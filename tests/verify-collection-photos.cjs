// Read-only hosted photo verification. Normal browser TLS; no intercepted images.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const base=process.env.OAKTOWN_BASE_URL||'https://felix-oaktown-signature-oaktown.rentals10.workers.dev';
const output=path.resolve(__dirname,'../docs/oaktown-signature/phase2b');
const originalDir=process.env.OAKTOWN_ORIGINAL_DIR||'/tmp/phase2b-originals';
(async()=>{
 const audit=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../docs/oaktown-signature/phase2a/catalogue-audit.json')));
 fs.mkdirSync(output,{recursive:true});fs.mkdirSync(originalDir,{recursive:true});
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const report={base,verifiedAt:new Date().toISOString(),normalTLS:true,interceptedImages:false,assets:[],properties:[],photos:[],errors:[]};
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  page.on('pageerror',e=>report.errors.push(e.message));
  const response=await page.goto(base+'/',{waitUntil:'domcontentloaded'});report.previewStatus=response.status();
  await page.locator('.property-card').first().waitFor();
  const data=await page.evaluate(()=>window.OAKTOWN_DATA);
  for(const file of ['data.js','app.js','property-cards.js','collection.js','collection.css','signature.js','signature.css']){
   const served=await page.evaluate(async file=>{const r=await fetch('/'+file);return {status:r.status,body:await r.text()};},file);
   const hash=crypto.createHash('sha256').update(served.body).digest('hex');
   const local=crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../',file))).digest('hex');
   report.assets.push({file,status:served.status,sha256:hash,matchesLocal:hash===local});assert.equal(hash,local,file+' deployed bytes');
  }
  for(const property of audit.properties){
   const item=data.properties.find(p=>p.slug===property.slug);assert.ok(item);assert.deepEqual(data.images[item.imageKey],property.photos.map(p=>p.url));
   report.properties.push({slug:property.slug,address:property.address,photoCount:property.photos.length,exactCatalogueMapping:true});
   for(let start=0;start<property.photos.length;start+=3){
    const results=await page.evaluate(async entries=>Promise.all(entries.map(async entry=>{
     const began=performance.now();
     try{
      const r=await fetch(entry.url);if(!r.ok)throw Error('HTTP '+r.status);
      const blob=await r.blob(),img=await createImageBitmap(blob);
      const encoded=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.readAsDataURL(blob)});
      return {...entry,status:r.status,mime:blob.type,bytes:blob.size,width:img.width,height:img.height,aspectRatio:Number((img.width/img.height).toFixed(4)),durationMs:Math.round(performance.now()-began),encoded};
     }catch(error){return {...entry,error:error.message}};
    })),property.photos.map(p=>({propertySlug:p.propertySlug,index:p.index,url:p.url})).slice(start,start+3));
    for(const result of results){if(result.encoded){const bytes=Buffer.from(result.encoded,'base64');result.sha256=crypto.createHash('sha256').update(bytes).digest('hex');fs.writeFileSync(path.join(originalDir,result.propertySlug+'-'+String(result.index).padStart(2,'0')+'.image'),bytes);delete result.encoded;}report.photos.push(result);}
   }
   console.log(property.slug+': originals '+report.photos.filter(p=>p.propertySlug===property.slug&&p.status===200).length+'/'+property.photos.length);
   await page.goto(base+'/'+property.detailRoute,{waitUntil:'domcontentloaded'});await page.locator('.gallery-active').waitFor();
   const thumbnails=await page.locator('[data-gallery-index] img').evaluateAll(images=>images.map(i=>i.getAttribute('src').split('?')[0]));
   assert.deepEqual(thumbnails,property.photos.map(p=>p.url));
   for(const photo of property.photos){
    await page.locator('[data-gallery-index="'+(photo.index-1)+'"]').click();
    await page.waitForFunction(url=>{const img=document.querySelector('.gallery-active');return img?.complete&&img.naturalWidth>0&&img.src.split('?')[0]===url},photo.url,{timeout:15000});
    const state=await page.locator('.gallery-active').evaluate(i=>({src:i.src,width:i.naturalWidth,height:i.naturalHeight,objectFit:getComputedStyle(i).objectFit}));
    Object.assign(report.photos.find(p=>p.propertySlug===property.slug&&p.index===photo.index),{detailGalleryLoaded:true,detailSelectedUrl:state.src,detailWidth:state.width,detailHeight:state.height,detailObjectFit:state.objectFit});
   }
  }
 }finally{fs.writeFileSync(path.join(output,'photo-verification.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
 assert.equal(report.photos.length,60);assert.ok(report.photos.every(p=>p.status===200&&p.detailGalleryLoaded));assert.deepEqual(report.errors,[]);
 console.log('PASS: 60 original bytes/dimensions/hashes and ordered detail selections, 4 exact catalogue mappings, 7 deployed asset hashes.');
})().catch(e=>{console.error(e);process.exitCode=1});
