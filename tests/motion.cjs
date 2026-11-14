const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=(process.env.OAKTOWN_BASE_URL||'http://127.0.0.1:8787').replace(/\/$/,'');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.OAKTOWN_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
 let checks=0;
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
  await page.goto(base+'/');
  await page.waitForSelector('[data-scene]');
  const scrollChapter=async progress=>{
   await page.evaluate(p=>{const story=document.querySelector('.story');scrollTo({top:story.offsetTop+(story.offsetHeight-innerHeight)*p,behavior:'instant'});},progress);
   await page.waitForTimeout(100);
  };
  for(const [progress,index] of [[.12,0],[.48,1],[.86,2]]) {
   await scrollChapter(progress);
   assert.equal(await page.locator('[data-scene].is-active').getAttribute('data-scene'),String(index));
   assert.equal(await page.locator('[data-scene-image].is-active').getAttribute('aria-hidden'),'false');
   assert.equal(await page.locator(`[data-scene-button="${index}"]`).getAttribute('aria-pressed'),'true');
   checks++;
  }
  await page.locator('#homes').scrollIntoViewIfNeeded();
  const before=await page.locator('#homes').evaluate(el=>el.getBoundingClientRect().top);
  await page.locator('#motion-toggle').click();
  await page.waitForTimeout(80);
  const after=await page.locator('#homes').evaluate(el=>el.getBoundingClientRect().top);
  assert.ok(Math.abs(before-after)<3,'pausing keeps the collection at its reading position');checks++;
  assert.equal(await page.locator('.story-stage').evaluate(el=>getComputedStyle(el).position),'relative');checks++;
  assert.equal(await page.locator('.story-image').first().evaluate(el=>el.style.transform),'');checks++;
  await page.locator('#motion-toggle').click();
  await page.waitForTimeout(80);
  assert.ok(Math.abs(before-await page.locator('#homes').evaluate(el=>el.getBoundingClientRect().top))<3,'resuming preserves the collection reading position');checks++;
  await page.setViewportSize({width:390,height:844});
  await page.goto(base+'/');
  await page.locator('[data-scene-button="1"]').click();
  await page.evaluate(()=>scrollTo({top:180,behavior:'instant'}));
  await page.waitForTimeout(100);
  assert.equal(await page.locator('[data-scene].is-active').getAttribute('data-scene'),'0','mobile scrolling drives the selected chapter');checks++;
  assert.equal(await page.locator('.story-stage').evaluate(el=>getComputedStyle(el).position),'sticky');checks++;
  for(const language of ['en','es'])for(const width of [320,390,768]) {
   const height=width<=390?640:844;
   await page.setViewportSize({width,height});
   await page.evaluate(l=>localStorage.setItem('oaktown-language',l),language);
   await page.goto(base+'/');
   for(const index of [0,1,2]) {
    await page.locator(`[data-scene-button="${index}"]`).click();
    await page.waitForTimeout(800);
    const geometry=await page.evaluate(()=>{
     const rect=selector=>document.querySelector(selector).getBoundingClientRect();
     return {copy:rect('.story-scene.is-active .story-description').bottom,actionTop:rect('.story-actions').top,actionBottom:rect('.story-actions').bottom,chapters:rect('.story-bottom').top,chapterBottom:rect('.story-bottom').bottom,barTop:rect('.mobile-actions').top,controls:[...document.querySelectorAll('.header-actions>*')].filter(el=>getComputedStyle(el).display!=='none').map(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right}))};
    });
    assert.ok(geometry.copy<geometry.actionTop,`${language} ${width} chapter ${index} copy clears actions`);
    assert.ok(geometry.actionBottom<geometry.chapters,`${language} ${width} chapter ${index} actions clear photo navigation`);
    assert.ok(geometry.chapterBottom<geometry.barTop,`${language} ${width} chapter navigation clears the fixed actions`);
    for(let i=1;i<geometry.controls.length;i++)assert.ok(geometry.controls[i].left>=geometry.controls[i-1].right,`${language} ${width} header controls do not overlap`);
    checks++;
   }
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base+'/');
  assert.equal(await page.locator('.story-stage').evaluate(el=>getComputedStyle(el).position),'relative');checks++;
  await page.locator('[data-scene-button="2"]').click();
  await page.evaluate(()=>scrollTo({top:400,behavior:'instant'}));
  await page.waitForTimeout(80);
  assert.equal(await page.locator('[data-scene].is-active').getAttribute('data-scene'),'2','reduced motion keeps manual chapter selection');checks++;
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto(base+'/#home/115-colonial-drive');
  await page.waitForSelector('.gallery');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForTimeout(80);
  assert.equal(await page.locator('.story').count(),0);
  assert.deepEqual(errors,[],'chapter listeners clean up when leaving the homepage');checks++;
  assert.equal(await page.locator('.footer-signature').count(),0);checks++;
  console.log(`${checks} motion checks passed: synchronized chapters, pause/resume reading position, mobile scrolling/static reduced motion, bilingual clearances and route cleanup.`);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
