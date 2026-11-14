const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=(process.env.OAKTOWN_BASE_URL||'http://127.0.0.1:8793').replace(/\/$/,'');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.OAKTOWN_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});let checks=0;
 try{
  for(const [width,height] of [[320,560],[320,640],[390,640],[390,844],[768,1024],[1024,650],[1440,900]])for(const language of ['en','es']){
   const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(l=>localStorage.setItem('oaktown-language',l),language);
   await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
   await page.goto(base+'/');await page.waitForSelector('.story');await page.evaluate(()=>document.fonts.ready);
   const scroll=async progress=>{await page.evaluate(p=>{const story=document.querySelector('.story'),stage=document.querySelector('.story-stage');scrollTo({top:story.offsetTop+(story.offsetHeight-stage.offsetHeight)*p,behavior:'instant'});},progress);await page.waitForTimeout(100);};
   for(const [progress,index] of [[.1,0],[.45,1],[.85,2]]){
    await scroll(progress);await page.waitForTimeout(700);
    const state=await page.evaluate(()=>{
     const rect=selector=>document.querySelector(selector).getBoundingClientRect();
     const stage=document.querySelector('.story-stage'),notice=getComputedStyle(stage,'::after');
     return {position:getComputedStyle(stage).position,top:rect('.story-stage').top,scene:document.querySelector('[data-scene].is-active').dataset.scene,image:document.querySelector('[data-scene-image].is-active').dataset.sceneImage,transform:document.querySelector('[data-scene-image].is-active').style.transform,copy:rect('.story-scene.is-active .story-description').bottom,actions:rect('.story-actions').top,actionBottom:rect('.story-actions').bottom,chapters:rect('.story-bottom').top,chaptersBottom:rect('.story-bottom').bottom,noticeTop:rect('.story-stage').bottom-parseFloat(notice.bottom)-parseFloat(notice.height),hint:rect('.story-topline').bottom,copyTop:rect('.story-copy').top,overflow:document.documentElement.scrollWidth>innerWidth,stageHeight:stage.offsetHeight,homes:document.querySelector('#homes').offsetTop};
    });
    assert.equal(state.position,'sticky',`${language} ${width}x${height} pins the photo stage`);
    assert.ok(Math.abs(state.top)<2);
    assert.equal(state.scene,String(index));assert.equal(state.image,String(index));
    assert.match(state.transform,/translateY.*scale/);
    assert.equal(state.overflow,false);
    assert.ok(state.homes<=height*2,'homes remain within two screens');
    if(width<=850){
     assert.ok(state.copy<state.actions,`${language} ${width}x${height} copy clears View Homes`);
     assert.ok(state.actionBottom<state.chapters,`${language} ${width}x${height} actions clear chapters`);
     assert.ok(state.hint<state.copyTop,`${language} ${width}x${height} scroll hint clears copy`);
     if(height<=600)assert.ok(state.chaptersBottom<state.noticeTop,`${language} ${width}x${height} unavailable-photo notice clears the controls`);
    }
    checks++;
   }
   await scroll(.1);const before=await page.locator('[data-scene-image="0"]').evaluate(el=>el.style.transform);
   await scroll(.2);assert.notEqual(await page.locator('[data-scene-image="0"]').evaluate(el=>el.style.transform),before,'same-photo motion is scrubbed continuously');checks++;
   await page.locator('#motion-toggle').click();await page.waitForTimeout(100);
   assert.equal(await page.locator('.story-stage').evaluate(el=>getComputedStyle(el).position),'relative');
   assert.equal(await page.locator('[data-scene-image="0"]').evaluate(el=>el.style.transform),'');checks++;
   assert.deepEqual(errors,[]);await page.close();
  }
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());await page.goto(base+'/');
  await page.locator('[data-scene-button="2"]').click();
  assert.equal(await page.locator('[data-scene].is-active').getAttribute('data-scene'),'2');
  assert.equal(await page.locator('.story-stage').evaluate(el=>getComputedStyle(el).position),'relative');checks++;
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(base+'/');
  await page.locator('#homes').scrollIntoViewIfNeeded();await page.locator('[data-layout-button="gallery"]').click();
  await page.waitForFunction(()=>document.querySelectorAll('.property-image-wrap')[1].style.transform.includes('rotateY'));
  const galleryPhoto=page.locator('.property-image-wrap').nth(1);
  const initial=await galleryPhoto.evaluate(el=>el.style.transform);
  await page.locator('.collection-viewport').evaluate(el=>el.scrollTo({left:el.clientWidth,behavior:'instant'}));
  await page.waitForFunction(previous=>document.querySelectorAll('.property-image-wrap')[1].style.transform!==previous,initial);
  assert.notEqual(await galleryPhoto.evaluate(el=>el.style.transform),initial,'phone gallery perspective responds to native scrolling');checks++;
  await page.setViewportSize({width:844,height:390});await page.goto(base+'/');
  assert.equal(await page.locator('.story-stage').evaluate(el=>getComputedStyle(el).position),'relative','very short landscape windows remain static and browsable');
  await page.locator('[data-scene-button="2"]').click();
  assert.equal(await page.locator('[data-scene].is-active').getAttribute('data-scene'),'2');checks++;
  console.log(`${checks} scroll-photo checks passed: EN/ES across seven phone/tablet/laptop sizes, synchronized photos and copy, continuous pan/zoom, clear controls and static motion preferences.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
