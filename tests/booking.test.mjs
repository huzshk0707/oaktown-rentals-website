import test from 'node:test';
import assert from 'node:assert/strict';
import { bookingFixture, signature, rules, start, end } from './booking-fixture.mjs';
import { dateDay,nightsBetween,today } from '../cms/booking-model.mjs';
const admin={'X-Test-Admin':'editor@example.com'};
const status=(h,id,token='a'.repeat(64))=>h.call('/api/booking/status','POST',{id,token});
test('strict local dates, leap days and DST-independent nights',()=>{
  assert.throws(()=>dateDay('2027-02-29'));assert.throws(()=>dateDay('2028-02-30'));assert.ok(dateDay('2028-02-29'));
  assert.equal(nightsBetween('2027-03-13','2027-03-15').length,2);
  assert.equal(nightsBetween('2027-11-06','2027-11-08').length,2);
  assert.throws(()=>nightsBetween('2027-06-04','2027-06-01'));
  assert.equal(today(new Date('2027-01-01T03:00:00Z')),'2026-12-31');
});
test('closed configuration, live gate, canonical origin, strict quote and unavailable inventory',async()=>{
  const h=await bookingFixture();try{
    const q=await h.quote();assert.equal(q.accommodationCents,90000);assert.equal(q.taxCents,12813);assert.equal(q.totalCents,115313);
    for(const extra of [{arrival:'2027-02-30'},{guests:9},{guests:'2'},{departure:'2027-06-02'},{arrival:'2020-01-01'}])assert.ok((await h.quote(extra)).error);
    assert.equal((await h.call('/api/booking/quote','POST',{arrival:start,departure:end,guests:2},{Origin:'https://evil.example'})).status,403);
    h.DB.sqlite.prepare("UPDATE booking_inventory SET open=0 WHERE day='2027-06-02'").run();assert.equal((await h.quote()).error,'unavailable');
    h.env.BOOKING_MODE='live';h.env.STRIPE_SECRET_KEY='sk_live_fixture';assert.deepEqual(await (await h.call('/api/booking/config')).json(),{enabled:false});
    h.env.BOOKING_LIVE_ENABLED='true';
    assert.deepEqual(await (await h.call('/api/booking/config')).json(),{enabled:false});
    Object.assign(h.env,{RESEND_API_KEY:'fixture',BOOKING_EMAIL_FROM:'bookings@example.com',BOOKING_OPERATOR_EMAIL:'host@example.com'});
    assert.equal((await (await h.call('/api/booking/config')).json()).enabled,true);
    h.DB.sqlite.exec('DROP TABLE booking_notifications');
    assert.deepEqual(await (await h.call('/api/booking/config')).json(),{enabled:false});
    delete h.env.DB;assert.deepEqual(await (await h.call('/api/booking/config')).json(),{enabled:false});
  }finally{h.close();}
});
test('exclusive checkout holds, duplicate retries, token privacy, paid webhook and replay',async()=>{
  const h=await bookingFixture();try{
    const q=await h.quote();let response=await h.checkout(q);assert.equal(response.status,201);const r=await response.json();assert.equal(r.state,'holding');
    assert.equal(h.DB.sqlite.prepare('SELECT count(*) n FROM booking_nights').get().n,3);
    assert.equal((await h.quote()).error,'unavailable');
    response=await h.checkout(q);assert.equal(response.status,200);assert.equal((await response.json()).id,r.id);assert.equal(h.sessions.size,1);
    assert.equal((await status(h,r.id,'b'.repeat(64))).status,404);
    let view=await (await status(h,r.id)).json();assert.equal(view.state,'holding');assert.equal(JSON.stringify(view).includes('token_hash'),false);
    h.pay('cs_test_1');assert.equal((await h.webhook('cs_test_1')).status,200);assert.equal((await h.webhook('cs_test_1')).status,200);
    view=await (await status(h,r.id)).json();assert.equal(view.state,'confirmed');assert.equal(view.checkoutUrl,null);
    assert.equal(h.DB.sqlite.prepare("SELECT count(*) n FROM booking_activity WHERE action='reservation_confirmed'").get().n,1);
    assert.equal(h.DB.sqlite.prepare('SELECT count(*) n FROM booking_nights').get().n,3);
  }finally{h.close();}
});
test('two simultaneous checkouts cannot own the same nights; adjacent checkout is allowed',async()=>{
  const h=await bookingFixture();try{
    const q=await h.quote();const responses=await Promise.all([h.checkout(q),h.checkout(q,'b'.repeat(64))]);assert.deepEqual(responses.map(r=>r.status).sort(),[201,409]);assert.equal(h.sessions.size,1);
    const adjacent=await h.quote({arrival:end,departure:'2027-06-06'});assert.ok(adjacent.key);assert.equal((await h.checkout(adjacent,'c'.repeat(64))).status,201);
  }finally{h.close();}
});
test('price tampering, stale rates, human verification, terms and repeat-attempt limit',async()=>{
  const h=await bookingFixture();try{
    let q=await h.quote();assert.equal((await h.checkout(q,undefined,{quoteKey:'tampered',totalCents:1})).status,409);
    assert.equal((await h.checkout(q,undefined,{verification:'bad'})).status,403);
    assert.equal((await h.checkout(q,undefined,{acceptedTerms:false})).status,400);
    h.DB.sqlite.prepare('UPDATE booking_inventory SET rate_cents=rate_cents+100').run();assert.equal((await h.checkout(q)).status,409);
    q=await h.quote();assert.equal((await h.checkout(q,undefined,{totalCents:1})).status,201);assert.equal(h.sessions.get('cs_test_1').amount_total,q.totalCents);
    const next=await h.quote({arrival:'2027-06-10',departure:'2027-06-13'});assert.equal((await h.checkout(next,'d'.repeat(64))).status,429);
  }finally{h.close();}
});
test('lost Stripe creation response is recovered with the same key without releasing nights',async()=>{
  const h=await bookingFixture();try{
    const q=await h.quote();h.loseCreateResponse();assert.equal((await h.checkout(q)).status,503);assert.equal(h.sessions.size,1);assert.equal(h.DB.sqlite.prepare('SELECT count(*) n FROM booking_nights').get().n,3);
    assert.equal((await h.checkout(q)).status,200);assert.equal(h.sessions.size,1);
  }finally{h.close();}
});
test('expiry requires Stripe confirmation; full refunds close inventory; partial refunds retain stay',async()=>{
  const h=await bookingFixture();try{
    const q=await h.quote(),r=await (await h.checkout(q)).json();
    h.DB.sqlite.prepare('UPDATE booking_reservations SET expires_at=0').run();assert.equal((await (await status(h,r.id)).json()).state,'holding');
    h.sessions.get('cs_test_1').status='expired';await h.webhook('cs_test_1','checkout.session.expired');assert.equal(h.DB.sqlite.prepare('SELECT count(*) n FROM booking_nights').get().n,0);
    const q2=await h.quote(),r2=await (await h.checkout(q2,'b'.repeat(64))).json();h.pay('cs_test_2');await h.webhook('cs_test_2');
    const id=h.sessions.get('cs_test_2').payment_intent;
    h.refunds.set(id,[{id:'re_1',payment_intent:id,currency:'usd',status:'succeeded',amount:100}]);
    assert.equal((await (await status(h,r2.id,'b'.repeat(64))).json()).state,'confirmed');
    h.refunds.get(id).push({id:'re_2',payment_intent:id,currency:'usd',status:'succeeded',amount:q2.totalCents-100});
    assert.equal((await (await status(h,r2.id,'b'.repeat(64))).json()).state,'refunded');assert.equal((await h.quote()).error,'unavailable');assert.equal(h.DB.sqlite.prepare('SELECT count(*) n FROM booking_nights').get().n,0);
  }finally{h.close();}
});
test('signed webhook rejects forgery, stale timestamps, wrong amounts and modes',async()=>{
  const h=await bookingFixture();try{
    await h.checkout(await h.quote());const raw=JSON.stringify({type:'checkout.session.completed',livemode:false,data:{object:h.sessions.get('cs_test_1')}});
    assert.equal((await h.call('/api/booking/stripe-webhook','POST',raw,{'Stripe-Signature':'t=1,v1=bad'})).status,400);
    assert.equal((await h.call('/api/booking/stripe-webhook','POST',raw,{'Stripe-Signature':await signature(raw,'whsec_fixture',Math.floor(Date.now()/1000)-600)})).status,400);
    assert.equal((await h.call('/api/booking/stripe-webhook','POST',raw+' ',{'Stripe-Signature':await signature(raw)})).status,400);
    h.sessions.get('cs_test_1').amount_total=1;assert.equal((await h.webhook('cs_test_1')).status,409);
    assert.equal((await h.webhook('cs_test_1','checkout.session.completed',{livemode:true})).status,400);
    assert.equal(h.DB.sqlite.prepare('SELECT state FROM booking_reservations').get().state,'holding');
  }finally{h.close();}
});
test('booking admin retains Access, CSRF, stale-write checks and explicit cross-channel acknowledgment',async()=>{
  const h=await bookingFixture();try{
    assert.equal((await h.call('/api/admin/bookings')).status,401);
    assert.equal((await h.call('/admin/bookings.html')).status,401);
    assert.equal((await h.call('/api/admin/bookings/settings','PUT',{version:1,config:rules},{...admin,Origin:'https://evil.example'})).status,403);
    assert.equal((await h.call('/api/admin/bookings/settings','PUT',{version:1,config:{...rules,exclusiveInventoryAcknowledged:false}},admin)).status,400);
    assert.equal((await h.call('/api/admin/bookings/settings','PUT',{version:1,config:rules},admin)).status,200);
    assert.equal((await h.call('/api/admin/bookings/settings','PUT',{version:1,config:rules},admin)).status,409);
    const input={version:2,arrival:'2027-07-01',departure:'2027-07-04',rateCents:40000,open:true};
    assert.equal((await h.call('/api/admin/bookings/inventory','PUT',input,admin)).status,400);
    assert.equal((await h.call('/api/admin/bookings/inventory','PUT',{...input,blockedElsewhere:true},admin)).status,200);
    assert.equal((await h.call('/api/admin/bookings/inventory','PUT',{...input,blockedElsewhere:true,open:false},admin)).status,409);
    assert.equal(h.DB.sqlite.prepare("SELECT open FROM booking_inventory WHERE day='2027-07-01'").get().open,1);
    const response=await h.call('/admin/bookings.html','GET',undefined,admin);assert.equal(response.status,200);assert.match(response.headers.get('Cache-Control'),/no-store/);
  }finally{h.close();}
});

