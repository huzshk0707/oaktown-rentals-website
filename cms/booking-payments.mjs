import { fail } from './model.mjs';
import { stripe, stripeReady } from './stripe.mjs';
import { emailReady, sendBookingNotifications } from './booking-email.mjs';

const timestamp=()=>Math.floor(Date.now()/1000);
const now=()=>new Date().toISOString();
const sessionId=/^cs_(test_|live_)?[a-zA-Z0-9]+$/;
const intentId=/^pi_[a-zA-Z0-9]+$/;
export const rowById=(db,id)=>db.prepare('SELECT * FROM booking_reservations WHERE id=?').bind(id).first();

function validSession(session,row,env) {
  const quote=JSON.parse(row.quote_json);
  if (!sessionId.test(session?.id||'') || (row.stripe_session && session.id!==row.stripe_session)
    || session.client_reference_id!==row.id || session.metadata?.reservation_id!==row.id
    || session.currency!==quote.currency || session.amount_total!==quote.totalCents
    || session.mode!=='payment' || session.livemode!==(env.BOOKING_MODE==='live')) fail('payment_mismatch',409);
}

async function attachSession(env,row,session) {
  validSession(session,row,env);
  if (session.url && (!URL.canParse(session.url) || new URL(session.url).origin!=='https://checkout.stripe.com')) {
    fail('payment_mismatch',409);
  }
  const current=await env.DB.prepare(`
    UPDATE booking_reservations SET stripe_session=?,checkout_url=?,updated_at=?
    WHERE id=? AND state='holding' AND stripe_session IS NULL
  `).bind(session.id,session.url||null,now(),row.id).run();
  const stored=await rowById(env.DB,row.id);
  if (current.meta.changes!==1 && stored.stripe_session!==session.id) fail('payment_review_required',409);
  return stored;
}

async function releaseUncreated(db,row,actor,action,attempts=row.stripe_create_attempts) {
  const operation=crypto.randomUUID();
  const result=await db.batch([
    db.prepare(`
      UPDATE booking_reservations SET state='expired',updated_at=?,reconcile_version=reconcile_version+1
      WHERE id=? AND state='holding' AND stripe_session IS NULL AND stripe_create_attempts=?
    `).bind(now(),row.id,attempts),
    db.prepare('INSERT INTO booking_activity SELECT ?,?,?,?,? WHERE changes()=1')
      .bind(operation,actor,action,row.id,now()),
    db.prepare('DELETE FROM booking_nights WHERE reservation_id=? AND EXISTS (SELECT 1 FROM booking_activity WHERE id=?)')
      .bind(row.id,operation)
  ]);
  return result[0].meta.changes===1;
}

export async function ensureSession(env,row,transport) {
  if (row.stripe_session || row.state!=='holding') return row;
  // Stripe requires at least 30 minutes until expires_at on new sessions.
  // Keep the stored parameters and idempotency key stable across retries.
  const cutoff=timestamp()+30*60+30;
  if (row.expires_at<=cutoff) fail('payment_review_required',409);
  const claim=await env.DB.prepare(`
    UPDATE booking_reservations SET stripe_create_attempts=stripe_create_attempts+1
    WHERE id=? AND state='holding' AND stripe_session IS NULL AND expires_at>?
    RETURNING stripe_create_attempts
  `).bind(row.id,cutoff).first();
  if (!claim) return rowById(env.DB,row.id);
  let session;
  try {
    session=await stripe(env,'checkout/sessions',JSON.parse(row.checkout_params),'lobster-'+row.id,transport);
  } catch (error) {
    if (error.rejected && claim.stripe_create_attempts===1
      && await releaseUncreated(env.DB,row,'stripe','checkout_rejected',1)) fail('checkout_rejected',503);
    throw error;
  }
  return attachSession(env,row,session);
}

async function refundStatus(env,paymentIntent,amount,transport) {
  let refunded=0;
  let pending=false;
  let failed=false;
  const query=new URLSearchParams({payment_intent:paymentIntent,limit:'100'});
  for (let page=0;page<5;page++) {
    const refunds=await stripe(env,'refunds?'+query,undefined,undefined,transport);
    if (!Array.isArray(refunds?.data)) fail('payment_review_required',503);
    for (const refund of refunds.data) {
      if (refund.payment_intent!==paymentIntent || refund.currency!=='usd'
        || !['succeeded','pending','requires_action','failed','canceled'].includes(refund.status)
        || !Number.isSafeInteger(refund.amount) || refund.amount<1 || refund.amount>amount) fail('payment_mismatch',409);
      if (refund.status==='succeeded') refunded+=refund.amount;
      if (['pending','requires_action'].includes(refund.status)) pending=true;
      if (['failed','canceled'].includes(refund.status)) failed=true;
    }
    if (!refunds.has_more) {
      if (refunded>amount) fail('payment_mismatch',409);
      if (refunded===amount) return 'full';
      if (pending) return 'pending';
      if (failed) return 'failed';
      return refunded>0?'partial':'none';
    }
    const after=refunds.data.at(-1)?.id;
    if (!/^re_[a-zA-Z0-9]+$/.test(after||'')) fail('payment_review_required',503);
    query.set('starting_after',after);
  }
  fail('payment_review_required',503);
}

