const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { join, resolve } = require('node:path');
const { writeFileSync } = require('node:fs');

const before = process.argv.includes('--before');
const base = process.env.OAKTOWN_BASE_URL || 'http://127.0.0.1:8946';
const out = resolve('docs/oaktown-signature/phase3');
const phase = before ? 'before' : 'after';
const axePath = process.env.OAKTOWN_AXE_PATH;
const scans = [];
const capture = (page, name, options = {}) => page.screenshot({path: join(out, `${name}.jpg`), type: 'jpeg', quality: 89, ...options});
const settle = page => page.waitForTimeout(150);
const scroll = (page, top) => page.evaluate(top => scrollTo({top, behavior:'instant'}), top);

async function open(context, language = 'en') {
  const page = await context.newPage();
  await page.addInitScript(language => localStorage.setItem('oaktown-language', language), language);
  await page.goto(`${base}/`);
  await page.locator('.cinematic-photo').evaluate(img => img.decode());
  await page.evaluate(() => document.fonts.ready);
  return page;
}

async function loadPage(page) {
  await page.evaluate(async () => {
    const images = [...document.querySelectorAll('#app img')];
    images.forEach(img => {img.loading = 'eager'});
  });
  const cardCount = await page.locator('.property-card').count();
  for (const card of await page.locator('.property-card').all()) await card.scrollIntoViewIfNeeded();
  await page.locator('.collection-viewport').evaluate(el => {el.scrollLeft=0});
  await page.waitForFunction(() => [...document.querySelectorAll('.property-card:not(.listing-photo-pending) img.property-image')].filter(img => img.getAttribute('src')).every(img => img.complete && img.naturalWidth > 0));
  assert.equal(cardCount,6);
  await scroll(page,0);
  await settle(page);
}

async function colors(browser) {
  const measured = [];
  for (const [name,colorScheme,autoDark] of [['light','light',false],['dark','dark',false],['forced-dark','dark',true]]) {
    const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,colorScheme,reducedMotion:'reduce'});
    const page = await open(context);
    if (autoDark) {
      const session = await context.newCDPSession(page);
      await session.send('Emulation.setAutoDarkModeOverride',{enabled:true});
    }
    await page.locator('#homes').evaluate(el => el.scrollIntoView({block:'start',behavior:'instant'}));
    await settle(page);
    measured.push(await page.evaluate(({name,autoDark}) => {
      const css = s => getComputedStyle(document.querySelector(s));
      return {name,autoDark,darkPreference:matchMedia('(prefers-color-scheme: dark)').matches,
        root:css('html').colorScheme,body:css('body').colorScheme,
        collection:css('#homes').backgroundColor,bodyBackground:css('body').backgroundColor,
        price:css('.property-price').backgroundImage,
        theme:document.querySelector('meta[name=theme-color]').content};
    },{name,autoDark}));
    await capture(page,`${phase}-mobile-${name}`);
    await context.close();
  }
  writeFileSync(join(out,`${phase}-mobile-colors.json`),JSON.stringify(measured,null,2)+'\n');
}

(async () => {
  const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  try {
    for (const [name, width, height, lang] of before ? [['desktop',1440,900,'en'],['mobile',390,844,'en']] : [['desktop',1440,900,'en'],['desktop-es',1440,900,'es'],['mobile',390,844,'en'],['mobile-es',390,844,'es']]) {
      const ctx = await browser.newContext({viewport:{width,height},reducedMotion:'reduce',isMobile:width<600,hasTouch:width<600});
      const page = await open(ctx,lang);
      await loadPage(page);
      await capture(page,`${phase}-${name}-full`,{fullPage:true});
      if (!before) {
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false);
        const sections = await page.locator('#app').evaluate(el => [...el.children].map(child => child.className));
        assert.deepEqual(sections.slice(-3),['signature-story','signature-journey','signature-vacation']);
        await page.goto(`${base}/#about`);
        const section = page.locator('#about');
        await section.locator('img').evaluate(img => {img.loading='eager'});
        await page.waitForFunction(() => document.querySelector('#about img').naturalWidth>0);
        await settle(page);
        if (width>=1000) assert.ok((await section.boundingBox()).height>=height);
        assert.equal(await section.locator('.signature-credit a').count(),2);
        await capture(page,`${name}-louisville`);
        await section.locator('summary').click();
        assert.equal(await section.locator('details').getAttribute('open'),'');
        await section.locator('summary').click();
        if (axePath) {
          await page.addScriptTag({path:axePath});
          for (const selector of ['#about','.signature-journey','#cudejoe']) {
            const result = await page.evaluate(async selector => {
              const report = await axe.run(selector,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});
              return {violations:report.violations.map(x=>({id:x.id,targets:x.nodes.map(n=>n.target)})),incomplete:report.incomplete.map(x=>x.id)};
            },selector);
            scans.push({name,selector,...result});
          }
        }
        if (lang==='en') {
          for (const [selector,file] of [['.signature-journey','louisville-to-journey'],['#cudejoe','journey-to-nirvana']]) {
            await page.locator(selector).evaluate(el => scrollTo({top:el.getBoundingClientRect().top+scrollY-innerHeight*.38,behavior:'instant'}));
            await settle(page);
            await capture(page,`${name}-${file}`);
          }
        }
      }
      await ctx.close();
    }
    await colors(browser);
    if (!before) {
      writeFileSync(join(out,'accessibility.json'),JSON.stringify(scans,null,2)+'\n');
      assert.ok(scans.every(scan=>!scan.violations.length),'See accessibility.json');
    }
    console.log(`PASS ${phase} homepage capture and mobile color measurement (${scans.length} axe scans)`);
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
