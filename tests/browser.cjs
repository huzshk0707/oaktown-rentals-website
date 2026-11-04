const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=(process.env.OAKTOWN_BASE_URL||'http://localhost:8787').replace(/\/$/,'');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.OAKTOWN_CHROMIUM||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),headless:true,args:['--no-sandbox']});
 const failures=[],passed=[];
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.on('pageerror',e=>failures.push(e.message));
 // External photos are blocked by the environment. Test layout and behavior with failed-image fallbacks.
 await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 const check=(name,fn)=>{try{fn();passed.push(name)}catch(e){failures.push(name+': '+e.message)}};
 await page.goto(base+'/');await page.waitForTimeout(250);
 
 const stage=await page.locator('.story-stage').boundingBox();check('desktop hero height',()=>assert.equal(stage.height,1000));
 for(const [progress,scene] of [[.1,0],[.5,1],[.9,2]]){
   await page.evaluate(p=>{const el=document.querySelector('.story');window.scrollTo({top:(el.offsetHeight-innerHeight)*p,behavior:'instant'})},progress);await page.waitForTimeout(80);
   const active=await page.locator('[data-scene].is-active').getAttribute('data-scene');check('scroll activates scene '+scene,()=>assert.equal(active,String(scene)));
 }
 await page.evaluate(()=>{const el=document.querySelector('.portal');scrollTo({top:el.offsetTop+(el.offsetHeight-innerHeight)*.9,behavior:'instant'})});await page.waitForTimeout(80);
 
 const portal=await page.locator('.portal-copy').evaluate(el=>({inert:el.inert,opacity:Number(getComputedStyle(el).opacity)}));check('portal links become accessible',()=>{assert.equal(portal.inert,false);assert.equal(portal.opacity,1)});
 await page.locator('#homes').scrollIntoViewIfNeeded();await page.waitForTimeout(300);
 await page.locator('[data-collection-step="1"]').click();await page.waitForTimeout(700);
 const scroll=await page.locator('.collection-viewport').evaluate(el=>el.scrollLeft);check('carousel next advances',()=>assert.ok(scroll>100));
 await page.locator('[data-filter="The Highlands|Cherokee Triangle"]').click();
 
 const names=await page.locator('.property-card:not([hidden]) .property-name').allTextContents();check('Highlands filter contents',()=>{assert.equal(names.length,2);assert.ok(names.every(n=>n.includes('Cherokee')))});
 const pressed=await page.locator('[data-filter="The Highlands|Cherokee Triangle"]').getAttribute('aria-pressed');check('filter exposes selected state',()=>assert.equal(pressed,'true'));
 await page.locator('[data-filter="All"]').click();
 await page.locator('.property-card').first().locator('.property-image-wrap').click();await page.waitForTimeout(200);
 const count=await page.locator('[data-gallery-index]').count();check('Colonial full gallery',()=>assert.equal(count,14));
 
 const inquiry=await page.locator('#mobile-inquiry').getAttribute('href');check('inquiry carries address',()=>assert.ok(decodeURIComponent(inquiry).includes('115 Colonial Drive')));
 await page.locator('[data-open-gallery]').click();await page.keyboard.press('ArrowRight');
 const counts=await page.locator('.gallery-count').allTextContents();check('keyboard gallery advances both counters',()=>assert.ok(counts.every(x=>x==='2 / 14')));
 await page.keyboard.press('Escape');await page.waitForTimeout(50);
 
 const modal=await page.locator('.lightbox').evaluate(el=>({open:el.open,locked:document.body.classList.contains('gallery-is-open'),focus:document.activeElement.hasAttribute('data-open-gallery')}));check('Escape restores page and focus',()=>{assert.equal(modal.open,false);assert.equal(modal.locked,false);assert.equal(modal.focus,true)});
 await page.goto(base+'/#home/%E0%A4%A');
 const main=await page.locator('#app>section').count();check('malformed route has content',()=>assert.ok(main>0));
 for(const width of [320,390,768,1024,1440,1920]){
   await page.setViewportSize({width,height:900});await page.goto(base+'/');await page.waitForTimeout(150);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);check('no horizontal document overflow at '+width,()=>assert.equal(overflow,false));
 }
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/');await page.waitForTimeout(200);
 await page.locator('[data-scene-button="1"]').click();
 const active=await page.locator('[data-scene].is-active').getAttribute('data-scene');check('mobile second scene active',()=>assert.equal(active,'1'));
 await page.locator('#menu-button').click();await page.keyboard.press('Escape');const hidden=await page.locator('#mobile-nav').isHidden();check('mobile menu closes with Escape',()=>assert.equal(hidden,true));
 await page.locator('#language-switch').click();const text=await page.locator('[data-scene-button="1"]').innerText();check('new experience translates',()=>assert.ok(text.includes('día')));

 await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/');await page.waitForTimeout(150);
 const sizes=await page.evaluate(()=>({story:document.querySelector('.story').offsetHeight,stage:document.querySelector('.story-stage').offsetHeight,portal:document.querySelector('.portal').offsetHeight,portalStage:document.querySelector('.portal-stage').offsetHeight}));check('reduced motion removes scroll pinning',()=>{assert.equal(sizes.story,sizes.stage);assert.equal(sizes.portal,sizes.portalStage)});
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(base+'/');await page.locator('#motion-toggle').click();await page.reload();const motion=await page.locator('#motion-toggle').getAttribute('aria-pressed');check('motion remains disabled after reload',()=>assert.equal(motion,'false'));
 await page.locator('#motion-toggle').click();await page.waitForTimeout(250);
console.log(JSON.stringify({passed,failures},null,2));await browser.close();if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
