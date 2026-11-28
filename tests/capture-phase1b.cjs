const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.OAKTOWN_BASE_URL || 'http://127.0.0.1:8931';
const output = path.resolve(__dirname, '../docs/oaktown-signature/phase1b');
(async () => {
  const browser = await chromium.launch({executablePath: '/usr/bin/chromium', args: ['--no-sandbox']});
  const report = [];
  async function open(width, height, language = 'en', reducedMotion = 'no-preference') {
    const page = await browser.newPage({viewport: {width, height}, reducedMotion});
    await page.addInitScript(lang => localStorage.setItem('oaktown-language', lang), language);
    await page.goto(base + '/');
    await page.locator('.cinematic-photo').waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await document.querySelector('.cinematic-photo').decode();
      scrollTo({top: 0, behavior: 'instant'});
    });
    return page;
  }
  async function capture(page, name) {
    await page.waitForTimeout(180);
    await page.screenshot({path: path.join(output, name + '.png')});
    report.push({name, ...await page.evaluate(() => ({
      width: innerWidth, height: innerHeight, scroll: scrollY,
      scene: document.querySelector('.cinematic-hero').dataset.scene,
      camera: document.querySelector('.signature-images').style.transform,
      image: document.querySelector('.cinematic-photo').currentSrc,
      loaded: document.querySelector('.cinematic-photo').naturalWidth > 0,
      overflow: document.documentElement.scrollWidth > innerWidth
    }))});
  }
  const desktop = await open(1672, 941);
  for (const [name, progress] of [['scene-1',0], ['scene-2',.5], ['scene-3',1], ['search-transition',1.3]]) {
    await desktop.evaluate(p => {
      const hero = document.querySelector('.cinematic-hero');
      const travel = hero.offsetHeight - hero.querySelector('.cinematic-stage').offsetHeight;
      scrollTo({top: travel * p, behavior: 'instant'});
    }, progress);
    await capture(desktop, name);
  }
  await desktop.close();
  for (const [name, width, height, lang, reduce] of [
    ['mobile',390,844,'en','no-preference'],
    ['mobile-es',390,844,'es','no-preference'],
    ['narrow-es',320,640,'es','no-preference'],
    ['tablet',768,1024,'en','no-preference'],
    ['reduced-motion',1440,1000,'en','reduce'],
    ['desktop-es',1440,1000,'es','no-preference']
  ]) {
    const page = await open(width,height,lang,reduce);
    await capture(page,name);
    await page.close();
  }
  const context = await browser.newContext({
    viewport: {width:1440,height:900},
    recordVideo: {dir: '/tmp/phase1b-recording', size:{width:1440,height:900}}
  });
  const page = await context.newPage();
  await page.goto(base + '/');
  await page.locator('.cinematic-photo').waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await document.querySelector('.cinematic-photo').decode();
  });
  await page.waitForTimeout(900);
  async function scrollToProgress(target, duration) {
    await page.evaluate(async ({target,duration}) => {
      const hero = document.querySelector('.cinematic-hero');
      const travel = hero.offsetHeight - hero.querySelector('.cinematic-stage').offsetHeight;
      const initial = scrollY;
      const end = travel * target;
      const start = performance.now();
      await new Promise(resolve => {
        function frame(now) {
          const p = Math.min(1, (now - start) / duration);
          const eased = p * p * (3 - 2 * p);
          scrollTo({top:initial + (end - initial) * eased,behavior:'instant'});
          if (p < 1) requestAnimationFrame(frame); else resolve();
        }
        requestAnimationFrame(frame);
      });
    }, {target,duration});
  }
  await scrollToProgress(.5,2200);
  await page.waitForTimeout(800);
  await scrollToProgress(1,2200);
  await page.waitForTimeout(800);
  await scrollToProgress(1.35,1200);
  await page.waitForTimeout(800);
  await scrollToProgress(.5,2400);
  await page.waitForTimeout(600);
  await scrollToProgress(0,2000);
  await page.waitForTimeout(800);
  const video = page.video();
  await context.close();
  await video.saveAs(path.join(output,'forward-reverse.webm'));
  fs.writeFileSync(path.join(output,'capture-report.json'),JSON.stringify(report,null,2)+'\n');
  await browser.close();
  console.log('Captured ten real browser screenshots and forward/reverse video.');
})().catch(error => {console.error(error);process.exitCode=1;});