async function savePaymentState(db,row,state,refund,paymentIntent) {
  const operation=crypto.randomUUID();
  const action=state!==row.state?'reservation_'+state:'refund_'+refund;
  const statements=[
    db.prepare(`
      UPDATE booking_reservations
      SET state=?,refund_status=?,payment_intent=?,updated_at=?,reconcile_version=reconcile_version+1
      WHERE id=? AND reconcile_version=?
    `).bind(state,refund,paymentIntent,now(),row.id,row.reconcile_version),
    db.prepare('INSERT INTO booking_activity SELECT ?,?,?,?,? WHERE changes()=1')
      .bind(operation,'stripe',action,row.id,now())
  ];
  if (state==='refunded') {
    statements.push(
      db.prepare(`
        UPDATE booking_inventory SET open=0 WHERE day IN (SELECT day FROM booking_nights WHERE reservation_id=?)
        AND EXISTS (SELECT 1 FROM booking_activity WHERE id=?)
      `).bind(row.id,operation),
      db.prepare(`
        UPDATE booking_settings SET version=version+1 WHERE id=1
        AND EXISTS (SELECT 1 FROM booking_activity WHERE id=?)
      `).bind(operation));
  }
  if (state==='expired' || state==='refunded') {
    statements.push(db.prepare('DELETE FROM booking_nights WHERE reservation_id=? AND EXISTS (SELECT 1 FROM booking_activity WHERE id=?)')
      .bind(row.id,operation));
  }
  if (state==='confirmed') {
    for (const recipient of ['guest','operator']) {
      statements.push(db.prepare(`
        INSERT OR IGNORE INTO booking_notifications (reservation_id,recipient)
        SELECT ?,? WHERE EXISTS (SELECT 1 FROM booking_activity WHERE id=?)
      `).bind(row.id,recipient,operation));
    }
  }
  const result=await db.batch(statements);
  return result[0].meta.changes===1;
}

export async function reconcile(env,row,transport,{notify=false}={}) {
  for (let attempt=0;attempt<3;attempt++) {
    if (!row.stripe_session || row.state==='refunded' || row.state==='expired') return row;
    if (!stripeReady(env)) fail('payment_unavailable',503);
    const session=await stripe(env,'checkout/sessions/'+encodeURIComponent(row.stripe_session),undefined,undefined,transport);
    validSession(session,row,env);
    let state=row.state;
    let refund=row.refund_status;
    let paymentIntent=row.payment_intent;
    if (session.status==='complete' && session.payment_status==='paid') {
      paymentIntent=session.payment_intent;
      if (!intentId.test(paymentIntent||'') || (row.payment_intent && row.payment_intent!==paymentIntent)) fail('payment_mismatch',409);
      const intent=await stripe(env,'payment_intents/'+paymentIntent,undefined,undefined,transport);
      if (intent.id!==paymentIntent || intent.currency!==session.currency || intent.amount!==session.amount_total
        || intent.amount_received!==session.amount_total || intent.status!=='succeeded'
        || intent.metadata?.reservation_id!==row.id) fail('payment_mismatch',409);
      refund=await refundStatus(env,paymentIntent,session.amount_total,transport);
      state=refund==='full'?'refunded':'confirmed';
    } else if (session.status==='expired' && row.state==='holding') {
      state='expired';
    }
    if (state!==row.state || refund!==row.refund_status || paymentIntent!==row.payment_intent) {
      const saved=await savePaymentState(env.DB,row,state,refund,paymentIntent);
      row=await rowById(env.DB,row.id);
      if (!saved) continue;
    } else {
      row=await rowById(env.DB,row.id);
    }
    if (notify) await sendBookingNotifications(env,row,session.customer_details?.email,transport);
    return row;
  }
  fail('payment_unavailable',503);
}

