const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const base=(process.env.OAKTOWN_BASE_URL||'http://127.0.0.1:8793').replace(/\/$/,'');
const fixture={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../data.js'),'utf8'),fixture);
const data=fixture.window.OAKTOWN_DATA;
const thirdPhoto=data.images[data.properties[0].imageKey][6].split('?')[0];
const decodedFixture=fs.readFileSync(require.resolve('../assets/oaktown-rentals-logo.jpg'));
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.OAKTOWN_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
 let checks=0;
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.addInitScript(()=>{
   window.__frames=0;window.__layoutReads=0;
   window.__navigationRequests=[];
   const scrollIntoView=Element.prototype.scrollIntoView;
   Element.prototype.scrollIntoView=function(options){window.__navigationRequests.push(options);return scrollIntoView.call(this,options);};
   const raf=window.requestAnimationFrame;
   window.requestAnimationFrame=function(callback){window.__frames++;return raf.call(this,callback);};
   const rect=Element.prototype.getBoundingClientRect;
   Element.prototype.getBoundingClientRect=function(){window.__layoutReads++;return rect.call(this);};
  });
  await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
  const portalPosition=async()=>{
   await page.evaluate(()=>{const story=document.querySelector('.story'),stage=document.querySelector('.story-stage');scrollTo({top:story.offsetTop+(story.offsetHeight-stage.offsetHeight)*.59,behavior:'instant'});});
   await page.waitForTimeout(150);
  };
  await page.goto(base+'/');await page.waitForSelector('.story-letter',{state:'attached'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(950);
  await portalPosition();
  assert.equal(await page.locator('.story-letter').evaluate(el=>el.hidden),true,'failed property photos never become a solid decorative O');checks++;
  const frames=await page.evaluate(()=>window.__frames);
  await page.waitForTimeout(350);
  assert.equal(await page.evaluate(()=>window.__frames),frames,'there is no idle requestAnimationFrame loop');checks++;
  const reads=await page.evaluate(()=>window.__layoutReads);
  await page.evaluate(()=>scrollBy({top:12,behavior:'instant'}));await page.waitForTimeout(150);
  assert.equal(await page.evaluate(()=>window.__layoutReads),reads,'scroll rendering reuses cached geometry');checks++;

  // Decode/readiness mechanics only: this original brand-logo JPEG is an
  // isolated test fixture, never a property image or visual review capture.
  await page.route('https://images.squarespace-cdn.com/**',r=>r.request().url().split('?')[0]===thirdPhoto?r.fulfill({body:decodedFixture,contentType:'image/jpeg'}):r.abort());
  await page.reload();await page.waitForSelector('.story-letter',{state:'attached'});
  await page.locator('[data-scene-image="2"] img').evaluate(img=>{img.loading='eager';return img.decode();});
  await portalPosition();
  const portal=await page.locator('.story-letter').evaluate(el=>({hidden:el.hidden,opacity:Number(el.style.opacity),source:el.style.backgroundImage,transform:el.style.transform}));
  const source=await page.locator('[data-scene-image="2"] img').evaluate(img=>img.currentSrc);
  assert.equal(portal.hidden,false,'a decoded third-chapter image enables the O');checks++;
  assert.ok(portal.opacity>.1&&portal.opacity<=.8);checks++;
  assert.ok(portal.source.includes(source),'O reuses the chapter’s existing responsive URL');checks++;
  assert.match(portal.transform,/scale\(/);checks++;
  await page.evaluate(()=>{const story=document.querySelector('.story'),stage=document.querySelector('.story-stage');scrollTo({top:(story.offsetHeight-stage.offsetHeight)*.95,behavior:'instant'});});
  await page.waitForTimeout(100);
  assert.equal(await page.locator('.story-letter').evaluate(el=>el.hidden),true,'O clears before browsing');checks++;
  await portalPosition();await page.locator('#motion-toggle').click();await page.waitForTimeout(100);
  assert.equal(await page.locator('.story-letter').evaluate(el=>el.hidden),true,'Motion off disables the O');checks++;
  await page.locator('#motion-toggle').click();await portalPosition();
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
  assert.equal(await page.locator('.story-letter').evaluate(el=>el.hidden),true,'reduced motion disables the O');checks++;
  await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);
  assert.equal(await page.locator('.story-letter').evaluate(el=>el.hidden),true,'phones keep photo chapters without O scaling');checks++;

  await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/');
  await page.locator('#homes').scrollIntoViewIfNeeded();await page.locator('[data-layout-button="gallery"]').click();await page.waitForTimeout(150);
  assert.match(await page.locator('.property-image-wrap').nth(1).evaluate(el=>el.style.transform),/rotateY/,'gallery perspective is restored');checks++;
  await page.locator('[data-filter="The Highlands|Cherokee Triangle"]').click();await page.waitForTimeout(100);
  const viewport=page.locator('.collection-viewport');
  await viewport.focus();await page.keyboard.press('End');await page.waitForTimeout(150);
  assert.equal(await page.locator('[data-collection-step="1"]').isDisabled(),true,'filtered gallery measures its new end');checks++;
  await page.keyboard.press('Home');await page.waitForTimeout(100);
  assert.equal(await page.locator('[data-collection-step="-1"]').isDisabled(),true);checks++;
  await page.locator('[data-layout-button="grid"]').click();await page.waitForTimeout(150);
  assert.equal(await page.locator('.property-image-wrap').nth(1).evaluate(el=>el.style.transform),'','grid clears perspective');checks++;
  await page.locator('[data-filter="All"]').click();await page.waitForTimeout(150);
  const rows=await page.locator('.property-details-line').evaluateAll(items=>items.slice(0,2).map(el=>el.getBoundingClientRect().top));
  assert.ok(Math.abs(rows[0]-rows[1])<2,'comparison-card facts align across a row');checks++;
  await page.locator('#motion-toggle').click();
  await page.evaluate(()=>{location.hash='homes';});await page.waitForTimeout(150);
  assert.equal(await page.evaluate(()=>window.__navigationRequests.at(-1)?.behavior),'instant','Motion off also disables animated anchor navigation');checks++;
  assert.equal(await page.locator('.footer-signature').count(),0);checks++;
  console.log(`${checks} cinematic checks passed: decoded-photo O guards, preferences, cached geometry, idle scheduling, filtered perspective and aligned cards.`);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
