const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const manifest=JSON.parse(fs.readFileSync(process.env.OAKTOWN_PHOTO_MANIFEST));
const snapshot=fs.readFileSync(process.env.OAKTOWN_CONTENT_SNAPSHOT,'utf8');
const out=path.resolve(__dirname,'../docs/audit-fixes');
const axePath=process.env.OAKTOWN_AXE_PATH||require.resolve('axe-core/axe.min.js');
fs.mkdirSync(out,{recursive:true});
async function ready(page){
  await page.evaluate(async()=>{
    await document.fonts.ready;
    await Promise.all([...document.images].filter(i=>i.getAttribute('src')).map(async i=>{
      i.loading='eager';i.sizes=i.sizes.replace(/^auto,\s*/,'');await i.decode().catch(()=>{});
    }));
  });
  await page.waitForTimeout(1000);
}
async function scan(page,view){
  await page.addScriptTag({path:axePath});
  return {view,...await page.evaluate(async()=>{
    const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});
    return {violations:r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,count:v.nodes.length}))};
  })};
}
(async()=>{
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  const metrics=[],accessibility=[];
  try{
    for(const [version,base] of [['before',process.env.OAKTOWN_BEFORE_URL||'http://127.0.0.1:8812'],['after',process.env.OAKTOWN_BASE_URL||'http://127.0.0.1:8811']]){
      for(const [name,width,height,lang] of [['desktop',1440,1000,'en'],['phone',390,844,'en'],['small-phone-es',320,640,'es']]){
        const page=await browser.newPage({viewport:{width,height},hasTouch:width<600,isMobile:width<600});
        await page.addInitScript(l=>{localStorage.setItem('oaktown-language',l);sessionStorage.setItem('oaktown-opening-seen','yes')},lang);
        await page.route('https://images.squarespace-cdn.com/**',r=>{
          const photo=manifest[r.request().url().split('?')[0]];
          return photo?r.fulfill({body:fs.readFileSync(photo.path),contentType:photo.contentType}):r.abort();
        });
        await page.route('**/api/properties',r=>r.fulfill({status:200,contentType:'application/json',body:snapshot}));
        await page.goto(base+'/');await ready(page);
        metrics.push({version,view:name,width,height,...await page.evaluate(()=>{
          const card=document.querySelector('.property-card');
          const transform=new DOMMatrixReadOnly(getComputedStyle(card).transform);
          return {homesTop:document.querySelector('#homes').offsetTop,firstCardTop:Math.round(card.getBoundingClientRect().top+scrollY-transform.m42),clearPhotoBand:Math.round(document.querySelector('.story-copy').getBoundingClientRect().top-document.querySelector('#site-header').getBoundingClientRect().bottom),overflow:document.documentElement.scrollWidth>innerWidth,photoLoaded:document.querySelector('.story-image img').naturalWidth>0};
        })});
        await page.screenshot({path:path.join(out,`${version}-${name}-hero.png`)});
        if(version==='after')accessibility.push(await scan(page,`${name}-home`));
        await page.evaluate(()=>scrollTo({top:document.querySelector('#homes').getBoundingClientRect().top+scrollY-document.querySelector('#site-header').offsetHeight,behavior:'instant'}));
        await ready(page);await page.screenshot({path:path.join(out,`${version}-${name}-homes.png`)});
        if(version==='after')accessibility.push(await scan(page,`${name}-collection`));
        if(version==='after'){
          await page.locator('.property-name a').first().click();await page.waitForSelector('.detail-cover');await ready(page);
          await page.screenshot({path:path.join(out,`after-${name}-listing.png`)});
          await page.locator('.details-bar').scrollIntoViewIfNeeded();await ready(page);
          await page.screenshot({path:path.join(out,`after-${name}-costs.png`)});
          accessibility.push(await scan(page,`${name}-listing`));
        }
        await page.close();
      }
    }
    fs.writeFileSync(path.join(out,'metrics.json'),JSON.stringify(metrics,null,2)+'\n');
    fs.writeFileSync(path.join(out,'accessibility.json'),JSON.stringify(accessibility,null,2)+'\n');
    console.log(JSON.stringify({metrics,accessibility},null,2));
    assert.ok(metrics.every(m=>!m.overflow&&m.photoLoaded));
    assert.ok(accessibility.every(r=>!r.violations.length));
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