test('only a definitive first Stripe rejection releases the hold, and the same quote can start a fresh attempt',async()=>{
  const h=await bookingFixture();
  try {
    const q=await h.quote();
    h.rejectCreate();
    const rejected=await h.checkout(q);
    assert.equal(rejected.status,503);
    assert.equal((await rejected.json()).error,'checkout_rejected');
    assert.equal(h.DB.sqlite.prepare('SELECT count(*) n FROM booking_nights').get().n,0);
    const fresh=await (await h.checkout(q,'b'.repeat(64))).json();
    assert.equal(fresh.state,'holding');
    h.sessions.get('cs_test_1').status='expired';
    await h.webhook('cs_test_1','checkout.session.expired');
    assert.equal((await (await h.checkout(q,'b'.repeat(64))).json()).state,'expired');
    assert.equal((await (await h.checkout(q,'c'.repeat(64))).json()).state,'holding');
  } finally {h.close();}
});

test('an ambiguous create stays held, survives a later rejection and supports verified operator recovery',async()=>{
  const h=await bookingFixture();
  try {
    const q=await h.quote();
    h.unknownCreate();
    assert.equal((await h.checkout(q)).status,503);
    h.rejectCreate();
    assert.equal((await (await h.checkout(q)).json()).error,'payment_unavailable');
    const recovered=await (await h.call('/api/booking/status','POST',{token:'a'.repeat(64)})).json();
    assert.equal(recovered.state,'holding');
    assert.equal(recovered.checkoutUrl,null);
    const endpoint='/api/admin/bookings/'+recovered.id+'/review-checkout';
    assert.equal((await h.call(endpoint,'POST',{confirmNoSession:true},admin)).status,409);
    h.DB.sqlite.prepare('UPDATE booking_reservations SET expires_at=?').run(Math.floor(Date.now()/1000)-360);
    assert.equal((await h.call(endpoint,'POST',{},admin)).status,409);
    const released=await (await h.call(endpoint,'POST',{confirmNoSession:true},admin)).json();
    assert.equal(released.state,'expired');
    assert.equal((await h.quote()).key,q.key);
    const entry=h.DB.sqlite.prepare("SELECT actor FROM booking_activity WHERE action='checkout_released_after_stripe_review'").get();
    assert.equal(entry.actor,'editor@example.com');
  } finally {h.close();}
});

