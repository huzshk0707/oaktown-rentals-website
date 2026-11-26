const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
  const {bookingServer,start,end}=await import('./booking-fixture.mjs');
  const server=await bookingServer();
  const browser=await chromium.launch({executablePath:process.env.OAKTOWN_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const folder=path.resolve('docs/booking-review');fs.mkdirSync(folder,{recursive:true});
  const errors=[];
  try{
    for(const language of ['en','es'])for(const width of [320,390,768,1440]){
      const context=await browser.newContext({viewport:{width,height:width<800?844:1000}});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
      await page.route('**/*',route=>route.request().url().startsWith(server.base+'/')?route.continue():route.abort());
      await page.addInitScript(()=>{window.turnstile={render:(selector,options)=>{document.querySelector(selector).textContent='Security verification fixture';options.callback('valid');return 1;},reset:()=>{}};});
      await page.goto(server.base+'/booking/?lang='+language);await page.locator('#dates').waitFor({state:'visible'});
      await page.locator('[name=arrival]').fill(start);await page.locator('[name=departure]').fill(end);await page.locator('[name=guests]').selectOption('2');
      await page.locator('#dates button').click();await page.locator('#quote').waitFor({state:'visible'});
      assert.match(await page.locator('#price').innerText(),/1,153\.13/);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,language+' overflow '+width);
      assert.equal(await page.locator('.booking-story img').evaluate(i=>i.complete&&i.naturalWidth>0),true);
      await page.locator('#pay').click();await page.waitForFunction(()=>document.querySelector('#status').classList.contains('error'));
      assert.match(await page.locator('#status').innerText(),language==='es'?/Acepta/:/agree/);
      await page.locator('#accept').check();await page.locator('#language').click();assert.equal(await page.locator('#accept').isChecked(),false,'language change requires renewed agreement');await page.locator('#language').click();
      await page.screenshot({path:path.join(folder,`${language}-${width}-quote.png`),fullPage:true});
      await page.locator('[name=departure]').fill('2027-06-05');assert.equal(await page.locator('#quote').isHidden(),true,'date edits invalidate quote');
      await context.close();
    }
    const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{window.turnstile={render:(s,o)=>{o.callback('valid');return 1;},reset:()=>{}};});
    await page.route('https://checkout.stripe.com/**',r=>r.fulfill({contentType:'text/html',body:'<h1>Stripe fixture checkout</h1>'}));
    await page.goto(server.base+'/booking/');await page.locator('#dates').waitFor({state:'visible'});
    await page.locator('[name=arrival]').fill(start);await page.locator('[name=departure]').fill(end);await page.locator('#dates button').click();await page.locator('#quote').waitFor({state:'visible'});await page.locator('#accept').check();
    await page.locator('#pay').click();await page.waitForURL('https://checkout.stripe.com/**');
    const row=server.DB.sqlite.prepare('SELECT * FROM booking_reservations').get();assert.ok(row);server.pay(row.stripe_session);
    await page.goto(server.base+'/booking/?reservation='+row.id);await page.waitForFunction(()=>document.querySelector('#reservation-title').textContent.includes('booked'));
    assert.equal(await page.locator('#resume').isHidden(),true);await page.screenshot({path:path.join(folder,'en-confirmed.png'),fullPage:true});
    await page.locator('#language').click();assert.match(await page.locator('#reservation-title').innerText(),/reservada/);
    await context.close();
    const admin=await browser.newContext({viewport:{width:390,height:844},extraHTTPHeaders:{'X-Test-Admin':'editor@example.com'}});const editor=await admin.newPage();editor.on('pageerror',e=>errors.push(e.message));
    await editor.goto(server.base+'/admin/bookings.html');await editor.locator('#notice').filter({hasText:'Loaded.'}).waitFor();
    assert.match(await editor.locator('#reservations').innerText(),/confirmed/);assert.equal(await editor.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await editor.locator('#inventory [name=arrival]').fill('2027-07-01');await editor.locator('#inventory [name=departure]').fill('2027-07-04');await editor.locator('[name=rate]').fill('425');await editor.locator('[name=open]').selectOption('true');await editor.locator('[name=blockedElsewhere]').check();await editor.locator('#inventory button').click();await editor.locator('#notice').filter({hasText:'Dates and rate saved.'}).waitFor();
    assert.equal(server.DB.sqlite.prepare("SELECT rate_cents FROM booking_inventory WHERE day='2027-07-01'").get().rate_cents,42500);
    await editor.screenshot({path:path.join(folder,'admin-mobile.png'),fullPage:true});await admin.close();
    server.env.BOOKING_MODE='off';const closed=await browser.newPage({viewport:{width:390,height:844}});await closed.goto(server.base+'/booking/');await closed.locator('#closed').waitFor({state:'visible'});assert.equal(await closed.locator('#dates').isHidden(),true);await closed.screenshot({path:path.join(folder,'closed-mobile.png'),fullPage:true});
    assert.deepEqual(errors,[]);console.log('Booking browser: 8 EN/ES layouts, photos, totals, consent, edits, Stripe handoff/return, confirmation, mobile admin and closed setup passed. Stripe/Turnstile are local fixtures.');
  }finally{await browser.close();await server.stop();}
})().catch(error=>{console.error(error);process.exitCode=1;});
