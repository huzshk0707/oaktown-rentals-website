const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const base = (process.env.OAKTOWN_BASE_URL || 'http://127.0.0.1:8931').replace(/\/$/, '');
(async () => {
  const browser = await chromium.launch({executablePath: '/usr/bin/chromium', args: ['--no-sandbox']});
  const passed = [];
  try {
    for (const language of ['en', 'es']) {
      const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
      await page.addInitScript(lang => localStorage.setItem('oaktown-language', lang), language);
      await page.route('https://**', route => route.abort());
      await page.goto(base + '/');
      await page.locator('.cinematic-hero.is-cinematic').waitFor();
      const positions = [0, .5, 1, .5, 0];
      const observed = [];
      for (const progress of positions) {
        await page.evaluate(p => {
          const hero = document.querySelector('.cinematic-hero');
          const stage = hero.querySelector('.cinematic-stage');
          scrollTo({top: hero.offsetTop + (hero.offsetHeight - stage.offsetHeight) * p, behavior: 'instant'});
        }, progress);
        await page.waitForTimeout(100);
        observed.push(await page.evaluate(() => ({
          scene: document.querySelector('.cinematic-hero').dataset.scene,
          transform: document.querySelector('.signature-images').style.transform,
          top: document.querySelector('.cinematic-stage').getBoundingClientRect().top,
          source: document.querySelector('.cinematic-photo').currentSrc
        })));
      }
      assert.deepEqual(observed.map(x => x.scene), ['0', '1', '2', '1', '0']);
      assert.equal(new Set(observed.map(x => x.source)).size, 1);
      assert.equal(observed[1].transform, observed[3].transform);
      assert.equal(observed[0].transform, observed[4].transform);
      assert.ok(observed.every(x => Math.abs(x.top) < 2));
      await page.waitForTimeout(1500);
      assert.equal(await page.locator('.signature-images').evaluate(e => e.style.transform), observed[4].transform);
      passed.push(language + ' forward/reverse continuous camera, fixed stage and no idle advance');

      await page.locator('[data-hero-scene-button="2"]').focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.querySelector('.cinematic-hero').dataset.scene === '2');
      await page.waitForTimeout(700);
      assert.equal(await page.locator('[data-hero-scene="0"]').evaluate(e => e.inert), true);
      assert.equal(await page.locator('[data-hero-scene="2"]').evaluate(e => e.inert), false);
      await page.locator('[data-hero-scene="2"] a[href="#faq"]').click();
      await page.locator('.faq-item').first().waitFor();
      await page.goto(base + '/');
      await page.locator('[data-hero-scene="0"] a[href="#homes"]').click();
      await page.waitForTimeout(700);
      const top = await page.locator('#homes').evaluate(e => e.getBoundingClientRect().top);
      assert.ok(top < 150);
      await page.locator('#motion-toggle').evaluate(e => e.click());
      await page.waitForTimeout(100);
      assert.ok(Math.abs(top - await page.locator('#homes').evaluate(e => e.getBoundingClientRect().top)) < 4);
      assert.equal(await page.locator('.signature-images').evaluate(e => e.style.transform), 'none');
      await page.locator('#motion-toggle').evaluate(e => e.click());
      await page.waitForTimeout(100);
      assert.ok(Math.abs(top - await page.locator('#homes').evaluate(e => e.getBoundingClientRect().top)) < 4);
      passed.push(language + ' keyboard scenes, hidden-scene focus safety, shortcuts and stable motion toggle');

      await page.emulateMedia({reducedMotion: 'reduce'});
      await page.goto(base + '/');
      assert.equal(await page.locator('.cinematic-hero').evaluate(e => e.offsetHeight), 1000);
      assert.equal(await page.locator('.cinematic-progress').isVisible(), false);
      assert.equal(await page.locator('#motion-toggle').isDisabled(), true);
      assert.equal(await page.locator('.signature-images').evaluate(e => e.style.transform), 'none');
      passed.push(language + ' reduced-motion static fallback without empty scroll space');
      await page.close();
    }
    for (const [width, height] of [[320,640], [390,844], [768,1024]]) {
      const page = await browser.newPage({viewport: {width,height}});
      await page.goto(base + '/');
      await page.locator('.cinematic-hero').waitFor();
      assert.equal(await page.locator('.cinematic-hero').evaluate(e => e.classList.contains('is-cinematic')), false);
      assert.equal(await page.locator('.cinematic-progress').isVisible(), false);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.ok(await page.locator('[data-hero-scene="0"] a').isVisible());
      await page.setViewportSize({width:1440,height:1000});
      await page.locator('.is-cinematic').waitFor();
      await page.setViewportSize({width,height});
      await page.waitForFunction(() => !document.querySelector('.cinematic-hero').classList.contains('is-cinematic'));
      passed.push(width + 'px static mobile and responsive mode changes');
      await page.close();
    }
    console.log(JSON.stringify({passed,failures:[]}, null, 2));
  } finally { await browser.close(); }
})().catch(error => {console.error(error); process.exitCode = 1;});
