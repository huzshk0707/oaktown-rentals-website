const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const captions=page=>page.locator('[data-caption]').evaluateAll(inputs=>inputs.map(input=>input.value));
const sources=page=>page.locator('.photo-card img').evaluateAll(images=>images.map(image=>image.getAttribute('src')));
async function panel(page,name){
  const tab=page.locator(`[data-editor-tab="${name}"]`);
  if(await tab.getAttribute('aria-selected')!=='true')await tab.click();
}
async function scrollToPhotos(page){
  await panel(page,'photos');
  await page.locator('#photo-list').evaluate(list=>window.scrollTo(0,list.getBoundingClientRect().top+scrollY-100));
}
async function dragPhoto(page,from,to){
  await scrollToPhotos(page);
  const handle=await page.locator('[data-drag]').nth(from).boundingBox();
  const target=await page.locator('.photo-card').nth(to).boundingBox();
  await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2);
  await page.mouse.down();
  await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2+10,{steps:3});
  await page.mouse.move(target.x+target.width/2,target.y+target.height*(to>from?.8:.2),{steps:25});
  // Allow Sortable's hover/animation interval to settle before dropping.
  await page.waitForTimeout(250);
  await page.mouse.up();
}
async function save(page){
  await page.getByRole('button',{name:'Save draft',exact:true}).click();
  await page.locator('#notice').filter({hasText:'Draft saved'}).waitFor();
}
async function open(page,title){
  await page.locator('.listing').filter({hasText:title}).getByRole('button',{name:'Edit listing'}).click();
}
async function checkOrder(page,expected){
  await page.waitForFunction(expected=>JSON.stringify([...document.querySelectorAll('[data-caption]')].map(input=>input.value))===JSON.stringify(expected),expected,{timeout:10000}).catch(async()=>{assert.deepEqual(await captions(page),expected,'photo order after dragging');});
  assert.deepEqual(await captions(page),expected);
  assert.equal(await page.locator('.photo-card .badge').first().textContent(),'Main photo');
  assert.equal(await page.locator('[data-move="0"][data-direction="-1"]').isDisabled(),true);
  assert.equal(await page.locator(`[data-move="${expected.length-1}"][data-direction="1"]`).isDisabled(),true);
}

