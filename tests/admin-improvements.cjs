const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const panel=(page,name)=>page.locator(`[data-editor-tab="${name}"]`).click();
const notice=(page,text)=>page.locator('#notice').filter({hasText:text}).waitFor();
const publicProperties=async server=>(await (await fetch(server.base+'/api/properties')).json()).properties;
const adminRecords=async(context,server)=>(await (await context.request.get(server.base+'/api/admin/properties')).json()).properties;
const errorFile='/tmp/admin-improvements-failure.png';
async function record(context,server,slug){return (await adminRecords(context,server)).find(r=>r.slug===slug);}
async function openTranslation(page,name){
  await page.locator(`[name="${name}"]`).evaluate(input=>{const details=input.closest('details');if(details)details.open=true;});
}
async function confirmPublish(page){
  await page.locator('#publish').click();await page.locator('#publish-dialog').waitFor({state:'visible'});
  await page.locator('#confirm-publish').click();await notice(page,'Listing published');
}
(async()=>{
  const {startServer}=await import('./cms-harness.mjs');const server=await startServer();
  const browser=await chromium.launch({executablePath:process.env.OAKTOWN_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:1440,height:1000},extraHTTPHeaders:{'X-Test-Admin':'editor@example.com'}});
  context.setDefaultTimeout(10000);const page=await context.newPage();const errors=[],passed=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',route=>route.request().url().startsWith(server.base+'/')?route.continue():route.abort());
  const getRow=name=>page.locator('.listing').filter({hasText:name});
  try{
    await page.goto(server.base+'/admin/');await getRow('115 Colonial Drive').waitFor();
    const original=(await publicProperties(server)).find(p=>p.slug==='115-colonial-drive');
    await getRow('115 Colonial Drive').getByRole('button',{name:'Edit listing',exact:true}).click();
    await page.locator('[name=rent]').fill('1999');await page.locator('[name=availability]').selectOption('available');
    await page.locator('#save').click();await notice(page,'Draft saved');
    assert.equal((await publicProperties(server)).find(p=>p.slug===original.slug).rent,1699);
    await page.locator('#back').click();
    const row=getRow('115 Colonial Drive');
    assert.match(await row.locator('.listing-bottom strong').innerText(),/1,699/,'the dashboard primary rent represents the actual live snapshot');
    assert.ok(await row.locator('.draft-delta').isVisible(),'saved private edits are clearly marked');
    assert.equal((await record(context,server,original.slug)).publishedProperty.rent,1699);
    await page.locator('#state-filter').selectOption('changes');assert.equal(await page.locator('.listing').count(),1);
    await page.screenshot({path:'/tmp/admin-improvements-dashboard.png'});
    passed.push('dashboard separates live values from saved draft changes and filters needs-publishing records');

    await row.locator('[data-quick]').click();assert.equal(await page.locator('[name=rent]').inputValue(),'1999');
    assert.equal(await page.locator('[name=availability]').inputValue(),'available');
    await page.locator('#tab-details').focus();await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#tab-photos').getAttribute('aria-selected'),'true');
    await page.keyboard.press('End');assert.equal(await page.locator('#tab-review').getAttribute('aria-selected'),'true');
    await page.keyboard.press('Home');assert.equal(await page.locator('#tab-details').getAttribute('aria-selected'),'true');
    await panel(page,'description');assert.equal(await page.locator('[name=description]').inputValue(),original.description.join('\n\n'));
    const privateSummary='Private unsaved summary for the real website preview';
    const privateDescription='Private draft description. <script>window.privateInjected=1</script>';
    await page.locator('[name=summary]').fill(privateSummary);await page.locator('[name=description]').fill(privateDescription);
    await openTranslation(page,'descriptionEs');await page.locator('[name=descriptionEs]').fill('Descripción privada de esta vivienda para la vista previa.');
    const storedBeforePreview=await record(context,server,original.slug);
    const previews=[];page.on('popup',popup=>previews.push(popup));
    await page.locator('#preview').click();const preview=page.frameLocator('#preview-frame');
    await preview.locator('body[data-preview-ready="true"]').waitFor();
    await preview.locator('.detail-text').filter({hasText:privateDescription}).waitFor();
    assert.ok((await preview.locator('.intro-sub').innerText()).includes(privateSummary));
    assert.equal(await preview.locator('body').evaluate(()=>window.privateInjected),undefined,'draft HTML is rendered as text');
    assert.equal((await record(context,server,original.slug)).version,storedBeforePreview.version,'preview does not save draft content');
    assert.equal((await publicProperties(server)).find(p=>p.slug===original.slug).summary,original.summary,'preview cannot replace live data');
    const iframe=page.frames().find(f=>f.parentFrame());assert.ok(iframe);const previewUrl=iframe.url();
    assert.equal(previewUrl.includes(privateSummary),false);assert.equal(page.url().includes(privateSummary),false);
    await preview.locator('.detail-actions a').first().click();await page.waitForTimeout(100);
    assert.equal(iframe.url(),previewUrl);assert.equal(previews.length,0,'showing/application exits are blocked inside private preview');
    await page.locator('#preview-viewport').selectOption('mobile');
    assert.ok((await page.locator('#preview-frame').boundingBox()).width<=391);
    await page.locator('#preview-language').selectOption('es');
    await preview.locator('.detail-text').filter({hasText:'Descripción privada'}).waitFor();
    assert.equal(await preview.locator('html').getAttribute('lang'),'es');
    await page.locator('#close-preview').click();
    await page.route('**/api/admin/session',route=>route.fulfill({status:401,contentType:'application/json',body:JSON.stringify({error:'Sign in required.'})}));
    await page.locator('#preview').click();
    await page.locator('#preview-content').filter({hasText:'Sign in again'}).waitFor();
    assert.equal(await preview.locator('.detail-text').count(),0,'an expired preview session never falls back to public or private listing content');
    assert.equal((await record(context,server,original.slug)).version,storedBeforePreview.version);
    await page.locator('#close-preview').click();await page.unroute('**/api/admin/session');
    passed.push('quick edit retains the full draft; real-page preview safely shows unsaved English/Spanish content without saving or exposing it');

    const beforeCancel=await record(context,server,original.slug);
    await page.locator('#publish').click();await page.locator('#publish-dialog').waitFor({state:'visible'});
    const summary=await page.locator('#publish-summary').innerText();assert.ok(summary.includes('1,699'));assert.ok(summary.includes('1,999'));
    await page.locator('#cancel-publish').click();
    assert.equal((await record(context,server,original.slug)).version,beforeCancel.version,'cancel review performs no write');
    assert.equal((await publicProperties(server)).find(p=>p.slug===original.slug).rent,1699);
    await confirmPublish(page);
    const live=(await publicProperties(server)).find(p=>p.slug===original.slug);
    assert.equal(live.rent,1999);assert.equal(live.availability,'available');assert.equal(live.summary,privateSummary);
    assert.equal(live.description[0],privateDescription);assert.equal((await record(context,server,original.slug)).unpublishedChanges,false);
    await panel(page,'review');assert.ok((await page.locator('#view-live').getAttribute('href')).includes('#home/'+original.slug));
    await page.screenshot({path:'/tmp/admin-improvements-review.png'});
    passed.push('publishing review shows old/new rent, cancellation preserves both versions, confirmation publishes the exact form and offers its live link');

    await page.locator('#back').click();await page.locator('#state-filter').selectOption('all');
    await page.locator('#new-property').click();
    await page.locator('#preview').click();
    await preview.locator('body[data-preview-ready="true"]').waitFor();
    await preview.locator('.listing-photo-pending').waitFor();
    assert.equal(await preview.locator('#gallery,[data-cover-gallery]').count(),0,'empty preview has no gallery controls');
    await page.locator('#close-preview').click();
    await page.locator('[name=name]').fill('Admin improvements test');await page.locator('[name=neighborhood]').fill('Test neighborhood');
    await page.locator('[name=rent]').fill('1450');await page.locator('[name=deposit]').fill('1450');
    await panel(page,'photos');
    const file={mimeType:'image/jpeg',buffer:fs.readFileSync(path.join(__dirname,'../assets/oaktown-rentals-logo.jpg'))};
    let uploadNumber=0;
    await page.route('**/api/admin/properties/*/photos',route=>{
      uploadNumber++;
      return uploadNumber===2?route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Temporary test upload failure. Please retry.'})}):route.continue();
    });
    await page.locator('#photo-upload').setInputFiles([{...file,name:'front.jpg'},{...file,name:'kitchen.jpg'}]);
    await page.locator('[data-status="failed"] [data-retry-upload]:enabled').waitFor();assert.equal(await page.locator('.photo-card').count(),1);
    const firstSource=await page.locator('.photo-card img').first().getAttribute('src');
    await page.locator('#publish').click();assert.equal(await page.locator('#publish-dialog').isVisible(),false);
    assert.ok(await page.locator('[data-readiness-target="photos"]').count(),'a failed upload is visible in readiness');
    await panel(page,'photos');await page.locator('[data-retry-upload]').click();
    await page.waitForFunction(()=>document.querySelectorAll('.photo-card').length===2);
    assert.equal(uploadNumber,3,'retry resends only the failed file');
    const uploadedSources=await page.locator('.photo-card img').evaluateAll(images=>images.map(img=>img.getAttribute('src')));
    assert.equal(uploadedSources[0],firstSource);assert.equal(new Set(uploadedSources).size,2);
    await page.unroute('**/api/admin/properties/*/photos');
    await page.locator('[data-caption="0"]').fill('Front exterior');await page.locator('[data-caption="1"]').fill('Kitchen');
    await page.locator('[data-main="1"]').click();
    assert.deepEqual(await page.locator('[data-caption]').evaluateAll(inputs=>inputs.map(input=>input.value)),['Kitchen','Front exterior']);
    assert.equal(await page.locator('.photo-card img').first().getAttribute('src'),uploadedSources[1]);
    await page.locator('#save').click();await notice(page,'Draft saved');
    const draft=await record(context,server,'admin-improvements-test');
    assert.deepEqual(draft.property.photos.map(photo=>photo.alt),['Kitchen','Front exterior']);
    assert.equal((await publicProperties(server)).some(p=>p.slug==='admin-improvements-test'),false);
    assert.equal((await fetch(server.base+draft.property.photos[0].url)).status,404,'uploaded draft media is not public');
    await page.screenshot({path:'/tmp/admin-improvements-photos.png'});
    passed.push('per-file retries preserve successful uploads and Set as Main Photo persists only to the private draft');

    await page.locator('#publish').click();assert.equal(await page.locator('#publish-dialog').isVisible(),false);
    await page.locator('[data-readiness-target="description"]').first().click();
    assert.equal(await page.locator('#panel-description').isVisible(),true);
    await page.locator('[name=summary]').fill('A local browser test listing.');await page.locator('[name=description]').fill('A complete description for the local browser test.');
    await confirmPublish(page);
    const added=(await publicProperties(server)).find(p=>p.slug==='admin-improvements-test');assert.ok(added);
    assert.equal(added.availability,'unknown','readiness does not fabricate an availability status');
    assert.deepEqual(added.photos.map(photo=>photo.alt),['Kitchen','Front exterior']);
    passed.push('readiness links to missing content, blocks incomplete publishing and permits an explicitly reviewed unknown availability');

    for(const width of [320,390]){
      await page.setViewportSize({width,height:640});await panel(page,'description');
      await page.locator('[name=description]').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
      const controls=await page.locator('#save,#preview,#publish').evaluateAll(buttons=>buttons.map(button=>{const r=button.getBoundingClientRect();return {id:button.id,x:r.x,y:r.y,right:r.right,bottom:r.bottom}}));
      assert.ok(controls.every(r=>r.x>=0&&r.right<=width+1&&r.y>=0&&r.bottom<=641),JSON.stringify(controls));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'mobile admin has no document overflow');
      assert.ok(Number.parseFloat(await page.locator('[name=description]').evaluate(el=>getComputedStyle(el).fontSize))>=16);
      await page.screenshot({path:`/tmp/admin-improvements-mobile-${width}.png`});
    }
    passed.push('Save, Preview and Publish remain visible at 320px and 390px with readable inputs and no horizontal overflow');
    assert.deepEqual(errors,[]);console.log(JSON.stringify({passed,failures:[]},null,2));
  }catch(error){await page.screenshot({path:errorFile}).catch(()=>{});throw error;}
  finally{await browser.close();await server.stop();}
})().catch(error=>{console.error(error);process.exitCode=1;});
