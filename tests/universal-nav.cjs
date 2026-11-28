const assert = require('node:assert/strict');
const { mkdirSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const { chromium } = require('playwright');

const base = process.env.OAKTOWN_BASE_URL || 'http://127.0.0.1:8958';
const evidence = process.env.OAKTOWN_EVIDENCE;
const axePath = process.env.OAKTOWN_AXE_PATH;
const routes = {
  home: ['/', '.cinematic-hero'],
  homes: ['/#homes', '.property-card'],
  story: ['/#about', '#about'],
  faq: ['/#faq', '.resource-intro'],
  community: ['/#community', '.resource-intro'],
  contact: ['/#contact', '.resource-intro'],
  'lobster-nirvana': ['/mint-mojo/', '.mint-hero'],
  '404': ['/404.html', '[data-sky-error]'],
  '115-colonial-drive': ['/#home/115-colonial-drive', '.detail-cover-photo', 19],
  '4005-smallboat-ct': ['/#home/4005-smallboat-ct', '.detail-cover-photo', 17],
  '1106-cherokee-rd-unit-8': ['/#home/1106-cherokee-rd-unit-8', '.detail-cover-photo', 9],
  '1824-w-madison': ['/#home/1824-w-madison', '.detail-cover-photo', 15],
  '208-sloemer-ave': ['/#home/208-sloemer-ave', '.detail-cover-photo', 8],
  '8008-troutwood-ct': ['/#home/8008-troutwood-ct', '.listing-photo-pending', 0]
};
const application = 'https://oaktownrentalsapplication.fillout.com/95';

(async () => {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium', args: ['--no-sandbox'],
    ignoreDefaultArgs: ['--disable-back-forward-cache']
  });
  if (evidence) mkdirSync(evidence, { recursive: true });
  const results = {};
  try {
    for (const [view, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height }, hasTouch: view === 'mobile', reducedMotion: 'reduce' });
      let logo;
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const [name, [path, target, count]] of Object.entries(routes)) {
        await page.goto(base + path, { waitUntil: 'domcontentloaded' });
        await page.locator(target).first().waitFor();
        const header = page.locator('.sky-header');
        await header.waitFor();
        await page.waitForFunction(() => document.querySelectorAll('#header-properties a').length === 6);
        assert.equal(await header.count(), 1);
        assert.equal(await header.locator('.brand-logo').getAttribute('src'), '/assets/signature/oaktown-wordmark-transparent.png');
        const actual = await header.locator('.brand-logo').boundingBox();
        if (logo) assert.deepEqual(actual, logo, view + ' ' + name);
        logo ??= actual;
        assert.equal(await header.locator('summary,.sky-nav-link').allTextContents().then(values => values.map(v => v.trim()).join('|')), 'Our Homes|Lobster Nirvana|Resources|Our Story');
        assert.equal(await header.getAttribute('data-surface'), name === 'home' ? 'sky' : 'ivory', name);
        assert.equal(await header.locator('#motion-toggle').isDisabled(), true);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, name);
        if (count !== undefined) {
          assert.equal(await page.locator('[data-gallery-index]').count(), count);
          assert.equal(await page.locator('.listing-availability a').count(), 1);
          assert.equal(await page.locator('.details-bar a[href^="sms:"]').count(), 0);
          assert.match(await page.locator('.listing-availability a').getAttribute('href'), /^sms:/);
          if (count) {
            assert.equal(await page.locator('.details-bar a').getAttribute('href'), application);
            assert.equal(await page.locator('.detail-cover').evaluate(el => getComputedStyle(el).borderRadius), '16px');
            await page.locator(target).evaluate(el => el.decode());
            if (name === '115-colonial-drive') {
              await page.locator('[data-cover-gallery]').click();
              const viewer = page.locator('dialog.lightbox[open]');
              const image = viewer.locator('img');
              await viewer.waitFor();
              await image.evaluate(el => el.decode());
              assert.ok(await image.evaluate(el => el.naturalWidth > el.naturalHeight));
              assert.equal(await image.evaluate(el => getComputedStyle(el).objectFit), 'contain');
              assert.equal(await viewer.locator('.gallery-count').innerText(), '01 / 19');
              assert.equal(await viewer.locator('[data-playback], .gallery-thumbs, .photo-track').count(), 0);
              await viewer.locator('[data-gallery-step="1"]').click();
              await image.evaluate(el => el.decode());
              assert.ok(await image.evaluate(el => el.naturalWidth < el.naturalHeight));
              assert.equal(await viewer.locator('.gallery-count').innerText(), '02 / 19');
              await viewer.locator('[data-gallery-step="-1"]').click();
              await viewer.locator('[data-close-gallery]').click();
              assert.equal(await page.locator('[data-gallery-index="0"]').getAttribute('aria-pressed'), 'true');
            }
          } else {
            assert.equal(await page.locator('.details-bar a, #gallery').count(), 0);
            assert.equal(await header.locator('[data-application-link]').isVisible(), false);
          }
          if (name === '208-sloemer-ave') {
            assert.match(await page.locator('.details-bar').innerText(), /Ask for pricing/);
            assert.equal(await page.locator('.listing-availability .availability-badge').count(), 0);
          }
        }
        if (axePath) {
          await page.addScriptTag({ path: axePath });
          const scan = await page.evaluate(async () => {
            const result = await axe.run('.sky-header', { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] });
            return { violations: result.violations.map(rule => rule.id), incomplete: result.incomplete.map(rule => rule.id) };
          });
          assert.deepEqual(scan.violations, [], name);
          (results[name] ??= {})[view] = scan;
        }
        if (evidence) {
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(220);
          await page.screenshot({ path: join(evidence, view + '-' + name + '.jpg'), quality: 84 });
        }
      }
      assert.deepEqual(errors, []);
      await page.close();
    }

    const session = await browser.newContext({
      viewport: { width: 1440, height: 960 },
      ...(process.env.OAKTOWN_VIDEO_DIR && { recordVideo: { dir: process.env.OAKTOWN_VIDEO_DIR, size: { width: 1152, height: 768 } } })
    });
    const page = await session.newPage();
    const settle = () => page.waitForTimeout(evidence ? 550 : 180);
    await page.goto(base + '/');
    const dropdown = page.locator('.sky-disclosure').first();
    async function pickHome(slug) {
      await dropdown.locator('summary').hover();
      await dropdown.locator('a[href$="#home/' + slug + '"]').click();
      await page.waitForURL('**/#home/' + slug);
      await page.locator('.listing-intro-copy').waitFor();
      await settle();
    }
    await page.locator('.cinematic-hero').waitFor();
    await settle();
    await pickHome('115-colonial-drive');
    await pickHome('4005-smallboat-ct');
    await page.locator('[data-gallery-index="2"]').click();
    const selected = page.locator('[data-gallery-index="2"]');
    assert.equal(await selected.getAttribute('aria-pressed'), 'true');
    const vacation = page.locator('.sky-nav-link[href="/mint-mojo/"]');
    await vacation.focus();
    const previousY = await page.evaluate(() => scrollY);
    await vacation.press('Enter');
    await page.waitForURL('**/mint-mojo/', { waitUntil: 'commit' });
    await page.locator('.mint-section-nav').waitFor();
    await settle();

    const resources = page.locator('.resources-menu');
    await resources.locator('summary').focus();
    await resources.locator('summary').press('Enter');
    assert.equal(await resources.getAttribute('open'), '');
    await page.keyboard.press('Escape');
    assert.equal(await resources.locator('summary').evaluate(el => el === document.activeElement), true);
    await page.locator('#language-switch').click();
    await page.locator('#motion-toggle').click();
    await page.waitForFunction(() => document.querySelector('#motion-toggle').getAttribute('aria-pressed') === 'false');
    await page.goBack({ waitUntil: 'commit' });
    await page.waitForURL('**/#home/4005-smallboat-ct', { waitUntil: 'commit' });
    await selected.waitFor();
    assert.equal(await selected.getAttribute('aria-pressed'), 'true');
    await page.waitForFunction(expected => Math.abs(scrollY - expected) <= 64, previousY);
    assert.equal(await page.locator('html').getAttribute('lang'), 'es');
    assert.equal(await page.locator('#motion-toggle').getAttribute('aria-pressed'), 'false');
    // A restored document may already have completed its original load event.
    await page.goForward({ waitUntil: 'commit' });
    await page.waitForURL('**/mint-mojo/', { waitUntil: 'commit' });
    await page.locator('.mint-section-nav').waitFor();
    assert.equal(await page.locator('html').getAttribute('lang'), 'es');
    assert.equal(await page.locator('#motion-toggle').getAttribute('aria-pressed'), 'false');
    await page.locator('#language-switch').click();

    for (const [group, hash, target] of [
      [resources, 'faq', '#faq'], [resources, 'community', '#community'], [dropdown, 'homes', '#homes']
    ]) {
      const summary = group.locator('summary');
      await summary.focus();
      await summary.press('Enter');
      await group.locator('a[href$="#' + hash + '"]').click();
      await page.waitForURL('**/#' + hash, { waitUntil: 'commit' });
      await page.locator(target).waitFor();
      await settle();
    }
    for (const hash of ['community', 'faq']) {
      await page.goBack({ waitUntil: 'commit' });
      await page.waitForURL('**/#' + hash, { waitUntil: 'commit' });
      await page.locator('#' + hash).waitFor();
    }
    await page.goBack({ waitUntil: 'commit' });
    await page.waitForURL('**/mint-mojo/', { waitUntil: 'commit' });
    await page.locator('.mint-section-nav').waitFor();
    await settle();
    const video = page.video();
    await session.close();
    if (video && evidence) await video.saveAs(join(evidence, 'navigation.webm'));

    const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
    await phone.goto(base + '/mint-mojo/');
    await phone.locator('#menu-button').click();
    await phone.locator('.sky-disclosure summary').first().click();
    await phone.locator('#header-properties a[href="/#home/115-colonial-drive"]').click();
    await phone.waitForURL('**/#home/115-colonial-drive');
    await phone.locator('.listing-intro-copy').waitFor();
    await phone.close();

    if (evidence) writeFileSync(join(evidence, 'navigation-checks.json'), JSON.stringify(results, null, 2) + '\n');
    console.log('PASS: 14 routes × 2 viewports, shared header metrics, six property openings, cross-document history and preferences, navigation journey, mobile menu.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
