// Real-photo visual evidence. Requires local Chromium and Playwright video support.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const base = process.env.OAKTOWN_BASE_URL || 'http://127.0.0.1:8944';
const out = process.env.OAKTOWN_SKY_EVIDENCE || resolve(__dirname,'../docs/oaktown-signature/phase2e');
const axePath = process.env.OAKTOWN_AXE_PATH;
const report = { base, screenshots: [], accessibility: [], errors: [] };
mkdirSync(out,{recursive:true});

(async () => {
  const browser = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--no-sandbox'] });
  async function ready(page, url=base+'/') {
    await page.goto(url);
    await page.locator('.sky-header[data-surface]').waitFor();
    await page.locator('.wordmark img').evaluate(img=>img.decode());
    await page.evaluate(()=>document.fonts.ready);
    const photo = page.locator('.cinematic-photo,.detail-cover-photo').first();
    if(await photo.count()) await photo.evaluate(img => img.decode());
    await page.waitForTimeout(260);
  }
  async function open(width,height,lang='en',reduce=false) {
    const p = await browser.newPage({viewport:{width,height}, hasTouch:width<=768, reducedMotion:reduce?'reduce':'no-preference'});
    p.on('pageerror',e=>report.errors.push(e.message));
    await p.addInitScript(language=>localStorage.setItem('oaktown-language',language),lang);
    await ready(p);
    return p;
  }
  async function capture(p,name) {
    await p.waitForTimeout(360);
    const state=await p.evaluate(()=>({
      lang:document.documentElement.lang, viewport:[innerWidth,innerHeight],
      surface:document.querySelector('.sky-header').dataset.surface,
      scene:document.querySelector('.cinematic-hero')?.dataset.scene ?? null,
      overflow:document.documentElement.scrollWidth>innerWidth,
      realPhoto:[...document.querySelectorAll('.cinematic-photo,.detail-cover-photo')].every(img=>img.complete&&img.naturalWidth>0)
    }));
    assert.ok(!state.overflow&&state.realPhoto,name);
    await p.screenshot({path:resolve(out,name+'.jpg'),quality:91});
    report.screenshots.push({name,...state});
  }
  async function scan(p,name) {
    if(!axePath)return;
    if(!await p.evaluate(()=>!!window.axe)) await p.addScriptTag({path:axePath});
    report.accessibility.push({name,...await p.evaluate(async()=>{
      const results=await window.axe.run({include:[['#site-header'],['.cinematic-hero']]},{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});
      return {violations:results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),incomplete:results.incomplete.map(v=>({id:v.id,count:v.nodes.length}))};
    })});
  }
  const changeScene = async (p,i) => {
    await p.locator(`[data-hero-scene-button="${i}"]`).click();
    await p.waitForFunction(i=>document.querySelector('.cinematic-hero').dataset.scene===String(i),i);
    await p.waitForTimeout(580);
  };
  const revealIvory = async p=>{
    const end=await p.locator('.cinematic-hero').evaluate(e=>e.offsetHeight);
    await p.mouse.move(500,400);
    await p.evaluate(y=>{document.activeElement.blur();scrollTo({top:y,behavior:'instant'});},end+145);
    await p.waitForTimeout(330);
    return end;
  };
  try {
    for(const [w,h,lang,reduce] of [[1440,900,'en',false],[1440,900,'es',false],[1920,1080,'en',false],[1366,520,'en',false],[768,900,'en',false],[390,844,'en',false],[390,844,'es',false],[320,640,'es',false],[1440,900,'en',true],[390,844,'es',true]]) {
      const p=await open(w,h,lang,reduce);
      const name=reduce?'reduced-'+w+'-'+lang:'opening-'+w+'-'+lang;
      await capture(p,name);
      await scan(p,name);
      if(w<=960 && !reduce) {
        await p.locator('#menu-button').tap();
        await capture(p,'mobile-menu-'+w+'-'+lang);
        await p.locator('.sky-disclosure summary').first().tap();
        await capture(p,'mobile-properties-'+w+'-'+lang);
        await scan(p,'mobile-properties-'+w+'-'+lang);
      }
      if(w===1440&&lang==='en'&&!reduce) {
        const actions=p.locator('.hero-opening-actions');
        await actions.locator('a').first().hover();
        await p.waitForTimeout(360);
        await actions.screenshot({path:resolve(out,'after-button-hover.png')});
        await actions.locator('a').last().hover();
        await p.waitForTimeout(360);
        await actions.screenshot({path:resolve(out,'after-apply-hover.png')});
        await p.mouse.move(580,230);
        for(const [n,i] of [['homes-dropdown',0],['resources-dropdown',1]]) {
          await p.locator('.sky-disclosure').nth(i).locator('summary').hover();
          await capture(p,n);
          await scan(p,n);
          await p.mouse.move(580,230);
          await p.waitForTimeout(160);
        }
        await p.locator('.sky-story-link').hover();
        await capture(p,'story-underline');
        await p.mouse.move(580,230);
        for(const i of [1,2]) {
          await changeScene(p,i);
          await capture(p,'scene-'+(i+1));
          await scan(p,'scene-'+(i+1));
        }
        await revealIvory(p);
        await capture(p,'below-hero');
        await ready(p,base+'/#home/115-colonial-drive');
        await capture(p,'property-detail');
      }
      await p.close();
    }
    const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:'/tmp/oaktown-sky-video',size:{width:1280,height:800}}});
    const p=await context.newPage();
    await ready(p);
    await p.waitForTimeout(600);
    for(const i of [0,1]){
      await p.locator('.hero-opening-actions a').nth(i).hover();
      await p.waitForTimeout(650);
    }
    await p.mouse.move(620,240);
    await p.waitForTimeout(220);
    for(const i of [0,1]){
      await p.locator('.sky-disclosure').nth(i).locator('summary').hover();
      await p.waitForTimeout(i===0?1300:660);
      await p.mouse.move(620,240);
      await p.waitForTimeout(220);
    }
    await changeScene(p,1);
    await changeScene(p,2);
    const end=await revealIvory(p);
    await p.mouse.wheel(0,370);
    await p.waitForTimeout(750);
    await p.mouse.wheel(0,-100);
    await p.waitForTimeout(650);
    await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),end+125);
    await p.waitForTimeout(350);
    const video=p.video();
    await context.close();
    await video.saveAs(resolve(out,'header-interactions.webm'));
    assert.deepEqual(report.errors,[]);
    assert.ok(report.accessibility.every(s=>!s.violations.length),'Review accessibility.json');
    console.log(JSON.stringify({screenshots:report.screenshots.length,scans:report.accessibility.length,violations:0}));
  } finally {
    writeFileSync(resolve(out,'capture-report.json'),JSON.stringify(report,null,2)+'\n');
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