test('operator review attaches an existing Stripe session and expiry recovery releases only eligible holds',async()=>{
  const h=await bookingFixture();
  try {
    const q=await h.quote();
    h.loseCreateResponse();
    await h.checkout(q);
    const row=h.DB.sqlite.prepare('SELECT * FROM booking_reservations').get();
    const recovered=await (await h.call('/api/admin/bookings/'+row.id+'/review-checkout','POST',{},admin)).json();
    assert.equal(recovered.state,'holding');
    assert.match(recovered.checkoutUrl,/cs_test_1/);
    assert.equal(h.sessions.size,1);
    h.DB.sqlite.prepare('UPDATE booking_reservations SET expires_at=0').run();
    await h.app.scheduled(null,h.env);
    assert.equal(h.DB.sqlite.prepare('SELECT count(*) n FROM booking_nights').get().n,3);
    h.sessions.get('cs_test_1').status='expired';
    h.DB.sqlite.prepare('UPDATE booking_reservations SET recovery_checked_at=0').run();
    await h.app.scheduled(null,h.env);
    assert.equal(h.DB.sqlite.prepare('SELECT count(*) n FROM booking_nights').get().n,0);
  } finally {h.close();}
});

test('refund-before-completion webhook converges after a stale concurrent write and invalidates admin edits',async()=>{
  const h=await bookingFixture();
  try {
    const q=await h.quote();
    h.loseCreateResponse();
    assert.equal((await h.checkout(q)).status,503);
    const reservation=h.DB.sqlite.prepare('SELECT * FROM booking_reservations').get();
    assert.equal(reservation.stripe_session,null);
    const version=(await (await h.call('/api/admin/bookings','GET',undefined,admin)).json()).version;
    h.pay('cs_test_1');
    const paymentIntent=h.sessions.get('cs_test_1').payment_intent;
    const refund={id:'re_1',payment_intent:paymentIntent,currency:'usd',status:'succeeded',amount:q.totalCents};
    let releaseRefund, readRefund;
    const refundPaused=new Promise(resolve=>{readRefund=resolve;});
    const resumeRefund=new Promise(resolve=>{releaseRefund=resolve;});
    let reads=0;
    h.intercept(async url=>{
      if (!url.includes('/refunds?')) return;
      reads++;
      if (reads===1) {
        readRefund();
        await resumeRefund;
      }
      return Response.json({data:reads===2?[]:[refund],has_more:false});
    });
    const incoming=h.webhook('cs_test_1','refund.created',{data:{object:refund}});
    await refundPaused;
    try {
      assert.equal((await h.webhook('cs_test_1')).status,200);
      assert.equal(h.DB.sqlite.prepare('SELECT state FROM booking_reservations').get().state,'confirmed');
    } finally {releaseRefund();}
    assert.equal((await incoming).status,200);
    assert.equal((await (await status(h,reservation.id)).json()).state,'refunded');
    assert.equal(h.DB.sqlite.prepare('SELECT count(*) n FROM booking_nights').get().n,0);
    const stale={version,arrival:start,departure:end,rateCents:30000,open:true,blockedElsewhere:true};
    assert.equal((await h.call('/api/admin/bookings/inventory','PUT',stale,admin)).status,409);
    assert.equal((await h.quote()).error,'unavailable');
  } finally {h.close();}
});

