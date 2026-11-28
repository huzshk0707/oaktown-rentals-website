// Actual screenshots and network observations. No intercepted/substitute photos.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.OAKTOWN_BASE_URL||'http://127.0.0.1:8930';
const output=path.resolve(__dirname,'../docs/oaktown-signature/phase2a');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const report=[],accessibility=[];
 const axePath=process.env.OAKTOWN_AXE_PATH||require.resolve('axe-core/axe.min.js');
 for(const [name,width,height,lang] of [['desktop',1440,1000,'en'],['mobile',390,844,'en'],['mobile-es',390,844,'es'],['tablet',768,1024,'es']]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  await page.addInitScript(lang=>localStorage.setItem('oaktown-language',lang),lang);
  await page.goto(base);await page.locator('.property-card').first().waitFor();
  await page.evaluate(async()=>{await document.fonts.ready;await document.querySelector('.cinematic-photo').decode();});
  await page.screenshot({path:path.join(output,`gallery-${name}-hero.png`)});
  const viewport=page.locator('.collection-viewport');await viewport.scrollIntoViewIfNeeded();
  for(const card of await page.locator('.property-card').all())await card.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>[...document.querySelectorAll('.property-image')].every(i=>i.complete),{},{timeout:12000}).catch(()=>{});
  await viewport.evaluate(el=>el.scrollTo({left:0,behavior:'instant'}));
  await page.locator('#homes').evaluate(el=>scrollTo({top:el.offsetTop-100,behavior:'instant'}));await page.waitForTimeout(120);
  const photos=await page.locator('.property-image').evaluateAll(els=>els.map(i=>({url:i.currentSrc,loaded:i.naturalWidth>0,width:i.naturalWidth,height:i.naturalHeight})));
  const suffix=photos.some(p=>!p.loaded)?'-CDN-unavailable':'';
  await page.locator('#homes').screenshot({path:path.join(output,`gallery-${name}-collection${suffix}.png`)});
  await page.screenshot({path:path.join(output,`gallery-${name}-full${suffix}.png`),fullPage:true});
  const geometry=await page.locator('.property-card').evaluateAll(els=>els.map(el=>({slug:el.dataset.propertySlug,width:el.offsetWidth,height:el.offsetHeight,top:el.offsetTop})));
  assert.equal(new Set(geometry.map(g=>g.top)).size,1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.addScriptTag({path:axePath});
  const scan=async(scope,label)=>{const result=await page.evaluate(async scope=>{const r=await axe.run(scope,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return {violations:r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,count:v.nodes.length}))}},scope);accessibility.push({name,label,...result});};
  await scan('#homes','collection');
  await page.locator('[name=neighborhood]').selectOption('Russell');await page.locator('#home-search [type=submit]').click();await page.waitForTimeout(80);
  await page.locator('#homes').screenshot({path:path.join(output,`gallery-${name}-one-result${suffix}.png`)});await scan('#homes','one result');
  assert.equal(await page.locator('.collection-bottom').isVisible(),false);
  await page.locator('.property-card:not([hidden]) .property-name a').click();await page.locator('.detail-cover').waitFor();await page.waitForTimeout(100);
  await page.screenshot({path:path.join(output,`gallery-${name}-madison-detail${suffix}.png`)});await scan('#app','detail');
  report.push({name,width,height,lang,photos,geometry});await page.close();
 }
 const probe=await browser.newPage();await probe.goto(base);await probe.locator('.property-card').first().waitFor();
 const outcomes=await probe.evaluate(async()=>{
  const entries=window.OAKTOWN_DATA.properties.flatMap(p=>window.OAKTOWN_DATA.images[p.imageKey].map((url,index)=>({property:p.slug,index:index+1,url})));
  const results=[];
  for(let offset=0;offset<entries.length;offset+=6)results.push(...await Promise.all(entries.slice(offset,offset+6).map(entry=>new Promise(resolve=>{
    const img=new Image(),start=performance.now();let timer;
    const finish=outcome=>{clearTimeout(timer);img.onload=img.onerror=null;resolve({...entry,outcome,width:img.naturalWidth||null,height:img.naturalHeight||null,durationMs:Math.round(performance.now()-start)});};
    img.onload=()=>finish('loaded');img.onerror=()=>finish('failed');timer=setTimeout(()=>finish('timeout'),5000);img.src=entry.url;
  }))));return results;
 });
 fs.writeFileSync(path.join(output,'gallery-browser-evidence.json'),JSON.stringify(report,null,2)+'\n');
 fs.writeFileSync(path.join(output,'photo-request-results.json'),JSON.stringify(outcomes,null,2)+'\n');
 fs.writeFileSync(path.join(output,'accessibility.json'),JSON.stringify(accessibility,null,2)+'\n');
 await browser.close();console.log(JSON.stringify({screens:report.length,photoLoads:outcomes.filter(o=>o.outcome==='loaded').length,totalPhotos:outcomes.length,axeScans:accessibility.length,violations:accessibility.reduce((n,s)=>n+s.violations.length,0)}));
 assert.ok(accessibility.every(r=>!r.violations.length),'Review accessibility violations in evidence');
})().catch(e=>{console.error(e);process.exit(1)});
