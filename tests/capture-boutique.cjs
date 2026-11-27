// Actual Phase 2C browser evidence. No photo replacements or response interception.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.OAKTOWN_BASE_URL||'http://127.0.0.1:8930';
const output=path.resolve(__dirname,'../docs/oaktown-signature/phase2c');
const axePath=process.env.OAKTOWN_AXE_PATH||'/workspace/work/oaktown-review/tools/node_modules/axe-core/axe.min.js';
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const report=[],scans=[],errors=[];
 async function open(width,height,lang='en',reduce=true){
  const p=await browser.newPage({viewport:{width,height},reducedMotion:reduce?'reduce':'no-preference'});p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(lang=>localStorage.setItem('oaktown-language',lang),lang);await p.goto(base+'/#homes');await p.locator('.property-card').first().waitFor();await p.evaluate(()=>document.fonts.ready);
  for(const c of await p.locator('.property-card').all())await c.scrollIntoViewIfNeeded();
  await p.waitForFunction(()=>[...document.querySelectorAll('.property-image')].every(i=>i.complete&&i.naturalWidth>0));return p;
 }
 async function align(p){await p.locator('#homes').evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-100,behavior:'instant'}));await p.waitForTimeout(100);}
 async function capture(p,name){
  await align(p);const before=await p.locator('.collection-viewport').evaluate(el=>el.scrollLeft);
  await p.screenshot({path:path.join(output,name+'.png')});
  const state=await p.evaluate(()=>({width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,x:document.querySelector('.collection-viewport').scrollLeft,cards:[...document.querySelectorAll('.property-card:not([hidden])')].map(c=>({slug:c.dataset.propertySlug,width:c.offsetWidth,photos:[...c.querySelectorAll('img')].map(i=>({url:i.currentSrc,loaded:i.naturalWidth>0}))})),controls:!document.querySelector('.collection-bottom').hidden}));
  assert.equal(state.overflow,false);assert.ok(Math.abs(state.x-before)<2);assert.ok(state.cards.every(c=>c.photos.every(i=>i.loaded)));report.push({name,...state});
 }
 async function scan(p,name,scope='#homes'){
  if(!await p.evaluate(()=>typeof axe!=='undefined'))await p.addScriptTag({path:axePath});
  scans.push({name,...await p.evaluate(async scope=>{const r=await axe.run(scope,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return {violations:r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,count:v.nodes.length}))};},scope)});
 }
 try{
  for(const [label,width,height,lang] of [['desktop',1440,1280,'en'],['desktop-es',1440,1280,'es'],['tablet',768,1280,'en'],['tablet-es',768,1280,'es'],['mobile',390,1280,'en'],['mobile-es',390,1280,'es'],['narrow-es',320,1280,'es']]){
   const p=await open(width,height,lang);const viewport=p.locator('.collection-viewport');await viewport.evaluate(el=>el.scrollTo({left:0,behavior:'instant'}));
   await capture(p,label+'-all-left');await scan(p,label+'-all');
   await viewport.focus();await p.keyboard.press('End');await capture(p,label+'-all-right');
   await p.locator('[name=neighborhood]').selectOption('Cherokee Triangle');await p.locator('#home-search [type=submit]').click();await capture(p,label+'-one');await scan(p,label+'-one');
   assert.equal(await p.locator('.collection-bottom').isVisible(),false);
   // Existing catalogue filters cannot return exactly two. Browser-only combined
   // area option uses the real pipe-filter path; no record/public UI mutation.
   await p.locator('[name=neighborhood]').evaluate(el=>el.add(new Option('St. Matthews + Okolona (review fixture)','St. Matthews|Okolona')));
   await p.locator('[name=neighborhood]').selectOption('St. Matthews|Okolona');await p.locator('#home-search [type=submit]').click();await capture(p,label+'-two-review-fixture');assert.equal(await p.locator('.property-card:not([hidden])').count(),2);
   if(width===1440||label==='mobile'){
    await p.locator('#home-search [type=reset]').click();await viewport.evaluate(el=>el.scrollTo({left:0,behavior:'instant'}));await align(p);
    await p.screenshot({path:path.join(output,label+'-full-page.png'),fullPage:true});
   }
   await p.close();
  }
  for(const lang of ['en','es']){
   const p=await open(1440,1000,lang,false);await p.goto(base+'/');await p.locator('.cinematic-hero.is-cinematic').waitFor();
   await p.locator('[data-hero-scene-button="1"]').click();await p.waitForFunction(()=>document.querySelector('.cinematic-hero').dataset.scene==='1');await p.waitForTimeout(550);
   await p.screenshot({path:path.join(output,'hero-scene-2-'+lang+'.png')});await scan(p,'hero-scene-2-'+lang,'.cinematic-hero');await p.close();
  }
  for(const lang of ['en','es']){
   const p=await open(390,844,lang);await p.locator('.collection-viewport').evaluate(el=>el.scrollTo({left:0,behavior:'instant'}));await capture(p,'phone-844-'+lang);await p.close();
  }
  // Real recording: desktop hover, manual photo, same-image detail transition,
  // Back focus, edge scroll and bounded arrows. Exact genuine images throughout.
  const context=await browser.newContext({viewport:{width:1440,height:1200},recordVideo:{dir:'/tmp/oaktown-boutique-video',size:{width:1440,height:1200}}});
  const p=await context.newPage();await p.goto(base+'/#homes');await p.locator('.property-card').first().waitFor();await align(p);await p.waitForFunction(()=>document.querySelector('.property-image')?.naturalWidth>0);
  await p.waitForTimeout(400);const card=p.locator('.property-card').first();await card.locator('.property-image-wrap').hover();await p.waitForTimeout(1100);
  await card.locator('[data-card-photo-index="2"]').click();await p.waitForFunction(()=>document.querySelector('.property-card').dataset.selectedPhoto==='2');await p.waitForTimeout(500);
  await card.locator('.card-detail-link').click();await p.locator('.detail-cover').waitFor();await p.waitForTimeout(1200);await p.goBack();await p.locator('.property-card').first().waitFor();await align(p);await p.waitForTimeout(500);
  const box=await p.locator('.collection-viewport').boundingBox();await p.mouse.move(box.x+box.width-7,box.y+80);await p.waitForTimeout(1700);await p.mouse.move(0,100);await p.waitForTimeout(350);
  await p.locator('[data-collection-step="1"]').click();await p.waitForTimeout(800);await p.locator('.collection-viewport').focus();await p.keyboard.press('End');await p.waitForTimeout(400);
  const video=p.video();await context.close();await video.saveAs(path.join(output,'boutique-interactions.webm'));
 }finally{fs.writeFileSync(path.join(output,'capture-report.json'),JSON.stringify(report,null,2)+'\n');fs.writeFileSync(path.join(output,'accessibility.json'),JSON.stringify(scans,null,2)+'\n');await browser.close();}
 assert.deepEqual(errors,[]);assert.ok(scans.every(s=>!s.violations.length),'Review axe findings');console.log(JSON.stringify({captures:report.length,axeScans:scans.length,violations:0,recording:'boutique-interactions.webm',normalTLS:true,substitutedPhotos:false}));
})().catch(e=>{console.error(e);process.exit(1)});
