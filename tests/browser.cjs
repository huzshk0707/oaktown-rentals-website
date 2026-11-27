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
 
 const stage=await page.locator('.cinematic-stage').boundingBox();check('desktop cinematic stage fills one screen',()=>assert.equal(stage.height,1000));
 for(const scene of [0,1,2]){
   await page.locator('[data-hero-scene-button="'+scene+'"]').click();
   await page.waitForFunction(index=>document.querySelector('.cinematic-hero').dataset.scene===String(index),scene);
   const currentScene=await page.locator('.cinematic-hero').getAttribute('data-scene');
   check('scene navigation '+scene,()=>assert.equal(currentScene,String(scene)));
 }
 await page.evaluate(()=>scrollTo({top:200,behavior:'instant'}));await page.waitForTimeout(100);
 const movement=await page.locator('.signature-images').evaluate(el=>getComputedStyle(el).transform);check('native scroll subtly moves the hero photography',()=>assert.notEqual(movement,'none'));
 const homesTop=await page.locator('#homes').evaluate(el=>el.getBoundingClientRect().top+scrollY);check('homes start within three desktop screens',()=>assert.ok(homesTop<=3000));
 const grid=await page.locator('.property-grid').evaluate(el=>({display:getComputedStyle(el).display,columns:getComputedStyle(el).gridTemplateColumns.split(' ').length}));check('default property view has four comparison columns',()=>{assert.equal(grid.display,'grid');assert.equal(grid.columns,4)});
 await page.locator('#homes').scrollIntoViewIfNeeded();await page.waitForTimeout(300);
 await page.locator('[data-layout-button="gallery"]').click();
 await page.locator('[data-collection-step="1"]').click();await page.waitForTimeout(700);
 const scroll=await page.locator('.collection-viewport').evaluate(el=>el.scrollLeft);check('carousel next advances',()=>assert.ok(scroll>100));
 await page.locator('[name=neighborhood]').selectOption('Cherokee Triangle');await page.locator('#home-search [type=submit]').click();
 
 const names=await page.locator('.property-card:not([hidden]) .property-name').allTextContents();check('Highlands filter contents',()=>{assert.equal(names.length,1);assert.ok(names.every(n=>n.includes('Cherokee')))});
 const selected=await page.locator('[name=neighborhood]').inputValue();check('filter exposes selected state',()=>assert.equal(selected,'Cherokee Triangle'));
 await page.locator('[data-layout-button="grid"]').click();await page.waitForTimeout(100);
 const layout=await page.locator('.collection-viewport').evaluate(el=>({scroll:el.scrollLeft,tabIndex:el.getAttribute('tabindex'),overflow:el.scrollWidth>el.clientWidth}));check('grid restores all columns after filtering gallery',()=>{assert.equal(layout.scroll,0);assert.equal(layout.tabIndex,null);assert.equal(layout.overflow,false)});
 await page.locator('#home-search [type=reset]').click();
 await page.locator('.property-card').first().locator('.property-image-wrap').click();await page.waitForTimeout(200);
 const count=await page.locator('[data-gallery-index]').count();check('Colonial full gallery',()=>assert.equal(count,19));
 const introContrast=await page.locator('.page-intro').evaluate(section=>{
   const channels=color=>color.match(/[\d.]+/g).slice(0,3).map(Number).map(c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4});
   const luminance=color=>channels(color).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
   const background=luminance(getComputedStyle(section).backgroundColor);
   return ['h1','.intro-sub'].map(selector=>{const foreground=luminance(getComputedStyle(section.querySelector(selector)).color);return (Math.max(foreground,background)+.05)/(Math.min(foreground,background)+.05)});
 });
 check('listing address meets large-text contrast',()=>assert.ok(introContrast[0]>=3,JSON.stringify(introContrast)));
 check('listing summary meets body-text contrast',()=>assert.ok(introContrast[1]>=4.5,JSON.stringify(introContrast)));
 
 const inquiry=await page.locator('#mobile-inquiry').getAttribute('href');check('inquiry carries address',()=>assert.ok(decodeURIComponent(inquiry).includes('115 Colonial Drive')));
 const showing=await page.locator('.detail-actions .button-solid').getAttribute('href');check('showing request has property and purpose',()=>assert.ok(decodeURIComponent(showing).includes('request a showing at 115 Colonial Drive')));
 const order=await page.evaluate(()=>document.querySelector('.gallery').compareDocumentPosition(document.querySelector('.detail-body'))&Node.DOCUMENT_POSITION_FOLLOWING);check('gallery precedes description',()=>assert.ok(order));
 await page.locator('[data-open-gallery]').click();await page.keyboard.press('ArrowRight');
 const counts=await page.locator('.gallery-count').allTextContents();check('keyboard gallery advances both counters',()=>assert.ok(counts.every(x=>x==='2 / 19')));
 await page.keyboard.press('Escape');await page.waitForTimeout(50);
 
 const modal=await page.locator('.lightbox').evaluate(el=>({open:el.open,locked:document.body.classList.contains('gallery-is-open'),focus:document.activeElement.hasAttribute('data-open-gallery')}));check('Escape restores page and focus',()=>{assert.equal(modal.open,false);assert.equal(modal.locked,false);assert.equal(modal.focus,true)});
 await page.goto(base+'/#home/%E0%A4%A');
 const main=await page.locator('#app>section').count();check('malformed route has content',()=>assert.ok(main>0));
 for(const width of [320,390,768,1024,1440,1920]){
   await page.setViewportSize({width,height:900});await page.goto(base+'/');await page.waitForTimeout(150);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);check('no horizontal document overflow at '+width,()=>assert.equal(overflow,false));
 }
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/');await page.waitForTimeout(200);
 const cta=await page.locator('[data-hero-scene="0"] .signature-button').ariaSnapshot();check('mobile hero has a named homes link',()=>assert.ok(cta.includes('link "Browse Our Homes"')));
 const ctaLabel=await page.locator('[data-hero-scene="0"] .signature-button').first().isVisible();check('mobile homes CTA retains its text',()=>assert.equal(ctaLabel,true));
 const mobileState=await page.locator('.cinematic-hero').evaluate(el=>({scene:el.dataset.scene,animated:el.classList.contains('is-cinematic'),hidden:el.querySelector('[data-hero-scene="0"]').getAttribute('aria-hidden')}));
 check('mobile has a static accessible scene',()=>assert.deepEqual(mobileState,{scene:'0',animated:false,hidden:'false'}));
 const mobileScenes=await page.locator('.cinematic-progress').isVisible();check('mobile scene controls are omitted',()=>assert.equal(mobileScenes,false));
 await page.locator('#menu-button').click();await page.keyboard.press('Escape');const hidden=await page.locator('#mobile-nav').isHidden();check('mobile menu closes with Escape',()=>assert.equal(hidden,true));
 await page.locator('#language-switch').click();const text=await page.locator('[data-hero-scene="0"] .signature-button').innerText();check('hero action translates',()=>assert.match(text,/Ver nuestras viviendas/));
 await page.reload();const lang=await page.locator('html').getAttribute('lang');check('Spanish preference survives reload',()=>assert.equal(lang,'es'));
 await page.setViewportSize({width:320,height:640});await page.goto(base+'/');
 const space=await page.evaluate(()=>({copy:document.querySelector('.cinematic-mobile-description').getBoundingClientRect().bottom,button:document.querySelector('.signature-copy .signature-button').getBoundingClientRect().top}));
 check('Spanish static hero copy clears CTA at 320px',()=>assert.ok(space.copy<space.button));
 for(const [slug,heading,term] of [
   ['115-colonial-drive','Un lugar para sentirte en casa','Los inquilinos pagan los servicios públicos'],
   ['1824-w-madison','Una casa con espacio en el sótano','Contrato de un año'],
   ['4005-smallboat-ct','Comodidad en cada rincón','Es necesario confirmar las visitas'],
   ['1106-cherokee-rd-unit-8','Un toque más de encanto','Los inquilinos pagan LG&E']
 ]){
   await page.goto(base+'/#home/'+slug);
   const content=await page.locator('.detail-body').innerText(),terms=await page.locator('.amenities').innerText();
   check('Spanish detail and terms: '+slug,()=>{assert.ok(content.includes(heading));assert.ok(terms.includes(term));assert.ok(!content.includes('The kitchen'));});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   check('Spanish detail fits 320px: '+slug,()=>assert.equal(overflow,false));
 }
 await page.locator('[data-gallery-index="2"]').click();
 await page.locator('.gallery').scrollIntoViewIfNeeded();
 const before=await page.locator('.gallery').evaluate(el=>el.getBoundingClientRect().top);
 // Click the visible sticky control directly. Locator auto-scrolling can move
 // the document before the click, invalidating this reading-position assertion.
 const languageControl=await page.locator('#language-switch').boundingBox();
 await page.mouse.click(languageControl.x+languageControl.width/2,languageControl.y+languageControl.height/2);
 const after=await page.locator('.gallery').evaluate(el=>el.getBoundingClientRect().top);
 const retained=await page.locator('.gallery > .gallery-heading .gallery-count').innerText();
 check('language change retains gallery photo and reading position',()=>{assert.equal(retained,'3 / 9');assert.ok(Math.abs(before-after)<3);});

 await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/');await page.waitForTimeout(150);
 const sizes=await page.evaluate(()=>({position:getComputedStyle(document.querySelector('.signature-hero')).position,transition:getComputedStyle(document.querySelector('.cinematic-photo')).transitionDuration,disabled:document.querySelector('#motion-toggle').disabled}));check('reduced motion keeps a static hero and disables transitions',()=>{assert.notEqual(sizes.position,'sticky');assert.ok(['0s','1e-05s'].includes(sizes.transition));assert.equal(sizes.disabled,true)});
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(base+'/');await page.locator('#motion-toggle').click();await page.reload();const motion=await page.locator('#motion-toggle').getAttribute('aria-pressed');check('motion remains disabled after reload',()=>assert.equal(motion,'false'));
 await page.locator('#motion-toggle').click();await page.waitForTimeout(250);
console.log(JSON.stringify({passed,failures},null,2));await browser.close();if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
