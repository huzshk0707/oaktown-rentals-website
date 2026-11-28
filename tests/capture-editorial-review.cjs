// Live preview evidence + explicitly labelled, browser-only editorial proposal.
// No production assets, gallery records, server routes or source photos are replaced.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.OAKTOWN_BASE_URL||'https://felix-oaktown-signature-oaktown.rentals10.workers.dev';
const output=path.resolve(__dirname,'../docs/oaktown-signature/phase2b');
const report=[],axeResults=[];
const axePath=process.env.OAKTOWN_AXE_PATH||'/tmp/signature-axe/node_modules/axe-core/axe.min.js';
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  async function open(width,height,lang='en',reduce=true){
   const p=await browser.newPage({viewport:{width,height},reducedMotion:reduce?'reduce':'no-preference'});
   await p.addInitScript(lang=>localStorage.setItem('oaktown-language',lang),lang);
   await p.goto(base+'/#homes',{waitUntil:'domcontentloaded'});await p.locator('.property-card').first().waitFor();
   await p.evaluate(()=>document.fonts.ready);
   for(const card of await p.locator('.property-card').all())await card.scrollIntoViewIfNeeded();
   await p.waitForFunction(()=>[...document.querySelectorAll('.property-image')].every(i=>i.complete&&i.naturalWidth>0));
   await p.locator('.collection-viewport').evaluate(el=>el.scrollTo({left:0,behavior:'instant'}));
   await align(p);return p;
  }
  async function align(p){await p.locator('#homes').evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-100,behavior:'instant'}));await p.waitForTimeout(160);}
  async function capture(p,name){
   await align(p);
   const state=await p.evaluate(()=>({width:innerWidth,height:innerHeight,lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth>innerWidth,x:document.querySelector('.collection-viewport').scrollLeft,prototype:document.querySelector('#homes').hasAttribute('data-editorial-review'),cards:[...document.querySelectorAll('.property-card:not([hidden])')].map(el=>{const i=el.querySelector('.property-image'),r=i.getBoundingClientRect(),c=getComputedStyle(i);return {slug:el.dataset.propertySlug,width:el.offsetWidth,loaded:i.complete&&i.naturalWidth>0,currentSrc:i.currentSrc,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,displayWidth:r.width,displayHeight:r.height,objectFit:c.objectFit,objectPosition:c.objectPosition};})}));
   assert.equal(state.overflow,false);assert.ok(state.cards.every(c=>c.loaded));
   await screenshotRegion(p,'#homes',name);
   const after=await p.locator('.collection-viewport').evaluate(el=>el.scrollLeft);assert.ok(Math.abs(after-state.x)<2,'capture must preserve horizontal offset');report.push({name,...state});
  }
  async function screenshotRegion(p,selector,name){
   if(selector!== '#homes'){
    await p.locator(selector).evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-100,behavior:'instant'}));
    await p.waitForTimeout(160);
   }
   await p.screenshot({path:path.join(output,name+'.png')});
  }
  async function scan(p,name,scope='#homes'){
   if(!await p.evaluate(()=>typeof axe!=='undefined'))await p.addScriptTag({path:axePath});
   axeResults.push({name,...await p.evaluate(async scope=>{const r=await axe.run(scope,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return {violations:r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,count:v.nodes.length}))};},scope)});
  }
  async function prototype(p){
   await p.addStyleTag({path:path.join(output,'editorial-prototype.css')});
   await p.evaluate(()=>{
    document.querySelector('#homes').setAttribute('data-editorial-review','');
    const es=document.documentElement.lang==='es';
    for(const card of document.querySelectorAll('.property-card')){
     const property=window.OAKTOWN_DATA.properties.find(p=>p.slug===card.dataset.propertySlug);
     const spec=card.querySelector('.property-details-line>span');spec.className='review-specs';
     const bed='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18V6m18 12v-8H3m0 5h18M6 10V7h5v3m2 0V7h5v3"/></svg>';
     const bath='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h18m-17 0v3a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-3M6 19v2m12-2v2M6 12V5a2 2 0 0 1 4 0v1m-2 0h4"/></svg>';
     spec.innerHTML='<span class="review-spec">'+bed+property.bedrooms+' '+(es?'hab.':property.bedrooms===1?'bed':'beds')+'</span><span class="review-spec">'+bath+property.bathrooms+' '+(es?'baño':'bath')+'</span>';
     const action=card.querySelector('.property-details-line>a');action.href='#home/'+property.slug;action.setAttribute('aria-label',(es?'Ver vivienda: ':'View home: ')+property.name);action.innerHTML=(es?'Ver vivienda':'View home')+' <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
    }
   });
  }
  for(const [label,width,height,lang] of [['desktop',1440,1280,'en'],['mobile',390,1280,'en'],['mobile-es',390,1280,'es'],['narrow-es',320,1280,'es']]){
   const p=await open(width,height,lang);
   await capture(p,'current-'+label+'-left');await scan(p,'current-'+label);
   await p.locator('.collection-viewport').focus();await p.keyboard.press('End');await p.waitForTimeout(80);await capture(p,'current-'+label+'-right');
   await p.locator('[name=neighborhood]').selectOption('Cherokee Triangle');await p.locator('#home-search [type=submit]').click();await capture(p,'current-'+label+'-one');
   assert.equal(await p.locator('.property-card:not([hidden])').count(),1);assert.equal(await p.locator('.collection-bottom').isVisible(),false);
   await p.locator('#home-search [type=reset]').click();
   // No existing single-area/bed/bath combination selects exactly two homes.
   // Add a browser-only combined option, exercising the existing pipe-filter path.
   await p.locator('[name=neighborhood]').evaluate(select=>select.add(new Option('St. Matthews + Okolona (review fixture)','St. Matthews|Okolona')));
   await p.locator('[name=neighborhood]').selectOption('St. Matthews|Okolona');await p.locator('#home-search [type=submit]').click();
   await capture(p,'current-'+label+'-two-review-fixture');assert.equal(await p.locator('.property-card:not([hidden])').count(),2);
   await p.locator('#home-search [type=reset]').click();await prototype(p);await capture(p,'proposal-'+label+'-left');await scan(p,'proposal-'+label);
   await p.locator('.collection-viewport').focus();await p.keyboard.press('End');await capture(p,'proposal-'+label+'-right');
   await p.close();
  }
  for(const [label,width,height,lang] of [['desktop',1440,1280,'en'],['mobile-es',390,1280,'es']]){
   const p=await open(width,height,lang);
   for(const property of JSON.parse(fs.readFileSync(path.join(output,'../phase2a/catalogue-audit.json'))).properties){
    await p.goto(base+'/'+property.detailRoute);await p.locator('.gallery-active').waitFor();await p.locator('[data-gallery-index="0"]').click();
    await p.waitForFunction(()=>document.querySelector('.gallery-active')?.naturalWidth>0);
    await screenshotRegion(p,'.gallery','detail-'+label+'-'+property.slug);
    await scan(p,'detail-'+label+'-'+property.slug,'.gallery');
   }
   await p.close();
  }
  // Real browser recording of pointer-driven edge movement, bounded arrows, and filter/reset.
  const context=await browser.newContext({viewport:{width:1440,height:1280},recordVideo:{dir:'/tmp/phase2b-video',size:{width:1440,height:1280}}});
  const p=await context.newPage();await p.goto(base+'/#homes');await p.locator('.property-card').first().waitFor();await align(p);
  await p.waitForFunction(()=>document.querySelector('.property-image')?.naturalWidth>0);await p.waitForTimeout(600);
  const viewport=p.locator('.collection-viewport');const box=await viewport.boundingBox();
  await p.mouse.move(box.x+box.width-8,box.y+90);await p.waitForTimeout(2200);await p.mouse.move(0,100);await p.waitForTimeout(500);
  const edgeOffset=await viewport.evaluate(el=>el.scrollLeft);assert.ok(edgeOffset>60);
  await p.locator('[data-collection-step="1"]').click();await p.waitForTimeout(1200);await p.locator('[data-collection-step="1"]').click();await p.waitForTimeout(1200);
  await viewport.focus();await p.keyboard.press('End');await p.waitForTimeout(600);assert.equal(await p.locator('[data-collection-step="1"]').isDisabled(),true);
  await p.locator('[data-collection-step="-1"]').click();await p.waitForTimeout(1200);
  await p.locator('[name=neighborhood]').selectOption('Cherokee Triangle');await p.locator('#home-search [type=submit]').click();await align(p);await p.waitForTimeout(2000);
  await p.locator('#home-search [type=reset]').click();await align(p);await p.waitForTimeout(1000);
  const video=p.video();await context.close();await video.saveAs(path.join(output,'horizontal-gallery-review.webm'));
  report.push({recording:'horizontal-gallery-review.webm',edgeOffset,arrowsAndFiltering:true});
 }finally{
  fs.writeFileSync(path.join(output,'capture-report.json'),JSON.stringify(report,null,2)+'\n');fs.writeFileSync(path.join(output,'accessibility.json'),JSON.stringify(axeResults,null,2)+'\n');await browser.close();
 }
 assert.ok(axeResults.every(r=>!r.violations.length),'Review axe findings');console.log('PASS: actual loaded-photo gallery/proposal states, 8 detail captures, '+axeResults.length+' axe scans, interaction recording.');
})().catch(e=>{console.error(e);process.exitCode=1});