async function findRefundReservation(env,paymentIntent,transport) {
  if (!intentId.test(paymentIntent||'')) return null;
  const existing=await env.DB.prepare('SELECT * FROM booking_reservations WHERE payment_intent=?').bind(paymentIntent).first();
  if (existing) return existing;
  const intent=await stripe(env,'payment_intents/'+paymentIntent,undefined,undefined,transport);
  if (intent?.id!==paymentIntent) fail('payment_mismatch',409);
  const id=intent.metadata?.reservation_id;
  const row=typeof id==='string' ? await rowById(env.DB,id) : null;
  if (!row || row.stripe_session || row.state==='expired') return row;
  const sessions=await stripe(env,'checkout/sessions?payment_intent='+paymentIntent+'&limit=2',undefined,undefined,transport);
  if (sessions?.data?.length!==1 || sessions.has_more) fail('payment_review_required',503);
  return attachSession(env,row,sessions.data[0]);
}

export async function reconcileWebhook(env,event,transport) {
  const object=event.data?.object;
  let row;
  if (event.type==='charge.refunded' || event.type.startsWith('refund.')) {
    row=await findRefundReservation(env,object?.payment_intent,transport);
  } else {
    const id=object?.metadata?.reservation_id;
    row=typeof id==='string' ? await rowById(env.DB,id) : null;
    if (row) {
      validSession(object,row,env);
      if (!row.stripe_session) row=await attachSession(env,row,object);
    }
  }
  if (row) {
    if (row.state==='expired' && (event.type==='checkout.session.completed' || event.type==='checkout.session.async_payment_succeeded'
      || event.type==='charge.refunded' || event.type.startsWith('refund.'))) fail('payment_review_required',409);
    await reconcile(env,row,transport,{notify:true});
  }
}

export async function reviewUnlinkedCheckout(env,row,actor,confirmNoSession,transport) {
  if (row.state!=='holding' || row.stripe_session) fail('payment_review_required',409);
  if (!stripeReady(env)) fail('payment_unavailable',503);
  const query=new URLSearchParams({
    'created[gte]':String(Math.floor(Date.parse(row.created_at)/1000)-60),
    'created[lte]':String(row.expires_at),
    limit:'100'
  });
  for (let page=0;page<10;page++) {
    const sessions=await stripe(env,'checkout/sessions?'+query,undefined,undefined,transport);
    if (!Array.isArray(sessions?.data)) fail('payment_unavailable',503);
    const found=sessions.data.find(session=>session.client_reference_id===row.id || session.metadata?.reservation_id===row.id);
    if (found) {
      const attached=await attachSession(env,row,found);
      return reconcile(env,attached,transport,{notify:true});
    }
    if (!sessions.has_more) {
      if (!confirmNoSession || timestamp()<row.expires_at+300) fail('payment_review_required',409);
      if (!await releaseUncreated(env.DB,row,actor,'checkout_released_after_stripe_review')) fail('payment_review_required',409);
      return rowById(env.DB,row.id);
    }
    const after=sessions.data.at(-1)?.id;
    if (!sessionId.test(after||'')) fail('payment_unavailable',503);
    query.set('starting_after',after);
  }
  fail('payment_review_required',409);
}

export async function recoverBookings(env,transport=fetch) {
  if (!stripeReady(env) || !env.STRIPE_WEBHOOK_SECRET) return;
  const time=timestamp();
  const db=env.DB;
  const reservations=await db.prepare(`
    SELECT * FROM booking_reservations
    WHERE recovery_checked_at<=? AND (
      (state='holding' AND expires_at<=? AND (stripe_session IS NOT NULL OR stripe_create_attempts=0))
      OR (state='confirmed' AND (refund_status='pending' OR (?=1 AND EXISTS (
        SELECT 1 FROM booking_notifications n WHERE n.reservation_id=booking_reservations.id
        AND n.sent_at IS NULL AND n.needs_review=0 AND n.next_attempt_at<=?
      ))))
    ) ORDER BY recovery_checked_at,expires_at LIMIT 10
  `).bind(time-240,time,emailReady(env)?1:0,time).all();
  for (const row of reservations.results) {
    const checked=await db.prepare('UPDATE booking_reservations SET recovery_checked_at=? WHERE id=? AND recovery_checked_at=?')
      .bind(time,row.id,row.recovery_checked_at).run();
    if (checked.meta.changes!==1) continue;
    try {
      if (row.stripe_session) await reconcile(env,row,transport,{notify:true});
      else await releaseUncreated(db,row,'system','checkout_never_sent');
    } catch (error) {
      console.warn('Booking recovery needs attention',row.id,error.status||500);
    }
  }
}
