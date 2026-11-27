const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.OAKTOWN_BASE_URL||'http://127.0.0.1:8930';
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const passed=[],errors=[];const test=async(name,fn)=>{await fn();passed.push(name)};
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(6000);
 page.on('pageerror',e=>errors.push(e.message));await page.route('https://**',r=>r.abort());
 await page.goto(base+'/#homes');await page.locator('.property-card').first().waitFor();
 const viewport=page.locator('.collection-viewport'),controls=page.locator('.collection-bottom');
 await viewport.scrollIntoViewIfNeeded();await page.waitForTimeout(600);
 const x=()=>viewport.evaluate(el=>el.scrollLeft);
 const edge=async()=>{const b=await viewport.boundingBox();await page.mouse.move(b.x+b.width-5,b.y+Math.min(100,b.height/2));};
 const reset=async()=>{await page.mouse.move(0,0);await viewport.scrollIntoViewIfNeeded();await page.waitForTimeout(150);await viewport.evaluate(el=>el.scrollTo({left:0,behavior:'instant'}));};
 await test('single row, full-width introduction, generous fixed widths and no redundant controls',async()=>{
  assert.equal(await page.locator('[data-view-all],[data-layout-button]').count(),0);
  const bounds=await page.locator('.property-card').evaluateAll(els=>els.map(el=>({top:el.offsetTop,width:el.offsetWidth})));
  assert.equal(new Set(bounds.map(b=>b.top)).size,1);assert.ok(Math.abs(bounds[0].width-1440*.44)<2);
  const intro=await page.locator('.collection-intro').boundingBox(),gallery=await viewport.boundingBox();assert.ok(intro.y+intro.height<=gallery.y);assert.ok(Math.abs(intro.width-gallery.width)<2);
  assert.equal(await controls.isVisible(),true);assert.equal(await viewport.getAttribute('tabindex'),'0');
 });
 await test('edge movement requires pointer intent, stops on leave, and has no timer',async()=>{
  await reset();await page.waitForTimeout(400);assert.equal(await x(),0);
  await edge();await page.waitForTimeout(450);assert.ok(await x()>20);
  await page.mouse.move(0,0);const stopped=await x();await page.waitForTimeout(350);assert.ok(Math.abs(await x()-stopped)<2);
 });
 await test('arrows and keyboard navigation stop at collection bounds without looping',async()=>{
  await reset();await page.locator('[data-collection-step="1"]').click();await page.waitForTimeout(650);assert.ok(await x()>500);
  await viewport.focus();await page.keyboard.press('End');await page.waitForTimeout(50);const end=await x();assert.ok(end>1000);assert.equal(await page.locator('[data-collection-step="1"]').isDisabled(),true);
  await page.keyboard.press('ArrowRight');await page.waitForTimeout(300);assert.ok(Math.abs(await x()-end)<2);
  await page.keyboard.press('Home');assert.equal(await x(),0);
 });
 await test('filter resets offset; single result retains width, stays left and hides navigation',async()=>{
  const width=await page.locator('.property-card').first().evaluate(el=>el.offsetWidth);
  await page.locator('[name=neighborhood]').selectOption('Cherokee Triangle');await page.locator('#home-search [type=submit]').click();await page.waitForTimeout(100);
  assert.equal(await x(),0);assert.equal(await controls.isVisible(),false);
  const card=page.locator('.property-card:not([hidden])');assert.equal(await card.count(),1);assert.equal(await card.evaluate(el=>el.offsetWidth),width);
  const b=await card.boundingBox(),v=await viewport.boundingBox();assert.ok(Math.abs(b.x-v.x)<2);
  await edge();await page.waitForTimeout(250);assert.equal(await x(),0);await page.mouse.move(0,0);
 });
 await test('two fitting results keep widths and left alignment; zero results remain usable',async()=>{
  await page.locator('#home-search [type=reset]').click();await page.setViewportSize({width:1200,height:1000});
  // The current four homes have no shared pair-only filter. A disposable CMS-like
  // pair exercises fit handling without changing production inventory.
  await page.locator('.property-card').evaluateAll(els=>els.forEach((el,i)=>el.hidden=i>1));await page.waitForTimeout(80);
  assert.equal(await controls.isVisible(),false);const cards=await page.locator('.property-card:not([hidden])').evaluateAll(els=>els.map(e=>({w:e.offsetWidth,left:e.offsetLeft})));
  assert.ok(Math.abs(cards[0].w-1200*.44)<2);assert.equal(cards[0].w,cards[1].w);
  await page.setViewportSize({width:1440,height:1000});await viewport.scrollIntoViewIfNeeded();await page.waitForTimeout(150);await edge();await page.waitForTimeout(250);assert.equal(await x(),0);await page.mouse.move(0,0); // Two homes never edge-drift, even if their fixed widths overflow.
  await page.locator('[name=neighborhood]').selectOption('Cherokee Triangle');await page.locator('[name=bedrooms]').selectOption('3');await page.locator('#home-search [type=submit]').click();
  assert.equal(await page.locator('.search-empty').isVisible(),true);assert.equal(await controls.isVisible(),false);
  await page.locator('#home-search [type=reset]').click();await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(80);assert.equal(await controls.isVisible(),true);
 });
 await test('motion toggle and reduced motion stop active edge movement but preserve controls',async()=>{
  await reset();await edge();await page.waitForTimeout(200);
  await page.locator('#motion-toggle').click();await reset();await edge();await page.waitForTimeout(300);assert.equal(await x(),0);
  await page.locator('[data-collection-step="1"]').click();assert.ok(await x()>500);
  await page.locator('#motion-toggle').click();await page.emulateMedia({reducedMotion:'reduce'});await reset();await edge();await page.waitForTimeout(250);assert.equal(await x(),0);
 });
 await test('manual scroll is preserved and resized fitting results reset safely',async()=>{
  await page.mouse.move(0,0);await viewport.evaluate(el=>el.scrollTo({left:350,behavior:'instant'}));assert.equal(await x(),350);
  await page.locator('[name=neighborhood]').selectOption('Russell');await page.locator('#home-search [type=submit]').click();
  await page.setViewportSize({width:1000,height:900});await page.waitForTimeout(100);assert.equal(await x(),0);assert.equal(await controls.isVisible(),false);
 });
 await page.close();
 await test('mobile touch swipe, Spanish labels, overflow containment and detail navigation',async()=>{
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});mobile.on('pageerror',e=>errors.push(e.message));
  await mobile.addInitScript(()=>localStorage.setItem('oaktown-language','es'));await mobile.route('https://**',r=>r.abort());await mobile.goto(base+'/#homes');await mobile.locator('.property-card').first().waitFor();
  const v=mobile.locator('.collection-viewport');await v.scrollIntoViewIfNeeded();
  assert.equal(await mobile.locator('[data-collection-step="1"]').getAttribute('aria-label'),'Siguiente vivienda');
  const box=await v.boundingBox();const cdp=await mobile.context().newCDPSession(mobile);const y=box.y+90;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:340,y}]});
  for(const x of [300,250,200,150,90]){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});await mobile.waitForTimeout(20);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await mobile.waitForTimeout(350);
  assert.ok(await v.evaluate(el=>el.scrollLeft)>100);assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await mobile.locator('[data-property-slug="4005-smallboat-ct"] .property-name a').click();await mobile.locator('.detail-cover').waitFor();assert.equal(await mobile.locator('[data-gallery-index]').count(),17);await mobile.close();
 });
 assert.deepEqual(errors,[]);await browser.close();console.log(JSON.stringify({passed},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
