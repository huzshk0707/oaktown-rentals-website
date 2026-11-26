import { fail } from './model.mjs';
import { hash, settings, nightsBetween, integer, dateDay, today, stay, makeQuote } from './booking-model.mjs';
import { stripe, verifyStripe, paymentReady, verifyHuman } from './stripe.mjs';
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
const now=()=>new Date().toISOString();
const rowById=(db,id)=>db.prepare('SELECT * FROM booking_reservations WHERE id=?').bind(id).first();
async function configRow(db) {
  if (!db) return null;
  try { return await db.prepare('SELECT * FROM booking_settings WHERE id=1').first(); }
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
  return {
    mode:'payment','payment_method_types[0]':'card',client_reference_id:id,'metadata[reservation_id]':id,
    'payment_intent_data[metadata][reservation_id]':id,locale:language==='es'?'es':'en',
    'line_items[0][price_data][currency]':'usd','line_items[0][price_data][unit_amount]':String(q.totalCents),
    'line_items[0][price_data][product_data][name]':'Lobster Nirvana',
    'line_items[0][price_data][product_data][description]':`${q.arrival} – ${q.departure} · ${q.guests} guests · Includes cleaning and tax`,
    'line_items[0][quantity]':'1',expires_at:String(expires),
    success_url:`${origin}/booking/?reservation=${id}&lang=${language==='es'?'es':'en'}`,
    cancel_url:`${origin}/booking/?reservation=${id}&cancelled=1&lang=${language==='es'?'es':'en'}`
  };
}
function validSession(s,row,env) {
  const q=JSON.parse(row.quote_json);
  if (!/^cs_(test_|live_)?[a-zA-Z0-9]+$/.test(s.id||'') || (row.stripe_session && s.id!==row.stripe_session) || s.client_reference_id!==row.id || s.metadata?.reservation_id!==row.id || s.currency!=='usd' || s.amount_total!==q.totalCents || s.mode!=='payment' || s.livemode!==(env.BOOKING_MODE==='live')) fail('payment_mismatch',409);
}
async function ensureSession(env,row,transport) {
  if (row.stripe_session) return row;
  // Stripe retains idempotency keys for at least 24h. Never recreate after that.
  if (Date.now()-Date.parse(row.created_at)>23*3600000) fail('payment_review_required',409);
  const s=await stripe(env,'checkout/sessions',JSON.parse(row.checkout_params),'lobster-'+row.id,transport);
  validSession(s,row,env);
  if (s.url && (new URL(s.url).origin!=='https://checkout.stripe.com')) fail('payment_mismatch',409);
  await env.DB.prepare('UPDATE booking_reservations SET stripe_session=?,checkout_url=?,updated_at=? WHERE id=? AND stripe_session IS NULL').bind(s.id,s.url||null,now(),row.id).run();
  return rowById(env.DB,row.id);
}
export async function reconcile(env,row,transport=fetch) {
  row=await ensureSession(env,row,transport);
  const session=await stripe(env,'checkout/sessions/'+encodeURIComponent(row.stripe_session),undefined,undefined,transport);
  validSession(session,row,env);
  let state=row.state;
  if (session.status==='complete' && session.payment_status==='paid') state='confirmed';
  else if (session.status==='expired' && row.state==='holding') state='expired';
  // Refunds are issued in Stripe by an authorized operator. Never equate a
  // checkout cancel/back button or an unpaid event with a refund.
  if (state==='confirmed' && /^pi_[a-zA-Z0-9]+$/.test(session.payment_intent||'')) {
    const intent=await stripe(env,'payment_intents/'+session.payment_intent+'?expand[]=latest_charge',undefined,undefined,transport);
    const charge=intent.latest_charge;
    if (intent.id!==session.payment_intent || intent.currency!=='usd' || intent.amount!==session.amount_total || intent.metadata?.reservation_id!==row.id) fail('payment_mismatch',409);
    if (charge && charge.refunded===true && charge.amount_refunded===session.amount_total) state='refunded';
  }
  if (row.state==='refunded') state='refunded';
  if (state!==row.state) {
    const db=env.DB;
    const statements=[db.prepare('UPDATE booking_reservations SET state=?,payment_intent=?,updated_at=? WHERE id=? AND state=?').bind(state,session.payment_intent||null,now(),row.id,row.state),
      db.prepare('INSERT INTO booking_activity SELECT ?,?,?,?,? WHERE changes()=1').bind(crypto.randomUUID(),'stripe','reservation_'+state,row.id,now())];
    if (state==='refunded') statements.push(db.prepare('UPDATE booking_inventory SET open=0 WHERE day IN (SELECT day FROM booking_nights WHERE reservation_id=?) AND EXISTS (SELECT 1 FROM booking_reservations WHERE id=? AND state=\'refunded\')').bind(row.id,row.id));
    if (['expired','refunded'].includes(state)) statements.push(db.prepare("DELETE FROM booking_nights WHERE reservation_id=? AND EXISTS (SELECT 1 FROM booking_reservations WHERE id=? AND state IN ('expired','refunded'))").bind(row.id,row.id));
    await db.batch(statements);
  }
  return rowById(env.DB,row.id);
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
    return json(enabled?{enabled:true,mode:env.BOOKING_MODE,minNights:config.minNights,maxNights:config.maxNights,maxGuests:config.maxGuests,today:today(),siteKey:env.TURNSTILE_SITE_KEY}:{enabled:false});
  }
  if (path==='/api/booking/stripe-webhook' && request.method==='POST') {
    const raw=new TextDecoder().decode(await readLimited(request,128*1024));
    await verifyStripe(raw,request.headers.get('Stripe-Signature'),env.STRIPE_WEBHOOK_SECRET);
    let event;try {event=JSON.parse(raw);}catch{fail('invalid_event');}
    if (event.livemode!==(env.BOOKING_MODE==='live')) fail('payment_mismatch',400);
    if (!['checkout.session.completed','checkout.session.expired','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','charge.refunded'].includes(event.type)) return json({received:true});
    const object=event.data?.object;
    let row;
    if (event.type==='charge.refunded') row=await db.prepare('SELECT * FROM booking_reservations WHERE payment_intent=?').bind(object?.payment_intent||'').first();
    else {
      const id=object?.metadata?.reservation_id;
      if (typeof id!=='string') return json({received:true});
      row=await rowById(db,id);
      if (row) {
        validSession(object,row,env);
        if (!row.stripe_session) await db.prepare('UPDATE booking_reservations SET stripe_session=? WHERE id=? AND stripe_session IS NULL').bind(object.id,row.id).run();
        row=await rowById(db,row.id);
      }
    }
    if (row) await reconcile(env,row,transport);
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
    const row=await db.prepare('SELECT * FROM booking_reservations WHERE id=? AND token_hash=?').bind(typeof input.id==='string'?input.id:'',tokenHash).first();
    if (!row) fail('reservation_not_found',404);
    return json(publicReservation(await reconcile(env,row,transport)));
  }
  await active(env);
  let row=await db.prepare('SELECT * FROM booking_reservations WHERE token_hash=?').bind(tokenHash).first();
  if (row) {
    if (row.quote_key!==input.quoteKey) fail('new_checkout_required',409);
    row=await reconcile(env,row,transport);
    return json(publicReservation(row));
  }
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
      AND NOT EXISTS (SELECT 1 FROM booking_nights WHERE day>=? AND day<?)`).bind(id,tokenHash,JSON.stringify(q),q.key,JSON.stringify(parameters),expires,created,created,q.version,JSON.stringify(q.nights),q.nights.length,q.arrival,q.departure),
    db.prepare('INSERT INTO booking_nights SELECT day,? FROM booking_inventory WHERE day>=? AND day<? AND EXISTS (SELECT 1 FROM booking_reservations WHERE id=?)').bind(id,q.arrival,q.departure,id),
    db.prepare('INSERT INTO booking_activity SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM booking_reservations WHERE id=?)').bind(crypto.randomUUID(),'guest','checkout_started',id,created,id)
  ]);
  if (result[0].meta.changes!==1) fail('unavailable',409);
  row=await ensureSession(env,await rowById(db,id),transport);
  return json(publicReservation(row),201);
}
export async function bookingAdmin(request,env,actor,{readJSON,transport=fetch}) {
  const db=env.DB,path=new URL(request.url).pathname;
  const current=await configRow(db);if(!current) fail('Apply the booking migration before configuring reservations.',503);
  if (path==='/api/admin/bookings' && request.method==='GET') {
    const [inventory,reservations]=await Promise.all([
      db.prepare('SELECT i.*,n.reservation_id FROM booking_inventory i LEFT JOIN booking_nights n ON n.day=i.day WHERE i.day>=? ORDER BY i.day').bind(today()).all(),
      db.prepare('SELECT * FROM booking_reservations ORDER BY created_at DESC LIMIT 200').all()
    ]);
    return json({version:current.version,config:JSON.parse(current.config_json),paymentReady:paymentReady(env),mode:env.BOOKING_MODE||'off',inventory:inventory.results,reservations:reservations.results.map(r=>({...publicReservation(r),stripeSession:r.stripe_session,createdAt:r.created_at}))});
  }
  if (path==='/api/admin/bookings/settings' && request.method==='PUT') {
    const input=await readJSON(request),config=settings(input.config);
    const result=await db.batch([db.prepare('UPDATE booking_settings SET config_json=?,version=version+1 WHERE id=1 AND version=?').bind(JSON.stringify(config),input.version),db.prepare('INSERT INTO booking_activity SELECT ?,?,?,?,? WHERE changes()=1').bind(crypto.randomUUID(),actor,'settings_saved','lobster-nirvana',now())]);
    if(result[0].meta.changes!==1) fail('Reload bookings before saving; settings changed.',409);
    return json({saved:true});
  }
  if (path==='/api/admin/bookings/inventory' && request.method==='PUT') {
    const input=await readJSON(request),days=nightsBetween(input.arrival,input.departure);
    if (input.arrival<today() || dateDay(input.departure)>dateDay(today())+730*86400000) fail('invalid_dates');
    if (typeof input.open!=='boolean' || (input.open && input.blockedElsewhere!==true)) fail('inventory_confirmation_required');
    const rate=integer(input.rateCents,50,1000000);
    // Serialize inventory changes with settings, so a stale tab cannot reopen dates.
    const operation=crypto.randomUUID();
    const statements=[db.prepare('UPDATE booking_settings SET version=version+1 WHERE id=1 AND version=?').bind(input.version),db.prepare('INSERT INTO booking_activity SELECT ?,?,?,?,? WHERE changes()=1').bind(operation,actor,'inventory_saved',input.arrival+'/'+input.departure,now())];
    for (const day of days) statements.push(db.prepare(`INSERT INTO booking_inventory (day,rate_cents,open) SELECT ?,?,? WHERE EXISTS (SELECT 1 FROM booking_activity WHERE id=?) ON CONFLICT(day) DO UPDATE SET rate_cents=excluded.rate_cents,open=excluded.open`).bind(day,rate,input.open?1:0,operation));
    // Explicit version guard inside transaction, not merely a preflight read.
    if (input.version!==current.version) fail('Reload bookings before saving; settings changed.',409);
    const result=await db.batch(statements);
    if(result[0].meta.changes!==1) fail('Reload bookings before saving; settings changed.',409);
    return json({saved:true});
  }
  const match=path.match(/^\/api\/admin\/bookings\/([a-f0-9-]{36})\/reconcile$/);
  if (match && request.method==='POST') {
    const row=await rowById(db,match[1]);if(!row)fail('Not found.',404);
    const result=await reconcile(env,row,transport);
    await audit(db,actor,'reconciled',row.id).run();
    return json(publicReservation(result));
  }
  return json({error:'Not found.'},404);
}
