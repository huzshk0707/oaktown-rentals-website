const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=(process.env.OAKTOWN_BASE_URL||'http://localhost:8787').replace(/\/$/,'');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.OAKTOWN_CHROMIUM||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1440,height:1000}}), errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>route.request().url().startsWith(base+'/')?route.continue():route.abort());
  await page.goto(base+'/');
  await page.locator('.desktop-nav a[href="./mint-mojo/"]').click();
  assert.equal(new URL(page.url()).pathname,'/mint-mojo/');
  await page.locator('.mint-hero h1').waitFor();
  assert.equal(await page.locator('.mint-hero-image').evaluate(img=>img.complete&&img.naturalWidth>0),true);
  for(const index of [1,2,0]){
    await page.locator('[data-mint-scene="'+index+'"]').click();
    assert.equal(await page.locator('[data-mint-scene="'+index+'"]').getAttribute('aria-pressed'),'true');
  }
  assert.equal(await page.locator('[data-mint-scene][aria-hidden=true]').count(),0);
  const opener=page.locator('.mint-quiet-button');
  await opener.click();
  assert.equal(await page.locator('dialog').evaluate(el=>el.open),true);
  for(let i=0;i<19;i++){
    const img=page.locator('.mint-lightbox-visual img');
    await img.evaluate(img=>img.decode());
    assert.ok(await img.getAttribute('alt'));
    assert.ok((await page.locator('.mint-gallery-caption').innerText()).startsWith((i+1)+' of 19'));
    await page.keyboard.press('ArrowRight');
  }
  assert.ok((await page.locator('.mint-gallery-caption').innerText()).startsWith('1 of 19'));
  await page.keyboard.press('ArrowLeft');
  assert.ok((await page.locator('.mint-gallery-caption').innerText()).startsWith('19 of 19'));
  await page.keyboard.press('Escape');
  assert.equal(await opener.evaluate(el=>el===document.activeElement),true);
  await page.locator('#inquire').scrollIntoViewIfNeeded();
  await page.locator('[name=arrival]').fill('2027-05-05');
  await page.locator('[name=departure]').fill('2027-05-04');
  assert.equal(await page.locator('.mint-date-form').evaluate(form=>form.checkValidity()),false);
  await page.locator('[name=departure]').fill('2027-05-12');
  await page.locator('.mint-date-form button').click();
  const email=await page.locator('[data-inquiry-email]').getAttribute('href');
  assert.ok(email.startsWith('mailto:joejrandles@yahoo.com?'));
  assert.ok(decodeURIComponent(email).includes('May 5, 2027'));
  assert.ok(decodeURIComponent(email).includes('May 12, 2027'));
  assert.equal(await page.locator('.mint-inquiry-ready').isVisible(),true);
  await page.locator('#mint-language').click();
  assert.equal(await page.locator('html').getAttribute('lang'),'es');
  assert.equal(await page.locator('[name=arrival]').inputValue(),'2027-05-05');
  assert.equal(await page.locator('[name=departure]').inputValue(),'2027-05-12');
  await page.locator('.mint-date-form button').click();
  assert.ok(decodeURIComponent(await page.locator('[data-inquiry-email]').getAttribute('href')).includes('Llegada:'));
  for(const width of [320,390,768,1024,1440,1920]){
    await page.setViewportSize({width,height:900});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Spanish overflow at '+width);
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto(base+'/mint-mojo/');
  assert.equal(await page.locator('html').getAttribute('lang'),'es');
  await page.locator('#mint-menu').click();
  assert.equal(await page.locator('#mint-nav').isVisible(),true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#mint-menu').evaluate(el=>el===document.activeElement),true);
  await page.locator('#mint-menu').click();
  await page.locator('#mint-nav a[href="#photos"]').click();
  assert.equal(await page.locator('#mint-nav').isVisible(),false);
  await page.locator('#mint-language').click();
  await page.locator('#motion-toggle').click();
  await page.reload();
  assert.equal(await page.locator('#motion-toggle').getAttribute('aria-pressed'),'false');
  assert.equal(await page.locator('.mint-hero-image').evaluate(img=>getComputedStyle(img).animationName),'none');
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();
  assert.equal(await page.locator('#motion-toggle').isDisabled(),true);
  assert.equal(await page.locator('.mint-hero-image').evaluate(img=>getComputedStyle(img).animationName),'none');
  await page.emulateMedia({reducedMotion:'no-preference'});
  for(const width of [320,390,768,1024,1440,1920]){
    await page.setViewportSize({width,height:900});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'English overflow at '+width);
  }
  await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/mint-mojo/');
  await page.evaluate(()=>Promise.all([...document.querySelectorAll('main img[src]')].map(img=>{img.loading='eager';return img.decode()})));
  await page.screenshot({path:'/workspace/work/mint-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.goto(base+'/mint-mojo/');
  await page.evaluate(()=>Promise.all([...document.querySelectorAll('main img[src]')].map(img=>{img.loading='eager';return img.decode()})));
  await page.screenshot({path:'/workspace/work/mint-phone.png',fullPage:true});
  await page.goto(base+'/#homes');
  assert.equal(await page.locator('.property-card').count(),4);
  assert.deepEqual(errors,[]);
  await browser.close();
  console.log('Mint Mojo: gallery photos, keyboard/focus, dates, inquiry links, EN/ES, phone navigation, motion and six layout widths passed.');
})().catch(error=>{console.error(error);process.exit(1)});
