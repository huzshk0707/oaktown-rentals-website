const {chromium} = require('playwright');
const {join,resolve} = require('node:path');
const {mkdirSync} = require('node:fs');
const assert = require('node:assert/strict');
const sources = require('../docs/oaktown-signature/phase3/review/sources.json');
const base = process.env.OAKTOWN_BASE_URL || 'http://127.0.0.1:8946';
const out = resolve('docs/oaktown-signature/phase3');

(async () => {
  const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  try {
    for (const [device,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
      const page = await browser.newPage({viewport:{width,height},reducedMotion:'reduce',isMobile:width<600});
      await page.goto(`${base}/#about`);
      for (const source of sources) {
        await page.locator('#about').evaluate((section,{source,mobile}) => {
          const image = section.querySelector('img');
          image.loading = 'eager';
          image.src = `/docs/oaktown-signature/phase3/review/${source.reviewFile}`;
          image.style.objectPosition = mobile ? source.mobileCrop : source.desktopCrop;
          // Older review checkpoints credit the previous image. Remove that credit only after the review swap.
          section.querySelector('.signature-credit')?.remove();
        },{source,mobile:width<600});
        await page.locator('#about img').evaluate(img=>img.decode());
        const sectionHeight = await page.locator('#about').evaluate(section => {
          document.querySelector('.site-header').style.visibility = 'hidden';
          document.querySelector('#progress').style.visibility = 'hidden';
          scrollTo({top:section.getBoundingClientRect().top+scrollY,behavior:'instant'});
          return section.getBoundingClientRect().height;
        });
        await page.screenshot({path:join(out,`proposal-${source.key}-${device}.jpg`),type:'jpeg',quality:90,clip:{x:0,y:0,width,height:Math.min(height,Math.floor(sectionHeight))}});
      }
      await page.close();
    }
    mkdirSync('/tmp/oaktown-phase3-video',{recursive:true});
    const context = await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:'/tmp/oaktown-phase3-video',size:{width:1440,height:900}}});
    const page = await context.newPage();
    await page.goto(`${base}/`);
    await page.locator('.cinematic-photo').evaluate(img=>img.decode());
    await page.waitForFunction(()=>document.querySelector('#about'));
    await page.evaluate(()=>document.querySelectorAll('#app img').forEach(img=>{img.loading='eager'}));
    await page.mouse.move(35,680);
    for (let i=0;i<36;i++) {
      await page.mouse.wheel(0,164);
      await page.waitForTimeout(230);
      if (await page.evaluate(()=>scrollY+innerHeight>=document.documentElement.scrollHeight-2)) break;
    }
    await page.waitForTimeout(400);
    assert.ok(await page.evaluate(()=>scrollY+innerHeight>=document.documentElement.scrollHeight-3));
    const video=page.video();
    await context.close();
    await video.saveAs(join(out,'homepage-scroll.webm'));
    console.log('PASS: three Louisville options at two widths and continuous homepage recording');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
