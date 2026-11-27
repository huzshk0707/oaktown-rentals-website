/* Signature replaced the pinned three-chapter opening. Preserve the motion
   contract: native scroll, explicit photo choice, stable layout and off/reduce. */
const {chromium}=require('playwright');const assert=require('node:assert/strict');
const base=(process.env.OAKTOWN_BASE_URL||'http://127.0.0.1:8930').replace(/\/$/,'');
(async()=>{const b=await chromium.launch({executablePath:process.env.OAKTOWN_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});const passed=[];try{
for(const [width,height,language] of [[1440,1000,'en'],[768,1024,'es'],[390,844,'en'],[320,640,'es']]){
 const p=await b.newPage({viewport:{width,height}});await p.addInitScript(lang=>localStorage.setItem('oaktown-language',lang),language);await p.route('https://**',r=>r.abort());await p.goto(base+'/');await p.locator('.signature-hero').waitFor();
 await p.evaluate(()=>scrollTo({top:180,behavior:'instant'}));await p.waitForTimeout(100);assert.notEqual(await p.locator('.signature-images').evaluate(e=>getComputedStyle(e).transform),'none');
 await p.locator('[data-hero-button="1"]').evaluate(e=>e.click());await p.evaluate(()=>scrollBy({top:50,behavior:'instant'}));await p.waitForTimeout(100);assert.equal(await p.locator('[data-hero-button="1"]').getAttribute('aria-pressed'),'true','scroll does not override an explicit photograph selection');
 await p.locator('#homes').scrollIntoViewIfNeeded();await p.waitForTimeout(500);const top=await p.locator('#homes').evaluate(e=>e.getBoundingClientRect().top);
 await p.locator('#motion-toggle').evaluate(e=>e.click());await p.waitForTimeout(100);assert.equal(await p.locator('.signature-images').evaluate(e=>getComputedStyle(e).transform),'none');assert.ok(Math.abs(top-await p.locator('#homes').evaluate(e=>e.getBoundingClientRect().top))<3,'pausing does not shift content');
 await p.locator('#motion-toggle').evaluate(e=>e.click());await p.waitForTimeout(100);assert.ok(Math.abs(top-await p.locator('#homes').evaluate(e=>e.getBoundingClientRect().top))<3,'resuming does not shift content');
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(100);assert.equal(await p.locator('.signature-images').evaluate(e=>getComputedStyle(e).transform),'none');assert.equal(await p.locator('#motion-toggle').isDisabled(),true);assert.equal(await p.locator('.signature-slide').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
 await p.locator('[data-hero-button="0"]').evaluate(e=>e.click());assert.equal(await p.locator('[data-hero-button="0"]').getAttribute('aria-pressed'),'true');
 passed.push(`${width}px ${language}: restrained scroll motion, explicit photo choice, pause/resume without layout shift and reduced-motion usability`);await p.close();
}
console.log(JSON.stringify({passed,failures:[]},null,2));}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
