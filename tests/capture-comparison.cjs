const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const mode=process.env.OAKTOWN_CAPTURE_MODE||'fallback';
if(!['fallback','real'].includes(mode))throw new Error('Capture mode must be fallback or real');
const manifest=process.env.OAKTOWN_PHOTO_MANIFEST?JSON.parse(fs.readFileSync(process.env.OAKTOWN_PHOTO_MANIFEST,'utf8')):null;
if(mode==='real'&&!manifest)throw new Error('Real-photo comparisons require the TLS-verified original-photo manifest');
const snapshot=process.env.OAKTOWN_CONTENT_SNAPSHOT?fs.readFileSync(process.env.OAKTOWN_CONTENT_SNAPSHOT,'utf8'):null;
const out=path.resolve(__dirname,'../docs/redesign/comparison',mode);
fs.mkdirSync(out,{recursive:true});
const versions=[
 {id:'older',title:'Preferred pre-PR #8 cinematic design',ref:'d6fee496e41385e381b1bd45180d46465c7dbe6c',url:process.env.OAKTOWN_COMPARE_OLDER_URL||'http://127.0.0.1:8791'},
 {id:'merged',title:'Currently merged PR #8 code',ref:'1a21d010b13726e195f1c8758168a03a8a2fa796',url:process.env.OAKTOWN_COMPARE_MERGED_URL||'http://127.0.0.1:8792'},
 {id:'improved',title:'Improved PR #9 working source',ref:execFileSync('git',['rev-parse','HEAD'],{cwd:path.resolve(__dirname,'..'),encoding:'utf8'}).trim(),url:process.env.OAKTOWN_COMPARE_IMPROVED_URL||'http://127.0.0.1:8793'}
];
const only=process.env.OAKTOWN_COMPARE_ONLY;
const fullOnly=process.env.OAKTOWN_COMPARE_FULL_ONLY==='1';
if(only&&!versions.some(version=>version.id===only))throw new Error('Unknown comparison version');
const sourceFiles=['app.js','effects.js','brand.css','cinematic.css','styles.css','index.html','data.js','cms-client.js'];
const sourceHashes=Object.fromEntries(sourceFiles.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'..',file))).digest('hex')]));
const savedManifest=path.join(out,'manifest.json');
const records=(only||fullOnly)&&fs.existsSync(savedManifest)?JSON.parse(fs.readFileSync(savedManifest,'utf8')).records.filter(record=>fullOnly?record.view!=='full-page':record.version!==only):[];
async function settle(page){
 const failed=await page.evaluate(async()=>{
  await document.fonts.ready;
  const results=await Promise.all([...document.images].map(async img=>{
   img.loading='eager';img.sizes=img.sizes.replace(/^auto,\s*/,'');
   try{await img.decode();return null;}catch{return img.currentSrc||img.src;}
  }));
  return results.filter(Boolean);
 });
 if(mode==='real'&&failed.length)throw new Error('Real-photo capture failed: '+failed.join(', '));
 await page.waitForTimeout(850);
 return failed;
}
async function chapter(page,index){
 await page.locator(`[data-scene-button="${index}"]`).click();
 await page.evaluate(i=>{
  const story=document.querySelector('.story'),stage=document.querySelector('.story-stage');
  const pinned=getComputedStyle(stage).position==='sticky';
  scrollTo({top:pinned?story.offsetTop+(story.offsetHeight-stage.offsetHeight)*(i/3+.08):0,behavior:'instant'});
 },index);
 await page.waitForTimeout(950);
}
async function fullPage(page){
 await chapter(page,0);
 await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,65));}scrollTo({top:0,behavior:'instant'});});
 await settle(page);
}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.OAKTOWN_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  for(const version of versions.filter(version=>!only||version.id===only))for(const locale of ['en','es'])for(const [device,width,normalHeight] of [['desktop',1440,1000],['tablet',768,1024],['mobile',390,844]]){
   if(fullOnly&&(device==='tablet'||locale==='es'&&device!=='mobile'))continue;
   const viewport=locale==='es'&&device==='mobile'?{width:320,height:640}:{width,height:normalHeight};
   const page=await browser.newPage({viewport});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.addInitScript(l=>localStorage.setItem('oaktown-language',l),locale);
   await page.route('**/*',route=>{
    const url=route.request().url();
    if(url.startsWith(version.url+'/'))return route.continue();
    const original=manifest?.[url.split('?')[0]];
    if(mode==='real'&&original)return route.fulfill({body:fs.readFileSync(original.path),contentType:original.contentType});
    return route.abort();
   });
   if(snapshot)await page.route('**/api/properties',route=>route.fulfill({status:200,contentType:'application/json',body:snapshot}));
   const capture=async (view,fullPage=false,selector=null)=>{
    const file=`${version.id}-${locale}-${device}-${view}.png`;
    const state=await page.evaluate(()=>({
     activeChapter:document.querySelector('[data-scene].is-active')?.dataset.scene??null,
     selectedPhoto:document.querySelector('[data-scene-image].is-active')?.dataset.sceneImage??null,
     overflow:document.documentElement.scrollWidth>innerWidth,
     letterVisible:!!document.querySelector('.story-letter:not([hidden])')&&Number(getComputedStyle(document.querySelector('.story-letter')).opacity)>0,
     failedPhotos:[...document.images].filter(i=>!i.naturalWidth&&i.src.includes('squarespace')).map(i=>i.src),
     propertyNames:[...document.querySelectorAll('.property-name')].map(el=>el.textContent),
     sourcePropertyPhotos:window.OAKTOWN_DATA?.images||null
    }));
    if(selector)await page.locator(selector).screenshot({path:path.join(out,file)});
    else await page.screenshot({path:path.join(out,file),fullPage});
    records.push({version:version.id,locale,device,viewport,view,file,mode,capturedAt:new Date().toISOString(),...state,errors:[...errors]});
    fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({mode,capturedAt:new Date().toISOString(),versions,improvedRuntimeSHA256:sourceHashes,content:snapshot?'shared read-only snapshot':'unchanged repository file records',liveDeploymentVerified:false,records},null,2)+'\n');
   };
   await page.goto(version.url+'/');await page.waitForSelector('.collection');await settle(page);
   if(fullOnly){await fullPage(page);await capture('full-page',true);await page.close();continue;}
   await capture('hero');
   if(locale==='en'||device==='mobile'){
    await chapter(page,1);await capture('chapter-2');
    await chapter(page,2);await capture('chapter-3');
   }
   if(device==='desktop'&&locale==='en'){
    await page.evaluate(()=>{
     const story=document.querySelector('.story'),stage=document.querySelector('.story-stage');
     scrollTo({top:getComputedStyle(stage).position==='sticky'?story.offsetTop+(story.offsetHeight-stage.offsetHeight)*.59:0,behavior:'instant'});
    });
    await page.waitForTimeout(950);await capture('o-window');
   }
   if(locale==='en'||device==='mobile'){
    // Reveal naturally offscreen cards before a full-section screenshot.
    await page.evaluate(async()=>{
     const section=document.querySelector('#homes');
     const top=section.getBoundingClientRect().top+scrollY;
     for(let y=top;y<top+section.offsetHeight;y+=Math.min(600,innerHeight*.65)){
      scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,70));
     }
    });
    await page.evaluate(()=>document.querySelector('#homes').scrollIntoView({block:'start',behavior:'instant'}));
    await settle(page);await capture('collection',false,'#homes');
    if(device!=='tablet'){
     await fullPage(page);await capture('full-page',true);
    }
   }
   await page.goto(version.url+'/#home/115-colonial-drive');await page.waitForSelector('.gallery');await settle(page);
   await capture('details');
   if(locale==='en'){
    await page.evaluate(()=>document.querySelector('.gallery').scrollIntoView({block:'start',behavior:'instant'}));
    await settle(page);await capture('gallery');
   }
   await page.close();
   console.log(`${version.id} ${locale} ${device} complete (${records.length} captures)`);
  }
  for(const [file,hash] of Object.entries(sourceHashes))if(crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'..',file))).digest('hex')!==hash)throw new Error(`Runtime changed during capture: ${file}. Repeat the comparison.`);
  console.log(`${records.length} ${mode} browser captures saved in ${out}`);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
