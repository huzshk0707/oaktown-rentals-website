const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const manifest=JSON.parse(fs.readFileSync(process.env.OAKTOWN_PHOTO_MANIFEST));
const snapshot=fs.readFileSync(process.env.OAKTOWN_CONTENT_SNAPSHOT,'utf8');
const out=path.resolve(__dirname,'../docs/public-polish');fs.mkdirSync(out,{recursive:true});
const axePath=process.env.OAKTOWN_AXE_PATH||require.resolve('axe-core/axe.min.js');
async function ready(page){
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(i=>i.src).map(async i=>{i.loading='eager';i.sizes=i.sizes.replace(/^auto,\s*/,'');await i.decode().catch(()=>{})}))});
  await page.waitForTimeout(950);
}
async function align(page,selector){
  await page.evaluate(s=>scrollTo({top:document.querySelector(s).getBoundingClientRect().top+scrollY-document.querySelector('#site-header').offsetHeight,behavior:'instant'}),selector);
  await ready(page);
}
async function scan(page,view){
  // Element screenshots can scroll the page and start nearby reveal effects.
  // Audit the settled view rather than a partially transparent entrance frame.
  await ready(page);
  if(!await page.evaluate(()=>!!window.axe))await page.addScriptTag({path:axePath});
  return {view,...await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return {violations:r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))}})};
}
(async()=>{
  const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const accessibility=[],metrics=[];
  try{
    for(const [version,base] of [['before',process.env.OAKTOWN_BEFORE_URL||'http://127.0.0.1:8861'],['after',process.env.OAKTOWN_BASE_URL||'http://127.0.0.1:8860']]){
      for(const [view,width,height,lang] of [['desktop',1440,1000,'en'],['phone',390,844,'en'],['phone-es',320,640,'es']]){
        const p=await b.newPage({viewport:{width,height},hasTouch:width<600,isMobile:width<600});
        await p.addInitScript(l=>{localStorage.setItem('oaktown-language',l);sessionStorage.setItem('oaktown-opening-seen','yes')},lang);
        await p.route('**/api/properties',r=>r.fulfill({status:200,contentType:'application/json',body:snapshot}));
        await p.route('https://images.squarespace-cdn.com/**',r=>{const a=manifest[r.request().url().split('?')[0]];return a?r.fulfill({body:fs.readFileSync(a.path),contentType:a.contentType}):r.abort()});
        await p.goto(base+'/');await ready(p);
        metrics.push({version,view,width,height,...await p.evaluate(()=>{const card=document.querySelector('.property-card');const dy=new DOMMatrixReadOnly(getComputedStyle(card).transform).m42;return {homesTop:document.querySelector('#homes').offsetTop,firstCardTop:Math.round(card.getBoundingClientRect().top+scrollY-dy),heroPhotoLoaded:document.querySelector('.story-image img').naturalWidth>0,overflow:document.documentElement.scrollWidth>innerWidth}})});
        await p.screenshot({path:`${out}/${version}-${view}-hero.png`});
        if(version==='after')accessibility.push(await scan(p,`${view}-home`));
        await align(p,'#homes');await p.screenshot({path:`${out}/${version}-${view}-collection.png`});
        await p.locator('.property-card').first().screenshot({path:`${out}/${version}-${view}-card.png`});
        if(version==='after'){
          accessibility.push(await scan(p,`${view}-collection`));
          await p.locator('#faq details').nth(2).evaluate(el=>el.open=true);await align(p,'#faq');
          await align(p,'#faq details:nth-child(3)');
          await p.screenshot({path:`${out}/after-${view}-faq.png`});
        }
        await align(p,'#cudejoe');await p.locator('#cudejoe').screenshot({path:`${out}/${version}-${view}-vacation.png`});
        if(version==='after'){
          await p.goto(base+'/#home/115-colonial-drive');await ready(p);
          await p.locator('.page-intro').screenshot({path:`${out}/after-${view}-listing-header.png`});
          await align(p,'.details-bar');
          await p.screenshot({path:`${out}/after-${view}-listing.png`});
          accessibility.push(await scan(p,`${view}-listing`));
        }
        await p.close();
      }
    }
    fs.writeFileSync(out+'/metrics.json',JSON.stringify(metrics,null,2)+'\n');
    fs.writeFileSync(out+'/accessibility.json',JSON.stringify(accessibility,null,2)+'\n');
    console.log(JSON.stringify({metrics,accessibility},null,2));
    assert.ok(metrics.every(m=>m.heroPhotoLoaded&&!m.overflow));
    assert.ok(accessibility.every(a=>!a.violations.length));
  }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
