const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const {startServer,example}=await import('./cms-harness.mjs');const server=await startServer();
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const errors=[];const context=await browser.newContext({extraHTTPHeaders:{'X-Test-Admin':'editor@example.com'}});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>r.request().url().startsWith(server.base+'/')?r.continue():r.abort());
  try{
    const anonymous=await fetch(server.base+'/api/admin/properties');assert.equal(anonymous.status,401);
    await page.goto(server.base+'/admin/');await page.locator('.listing').first().waitFor();assert.equal(await page.locator('.listing').count(),4);
    await page.locator('.listing').filter({hasText:'115 Colonial Drive'}).getByRole('button',{name:'Edit listing'}).click();
    await page.locator('[name=rent]').fill('1899');await page.getByRole('button',{name:'Save draft',exact:true}).click();await page.locator('#notice').filter({hasText:'Draft saved'}).waitFor();
    let publicData=await (await fetch(server.base+'/api/properties')).json();assert.equal(publicData.properties.find(p=>p.slug==='115-colonial-drive').rent,1799);
    await page.getByRole('button',{name:'Publish listing',exact:true}).click();await page.locator('#notice').filter({hasText:'Listing published'}).waitFor();
    publicData=await (await fetch(server.base+'/api/properties')).json();assert.equal(publicData.properties.find(p=>p.slug==='115-colonial-drive').rent,1899);
    await page.goto(server.base+'/#home/115-colonial-drive');await page.locator('.detail-stat').first().waitFor();assert.match(await page.locator('.detail-stat').first().innerText(),/1,899/);
    await page.goto(server.base+'/admin/');await page.getByRole('button',{name:'+ Add property'}).click();
    await page.locator('[name=name]').fill('502 Oak Street');await page.locator('[name=neighborhood]').fill('Old Louisville');await page.locator('[name=rent]').fill('1250');await page.locator('[name=deposit]').fill('1250');await page.locator('[name=summary]').fill('A bright place.');await page.locator('[name=description]').fill('A welcoming home with room to settle in.');
    await page.getByRole('button',{name:'Save draft',exact:true}).click();await page.locator('#notice').filter({hasText:'Draft saved'}).waitFor();
    await page.locator('#photo-upload').setInputFiles({name:'logo.jpg',mimeType:'image/jpeg',buffer:require('node:fs').readFileSync(require('node:path').join(__dirname,'../assets/oaktown-rentals-logo.jpg'))});
    await page.locator('#notice').filter({hasText:'Photos uploaded privately'}).waitFor();await page.locator('[data-caption="0"]').fill('Front of the house');
    await page.getByRole('button',{name:'Preview listing',exact:true}).click();assert.equal(await page.locator('#preview-dialog').evaluate(el=>el.open),true);await page.getByRole('button',{name:'Close',exact:true}).click();
    await page.getByRole('button',{name:'Publish listing',exact:true}).click();await page.locator('#notice').filter({hasText:'Listing published'}).waitFor();
    const published=await (await fetch(server.base+'/api/properties')).json();const property=published.properties.find(p=>p.slug==='502-oak-street');assert.ok(property);assert.equal((await fetch(server.base+property.photos[0].url)).status,200);
    await page.goto(server.base+'/#homes');await page.locator('.property-card').first().waitFor();assert.equal(await page.locator('[data-filter="Old Louisville"]').count(),1);
    await page.goto(server.base+'/#home/502-oak-street');await page.locator('#language-switch').click();assert.match(await page.locator('.detail-text').innerText(),/A welcoming home/,'blank translations fall back to English');
    await page.goto(server.base+'/admin/');await page.locator('.listing').filter({hasText:'502 Oak Street'}).getByRole('button',{name:'Edit listing'}).click();page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Archive',exact:true}).click();await page.locator('#notice').filter({hasText:'Property archived'}).waitFor();
    assert.ok(!(await (await fetch(server.base+'/api/properties')).json()).properties.some(p=>p.slug==='502-oak-street'));
    for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});await page.goto(server.base+'/admin/');await page.locator('.listing').first().waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'admin overflow at '+width);await page.screenshot({path:'/workspace/work/admin-'+width+'.png'});}
    const hostile={...example(),slug:'safe-rendering',name:'<img src=x onerror="window.cmsInjected=1">',description:['<script>window.cmsInjected=1</script>']};
    const created=await context.request.post(server.base+'/api/admin/properties',{headers:{Origin:server.base},data:hostile});assert.equal(created.status(),201);const unsafeRow=await created.json();
    assert.equal((await context.request.post(server.base+'/api/admin/properties/'+unsafeRow.id+'/publish',{headers:{Origin:server.base},data:{version:unsafeRow.version}})).status(),200);
    await page.goto(server.base+'/#home/safe-rendering');await page.locator('.detail-text').waitFor();assert.ok((await page.locator('.detail-text').innerText()).includes('<script>'));assert.equal(await page.evaluate(()=>window.cmsInjected),undefined,'CMS content is displayed as text, not executable markup');
    // A valid empty collection must not bring the original file-based listings back.
    server.env.DB.sqlite.exec("UPDATE properties SET state='archived',published_json=NULL");
    await page.goto(server.base+'/');await page.locator('.collection-empty').waitFor();assert.equal(await page.locator('.property-card').count(),0);
    assert.deepEqual(errors,[]);console.log('Admin browser workflow passed: draft isolation, publishing, public updates, photo upload/preview, Spanish fallback, archiving, empty collection and responsive layouts.');
  }finally{await browser.close();await server.stop();}
})().catch(error=>{console.error(error);process.exitCode=1;});