test('confirmation email is queued with payment, retries a transient failure, and a pending refund stays held',async()=>{
  const h=await bookingFixture();
  try {
    Object.assign(h.env,{RESEND_API_KEY:'fixture',BOOKING_EMAIL_FROM:'bookings@example.com',BOOKING_OPERATOR_EMAIL:'host@example.com'});
    const q=await h.quote();
    const r=await (await h.checkout(q,undefined,{language:'es'})).json();
    h.pay('cs_test_1');
    const id=h.sessions.get('cs_test_1').payment_intent;
    const refund={id:'re_1',payment_intent:id,currency:'usd',status:'pending',amount:q.totalCents};
    h.refunds.set(id,[refund]);
    assert.equal((await h.webhook('cs_test_1','refund.created',{data:{object:refund}})).status,200);
    assert.equal(h.DB.sqlite.prepare('SELECT refund_status FROM booking_reservations').get().refund_status,'pending');
    assert.equal(h.DB.sqlite.prepare('SELECT count(*) n FROM booking_nights').get().n,3);
    assert.equal(h.emails.length,0);
    refund.status='failed';
    h.intercept((url,options)=>{
      if (url==='https://api.resend.com/emails' && JSON.parse(options.body).to[0]==='guest@example.com') {
        return Response.json({error:'temporary'},{status:503});
      }
    });
    assert.equal((await h.webhook('cs_test_1','refund.failed',{data:{object:refund}})).status,200);
    assert.equal(h.DB.sqlite.prepare('SELECT refund_status FROM booking_reservations').get().refund_status,'failed');
    assert.equal(h.emails.length,1);
    assert.deepEqual(h.emails[0].to,['host@example.com']);
    h.intercept(undefined);
    h.DB.sqlite.prepare('UPDATE booking_notifications SET next_attempt_at=0').run();
    await h.app.scheduled(null,h.env);
    assert.equal(h.emails.length,2);
    const guest=h.emails[1];
    assert.deepEqual(guest.to,['guest@example.com']);
    assert.match(guest.subject,/reserva.*confirmada/);
    assert.ok(guest.text.includes(r.id));
    assert.equal(guest.key,'lobster-booking-'+r.id+'-guest');
    assert.equal((await h.webhook('cs_test_1')).status,200);
    assert.equal(h.emails.length,2);
    assert.equal(h.DB.sqlite.prepare('SELECT count(*) n FROM booking_notifications WHERE sent_at IS NOT NULL').get().n,2);
  } finally {h.close();}
});
