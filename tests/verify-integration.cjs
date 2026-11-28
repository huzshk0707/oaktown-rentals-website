// Read-only verification for the six-listing integration. No photo interception.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { readFileSync, writeFileSync } = require('node:fs');
const { createHash } = require('node:crypto');
const { resolve } = require('node:path');

const base = process.env.OAKTOWN_BASE_URL || 'http://127.0.0.1:8942';
const hosted = new URL(base).protocol === 'https:';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const expected = {
  '115-colonial-drive': 19,
  '4005-smallboat-ct': 17,
  '1106-cherokee-rd-unit-8': 9,
  '1824-w-madison': 15,
  '208-sloemer-ave': 8,
  '8008-troutwood-ct': 0
};
const fileCounts = { '115-colonial-drive': 19, '4005-smallboat-ct': 11, '208-sloemer-ave': 8 };
const axePath = process.env.OAKTOWN_AXE_PATH;
const result = { base, hosted, assets: [], properties: [], accessibility: [], errors: [] };

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => result.errors.push(error.message));
    const status = await page.goto(base + '/#homes');
    assert.equal(status.status(), 200);
    await page.locator('.property-card').first().waitFor();
    const records = await page.evaluate(() => {
      const { properties, images } = window.OAKTOWN_DATA;
      return properties.map(p => ({ slug: p.slug, photos: images[p.imageKey] }));
    });
    assert.deepEqual(Object.fromEntries(records.map(p => [p.slug, p.photos.length])), expected);
    const verifyAsset = async path => {
      const response = await page.request.get(base + path);
      assert.equal(response.status(), 200, path);
      const hash = sha256(await response.body());
      assert.equal(hash, sha256(readFileSync(resolve(__dirname, '..', path.slice(1)))), path);
      result.assets.push({ path, sha256: hash });
    };
    for (const path of ['/data.js', '/app.js', '/property-cards.js', '/collection.js', '/collection.css', '/signature.js', '/signature.css', '/cms-client.js']) await verifyAsset(path);
    if (hosted) {
      assert.deepEqual(await (await page.request.get(base + '/api/properties')).json(), { mode: 'file' });
      const robots = await (await page.request.get(base + '/robots.txt')).text();
      assert.match(robots, /Disallow:\s*\//);
      assert.match(await page.locator('meta[name=robots]').getAttribute('content'), /noindex/);
      assert.ok([401, 403, 503].includes((await page.request.get(base + '/api/admin/properties')).status()));
      assert.equal((await page.request.get(base + '/docs/oaktown-signature/phase2d/prototypes/index.html')).status(), 404);
    }
    for (const { slug, photos } of records) {
      const local = photos.filter(path => path.startsWith('/assets/properties/'));
      assert.equal(local.length, fileCounts[slug] || 0);
      await page.goto(base + '/#home/' + slug);
      await page.locator('.page-intro h1').waitFor();
      const thumbs = page.locator('[data-gallery-index]');
      assert.equal(await thumbs.count(), photos.length, slug);
      if (!photos.length) assert.equal(await page.locator('#gallery,[data-cover-gallery],.detail-actions .text-link').count(), 0);
      for (const path of local) await verifyAsset(path);
      for (const [index, path] of photos.entries()) {
        const url = new URL(path, base).href.split('?')[0];
        await thumbs.nth(index).click();
        await page.waitForFunction(url => {
          const photo = document.querySelector('.gallery-active');
          return photo?.naturalWidth > 0 && photo.src.split('?')[0] === url;
        }, url, { timeout: 15000 });
      }
      result.properties.push({ slug, local: local.length, gallerySelections: photos.length });
    }
    for (const width of [320, 390, 768, 1440]) for (const language of ['en', 'es']) {
      const view = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      view.on('pageerror', error => result.errors.push(error.message));
      await view.addInitScript(lang => localStorage.setItem('oaktown-language', lang), language);
      for (const route of ['homes', 'home/208-sloemer-ave', 'home/8008-troutwood-ct']) {
        await view.goto(base + '/#' + route);
        await view.locator(route === 'homes' ? '.property-card' : '.page-intro h1').first().waitFor();
        assert.equal(await view.locator('html').getAttribute('lang'), language);
        assert.equal(await view.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, width + ' ' + route);
        if (route.endsWith('troutwood-ct')) {
          const updates = view.locator('.listing-availability a');
          assert.equal((await updates.textContent()).trim(), language === 'en' ? 'Ask for updates' : 'Consultar novedades');
          assert.equal(await updates.evaluate(el => getComputedStyle(el).borderRadius), '12px');
          assert.equal(await view.locator('#gallery,.detail-actions a[target=_blank]').count(), 0);
        }
        if (axePath) {
          if (!await view.evaluate(() => !!window.axe)) await view.addScriptTag({ path: axePath });
          const scan = await view.evaluate(async () => {
            const report = await window.axe.run({ runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } });
            return {
              violations: report.violations.map(x => ({ id: x.id, targets: x.nodes.map(n => n.target) })),
              incomplete: report.incomplete.map(x => ({ id: x.id, count: x.nodes.length }))
            };
          });
          result.accessibility.push({ width, language, route, ...scan });
        }
      }
      await view.close();
    }
    assert.deepEqual(result.errors, []);
    assert.ok(result.accessibility.every(scan => !scan.violations.length), 'See recorded axe violations');
    console.log('PASS: six records, 38 byte-identical imports, 68 ordered image selections, eight responsive language/width pairs.');
  } finally {
    if (process.env.OAKTOWN_REPORT) writeFileSync(process.env.OAKTOWN_REPORT, JSON.stringify(result, null, 2) + '\n');
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
