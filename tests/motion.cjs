const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=(process.env.OAKTOWN_BASE_URL||'http://127.0.0.1:8787').replace(/\/$/,'');
// Explicit test-only imagery: motion checks do not depend on a third-party CDN.
const fixture='<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="#47785b"/><path d="M0 480 360 0h280v480" fill="#b6c4ab"/></svg>';
async function setup(page){await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.fulfill({status:200,contentType:'image/svg+xml',body:fixture}));}
const active=page=>page.locator('[data-scene-image].is-active');
const running=page=>page.locator('#app').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>['running','pending'].includes(a.playState)).length);
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await setup(page);const passed=[];
try{
 await page.goto(base+'/');await page.locator('.story-photo').first().evaluate(e=>e.decode());
 await page.locator('[data-scene-button="1"]').click();
 assert.equal(await active(page).getAttribute('data-scene-image'),'1');assert.ok(await running(page)>0);passed.push('photo selection provides animated feedback');
 await page.locator('[data-scene-button="2"]').click();await page.locator('[data-scene-button="0"]').click();await page.waitForTimeout(750);
 assert.equal(await active(page).getAttribute('data-scene-image'),'0');assert.equal(await running(page),0);assert.equal(await active(page).evaluate(e=>Number(getComputedStyle(e).opacity)),1);passed.push('rapid selections settle on the latest full-opacity photo');
 const stage=await page.locator('.story-images').boundingBox();const copyBefore=await page.locator('.story-copy').boundingBox();
 await page.mouse.move(stage.x+stage.width*.85,stage.y+stage.height*.2);await page.waitForTimeout(300);
 const tilted=await page.locator('.story-images').boundingBox();assert.ok(Math.abs(tilted.x-stage.x)>.05||Math.abs(tilted.y-stage.y)>.05);assert.ok(Math.abs(tilted.x-stage.x)<15&&Math.abs(tilted.y-stage.y)<15);assert.deepEqual(await page.locator('.story-copy').boundingBox(),copyBefore);passed.push('desktop depth is bounded and leaves copy and actions stable');
 await page.mouse.move(10,110);await page.waitForTimeout(700);const reset=await page.locator('.story-images').boundingBox();assert.ok(Math.abs(reset.x-stage.x)<.5&&Math.abs(reset.y-stage.y)<.5);passed.push('pointer exit returns the photograph to its resting position');
 await page.locator('#homes').scrollIntoViewIfNeeded();await page.locator('[data-layout-button="gallery"]').click();await page.waitForTimeout(400);
 const gallery=await page.locator('.property-card:not([hidden]) .property-image-wrap').evaluateAll(a=>a.map(e=>getComputedStyle(e).transform));assert.ok(gallery.some(t=>t!=='none'));assert.equal(await page.locator('.property-data').first().evaluate(e=>getComputedStyle(e).transform),'none');passed.push('gallery view adds photo depth with flat readable rental facts');
 await page.locator('[data-layout-button="grid"]').click();assert.equal(await page.locator('.property-image-wrap').first().evaluate(e=>getComputedStyle(e).transform),'none');passed.push('comparison grid retains flat geometry');
 await page.locator('[data-scene-button="1"]').click();await page.locator('#motion-toggle').click();
 assert.equal(await page.locator('#motion-toggle').getAttribute('aria-pressed'),'false');assert.equal(await running(page),0);assert.equal(await active(page).getAttribute('data-scene-image'),'1');assert.equal(await page.locator('.story-images').evaluate(e=>getComputedStyle(e).transform),'none');passed.push('turning motion off cancels movement without changing the selected photo');
 await page.reload();assert.equal(await page.locator('#motion-toggle').getAttribute('aria-pressed'),'false');await page.locator('[data-scene-button="2"]').click();assert.equal(await running(page),0);passed.push('saved motion preference disables later photo animations');
 await page.locator('#motion-toggle').click();await page.locator('[data-scene-button="1"]').click();await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(50);
 assert.equal(await running(page),0);assert.equal(await page.locator('#motion-toggle').isDisabled(),true);assert.equal(await active(page).getAttribute('data-scene-image'),'1');passed.push('system reduced motion cancels active effects and retains state');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('[data-scene-button="2"]').click();
 const oldImage=await active(page).elementHandle();await page.locator('#language-switch').click();assert.equal(await page.locator('html').getAttribute('lang'),'es');assert.equal(await oldImage.evaluate(e=>e.getAnimations().length),0);passed.push('language redraw disposes of previous animations');
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await setup(mobile);await mobile.goto(base+'/');await mobile.locator('.story-photo').first().evaluate(e=>e.decode());const mstage=await mobile.locator('.story-images').boundingBox();await mobile.mouse.move(mstage.x+300,mstage.y+50);assert.equal(await mobile.locator('.story-images').evaluate(e=>getComputedStyle(e).transform),'none');await mobile.locator('[data-scene-button="2"]').click();await mobile.waitForTimeout(750);assert.equal(await active(mobile).getAttribute('data-scene-image'),'2');assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await mobile.close();passed.push('touch layout keeps depth off and photo controls usable');
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed,failures:[]},null,2));
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
