import { fail } from './model.mjs';
import { hash, settings, nightsBetween, integer, dateDay, today, stay, makeQuote } from './booking-model.mjs';
import { verifyStripe, paymentReady, verifyHuman } from './stripe.mjs';
import { emailReady } from './booking-email.mjs';
import { ensureSession, reconcile, reconcileWebhook, reviewUnlinkedCheckout, rowById } from './booking-payments.mjs';
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
const now=()=>new Date().toISOString();
async function configRow(db) {
  if (!db) return null;
  try {
    return await db.prepare(`
      SELECT * FROM booking_settings WHERE id=1
      AND EXISTS (SELECT 1 FROM sqlite_schema WHERE type='table' AND name='booking_notifications')
    `).first();
  }
  catch (error) { if (/no such table.*booking_settings/.test(String(error))) return null; throw error; }
}
const audit=(db,actor,action,subject)=>db.prepare('INSERT INTO booking_activity VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),actor,action,subject,now());
async function active(env) {
  const row=await configRow(env.DB);
  if (!row || !paymentReady(env) || !JSON.parse(row.config_json).enabled) fail('booking_closed',503);
  return {config:settings(JSON.parse(row.config_json)),version:row.version};
}
async function quote(env,input) {
  const {config,version}=await active(env);
  stay(input,config);
  const rows=await env.DB.prepare('SELECT i.*, n.reservation_id AS occupied FROM booking_inventory i LEFT JOIN booking_nights n ON n.day=i.day WHERE i.day>=? AND i.day<? ORDER BY i.day').bind(input.arrival,input.departure).all();
  return makeQuote(input,config,version,rows.results);
}
function paramsFor(id,q,origin,expires,language) {
  const spanish=language==='es';
  const guests=spanish?(q.guests===1?'huésped':'huéspedes'):(q.guests===1?'guest':'guests');
  const fees=spanish?'Incluye limpieza e impuestos':'Includes cleaning and tax';
  return {
    mode:'payment','payment_method_types[0]':'card',client_reference_id:id,'metadata[reservation_id]':id,
    'payment_intent_data[metadata][reservation_id]':id,locale:language==='es'?'es':'en',
    'line_items[0][price_data][currency]':'usd','line_items[0][price_data][unit_amount]':String(q.totalCents),
    'line_items[0][price_data][product_data][name]':'Lobster Nirvana',
    'line_items[0][price_data][product_data][description]':q.arrival+' – '+q.departure+' · '+q.guests+' '+guests+' · '+fees,
    'line_items[0][quantity]':'1',expires_at:String(expires),
    success_url:`${origin}/booking/?reservation=${id}&lang=${language==='es'?'es':'en'}`,
    cancel_url:`${origin}/booking/?reservation=${id}&cancelled=1&lang=${language==='es'?'es':'en'}`
  };
}
function publicReservation(row) {
  const q=JSON.parse(row.quote_json);
  return {id:row.id,state:row.state,arrival:q.arrival,departure:q.departure,guests:q.guests,totalCents:q.totalCents,currency:q.currency,expiresAt:row.expires_at,checkoutUrl:row.state==='holding'?row.checkout_url:null};
}
export async function bookingAPI(request,env,{readJSON,readLimited,transport=fetch}) {
  const path=new URL(request.url).pathname, db=env.DB;
  if (path==='/api/booking/config' && request.method==='GET') {
    const row=await configRow(db), config=row?JSON.parse(row.config_json):{};
    const enabled=!!(config.enabled && paymentReady(env));
    return json(enabled?{enabled:true,mode:env.BOOKING_MODE,minNights:config.minNights,maxNights:config.maxNights,maxGuests:config.maxGuests,today:today(),siteKey:env.TURNSTILE_SITE_KEY,notifications:emailReady(env)}:{enabled:false});
  }
  if (path==='/api/booking/stripe-webhook' && request.method==='POST') {
    const raw=await readLimited(request,128*1024);
    await verifyStripe(raw,request.headers.get('Stripe-Signature'),env.STRIPE_WEBHOOK_SECRET);
    let event;try {event=JSON.parse(new TextDecoder().decode(raw));}catch{fail('invalid_event');}
    if (!event || event.livemode!==(env.BOOKING_MODE==='live')) fail('payment_mismatch',400);
    const events=['checkout.session.completed','checkout.session.expired','checkout.session.async_payment_succeeded',
      'checkout.session.async_payment_failed','charge.refunded','refund.created','refund.updated','refund.failed'];
    if (events.includes(event.type)) await reconcileWebhook(env,event,transport);
    return json({received:true});
  }
  if (!['/api/booking/quote','/api/booking/checkout','/api/booking/status'].includes(path) || request.method!=='POST') return json({error:'Not found.'},404);
  if (request.headers.get('Origin')!==env.BOOKING_ORIGIN || new URL(request.url).origin!==env.BOOKING_ORIGIN) fail('wrong_origin',403);
  const input=await readJSON(request);
  if (!input || typeof input!=='object') fail('invalid_request');
  if (path==='/api/booking/quote') return json(await quote(env,input));
  if (typeof input.token!=='string' || !/^[a-f0-9]{64}$/.test(input.token)) fail('invalid_token');
  const tokenHash=await hash(input.token);
  if (path==='/api/booking/status') {
    const row=await db.prepare('SELECT * FROM booking_reservations WHERE token_hash=?').bind(tokenHash).first();
    if (!row || (input.id!==undefined && input.id!==row.id)) fail('reservation_not_found',404);
    return json(publicReservation(await reconcile(env,row,transport)));
  }
  const existing=await db.prepare('SELECT * FROM booking_reservations WHERE token_hash=?').bind(tokenHash).first();
  if (existing) return retryCheckout(env,existing,input.quoteKey,transport);
  await active(env);
  await verifyHuman(env,input.verification,transport);
  const bucket=Math.floor(Date.now()/900000);
  const client=await hash(env.STRIPE_WEBHOOK_SECRET+':'+(request.headers.get('CF-Connecting-IP')||'unknown')+':'+bucket);
  const limit=await db.prepare('INSERT INTO booking_rate (client,bucket,attempts) VALUES (?,?,1) ON CONFLICT(client) DO UPDATE SET attempts=attempts+1 RETURNING attempts').bind(client,bucket).first();
  if(limit.attempts>4) fail('too_many_attempts',429);
  await db.prepare('DELETE FROM booking_rate WHERE bucket<?').bind(bucket-2).run();
  if (input.acceptedTerms!==true) fail('terms_required');
  const q=await quote(env,input);
  if (q.key!==input.quoteKey) fail('quote_changed',409);
  const id=crypto.randomUUID(),expires=Math.floor(Date.now()/1000)+35*60,created=now();
  const parameters=paramsFor(id,q,env.BOOKING_ORIGIN,expires,input.language);
  // One transaction inserts the reservation and all nights. Settings/rate
  // rechecks prevent stale quotes; the unique night key arbitrates races.
  const result=await db.batch([
    db.prepare(`INSERT INTO booking_reservations (id,token_hash,quote_json,quote_key,state,checkout_params,expires_at,created_at,updated_at)
      SELECT ?,?,?,?,'holding',?,?,?,? WHERE EXISTS (SELECT 1 FROM booking_settings WHERE id=1 AND version=?)
      AND (SELECT COUNT(*) FROM booking_inventory i JOIN json_each(?) j ON i.day=json_extract(j.value,'$.day') AND i.rate_cents=json_extract(j.value,'$.rateCents') WHERE i.open=1)=?
      AND NOT EXISTS (SELECT 1 FROM booking_nights WHERE day>=? AND day<?)
      AND NOT EXISTS (SELECT 1 FROM booking_reservations WHERE token_hash=?)`).bind(id,tokenHash,JSON.stringify(q),q.key,JSON.stringify(parameters),expires,created,created,q.version,JSON.stringify(q.nights),q.nights.length,q.arrival,q.departure,tokenHash),
    db.prepare('INSERT INTO booking_nights SELECT day,? FROM booking_inventory WHERE day>=? AND day<? AND EXISTS (SELECT 1 FROM booking_reservations WHERE id=?)').bind(id,q.arrival,q.departure,id),
    db.prepare('INSERT INTO booking_activity SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM booking_reservations WHERE id=?)').bind(crypto.randomUUID(),'guest','checkout_started',id,created,id)
  ]);
  if (result[0].meta.changes!==1) {
    const concurrent=await db.prepare('SELECT * FROM booking_reservations WHERE token_hash=?').bind(tokenHash).first();
    if (concurrent) return retryCheckout(env,concurrent,input.quoteKey,transport);
    fail('unavailable',409);
  }
  const row=await ensureSession(env,await rowById(db,id),transport);
  return json(publicReservation(row),201);
}
async function retryCheckout(env,row,quoteKey,transport) {
  if (row.quote_key!==quoteKey) fail('new_checkout_required',409);
  if (row.state==='holding' && !row.stripe_session) {
    await active(env);
    row=await ensureSession(env,row,transport);
  }
  return json(publicReservation(await reconcile(env,row,transport)));
}
export async function bookingAdmin(request,env,actor,{readJSON,transport=fetch}) {
  const db=env.DB,path=new URL(request.url).pathname;
  const current=await configRow(db);if(!current) fail('Apply the booking migrations before configuring reservations.',503);
  if (path==='/api/admin/bookings' && request.method==='GET') {
    const [inventory,reservations,notifications]=await Promise.all([
      db.prepare('SELECT i.*,n.reservation_id FROM booking_inventory i LEFT JOIN booking_nights n ON n.day=i.day WHERE i.day>=? ORDER BY i.day').bind(today()).all(),
      db.prepare(`
        SELECT * FROM booking_reservations
        ORDER BY (state='holding' AND stripe_session IS NULL) DESC, created_at DESC LIMIT 200
      `).all(),
      db.prepare(`
        SELECT reservation_id, recipient, sent_at, needs_review FROM booking_notifications
        WHERE reservation_id IN (SELECT id FROM booking_reservations
          ORDER BY (state='holding' AND stripe_session IS NULL) DESC, created_at DESC LIMIT 200)
      `).all()
    ]);
    return json({
      version:current.version,config:JSON.parse(current.config_json),paymentReady:paymentReady(env),
      emailReady:emailReady(env),mode:env.BOOKING_MODE||'off',inventory:inventory.results,
      reservations:reservations.results.map(row=>({
        ...publicReservation(row),stripeSession:row.stripe_session,refundStatus:row.refund_status,
        paymentIntent:row.payment_intent,createdAt:row.created_at,
        notifications:notifications.results.filter(item=>item.reservation_id===row.id).map(item=>({
          recipient:item.recipient,state:item.sent_at?'sent':item.needs_review?'needs review':'queued'
        }))
      }))
    });
  }
  if (path==='/api/admin/bookings/settings' && request.method==='PUT') {
    const input=await readJSON(request),config=settings(input.config);
    const result=await db.batch([db.prepare('UPDATE booking_settings SET config_json=?,version=version+1 WHERE id=1 AND version=?').bind(JSON.stringify(config),input.version),db.prepare('INSERT INTO booking_activity SELECT ?,?,?,?,? WHERE changes()=1').bind(crypto.randomUUID(),actor,'settings_saved','lobster-nirvana',now())]);
    if(result[0].meta.changes!==1) fail('Reload bookings before saving; settings changed.',409);
    return json({saved:true});
  }
  if (path==='/api/admin/bookings/inventory' && request.method==='PUT') {
    const input=await readJSON(request);
    if (!input || typeof input!=='object') fail('invalid_dates');
    const days=nightsBetween(input.arrival,input.departure);
    if (input.arrival<today() || dateDay(input.departure)>dateDay(today())+730*86400000) fail('invalid_dates');
    if (typeof input.open!=='boolean' || (input.open && input.blockedElsewhere!==true)) fail('inventory_confirmation_required');
    const rate=input.open?integer(input.rateCents,50,1000000):null;
    // Serialize inventory changes with settings, so a stale tab cannot reopen dates.
    const operation=crypto.randomUUID();
    const statements=[db.prepare('UPDATE booking_settings SET version=version+1 WHERE id=1 AND version=?').bind(input.version),db.prepare('INSERT INTO booking_activity SELECT ?,?,?,?,? WHERE changes()=1').bind(operation,actor,'inventory_saved',input.arrival+'/'+input.departure,now())];
    if (input.open) {
      for (const day of days) {
        statements.push(db.prepare(`
          INSERT INTO booking_inventory (day,rate_cents,open)
          SELECT ?,?,1 WHERE EXISTS (SELECT 1 FROM booking_activity WHERE id=?)
          ON CONFLICT(day) DO UPDATE SET rate_cents=excluded.rate_cents,open=1
        `).bind(day,rate,operation));
      }
    } else {
      statements.push(db.prepare(`
        UPDATE booking_inventory SET open=0 WHERE day>=? AND day<?
        AND EXISTS (SELECT 1 FROM booking_activity WHERE id=?)
      `).bind(input.arrival,input.departure,operation));
    }
    // Explicit version guard inside transaction, not merely a preflight read.
    if (input.version!==current.version) fail('Reload bookings before saving; settings changed.',409);
    const result=await db.batch(statements);
    if(result[0].meta.changes!==1) fail('Reload bookings before saving; settings changed.',409);
    return json({saved:true});
  }
  const match=path.match(/^\/api\/admin\/bookings\/([a-f0-9-]{36})\/(reconcile|review-checkout)$/);
  if (match && request.method==='POST') {
    const row=await rowById(db,match[1]);
    if (!row) fail('Not found.',404);
    if (match[2]==='review-checkout') {
      const input=await readJSON(request);
      return json(publicReservation(await reviewUnlinkedCheckout(env,row,actor,input?.confirmNoSession===true,transport)));
    }
    const result=await reconcile(env,row,transport,{notify:true});
    await audit(db,actor,'reconciled',row.id).run();
    return json(publicReservation(result));
  }
  return json({error:'Not found.'},404);
}
