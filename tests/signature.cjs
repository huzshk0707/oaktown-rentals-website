const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=(process.env.OAKTOWN_BASE_URL||'http://127.0.0.1:8930').replace(/\/$/,'');
(async()=>{
const browser=await chromium.launch({executablePath:process.env.OAKTOWN_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const results=[],errors=[];
const test=async(name,fn)=>{await fn();results.push(name);};
const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(6000);
page.on('pageerror',e=>errors.push(e.message));
// Network failure is intentional in behavioral tests; visual captures use actual requests.
await page.route('https://**',r=>r.abort());
await page.goto(base+'/');await page.locator('.signature-hero').waitFor();
await test('approved local photos load and Afterglow is not added to rental inventory',async()=>{
 const imgs=await page.locator('.cinematic-photo').evaluateAll(imgs=>imgs.map(i=>({ok:i.complete&&i.naturalWidth>0,src:i.currentSrc})));
 assert.ok(imgs[0].ok);assert.match(imgs[0].src,/afterglow/);
 assert.equal(await page.locator('.property-card').count(),6);assert.equal(await page.locator('.property-card').filter({hasText:'Afterglow'}).count(),0);
 await page.locator('[data-hero-scene-button="1"]').click();
 await page.waitForFunction(()=>document.querySelector('.cinematic-hero').dataset.scene==='1');
 assert.equal(await page.locator('.cinematic-photo').count(),1);
});
await test('combined minimum bedroom/bathroom filters, empty result and reset',async()=>{
 await page.locator('[name=neighborhood]').selectOption('Cherokee Triangle');await page.locator('[name=bedrooms]').selectOption('3');await page.locator('[name=bathrooms]').selectOption('1');
 await page.locator('#home-search [type=submit]').click();assert.equal(await page.locator('.property-card:visible').count(),0);assert.equal(await page.locator('.search-empty').isVisible(),true);
 await page.locator('[name=neighborhood]').selectOption('St. Matthews');await page.locator('#home-search [type=submit]').click();
 assert.deepEqual(await page.locator('.property-card:visible .property-name').allTextContents(),['115 Colonial Drive']);
 await page.locator('#home-search [type=reset]').click();assert.equal(await page.locator('.property-card:visible').count(),6);
 assert.equal(await page.locator('[name=bedrooms]').inputValue(),'');
});
await test('search persists through language changes, listing details and back navigation',async()=>{
 await page.locator('[name=neighborhood]').selectOption('Russell');await page.locator('[name=bedrooms]').selectOption('3');await page.locator('#home-search [type=submit]').click();
 await page.locator('#language-switch').click();assert.equal(await page.locator('[name=bedrooms]').inputValue(),'3');assert.equal(await page.locator('.property-card:visible').count(),1);
 await page.locator('.property-card:visible .property-name a').click();await page.locator('.page-intro h1').waitFor();assert.match(await page.locator('h1').innerText(),/Madison/);
 assert.equal(await page.locator('[data-gallery-index]').count(),15);
 await page.locator('.back-link').click();await page.locator('#home-search').waitFor();assert.equal(await page.locator('[name=neighborhood]').inputValue(),'Russell');assert.equal(await page.locator('[name=bedrooms]').inputValue(),'3');
 await page.locator('#home-search [type=reset]').click();assert.equal(await page.locator('.property-card:visible').count(),6);
 await page.locator('#language-switch').click();
});
await test('Resources keyboard navigation, verified links and no portal',async()=>{
 await page.locator('.resources-menu summary').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.resources-menu').getAttribute('open'),'');
 await page.keyboard.press('Escape');assert.equal(await page.locator('.resources-menu').getAttribute('open'),null);
 assert.equal(await page.getByText('Resident Portal',{exact:false}).count(),0);
 await page.locator('.resources-menu summary').click();await page.locator('.resources-menu a[href="#faq"]').click();await page.locator('.faq-item').first().waitFor();
 await page.locator('.faq-item summary').first().click();assert.ok(await page.locator('.faq-answer').first().isVisible());
 await page.goto(base+'/#community');assert.equal(await page.locator('.resource-link').count(),4);await page.goto(base+'/');
});
await test('single-row collection keeps previous/next and keyboard access',async()=>{
 await page.locator('[data-collection-step="1"]').click();await page.waitForTimeout(600);
 assert.ok(await page.locator('.collection-viewport').evaluate(e=>e.scrollLeft)>50);
 assert.equal(await page.locator('.collection-viewport').getAttribute('tabindex'),'0');assert.equal(await page.locator('[data-layout-button]').count(),2);
});
for(const language of ['en','es'])for(const width of [320,390,768,1024,1440,1920]){
 await test(`${language} ${width}px: no overflow, hero action and header controls fit`,async()=>{
  const p=await browser.newPage({viewport:{width,height:width===320?640:900}});p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(lang=>localStorage.setItem('oaktown-language',lang),language);await p.route('https://**',r=>r.abort());
  await p.goto(base+'/');await p.locator('.signature-hero').waitFor();
  const metrics=await p.evaluate(()=>{const action=document.querySelector('.signature-copy .signature-button').getBoundingClientRect(),header=document.querySelector('header').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,actionBottom:action.bottom,actionTop:action.top,headerBottom:header.bottom,heroBottom:document.querySelector('.signature-hero').getBoundingClientRect().bottom};});
  assert.equal(metrics.overflow,false);assert.ok(await p.locator('#home-search').evaluate(e=>e.getBoundingClientRect().top)>=await p.evaluate(()=>innerHeight),'search stays below the opening viewport');assert.ok(metrics.actionTop>metrics.headerBottom);assert.ok(metrics.actionBottom<metrics.heroBottom-30);
  if(width<=960){await p.locator('#menu-button').click();assert.ok(await p.locator('#mobile-nav').isVisible());await p.keyboard.press('Escape');assert.ok(await p.locator('#mobile-nav').isHidden());}
  if(width===320){assert.ok(metrics.actionBottom<640);await p.screenshot({path:`/tmp/signature-test-${language}-320.png`});}
  await p.close();
 });
}
await test('motion toggle and reduced-motion provide a static opening and working search',async()=>{
 await page.goto(base+'/');await page.locator('.signature-hero').waitFor();await page.evaluate(()=>scrollTo({top:200,behavior:'instant'}));await page.waitForTimeout(100);
 assert.notEqual(await page.locator('.signature-images').evaluate(e=>getComputedStyle(e).transform),'none');
 await page.locator('#motion-toggle').click();await page.waitForTimeout(100);assert.equal(await page.locator('.signature-images').evaluate(e=>getComputedStyle(e).transform),'none');
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.locator('.cinematic-progress').isVisible(),false);
 assert.equal(await page.locator('.cinematic-hero').getAttribute('data-scene'),'0');
 await page.locator('[name=neighborhood]').selectOption('Okolona');await page.locator('#home-search [type=submit]').click();assert.equal(await page.locator('.property-card:visible').count(),1);
});
await test('all real rental detail routes, galleries, showing/application links and Escape focus',async()=>{
 for(const [slug,count] of [['115-colonial-drive',19],['4005-smallboat-ct',17],['1106-cherokee-rd-unit-8',9],['1824-w-madison',15]]){
  await page.goto(base+'/#home/'+slug);await page.locator('.page-intro h1').waitFor();assert.equal(await page.locator('[data-gallery-index]').count(),count);
  const showing=await page.locator('.detail-actions .button-solid').getAttribute('href');assert.match(showing,/^sms:/);assert.ok(decodeURIComponent(showing).includes('showing'));
  assert.equal(await page.locator('.detail-actions .text-link').getAttribute('href'),'https://oaktownrentalsapplication.fillout.com/95');
  await page.locator('[data-open-gallery]').click();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('.lightbox .gallery-count').innerText(),`2 / ${count}`);
  await page.keyboard.press('Escape');assert.equal(await page.locator('.lightbox').evaluate(e=>e.open),false);
  assert.equal(await page.locator('[data-open-gallery]').evaluate(e=>document.activeElement===e),true);
 }
});
assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:results,failures:errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
