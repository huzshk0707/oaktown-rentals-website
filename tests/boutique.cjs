const {chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.OAKTOWN_BASE_URL||'http://127.0.0.1:8930';
const fixture='<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#789675"/></svg>';
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const passed=[],errors=[];
 const p=await browser.newPage({viewport:{width:1440,height:1100}});p.on('pageerror',e=>errors.push(e.message));
 await p.route('https://images.squarespace-cdn.com/**',r=>r.fulfill({contentType:'image/svg+xml',body:fixture}));
 await p.goto(base+'/#homes');await p.locator('.property-card').first().waitFor();const card=p.locator('.property-card').first();
 await card.scrollIntoViewIfNeeded();await p.mouse.move(0,0);
 const test=async(name,fn)=>{await fn();passed.push(name)};
 await test('approved 38vw width, single row, champagne price rail, preserved facts and no favorites',async()=>{
  assert.ok(Math.abs(await card.evaluate(e=>e.offsetWidth)-1440*.38)<2);
  assert.match(await card.locator('.property-price').innerText(),/1,699/);assert.equal(await p.locator('.property-card').count(),4);
  assert.equal(await card.locator('.card-spec svg').count(),2);assert.equal(await p.locator('.property-card .availability-badge').count(),1);
  assert.equal(await p.locator('[data-view-all],[data-favorite]').count(),0);assert.equal(await p.locator('[data-layout-button]').count(),2);
  assert.match(await card.locator('.property-price').evaluate(e=>getComputedStyle(e).backgroundImage),/linear-gradient/);
 });
 await test('manual photo controls update actual photo, dots/status, and stay on the collection',async()=>{
  await card.locator('[data-card-photo-step="1"]').click();await p.waitForFunction(()=>document.querySelector('.property-card').dataset.selectedPhoto==='1');
  assert.equal(await card.locator('[data-card-photo-index="1"]').getAttribute('aria-pressed'),'true');assert.match(await card.locator('[data-card-photo-status]').innerText(),/2 \/ 19/);assert.equal(new URL(p.url()).hash,'#homes');
  const previous=await card.locator('.property-preview.is-current').getAttribute('src');
  await card.locator('[data-card-photo-index="4"]').click();await p.waitForFunction(()=>document.querySelector('.property-card').dataset.selectedPhoto==='4');
  assert.equal(await card.locator('.property-preview.is-current').count(),1);
  assert.ok(await card.locator('.property-preview:not(.is-current)').evaluateAll((images,src)=>images.some(i=>i.getAttribute('src')===src&&i.style.opacity==='1'),previous));
  await p.waitForTimeout(350);assert.equal(await card.locator('.property-preview').count(),1);
  await card.locator('[data-card-photo-step="1"]').click();await p.waitForFunction(()=>document.querySelector('.property-card').dataset.selectedPhoto==='5');
  assert.equal(await card.locator('[data-card-photo-index="5"]').getAttribute('aria-pressed'),'true');
 });
 await test('keyboard photo controls retain focus, and pointer leave does not discard manual selection',async()=>{
  const dot=card.locator('[data-card-photo-index="6"]');await dot.focus();await p.keyboard.press('Enter');await p.waitForFunction(()=>document.querySelector('.property-card').dataset.selectedPhoto==='6');
  assert.equal(await p.evaluate(()=>document.activeElement.dataset.cardPhotoIndex),'6');await p.mouse.move(0,0);await p.waitForTimeout(800);assert.equal(await card.getAttribute('data-selected-photo'),'6');
 });
 await test('circular detail action expands the selected photo and Back restores link focus',async()=>{
  const source=await card.locator('.property-preview.is-current').getAttribute('src');
  await p.evaluate(()=>{window.boutiqueTransitions=0;const original=document.startViewTransition?.bind(document);if(original)document.startViewTransition=fn=>{window.boutiqueTransitions++;return original(fn);};});
  await card.locator('.card-detail-link').click();await p.locator('.detail-cover').waitFor();await p.waitForTimeout(650);
  assert.equal(await p.evaluate(()=>window.boutiqueTransitions),1);assert.equal(await p.locator('.detail-cover-photo').getAttribute('src'),source);
  assert.equal(await p.locator('.gallery-thumbs [aria-pressed=true]').getAttribute('data-gallery-index'),'6');
  await p.goBack();await p.locator('.property-card').first().waitFor();await p.waitForTimeout(150);
  assert.equal(await p.evaluate(()=>document.activeElement.classList.contains('card-detail-link')),true);
 });
 await test('failed manual photo keeps the genuine previous image and reports failure',async()=>{
  const c=p.locator('.property-card').first();const failed=await p.evaluate(()=>window.OAKTOWN_DATA.images.colonial[2].split('?')[0]);
  await p.route('https://images.squarespace-cdn.com/**',r=>r.request().url().split('?')[0]===failed?r.abort():r.fulfill({contentType:'image/svg+xml',body:fixture}));
  const previous=await c.getAttribute('data-selected-photo');await c.locator('[data-card-photo-index="2"]').click();await p.waitForFunction(()=>!document.querySelector('.card-media').hasAttribute('aria-busy'));
  assert.equal(await c.getAttribute('data-selected-photo'),previous);assert.match(await c.locator('[data-card-photo-status]').innerText(),/could not load/);
 });
 await test('reduced motion keeps manual controls functional without visual animations',async()=>{
  await p.emulateMedia({reducedMotion:'reduce'});await p.reload();await p.locator('.property-card').first().waitFor();
  await p.locator('.property-card').first().locator('[data-card-photo-index="3"]').click();await p.waitForFunction(()=>document.querySelector('.property-card').dataset.selectedPhoto==='3');
  assert.equal(await p.locator('.property-card').first().evaluate(el=>el.getAnimations({subtree:true}).length),0);
 });
 await test('approved second hero sentence and Spanish translation retain three scenes',async()=>{
  await p.goto(base+'/');assert.equal(await p.locator('[data-hero-scene="1"] h2').innerText(),'Well-cared-for homes across Greater Louisville.');
  await p.locator('#language-switch').click();assert.equal(await p.locator('[data-hero-scene="1"] h2').innerText(),'Viviendas bien cuidadas en el área metropolitana de Louisville.');assert.equal(await p.locator('[data-hero-scene]').count(),3);
 });
 assert.deepEqual(errors,[]);await browser.close();console.log(JSON.stringify({passed,failures:[]},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
