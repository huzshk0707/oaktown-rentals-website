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
    const intent=h.intents.get(h.sessions.get('cs_test_2').payment_intent);intent.latest_charge.amount_refunded=100;assert.equal((await (await status(h,r2.id,'b'.repeat(64))).json()).state,'confirmed');
    intent.latest_charge={refunded:true,amount_refunded:q2.totalCents};assert.equal((await (await status(h,r2.id,'b'.repeat(64))).json()).state,'refunded');assert.equal((await h.quote()).error,'unavailable');assert.equal(h.DB.sqlite.prepare('SELECT count(*) n FROM booking_nights').get().n,0);
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
