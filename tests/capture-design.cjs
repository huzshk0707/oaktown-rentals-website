const {chromium}=require('playwright');
const path=require('node:path');
const fs=require('node:fs');
const base=(process.env.OAKTOWN_BASE_URL||'http://127.0.0.1:8794').replace(/\/$/,'');
const external=process.env.OAKTOWN_CAPTURE_EXTERNAL==='1';
const photoManifest=process.env.OAKTOWN_PHOTO_MANIFEST?JSON.parse(fs.readFileSync(process.env.OAKTOWN_PHOTO_MANIFEST,'utf8')):null;
const contentSnapshot=process.env.OAKTOWN_CONTENT_SNAPSHOT?fs.readFileSync(process.env.OAKTOWN_CONTENT_SNAPSHOT,'utf8'):null;
async function loadImages(page) {
 const failed=await page.evaluate(async()=>{
  await document.fonts.ready;
  return (await Promise.all([...document.images].map(async img=>{
   img.loading='eager';
   // auto sizes applies to lazy images; eager review captures use its explicit
   // fallback to avoid offscreen raster omissions in full-page Chromium shots.
   img.sizes=img.sizes.replace(/^auto,\s*/,'');try{await img.decode();return null;}catch{return img.currentSrc||img.src;}
  }))).filter(Boolean);
 });
 if(external&&failed.length)throw new Error(`${failed.length} images failed to decode: ${failed.join(', ')}`);
}
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height}});
  if(!external)await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
  // Optional verified source-photo bytes keep captures reproducible in containers
  // whose browser trust store cannot use the environment's HTTPS proxy CA.
  if(photoManifest)await page.route('https://images.squarespace-cdn.com/**',r=>{
   const source=photoManifest[r.request().url().split('?')[0]];
   return source?r.fulfill({body:fs.readFileSync(source.path),contentType:source.contentType}):r.abort();
  });
  if(contentSnapshot)await page.route('**/api/properties',r=>r.fulfill({status:200,contentType:'application/json',body:contentSnapshot}));
  await page.goto(base+'/');await page.waitForSelector('.collection');await loadImages(page);
  const dir=path.resolve(__dirname,'../docs/redesign/screenshots');const phase=process.argv[2]||'after';
  await page.screenshot({animations:'disabled',path:path.join(dir,`${phase}-${name}.png`)});
  await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,100));}scrollTo({top:0,behavior:'instant'})});await page.waitForTimeout(500);await loadImages(page);
  await page.screenshot({animations:'disabled',path:path.join(dir,`${phase}-${name}-full.png`),fullPage:true});
  await page.locator('.property-card .property-image-wrap').first().click();await page.waitForSelector('.gallery');await loadImages(page);
  await page.screenshot({animations:'disabled',path:path.join(dir,`${phase}-${name}-listing.png`)});
  await page.close();
 }
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