(async()=>{
  const {startServer}=await import('./cms-harness.mjs');
  const server=await startServer();
  const browser=await chromium.launch({executablePath:process.env.OAKTOWN_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const errors=[];
  const context=await browser.newContext({viewport:{width:1440,height:1600},extraHTTPHeaders:{'X-Test-Admin':'editor@example.com'}});
  context.setDefaultTimeout(10000);
  const page=await context.newPage();
  let releaseUpload;
  page.on('pageerror',error=>errors.push(error.message));
  await context.route('**/*',route=>route.request().url().startsWith(server.base+'/')?route.continue():route.abort());
  try{
    await page.goto(server.base+'/admin/');
    await page.getByRole('button',{name:'+ Add property'}).click();
    await page.locator('[name=name]').fill('Photo ordering test');
    await page.locator('[name=neighborhood]').fill('Test neighborhood');
    await page.locator('[name=rent]').fill('1200');
    await panel(page,'photos');
    const file={mimeType:'image/jpeg',buffer:fs.readFileSync(path.join(__dirname,'../assets/oaktown-rentals-logo.jpg'))};
    await page.locator('#photo-upload').setInputFiles(['front','kitchen','bedroom','garden'].map(name=>({...file,name:name+'.jpg'})));
    await page.locator('#notice').filter({hasText:'Photos uploaded privately'}).waitFor();
    console.log('Created local listing with four uploaded photos.');
    for(const [i,caption] of ['Front','Kitchen','Bedroom','Garden'].entries())await page.locator(`[data-caption="${i}"]`).fill(caption);
    const originalSources=await sources(page);

    // A real mouse drag crosses both columns and rows without losing captions.
    await dragPhoto(page,0,3);
    await checkOrder(page,['Kitchen','Bedroom','Garden','Front']);
    assert.deepEqual(await sources(page),[...originalSources.slice(1),originalSources[0]]);
    assert.match(await page.locator('#photo-status').textContent(),/Moved photo 1 to position 4/);
    await dragPhoto(page,3,0);
    await checkOrder(page,['Front','Kitchen','Bedroom','Garden']);
    await page.locator('[data-caption="3"]').fill('Back garden');
    await dragPhoto(page,3,0);
    await checkOrder(page,['Back garden','Front','Kitchen','Bedroom']);
    await page.getByRole('button',{name:'Preview listing',exact:true}).click();
    await page.frameLocator('#preview-frame').locator('.detail-cover-photo').waitFor();
    assert.equal(await page.frameLocator('#preview-frame').locator('.detail-cover-photo').getAttribute('src'),originalSources[3]);
    await page.getByRole('button',{name:'Close',exact:true}).click();
    await save(page);
    console.log('Mouse dragging, captions and preview passed.');

    // Saved order survives a fresh load and is still private until published.
    await page.reload();await open(page,'Photo ordering test');await panel(page,'photos');
    await checkOrder(page,['Back garden','Front','Kitchen','Bedroom']);
    const publicBefore=await (await fetch(server.base+'/api/properties')).json();
    assert.equal(publicBefore.properties.some(p=>p.slug==='photo-ordering-test'),false);
    await panel(page,'description');
    await page.locator('[name=summary]').fill('Photo-order test listing.');
    await page.locator('[name=description]').fill('A local browser test property.');
    await page.getByRole('button',{name:'Publish listing',exact:true}).click();
    await page.locator('#publish-dialog').waitFor({state:'visible'});await page.locator('#confirm-publish').click();
    await page.locator('#notice').filter({hasText:'Listing published'}).waitFor();await panel(page,'photos');
    const publicPhotoOrder=(await (await fetch(server.base+'/api/properties')).json()).properties.find(p=>p.slug==='photo-ordering-test').photos;
    assert.deepEqual(publicPhotoOrder.map(p=>p.alt),['Back garden','Front','Kitchen','Bedroom']);
    console.log('Saved and published photo order passed.');

    // Existing-listing edits, keyboard handles and Earlier/Later retain focus.
    await page.locator('[data-drag="3"]').focus();await page.keyboard.press('Home');
    await checkOrder(page,['Bedroom','Back garden','Front','Kitchen']);
    assert.equal(await page.locator('[data-drag="0"]').evaluate(el=>el===document.activeElement),true);
    await page.keyboard.press('ArrowRight');
    await checkOrder(page,['Back garden','Bedroom','Front','Kitchen']);
    await page.locator('[data-move="1"][data-direction="-1"]').focus();await page.keyboard.press('Enter');
    await checkOrder(page,['Bedroom','Back garden','Front','Kitchen']);
    assert.equal(await page.locator('[data-move="0"][data-direction="1"]').evaluate(el=>el===document.activeElement),true);
    page.once('dialog',dialog=>dialog.dismiss());await page.getByRole('button',{name:'All properties',exact:true}).click();
    assert.equal(await page.locator('#editor').isVisible(),true,'reorder marks the form dirty');
    await save(page);
    const publicAfter=(await (await fetch(server.base+'/api/properties')).json()).properties.find(p=>p.slug==='photo-ordering-test').photos;
    assert.deepEqual(publicAfter,publicPhotoOrder,'saving a reordered draft does not alter published order');

    // Dropping in the same position leaves a clean draft clean.
    await dragPhoto(page,0,0);
    await checkOrder(page,['Bedroom','Back garden','Front','Kitchen']);
    const unexpectedDialog=dialog=>{errors.push('Unexpected unsaved-changes dialog');return dialog.dismiss();};
    page.on('dialog',unexpectedDialog);
    await page.getByRole('button',{name:'All properties',exact:true}).click();
    assert.equal(await page.locator('#collection').isVisible(),true);
    page.off('dialog',unexpectedDialog);await open(page,'Photo ordering test');await panel(page,'photos');

    // Keep every newly rendered card locked while a later upload is pending.
    let uploadCount=0;
    const gate=new Promise(resolve=>{releaseUpload=resolve;});
    await page.route('**/api/admin/properties/*/photos',async route=>{if(++uploadCount===2)await gate;await route.continue();});
    await page.locator('#photo-upload').setInputFiles([{...file,name:'extra-one.jpg'},{...file,name:'extra-two.jpg'}]);
    await page.waitForFunction(()=>document.querySelectorAll('.photo-card').length===5);
    assert.equal(await page.locator('#photo-list button:enabled,#photo-list input:enabled').count(),0);
    const busyOrder=await sources(page);await dragPhoto(page,0,1);assert.deepEqual(await sources(page),busyOrder);
    releaseUpload();await page.locator('#notice').filter({hasText:'Photos uploaded privately'}).waitFor();
    await page.unroute('**/api/admin/properties/*/photos');
    assert.equal(await page.locator('.photo-drag-handle:enabled').count(),6);
    await page.locator('[data-remove="5"]').click();await page.locator('[data-remove="4"]').click();
    await checkOrder(page,['Bedroom','Back garden','Front','Kitchen']);await save(page);
    console.log('Keyboard, no-op drops, upload locking and removal passed.');

    for(const width of [320,390,768,1440]){
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'photo editor overflow at '+width);
    }
    await page.setViewportSize({width:1440,height:1000});await scrollToPhotos(page);
    await page.screenshot({path:'/tmp/admin-photo-order-desktop.png'});

    // Real Chromium touch input exercises the mobile fallback, not synthetic DOM drag events.
    const mobile=await browser.newContext({viewport:{width:390,height:1400},isMobile:true,hasTouch:true,reducedMotion:'reduce',extraHTTPHeaders:{'X-Test-Admin':'editor@example.com'}});
    mobile.setDefaultTimeout(10000);
    await mobile.route('**/*',route=>route.request().url().startsWith(server.base+'/')?route.continue():route.abort());
    const phone=await mobile.newPage();phone.on('pageerror',error=>errors.push(error.message));
    await phone.goto(server.base+'/admin/');await open(phone,'Photo ordering test');await scrollToPhotos(phone);
    const client=await mobile.newCDPSession(phone);
    const touch=async(type,x,y)=>client.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,radiusX:3,radiusY:3,force:1}]});
    const handle=await phone.locator('[data-drag="0"]').boundingBox();
    const destination=await phone.locator('.photo-card').nth(2).boundingBox();
    const x=handle.x+handle.width/2,y=handle.y+handle.height/2;
    await touch('touchStart',x,y);await phone.waitForTimeout(200);
    for(let step=1;step<=20;step++)await touch('touchMove',x+(195-x)*step/20,y+(destination.y+destination.height*.8-y)*step/20);
    await phone.waitForTimeout(250);await touch('touchEnd');
    await checkOrder(phone,['Back garden','Front','Bedroom','Kitchen']);
    await save(phone);await phone.reload();await open(phone,'Photo ordering test');
    await checkOrder(phone,['Back garden','Front','Bedroom','Kitchen']);
    await phone.setViewportSize({width:390,height:844});await scrollToPhotos(phone);
    await phone.screenshot({path:'/tmp/admin-photo-order-mobile.png'});
    assert.equal(await phone.locator('[data-drag="0"]').evaluate(el=>getComputedStyle(el).touchAction),'none');
    assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);

    // Long galleries auto-scroll while the handle is held at the screen edge.
    const start=await phone.locator('[data-drag="0"]').boundingBox();
    const scrollBefore=await phone.evaluate(()=>scrollY);
    await touch('touchStart',start.x+start.width/2,start.y+start.height/2);await phone.waitForTimeout(200);
    for(let step=1;step<=20;step++)await touch('touchMove',195,start.y+start.height/2+(810-start.y-start.height/2)*step/20);
    await phone.waitForFunction(before=>scrollY>before+80,scrollBefore);
    await touch('touchEnd');
    assert.equal(await phone.locator('.photo-dragging,.photo-drop-target,.photo-chosen').count(),0);
    await mobile.close();
    assert.deepEqual(errors,[]);
    console.log('Photo ordering passed: mouse and touch drag, cross-row moves, captions, main photo/preview, keyboard focus, saved order, draft isolation, busy uploads, no-op drops, mobile scrolling and responsive layouts.');
  }catch(error){await Promise.all(browser.contexts().flatMap((ctx,i)=>ctx.pages().map(p=>p.screenshot({path:`/tmp/admin-photo-order-failure-${i}.png`}).catch(()=>{}))));throw error;}
  finally{releaseUpload?.();await browser.close();await server.stop();}
})().catch(error=>{console.error(error);process.exitCode=1;});
