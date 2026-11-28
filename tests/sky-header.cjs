const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const published = require('./fixtures/cms-inventory.json');
const base = process.env.OAKTOWN_BASE_URL || 'http://127.0.0.1:8944';
const expected = [
  '115-colonial-drive', '4005-smallboat-ct', '1106-cherokee-rd-unit-8',
  '1824-w-madison', '208-sloemer-ave', '8008-troutwood-ct'
];
const application = 'https://oaktownrentalsapplication.fillout.com/95';

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const passed = [];
  const errors = [];
  async function open(width=1440, height=900, language='en', reduced=false, catalogue) {
    const page = await browser.newPage({
      viewport: { width, height }, hasTouch: width <= 768,
      reducedMotion: reduced ? 'reduce' : 'no-preference'
    });
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(({lang, origin}) => {
      if (location.origin === origin) localStorage.setItem('oaktown-language', lang);
    }, {lang:language,origin:new URL(base).origin});
    if (catalogue) await page.route('**/api/properties', route => route.fulfill(catalogue));
    await page.goto(base);
    await page.locator('.sky-header[data-surface=sky]').waitFor();
    await page.locator('.cinematic-photo').evaluate(img => img.decode());
    await page.evaluate(() => document.fonts.ready);
    return page;
  }
  const ok = (label) => passed.push(label);
  const scrollTo = (page, y) => page.evaluate(y => window.scrollTo({top:y, behavior:'instant'}), y);
  const links = page => page.locator('#header-properties a');
  const homeTrigger = page => page.locator('.sky-disclosure summary').first();

  try {
    const page = await open();
    const hero = page.locator('.cinematic-hero');
    const header = page.locator('.site-header');
    const menu = page.locator('#mobile-nav');
    const photo = await page.locator('.cinematic-photo').boundingBox();
    const mark = page.locator('.wordmark img');
    assert.equal(await mark.getAttribute('src'), '/assets/signature/oaktown-wordmark-transparent.png');
    assert.equal(await mark.evaluate(img => img.naturalWidth), 480);
    assert.equal(await page.locator('.footer-brand img').getAttribute('src'), './assets/oaktown-rentals-logo.jpg');
    assert.equal(await header.evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)');
    assert.equal(await header.evaluate(el => getComputedStyle(el).borderBottomWidth), '0px');
    assert.equal(photo.y, 0);
    assert.equal(photo.height, 900);
    assert.equal(await page.locator('#menu-button').isVisible(), false);
    assert.equal(await menu.locator('.sky-mobile-apply').isVisible(), false);
    assert.equal(await menu.locator('summary,.sky-story-link').allInnerTexts().then(a => a.join('|')), 'Our Homes|Lofts & Nirvana|Resources|Our Story');
    ok('Full bleed, transparent opening, authentic mark, four desktop destinations and quiet utilities');

    const action = page.locator('.hero-opening-actions a');
    assert.deepEqual(await action.allTextContents(), ['Browse Our Homes', 'Apply Now']);
    assert.equal(await action.first().getAttribute('href'), '#homes');
    assert.equal(await action.last().getAttribute('href'), application);
    assert.equal(await page.locator('[data-hero-scene="2"] a[href="#faq"]').count(),1);
    assert.equal(await page.locator('.cinematic-scroll').getAttribute('href'), '#home-search');
    ok('Opening actions, discovery guidance and scroll destination');

    assert.deepEqual(await links(page).evaluateAll(anchors => anchors.map(a => a.hash.slice(6))), expected);
    await page.locator('[name=neighborhood]').selectOption('Cherokee Triangle');
    await page.locator('#home-search button[type=submit]').click();
    await page.waitForFunction(() => document.querySelectorAll('.property-card:not([hidden])').length === 1);
    assert.equal(await links(page).count(), 6);
    await page.goto(base);
    await page.locator('.sky-header[data-surface=sky]').waitFor();
    ok('Full six-property list independent of filters');

    const trigger = homeTrigger(page);
    const underline = async () => trigger.evaluate(el => getComputedStyle(el, '::after').transform);
    assert.match(await underline(), /matrix\(0,/);
    await trigger.hover();
    await page.waitForFunction(() => document.querySelector('.sky-disclosure').open);
    await page.waitForFunction(() => new DOMMatrix(getComputedStyle(document.querySelector('.sky-disclosure summary'),'::after').transform).a>.999);
    await links(page).first().hover();
    await page.waitForTimeout(160);
    assert.equal(await links(page).first().isVisible(), true);
    await page.mouse.move(500,250);
    await page.waitForFunction(() => !document.querySelector('.sky-disclosure').open);
    ok('Left-origin underline and gap-free hover transfer to menu');

    await trigger.focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.sky-browse').evaluate(el => document.activeElement===el), true);
    await page.keyboard.press('Shift+Tab');
    assert.equal(await trigger.evaluate(el => document.activeElement===el), true);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Escape');
    assert.equal(await trigger.evaluate(el => document.activeElement===el), true);
    assert.equal(await page.locator('.sky-disclosure[open]').count(), 0);
    await trigger.press('Enter');
    await page.locator('.resources-menu summary').click();
    assert.equal(await page.locator('.sky-disclosure[open]').count(), 1);
    assert.equal(await page.locator('.resources-menu[open]').count(), 1);
    await page.mouse.click(700,220);
    assert.equal(await page.locator('.sky-disclosure[open]').count(), 0);
    ok('Native disclosure labels, Tab, Shift+Tab, Space, Enter, Escape and outside dismissal');

    await page.locator('.sky-disclosure').nth(1).locator('summary').press('Enter');
    assert.deepEqual(await page.locator('.sky-disclosure').nth(1).locator('.sky-dropdown a').evaluateAll(as => as.map(a=>a.getAttribute('href'))), ['/mint-mojo/']);
    await page.keyboard.press('Escape');
    await page.locator('.resources-menu summary').press('Enter');
    assert.deepEqual(await page.locator('.resources-menu a').evaluateAll(as => as.map(a=>a.hash)), ['#faq','#community','#contact']);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.sky-story-link').getAttribute('href'), '#about');
    ok('Verified vacation, story and resource destinations');

    const travel = await hero.evaluate(el => el.offsetHeight - el.firstElementChild.offsetHeight);
    let lastScale = 0;
    for (const [i, progress] of [[0,0],[1,.5],[2,1],[1,.5],[0,0]]) {
      await scrollTo(page, Math.round(travel * progress));
      await page.waitForFunction(index => document.querySelector('.cinematic-hero').dataset.scene === String(index),i);
      const scale = await page.locator('.signature-images').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).a);
      if (i===2) assert.ok(scale>lastScale);
      lastScale=scale;
      assert.equal(await header.getAttribute('data-surface'), 'sky');
      assert.deepEqual(await hero.locator('[data-hero-scene]').evaluateAll(scenes => scenes.map(s => s.inert)), [0,1,2].map(index=>i!==index));
    }
    ok('Forward and reverse three-scene camera, transparent header and inert off-scene actions');

    await trigger.press('Enter');
    await links(page).last().click();
    await page.waitForURL('**/#home/8008-troutwood-ct');
    await page.waitForFunction(() => document.querySelector('h1')?.textContent === '8008 Troutwood Ct');
    assert.equal(await header.getAttribute('data-surface'),'ivory');
    assert.equal(await page.locator('.detail-actions a[href^="sms:"]').count(), 1);
    assert.equal(await page.locator('.detail-actions a[href^="https:"]').count(), 0);
    assert.equal(await links(page).last().getAttribute('aria-current'), 'page');
    await page.goBack();
    await hero.waitFor();
    await page.waitForFunction(() => document.querySelector('#site-header').dataset.surface === 'sky' && scrollY === 0);
    await page.evaluate(() => document.fonts.ready);
    ok('Exact contact-only route, ivory detail header, current property and Back');

    const end = await hero.evaluate(el => el.offsetHeight);
    await page.mouse.move(600,420);
    await page.evaluate(() => document.activeElement?.blur());
    await scrollTo(page,end+125);
    await page.waitForFunction(() => document.querySelector('#site-header').dataset.surface==='ivory');
    await scrollTo(page,end+350);
    await page.locator('.sky-header-away').waitFor({state:'attached'});
    await page.waitForFunction(y => scrollY === y,end+350);
    await scrollTo(page,end+200);
    await page.waitForFunction(y => scrollY === y,end+200);
    await page.locator('.sky-header-away').waitFor({state:'detached'});
    await trigger.press('Enter');
    await scrollTo(page,end+340);
    await page.waitForTimeout(260);
    assert.equal(await header.evaluate(el => el.classList.contains('sky-header-away')), false);
    await page.keyboard.press('Escape');
    await scrollTo(page,end+450);
    await page.waitForTimeout(260);
    assert.equal(await header.evaluate(el => el.classList.contains('sky-header-away')), false);
    ok('Ivory post-hero state, down/up threshold and protection for open/focused navigation');
    await page.close();

    for (const [width,height] of [[1920,1080],[1440,900],[1366,520],[768,900],[390,844],[320,640]]) {
      for (const language of ['en','es']) {
        const p = await open(width,height,language);
        const mobile = width<=960;
        assert.equal(await p.locator('html').getAttribute('lang'),language);
        assert.equal(await p.locator('#menu-button').isVisible(),mobile);
        const box = await p.locator('.hero-opening-actions').boundingBox();
        assert.ok(box.y+box.height<=height && box.y>88, `${width}×${height} ${language} opening actions in viewport`);
        assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        if (mobile) {
          await p.locator('#menu-button').tap();
          await homeTrigger(p).tap();
          assert.equal(await links(p).last().isVisible(),true);
          assert.equal(await p.locator('.sky-mobile-apply').getAttribute('href'),application);
          assert.equal(await p.locator('#mobile-nav').evaluate(el=>el.getBoundingClientRect().bottom<=innerHeight+1),true);
          await p.keyboard.press('Escape');
          assert.equal(await homeTrigger(p).evaluate(el=>document.activeElement===el),true);
          await p.keyboard.press('Escape');
          assert.equal(await p.locator('#mobile-nav').isHidden(),true);
          assert.equal(await p.locator('#menu-button').evaluate(el=>document.activeElement===el),true);
        }
        if (width===390) {
          await p.locator('#language-switch').click();
          assert.equal(await p.locator('html').getAttribute('lang'),language==='en'?'es':'en');
        }
        await p.close();
        ok(`${width}×${height} ${language} header, fit, actions and navigation`);
      }
    }

    const reduced = await open(1440,900,'en',true);
    assert.equal(await reduced.locator('.is-cinematic').count(),0);
    await homeTrigger(reduced).press('Enter');
    assert.equal(await reduced.locator('.sky-dropdown').first().evaluate(e=>getComputedStyle(e).animationName),'none');
    await reduced.mouse.click(650,220);
    await scrollTo(reduced,1300);
    await reduced.waitForFunction(() => document.querySelector('#site-header').dataset.surface === 'ivory');
    await scrollTo(reduced,1500);
    await reduced.waitForTimeout(140);
    assert.equal(await reduced.locator('.sky-header-away').count(),0);
    await reduced.close();
    ok('Reduced-motion opening and persistent ivory header');

    const subset = [published[0], {...published[2],name:'Cherokee & Louisville'}];
    for (const [label, response, slugs] of [
      ['published subset', {json:{mode:'database',properties:subset}}, subset.map(p=>p.slug)],
      ['empty database', {json:{mode:'database',properties:[]}}, []],
      ['database unavailable', {status:503, json:{error:'Unavailable'}}, []]
    ]) {
      const p = await open(1440,900,'en',true,response);
      await homeTrigger(p).press('Enter');
      assert.deepEqual(await links(p).evaluateAll(as=>as.map(a=>a.hash.slice(6))),slugs);
      assert.equal(await p.locator('.sky-browse').isVisible(),true);
      if (slugs.length) assert.equal(await links(p).last().innerText(),'Cherokee & Louisville');
      await p.close();
      ok(label+' stays authoritative in the property disclosure');
    }
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({passed,failures:[]},null,2));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
