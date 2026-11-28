const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const path = require('node:path');
const base = process.env.OAKTOWN_BASE_URL || 'http://127.0.0.1:8787';

(async () => {
  const browser = await chromium.launch({executablePath:process.env.OAKTOWN_CHROMIUM || '/usr/bin/chromium', args:['--no-sandbox']});
  try {
    for (const vacation of [false, true]) {
      const page = await browser.newPage({viewport:{width:390,height:844}});
      await page.route('https://images.squarespace-cdn.com/**', route => route.fulfill({
        contentType:'image/jpeg', path:path.join(__dirname, '../assets/oaktown-rentals-logo.jpg')
      }));
      await page.goto(base + (vacation ? '/mint-mojo/' : '/#home/115-colonial-drive'));
      if (vacation) await page.locator('.mint-quiet-button').click();
      else await page.locator('.gallery-main').scrollIntoViewIfNeeded();

      const thumbs = page.locator('.photo-playback .gallery-thumbs button');
      const toggle = page.locator('[data-playback]');
      const animation = page.locator('.active .photo-fill');
      await page.waitForFunction(() => document.querySelector('.active .photo-fill')?.getAnimations()[0]?.currentTime > 150);
      await toggle.click();
      const paused = await animation.evaluate(el => el.getAnimations()[0].currentTime);
      await page.waitForTimeout(250);
      assert.ok(Math.abs(await animation.evaluate(el => el.getAnimations()[0].currentTime) - paused) < 50);
      await thumbs.last().click();
      assert.equal(await thumbs.last().getAttribute('aria-pressed'), 'true');
      assert.equal(await animation.evaluate(el => el.getAnimations()[0].currentTime), 0);
      await toggle.click();
      await page.waitForFunction(() => document.querySelector('.gallery-thumbs button').getAttribute('aria-pressed') === 'true', null, {timeout:9000});

      if (!vacation) await page.locator('[data-open-gallery]').click();
      assert.equal(await page.locator('dialog[open] .photo-playback').count(), vacation ? 1 : 0);
      await page.keyboard.press('ArrowRight');
      assert.equal(await thumbs.nth(1).getAttribute('aria-pressed'), 'true');
      if (!vacation) {
        await page.waitForTimeout(6300);
        assert.equal(await page.locator('dialog .gallery-count').innerText(), '02 / 19');
        await page.keyboard.press('Escape');
        assert.equal(await toggle.innerText(), 'Pause');
        assert.equal(await thumbs.nth(1).getAttribute('aria-pressed'), 'true');
        await toggle.click();
        await page.locator('[data-open-gallery]').click();
        await page.keyboard.press('ArrowLeft');
        await page.locator('[data-close-gallery]').click();
        assert.equal(await toggle.innerText(), 'Play');
        assert.equal(await thumbs.first().getAttribute('aria-pressed'), 'true');
      }
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForFunction(() => document.querySelector('.active .photo-fill').getAnimations()[0].playState === 'paused');
      await page.keyboard.press('Escape');
      if (!vacation) await page.locator('#gallery > .photo-playback').waitFor();
      await page.close();
    }
    console.log('Rental and vacation galleries passed timer, pause, selection, wrap, expanded view, keyboard and reduced-motion checks.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode = 1;});
