const {chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.OAKTOWN_BASE_URL||'http://127.0.0.1:8933';
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const passed=[];try{
for(const lang of ['en','es']){
 const p=await b.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});await p.addInitScript(lang=>localStorage.setItem('oaktown-language',lang),lang);
 await p.goto(base);await p.locator('.cinematic-hero').waitFor();await p.waitForTimeout(150);assert.equal(await p.evaluate(()=>scrollY),0);
 await p.locator('.cinematic-scene[data-hero-scene="0"] .signature-button').click();await p.waitForURL('**/#homes');await p.waitForTimeout(150);assert.ok(await p.evaluate(()=>scrollY)>500);
 await p.reload();await p.locator('.property-card').first().waitFor({state:'attached'});await p.waitForTimeout(150);assert.ok(await p.evaluate(()=>scrollY)>500);
 await p.locator('.wordmark').click();await p.waitForTimeout(150);assert.equal(await p.evaluate(()=>scrollY),0);
 await p.goBack();await p.waitForTimeout(150);assert.equal(await p.evaluate(()=>location.hash),'#homes');assert.ok(await p.evaluate(()=>scrollY)>500);
 await p.goForward();await p.waitForTimeout(150);assert.equal(await p.evaluate(()=>scrollY),0);passed.push(lang+' fresh root, Browse Our Homes, deep-link refresh, logo and Back/Forward');
 await p.locator('.desktop-nav [href="#homes"]').click();await p.waitForTimeout(150);
 const size=await p.locator('.property-card').first().evaluate(c=>({w:c.offsetWidth,title:getComputedStyle(c.querySelector('.property-name')).fontSize,rent:getComputedStyle(c.querySelector('.property-price')).fontSize,deposit:parseFloat(getComputedStyle(c.querySelector('.property-deposit')).fontSize),location:parseFloat(getComputedStyle(c.querySelector('.property-location')).fontSize),specs:parseFloat(getComputedStyle(c.querySelector('.card-specs')).fontSize)}));
 assert.ok(Math.abs(size.w-1440*.38)<2);assert.equal(size.title,'26.64px');assert.equal(size.rent,'28.8px');assert.ok(size.deposit>=13&&size.location>=13&&size.specs>=14);assert.equal(await p.locator('.property-card').first().locator('.card-photo-dots button').count(),5);
 const targets=await p.locator('.property-details-line>a').evaluateAll(es=>es.map(a=>({text:a.textContent,href:a.getAttribute('href'),slug:a.closest('.property-card').dataset.propertySlug})));
 assert.equal(targets.length,4);for(const target of targets){assert.equal(target.text,lang==='es'?'Solicitar una visita':'Request a Tour');assert.ok(target.href.startsWith('sms:+15025001070?body='));}
 assert.ok(decodeURIComponent(targets.find(t=>t.slug.includes('cherokee')).href).includes('#8'));
 passed.push(lang+' 38vw/title/rent preserved, readable secondary type, five dots and exact-unit showing fallback');
 await p.locator('[data-layout-button="grid"]').click();assert.equal(await p.locator('#homes').getAttribute('data-layout'),'grid');assert.equal(await p.locator('.collection-bottom').isVisible(),false);
 const geometry=await p.locator('.property-card').evaluateAll(es=>es.map(e=>({x:e.offsetLeft,y:e.offsetTop,w:e.offsetWidth})));assert.equal(geometry[0].y,geometry[1].y);assert.ok(geometry[2].y>geometry[0].y);
 await p.locator('[name=neighborhood]').selectOption('Cherokee Triangle');await p.locator('#home-search [type=submit]').click();assert.equal(await p.locator('.property-card:not([hidden])').count(),1);
 await p.locator('.property-card:not([hidden]) .card-detail-link').click();await p.locator('.detail-cover').waitFor();await p.goBack();await p.locator('.property-card').first().waitFor({state:'attached'});assert.equal(await p.locator('#homes').getAttribute('data-layout'),'grid');assert.equal(await p.locator('[name=neighborhood]').inputValue(),'Cherokee Triangle');
 await p.reload();await p.locator('.property-card').first().waitFor({state:'attached'});assert.equal(await p.locator('#homes').getAttribute('data-layout'),'grid');
 await p.locator('#home-search [type=reset]').click();assert.equal(await p.locator('.property-card:not([hidden])').count(),4);
 await p.locator('[data-layout-button="grid"]').focus();await p.keyboard.press('ArrowLeft');assert.equal(await p.locator('#homes').getAttribute('data-layout'),'gallery');assert.equal(await p.locator('[data-layout-button="gallery"]').getAttribute('aria-pressed'),'true');
 passed.push(lang+' grid responsive columns, shared filter, detail/history, reload and keyboard segmented control');
 await p.close();
}
for(const width of [320,390,768,1024,1920]){
 const p=await b.newPage({viewport:{width,height:900},reducedMotion:'reduce'});await p.goto(base+'/#homes');await p.locator('.property-card').first().waitFor({state:'attached'});
 for(const mode of ['grid','gallery']){await p.locator('[data-layout-button="'+mode+'"]').click();assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await p.locator('.property-card').count(),4);}
 passed.push(width+'px grid/gallery no document overflow');await p.close();
}
const p=await b.newPage({reducedMotion:'reduce'});await p.goto(base);await p.locator('.cinematic-hero').waitFor();await p.evaluate(()=>scrollTo({top:600,behavior:'instant'}));await p.waitForTimeout(600);await p.reload();await p.locator('.cinematic-hero').waitFor();await p.waitForTimeout(150);assert.ok(Math.abs(await p.evaluate(()=>scrollY)-600)<4);passed.push('root refresh preserves an intentional reading position');await p.close();
console.log(JSON.stringify({passed,failures:[]},null,2));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
