const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=(process.env.OAKTOWN_BASE_URL||'http://127.0.0.1:8787').replace(/\/$/,'');
const fixture='<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="#1c5030"/><path d="M0 480 640 0v480" fill="#c0d0b4"/></svg>';
async function setup(page,{lang='en',motion='on',unsupported=false,delayTransition=0}={}){
 await page.addInitScript(({lang,motion,unsupported,delayTransition})=>{
  localStorage.setItem('oaktown-language',lang);localStorage.setItem('oaktown-motion',motion);sessionStorage.setItem('oaktown-opening-seen','yes');
  window.transitionCalls=0;window.transitionReady=null;
  if(unsupported)document.startViewTransition=undefined;
  else if(document.startViewTransition){const start=document.startViewTransition.bind(document);document.startViewTransition=fn=>{window.transitionCalls++;const t=start(async()=>{if(delayTransition)await new Promise(resolve=>setTimeout(resolve,delayTransition));return fn();});window.lastTransition=t;t.ready.then(()=>window.transitionReady=true,()=>window.transitionReady=false);return t;};}
 },{lang,motion,unsupported,delayTransition});
 await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.fulfill({status:200,contentType:'image/svg+xml',body:fixture}));
}
async function freeze(page){
 await page.clock.install();
 await page.clock.pauseAt(new Date((await page.evaluate(()=>Date.now()))+1000));
}
// Small virtual steps allow image decode and render tasks to settle between slides.
async function advanceUntil(page,predicate,arg,budget=12000){
 for(let elapsed=0;elapsed<=budget;elapsed+=100){
  if(await page.evaluate(predicate,arg))return;
  await page.clock.runFor(100);
 }
 assert.fail('Expected slideshow state was not reached within the virtual-time budget');
}
async function selected(card,index){
 await advanceUntil(card.page(),({slug,index})=>document.querySelector(`[data-property-slug="${slug}"]`)?.dataset.selectedPhoto===String(index),{slug:await card.getAttribute('data-property-slug'),index});
}
const mainPhoto=card=>card.locator('.property-image:not(.property-preview)').first();
const bare=src=>new URL(src,base).href.split('?')[0];
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const passed=[],errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));await setup(page);await page.goto(base+'/#homes');const card=page.locator('.property-card').first();await card.scrollIntoViewIfNeeded();await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('[data-card-preview]').count(),0);assert.equal(await page.locator('.property-preview').count(),0);passed.push('cards have no preview button and extra photographs are not requested eagerly');
 const photos=await page.evaluate(()=>{const d=window.OAKTOWN_DATA,p=d.properties[0];return d.images[p.imageKey].map(src=>new URL(src,location.href).href.split('?')[0])});const initialMain=await mainPhoto(card).getAttribute('src');await freeze(page);
 await card.locator('.property-name a').focus();await page.clock.runFor(4000);assert.equal(await card.getAttribute('data-selected-photo'),'0');assert.equal(await card.locator('.property-preview').count(),0);passed.push('keyboard focus alone keeps the main photograph static');
 await card.locator('.property-name a').hover();
 const observed=[];
 for(const index of [...photos.keys()].slice(1).concat(0)){
  await selected(card,index);observed.push(index);
  const displayed=index===0?await mainPhoto(card).getAttribute('src'):await card.locator('.property-preview.is-current').getAttribute('src');
  assert.equal(bare(displayed),photos[index],`slide ${index} belongs to the hovered property`);
  assert.equal(await mainPhoto(card).getAttribute('src'),initialMain,'the main image remains unchanged');
 }
 assert.equal(new Set(observed).size,photos.length);passed.push('desktop hover over the property text cycles every photograph in order and loops to the main image');passed.push('every slideshow image belongs to the hovered property and leaves the main source intact');
 await selected(card,1);await card.locator('.property-name a').evaluate(el=>el.focus({preventScroll:true}));await page.mouse.move(5,5);
 assert.equal(await card.getAttribute('data-selected-photo'),'0');assert.equal(await card.evaluate(el=>el.classList.contains('is-previewing')),false);await page.clock.runFor(5000);assert.equal(await card.getAttribute('data-selected-photo'),'0');passed.push('pointer leave immediately restores the main photograph even while its link retains keyboard focus');
 await card.locator('.property-image-wrap').hover();await selected(card,1);const expected=photos[1];
 await page.evaluate(()=>{
  document.addEventListener('click',event=>{window.modifiedClickPrevented=event.defaultPrevented;event.preventDefault();},{once:true});
  document.querySelector('.property-image-wrap').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,ctrlKey:true,button:0}));
 });assert.equal(await page.evaluate(()=>window.modifiedClickPrevented),false);assert.equal(await page.evaluate(()=>window.transitionCalls),0);assert.equal(new URL(page.url()).hash,'#homes');passed.push('modified links are not intercepted by the app');
 await page.clock.resume();await card.locator('.property-image-wrap').click();await page.waitForSelector('.detail-cover');await page.evaluate(()=>window.lastTransition?.finished.catch(()=>{}));
 assert.equal(await page.evaluate(()=>window.transitionReady),true);assert.equal(await page.evaluate(()=>window.transitionCalls),1);assert.equal(bare(await page.locator('.detail-cover-photo').getAttribute('src')),expected);assert.equal(await page.locator('.gallery-heading .gallery-count').innerText(),'2 / 19');assert.equal(await page.locator('[style*="view-transition-name"]').count(),0);passed.push('shared-photo transition carries the currently displayed slideshow photograph into the listing');
 await page.locator('[data-gallery-index="2"]').click();const displayedCover=await page.locator('.detail-cover-photo').getAttribute('src');
 await page.locator('[data-cover-gallery]').click();assert.equal(await page.locator('.lightbox-image img').getAttribute('src'),displayedCover);assert.equal(await page.locator('.lightbox').evaluate(e=>e.open),true);await page.keyboard.press('Escape');assert.equal(await page.locator('[data-cover-gallery]').evaluate(e=>e===document.activeElement),true);passed.push('cover stays synchronized with gallery selection, enlarges that photo and restores focus');
 await page.goBack();await page.waitForSelector('.collection');assert.equal(await page.locator('.listing-dock').count(),0);assert.equal(await page.locator('.property-card').count(),6);assert.equal(await page.locator('.property-card').first().getAttribute('data-selected-photo'),'0');passed.push('browser Back restores the collection with main photographs and no stale listing UI');await page.close();
 for(const mode of ['unsupported','off','reduce']){
  const p=await browser.newPage({viewport:{width:1280,height:900}});p.on('pageerror',e=>errors.push(e.message));await setup(p,{unsupported:mode==='unsupported',motion:mode==='off'?'off':'on'});if(mode==='reduce')await p.emulateMedia({reducedMotion:'reduce'});await p.goto(base+'/#homes');
  if(mode!=='unsupported'){
   const c=p.locator('.property-card').first();await c.scrollIntoViewIfNeeded();await freeze(p);await c.locator('.property-image-wrap').hover();await p.clock.runFor(6000);assert.equal(await c.getAttribute('data-selected-photo'),'0');assert.equal(await c.locator('.property-preview').count(),0);await p.clock.resume();passed.push(mode+' preference keeps hovered cards static');
  }
  await p.locator('.property-name a').first().click();await p.waitForSelector('.detail-cover');assert.equal(await p.evaluate(()=>window.transitionCalls),0);assert.equal(await p.locator('[data-gallery-index]').count(),19);await p.close();passed.push(mode+' navigation fallback preserves full property details');
 }
 const rapid=await browser.newPage();rapid.on('pageerror',e=>errors.push(e.message));await setup(rapid,{delayTransition:200});await rapid.goto(base+'/#homes');await rapid.locator('.property-image-wrap').first().click();await rapid.waitForFunction(()=>window.transitionCalls===1);await rapid.evaluate(()=>{location.hash='#home/1824-w-madison'});await rapid.waitForFunction(()=>document.querySelector('.page-intro h1')?.textContent.includes('1824 W Madison'));await rapid.waitForTimeout(350);
 const correctPhoto=await rapid.evaluate(()=>{const d=window.OAKTOWN_DATA,p=d.properties.find(p=>p.slug==='1824-w-madison');return d.images[p.imageKey][0].split('?')[0]});assert.equal(bare(await rapid.locator('.detail-cover-photo').getAttribute('src')),correctPhoto);assert.equal(bare(await rapid.locator('.gallery-active').getAttribute('src')),correctPhoto);await rapid.close();passed.push('canceled delayed transition cannot overwrite the newer property with another home’s photo');
 const failed=await browser.newPage();failed.on('pageerror',e=>errors.push(e.message));await setup(failed);await failed.route('**/*',r=>bare(r.request().url())===photos[1]?r.abort():r.fallback());await failed.goto(base+'/#homes');const fcard=failed.locator('.property-card').first();await fcard.scrollIntoViewIfNeeded();await freeze(failed);await fcard.locator('.property-image-wrap').hover();await selected(fcard,2);assert.equal(bare(await fcard.locator('.property-preview.is-current').getAttribute('src')),photos[2]);assert.ok(await mainPhoto(fcard).evaluate(e=>e.naturalWidth>0));await failed.mouse.move(5,5);assert.equal(await fcard.getAttribute('data-selected-photo'),'0');await failed.close();passed.push('a failed slideshow photo is skipped while a usable main photograph remains available');
 const delayed=await browser.newPage();delayed.on('pageerror',e=>errors.push(e.message));await setup(delayed);let releasePhoto,requested=false;const photoGate=new Promise(resolve=>releasePhoto=resolve);
 await delayed.route('**/*',async r=>{if(bare(r.request().url())!==photos[1])return r.fallback();requested=true;await photoGate;await r.fulfill({status:200,contentType:'image/svg+xml',body:fixture})});
 await delayed.goto(base+'/#homes');const dcard=delayed.locator('.property-card').first();await dcard.scrollIntoViewIfNeeded();await freeze(delayed);await dcard.locator('.property-image-wrap').hover();
 for(let i=0;i<40&&!requested;i++)await delayed.clock.runFor(100);assert.ok(requested,'hover requests the next image');await delayed.mouse.move(5,5);releasePhoto();await delayed.clock.runFor(6000);assert.equal(await dcard.getAttribute('data-selected-photo'),'0');assert.equal(await dcard.evaluate(el=>el.classList.contains('is-previewing')),false);await delayed.close();passed.push('an image that decodes after pointer leave cannot resurrect the slideshow');
 const filtered=await browser.newPage();filtered.on('pageerror',e=>errors.push(e.message));await setup(filtered);await filtered.goto(base+'/#homes');const hiddenCard=filtered.locator('.property-card').first();await hiddenCard.scrollIntoViewIfNeeded();await freeze(filtered);await hiddenCard.locator('.property-image-wrap').hover();await selected(hiddenCard,1);await filtered.locator('#home-search').evaluate(form=>{form.elements.neighborhood.value='Cherokee Triangle';form.requestSubmit();});await filtered.clock.runFor(6000);assert.equal(await hiddenCard.isHidden(),true);assert.equal(await hiddenCard.getAttribute('data-selected-photo'),'0');assert.equal(await hiddenCard.evaluate(el=>el.classList.contains('is-previewing')),false);await filtered.close();passed.push('filtering out a hovered property cancels its slideshow and restores the main image');
 const paused=await browser.newPage();paused.on('pageerror',e=>errors.push(e.message));await setup(paused);await paused.goto(base+'/#homes');const pcard=paused.locator('.property-card').first();await pcard.scrollIntoViewIfNeeded();await freeze(paused);await pcard.locator('.property-image-wrap').hover();await selected(pcard,1);await paused.locator('#motion-toggle').evaluate(el=>el.click());await paused.clock.runFor(5000);assert.equal(await pcard.getAttribute('data-selected-photo'),'0');assert.equal(await pcard.evaluate(el=>el.classList.contains('is-previewing')),false);await paused.close();passed.push('turning Motion off cancels an already running slideshow');
 for(const [width,lang] of [[1440,'en'],[768,'en'],[390,'en'],[320,'es']]){
  const p=await browser.newPage({viewport:{width,height:900}});await setup(p,{lang});await p.goto(base+'/#home/115-colonial-drive');await p.waitForSelector('.details-bar');assert.equal(await p.locator('.listing-dock').isHidden(),true);
  await p.evaluate(()=>{const bar=document.querySelector('.details-bar'),header=document.querySelector('#site-header');scrollTo({top:bar.getBoundingClientRect().bottom+scrollY-header.offsetHeight+30,behavior:'instant'})});await p.waitForFunction(()=>!document.querySelector('.listing-dock').hidden);
  const dock=await p.locator('.listing-dock').boundingBox();const header=await p.locator('#site-header').boundingBox();assert.ok(dock.y>=header.y+header.height-1);assert.ok(dock.height<=80);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.ok((await p.locator('.listing-dock').innerText()).includes('1,699'));
  await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.waitForFunction(()=>document.querySelector('.listing-dock').hidden);await p.close();passed.push(`rental dock is readable, clears the header and hides at the title: ${width}px ${lang}`);
 }
 const touch=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});touch.on('pageerror',e=>errors.push(e.message));await setup(touch);await touch.goto(base+'/#homes');const tc=touch.locator('.property-card').first();await tc.scrollIntoViewIfNeeded();await freeze(touch);await tc.locator('.property-image-wrap').hover();await touch.clock.runFor(10000);assert.equal(await tc.getAttribute('data-selected-photo'),'0');assert.equal(await tc.locator('.property-preview').count(),0);assert.equal(await touch.locator('[data-card-preview]').count(),0);await touch.clock.resume();await tc.locator('.property-image-wrap').tap();await touch.waitForSelector('.detail-cover');await touch.evaluate(()=>window.lastTransition?.finished.catch(()=>{}));assert.equal(await touch.locator('[data-gallery-index]').count(),19);assert.equal(await touch.locator('.gallery-heading .gallery-count').innerText(),'1 / 19');await touch.close();passed.push('touch cards stay on the main photograph and tapping opens the complete gallery normally');
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed,failures:[]},null,2));
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
