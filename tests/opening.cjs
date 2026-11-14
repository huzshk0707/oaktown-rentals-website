const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const base=(process.env.OAKTOWN_BASE_URL||'http://127.0.0.1:8793').replace(/\/$/,'');
const fixture={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../data.js'),'utf8'),fixture);
const data=fixture.window.OAKTOWN_DATA;
const firstPhoto=data.images[data.properties[0].imageKey][0].split('?')[0];
const jpeg=fs.readFileSync(require.resolve('../assets/oaktown-rentals-logo.jpg'));
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.OAKTOWN_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
 const contexts=[];let checks=0;
 async function fresh(options={}){
  const context=await browser.newContext({viewport:options.mobile?{width:390,height:844}:{width:1440,height:1000},reducedMotion:options.reduce?'reduce':'no-preference'});contexts.push(context);
  const page=await context.newPage();
  await page.addInitScript(({off,saveData})=>{
   if(off)localStorage.setItem('oaktown-motion','off');
   if(saveData)Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true});
  },options);
  await page.route('**/*',route=>route.request().url().startsWith(base+'/')?route.continue():route.abort());
  if(options.photo)await page.route('https://images.squarespace-cdn.com/**',async route=>{
   if(route.request().url().split('?')[0]!==firstPhoto)return route.abort();
   if(options.slow)await new Promise(resolve=>setTimeout(resolve,950));
   // Decode timing fixture only; never captured as property photography.
   return route.fulfill({body:jpeg,contentType:'image/jpeg'});
  });
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('.story-title',{state:'attached'});
  return page;
 }
 const animations=page=>page.evaluate(()=>({title:document.querySelector('.story-title').getAnimations().length,photo:document.querySelector('.story-images').getAnimations().length}));
 try{
  const loadingContext=await browser.newContext({viewport:{width:1440,height:1000}});contexts.push(loadingContext);
  const loadingPage=await loadingContext.newPage();
  await loadingPage.route('**/api/properties',async route=>{await new Promise(resolve=>setTimeout(resolve,650));return route.fulfill({status:404});});
  await loadingPage.goto(base+'/',{waitUntil:'domcontentloaded'});
  assert.ok(await loadingPage.locator('#footer').evaluate(el=>el.getBoundingClientRect().top>=innerHeight),'startup reserves the hero instead of flashing the footer');checks++;
  await loadingPage.waitForSelector('.story-title',{state:'attached'});
  assert.equal(await loadingPage.locator('#app > noscript').count(),0,'the reservation clears when the actual homepage renders');checks++;
  let page=await fresh();
  assert.ok((await animations(page)).title>0,'fresh visits get the headline entrance');checks++;
  assert.equal(await page.locator('.story-explore').isVisible(),true,'View Homes stays available during the entrance');checks++;
  await page.waitForTimeout(850);
  assert.deepEqual(await animations(page),{title:0,photo:0},'blocked photos settle naturally without a fake reveal');checks++;
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('oaktown-opening-seen')),'yes');checks++;
  await page.reload();await page.waitForSelector('.story-title',{state:'attached'});
  assert.deepEqual(await animations(page),{title:0,photo:0},'reload does not replay the intro in the same tab');checks++;
  await page.locator('#language-switch').click();
  assert.equal((await animations(page)).title,0,'language changes do not replay the entrance');checks++;

  page=await fresh();await page.mouse.wheel(0,120);await page.waitForTimeout(40);
  assert.deepEqual(await animations(page),{title:0,photo:0},'scroll interrupts the entrance immediately');checks++;
  page=await fresh();await page.keyboard.press('Tab');
  assert.deepEqual(await animations(page),{title:0,photo:0},'keyboard navigation interrupts motion');checks++;
  page=await fresh();await page.locator('#motion-toggle').click();
  assert.deepEqual(await animations(page),{title:0,photo:0},'Motion off cancels the active entrance');checks++;
  page=await fresh({off:true});assert.deepEqual(await animations(page),{title:0,photo:0});checks++;
  page=await fresh({reduce:true});assert.deepEqual(await animations(page),{title:0,photo:0});checks++;
  page=await fresh({saveData:true});assert.deepEqual(await animations(page),{title:0,photo:0});checks++;

  page=await fresh({photo:true});
  await page.waitForFunction(()=>document.querySelector('.story-images').getAnimations().length>0);
  const desktopFrames=await page.locator('.story-images').evaluate(el=>el.getAnimations()[0].effect.getKeyframes());
  assert.equal(desktopFrames[0].transform,'scale(0.9)','decoded desktop photography expands from a restrained frame');checks++;
  await page.waitForTimeout(1100);assert.deepEqual(await animations(page),{title:0,photo:0});checks++;
  assert.equal(await page.locator('.story-images').evaluate(el=>el.style.transform),'','finished entrance leaves no persistent transform');checks++;
  page=await fresh({photo:true,mobile:true});
  await page.waitForFunction(()=>document.querySelector('.story-images').getAnimations().length>0);
  const mobileFrames=await page.locator('.story-images').evaluate(el=>el.getAnimations()[0].effect.getKeyframes());
  assert.equal(mobileFrames.some(frame=>Object.hasOwn(frame,'transform')),false,'phones use a lighter opacity-only photo reveal');checks++;
  page=await fresh({photo:true,slow:true});
  await page.locator('[data-scene-image="0"] img').evaluate(img=>img.decode());
  assert.deepEqual(await animations(page),{title:0,photo:0},'late photo loading never starts a surprise intro');checks++;
  console.log(`${checks} opening checks passed: immediate actions, once per tab, input interruption, preferences, decoded/late photos, mobile and clean settlement.`);
 }finally{for(const context of contexts)await context.close();await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
