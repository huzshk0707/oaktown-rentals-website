const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.OAKTOWN_BASE_URL || 'http://127.0.0.1:8791';
(async () => {
  const browser = await chromium.launch({executablePath:process.env.OAKTOWN_CHROMIUM || '/usr/bin/chromium', args:['--no-sandbox']});
  const errors = [];
  async function page(options = {}) {
    const context = await browser.newContext({viewport:{width:1440,height:1000}, ...options});
    const p = await context.newPage();
    p.on('pageerror', error => errors.push(error.message));
    await p.route('**/*', route => route.request().url().startsWith(base+'/') ? route.continue() : route.abort());
    return p;
  }
  try {
    const p = await page();
    const requests = [];
    p.on('request', req => { if (req.url().includes('/scrollcraft/desktop/')) requests.push(req.url()); });
    await p.goto(base);
    await p.waitForFunction(() => document.querySelector('canvas').dataset.frame === '0');
    const before = await p.locator('canvas').evaluate(c => c.toDataURL());
    await p.evaluate(() => scrollTo({top:(document.querySelector('.story').offsetHeight-innerHeight)*.9,behavior:'instant'}));
    await p.waitForFunction(() => Number(document.querySelector('canvas').dataset.frame) >= 40);
    const after = await p.locator('canvas').evaluate(c => c.toDataURL());
    assert.notEqual(before, after, 'scroll must paint different actual pixels');
    assert.ok(requests.length < 12, 'scroll jumps must not download the whole sequence');
    const contrasts = await p.evaluate(() => {
      const luminance = color => {
        const rgb = color.match(/[\d.]+/g).slice(0,3).map(Number).map(n => {
          const c=n/255; return c<=.04045 ? c/12.92 : ((c+.055)/1.055)**2.4;
        });
        return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
      };
      const bg=luminance(getComputedStyle(document.querySelector('.collection')).backgroundColor);
      return ['.collection .display-title em','.collection .heading-note','.collection .property-price small','.collection .property-neighborhood'].map(selector => {
        const fg=luminance(getComputedStyle(document.querySelector(selector)).color);
        return {selector,ratio:(Math.max(bg,fg)+.05)/(Math.min(bg,fg)+.05)};
      });
    });
    for (const {selector,ratio} of contrasts) assert.ok(ratio>=4.5,`${selector} contrast ${ratio.toFixed(2)}:1`);
    await p.locator('#motion-toggle').click();
    await p.waitForFunction(() => document.querySelector('canvas').dataset.frame === '0');
    await p.evaluate(() => scrollTo(0, 0));
    assert.equal(await p.locator('canvas').getAttribute('data-frame'), '0');
    await p.goto(base+'/#home/115-colonial-drive');
    assert.equal(await p.locator('.scrollcraft-canvas').count(),0);
    await p.goto(base);
    await p.waitForFunction(() => document.querySelector('canvas').dataset.frame === '0');

    for (const options of [{reducedMotion:'reduce'}, {viewport:{width:390,height:844}}]) {
      const quiet = await page(options), frames = [];
      quiet.on('request', req => { if (/\/scrollcraft\/(desktop|mobile)\//.test(req.url())) frames.push(req.url()); });
      await quiet.goto(base);
      await quiet.waitForFunction(() => document.querySelector('canvas').dataset.frame === '0');
      await quiet.evaluate(() => scrollTo(0,400));
      await quiet.waitForTimeout(100);
      assert.equal(frames.length,1,'mobile and reduced motion load only a single poster');
      if (options.viewport) assert.match(frames[0],/\/mobile\//);
      else assert.match(frames[0],/\/desktop\//);
      await quiet.context().close();
    }
    const broken = await page();
    await broken.route('**/assets/scrollcraft/**/*.jpg', route => route.abort());
    await broken.goto(base);
    await broken.locator('.story-title').first().waitFor();
    await broken.locator('.story-explore').click();
    await broken.locator('.property-card').first().locator('.property-image-wrap').click();
    await broken.locator('.detail-stats').waitFor();
    assert.deepEqual(errors,[]);
    console.log('ScrollCraft integration passed: changing canvas pixels, bounded downloads, static mobile/reduced motion, navigation cleanup, and missing-frame fallback.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
