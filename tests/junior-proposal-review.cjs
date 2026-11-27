// FELIX JUNIOR: independent regression checks for the excluded Phase 2D review harness.
// Serve the repository root locally; do not run against production.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = new URL(process.env.OAKTOWN_BASE_URL || 'http://127.0.0.1:8933');
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname), 'Local review server only');
const review = new URL('/docs/oaktown-signature/phase2d/prototypes/', base).href;

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    for (const [width, height, lang] of [[1440, 1100, 'en'], [390, 1000, 'en'], [390, 1000, 'es']]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      try {
        await page.addInitScript(value => localStorage.setItem('oaktown-language', value), lang);
        await page.goto(review);
        const frame = await (await page.locator('#review-site').elementHandle()).contentFrame();
        await frame.locator('#homes .property-card').first().waitFor({ state: 'attached' });
        await frame.waitForFunction(value => document.documentElement.lang === value, lang);
        await page.locator('[data-mode="panels"]').click();
        const toggles = frame.locator('.review-panel-toggle');
        await toggles.first().waitFor();
        assert.equal(await toggles.count(), 4);
        await toggles.nth(1).focus();
        await toggles.nth(1).press('ArrowRight');
        await frame.waitForFunction(() => document.querySelectorAll('.review-panel-toggle')[2]?.getAttribute('aria-expanded') === 'true');
        const panelState = await frame.locator('.review-panel').evaluateAll(panels => panels.map(panel => {
          const card = panel.querySelector('.property-card');
          const media = panel.querySelector('.card-media');
          const image = panel.querySelector('.property-image-wrap');
          return { expanded: panel.querySelector('button.review-panel-toggle').getAttribute('aria-expanded'), active: panel.classList.contains('is-active'), inert: card.inert, width: panel.getBoundingClientRect().width, mediaHeight: media.getBoundingClientRect().height, imageHeight: image.getBoundingClientRect().height, flex: getComputedStyle(media).flexGrow, transition: getComputedStyle(panel).transitionDuration };
        }));
        assert.deepEqual(panelState.map(p => p.expanded), ['false', 'false', 'true', 'false']);
        assert.deepEqual(panelState.map(p => p.active), [false, false, true, false]);
        assert.deepEqual(panelState.map(p => p.inert), [true, true, false, true]);
        assert.ok(panelState.every(p => p.transition.split(',').every(duration => parseFloat(duration) === 0)), 'Reduced motion removes panel transitions');
        if (width <= 700) {
          assert.ok(Math.abs(panelState[2].mediaHeight - 270) <= 1, 'Mobile media height is 270px');
          assert.ok(Math.abs(panelState[2].imageHeight - 270) <= 1, 'Mobile image height is 270px');
          assert.equal(panelState[2].flex, '0');
        } else {
          assert.ok(panelState[2].width > panelState[1].width * 1.8, 'Desktop active panel is wider');
        }
        await page.locator('[data-mode="louisville"]').click();
        await frame.locator('.review-city').waitFor();
        const vacation = frame.locator('#review-vacation');
        await vacation.waitFor();
        const palette = await vacation.evaluate(clone => {
          const original = document.querySelector('.signature-vacation:not(.review-surface)');
          const a = getComputedStyle(original), b = getComputedStyle(clone);
          return { original: [a.backgroundColor, a.color], clone: [b.backgroundColor, b.color] };
        });
        assert.deepEqual(palette.clone, palette.original, 'Review vacation retains original palette');
        await frame.locator('[data-region="Cherokee Triangle"]').click();
        assert.equal(await frame.locator('[data-region="Cherokee Triangle"]').getAttribute('aria-pressed'), 'true');
        assert.match(await frame.locator('.review-map-action [role="status"]').innerText(), lang === 'es' ? /1 vivienda/ : /1 home/);
        // The list must work before loading any third-party map assets.
        assert.equal(await frame.locator('.review-map-loader').count(), 1);
        await frame.locator('.review-map-action button').click();
        await frame.locator('.review-surface').first().waitFor({ state: 'detached' });
        assert.equal(await frame.locator('#home-search [name="neighborhood"]').inputValue(), 'Cherokee Triangle');
        await frame.waitForFunction(() => document.querySelectorAll('#homes .property-card:not([hidden])').length === 1);
        assert.equal(await page.locator('[data-mode="original"]').getAttribute('aria-pressed'), 'true');
        console.log(`PASS: ${width} ${lang} reduced-motion panel, palette, map-free filter, original restore`);
      } finally { await page.close(); }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
