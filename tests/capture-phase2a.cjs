// Actual browser requests only: failed-photo captures are not photo acceptance.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const output=path.resolve(__dirname,'../docs/oaktown-signature/phase2a');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const report=[];
 for(const [version,base] of [['before',process.env.OAKTOWN_BEFORE_URL||'http://127.0.0.1:8932'],['after',process.env.OAKTOWN_BASE_URL||'http://127.0.0.1:8930']]){
  for(const [size,width,height,lang] of [['desktop',1440,1000,'en'],['mobile',390,844,'en'],['mobile-es',390,844,'es'],['tablet',768,1024,'es']]){
   const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),failures=[];
   page.on('requestfailed',r=>{if(r.url().includes('squarespace-cdn'))failures.push({url:r.url(),error:r.failure()?.errorText});});
   await page.addInitScript(lang=>localStorage.setItem('oaktown-language',lang),lang);
   await page.goto(base);await page.locator('.property-card').first().waitFor();
   await page.evaluate(async()=>{await document.fonts.ready;await document.querySelector('.cinematic-photo').decode();});
   await page.screenshot({path:path.join(output,`${version}-${size}-hero.png`)});
   await page.locator('#homes').scrollIntoViewIfNeeded();
   // Scroll each lazy image into view so the mobile full collection is observed too.
   for(const card of await page.locator('.property-card').all()){await card.scrollIntoViewIfNeeded();}
   await page.waitForFunction(()=>[...document.querySelectorAll('.property-image')].every(i=>i.complete),{},{timeout:12000}).catch(()=>{});
   await page.locator('#homes').scrollIntoViewIfNeeded();await page.waitForTimeout(350);
   const photos=await page.locator('.property-image').evaluateAll(imgs=>imgs.map(i=>({url:i.currentSrc,loaded:i.naturalWidth>0,width:i.naturalWidth,height:i.naturalHeight})));
   const fallback=photos.some(i=>!i.loaded);
   await page.locator('#homes').screenshot({path:path.join(output,`${version}-${size}-collection${fallback?'-CDN-unavailable':''}.png`)});
   const geometry=await page.locator('.property-card').evaluateAll(els=>els.map(el=>({slug:el.dataset.propertySlug,width:el.offsetWidth,height:el.offsetHeight,text:el.innerText})));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false);
   report.push({version,size,width,height,lang,photos,geometry,overflow,failures});
   await page.close();
  }
 }
 fs.writeFileSync(path.join(output,'browser-comparison.json'),JSON.stringify(report,null,2)+'\n');
 for(const after of report.filter(r=>r.version==='after'))assert.deepEqual(after.geometry,report.find(r=>r.version==='before'&&r.size===after.size).geometry,`unchanged card geometry/copy: ${after.size}`);
 await browser.close();console.log('PASS: four before/after collection geometry and copy comparisons; actual photo outcomes recorded.');
})().catch(e=>{console.error(e);process.exit(1)});
