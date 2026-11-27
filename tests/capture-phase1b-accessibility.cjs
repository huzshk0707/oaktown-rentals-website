const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({executablePath: '/usr/bin/chromium', args: ['--no-sandbox']});
  const results = [];
  try {
    for (const [width,height,lang,progress,reduce] of [
      [1440,1000,'en',0,false], [1440,1000,'en',.5,false], [1440,1000,'en',1,false],
      [1440,1000,'es',1,false], [390,844,'en',0,false], [320,640,'es',0,false], [1440,1000,'en',0,true]
    ]) {
      const page = await browser.newPage({viewport:{width,height},reducedMotion:reduce?'reduce':'no-preference'});
      await page.addInitScript(lang => localStorage.setItem('oaktown-language',lang),lang);
      await page.goto((process.env.OAKTOWN_BASE_URL || 'http://127.0.0.1:8931') + '/');
      await page.locator('.cinematic-photo').waitFor();
      await page.evaluate(async p => {
        await document.fonts.ready;
        await document.querySelector('.cinematic-photo').decode();
        const hero = document.querySelector('.cinematic-hero');
        scrollTo({top:(hero.offsetHeight-hero.querySelector('.cinematic-stage').offsetHeight)*p,behavior:'instant'});
      },progress);
      await page.waitForTimeout(180);
      await page.addScriptTag({path:process.env.OAKTOWN_AXE_PATH || require.resolve('axe-core/axe.min.js')});
      results.push({width,height,lang,progress,reduce,...await page.evaluate(async () => {
        const result = await axe.run('.cinematic-hero',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});
        return {violations:result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:result.incomplete.map(v=>({id:v.id,count:v.nodes.length}))};
      })});
      await page.close();
    }
    fs.writeFileSync(path.join(__dirname,'../docs/oaktown-signature/phase1b/accessibility.json'),JSON.stringify(results,null,2)+'\n');
    console.log(JSON.stringify(results));
    if (results.some(r=>r.violations.length)) process.exitCode=1;
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
