const {chromium}=require('playwright');
const path=require('node:path');
const base=process.env.OAKTOWN_BASE_URL||'http://127.0.0.1:8794';
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
 const page=await browser.newPage({viewport:{width,height}});
 if(process.env.OAKTOWN_CAPTURE_EXTERNAL!=='1')await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 await page.goto(base+'/');await page.waitForSelector('.collection');await page.waitForTimeout(250);
 const dir=path.resolve(__dirname,'../docs/redesign/screenshots');const phase=process.argv[2]||'after';
 await page.screenshot({path:path.join(dir,`${phase}-${name}.png`)});
 await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,40));}scrollTo(0,0)});await page.waitForTimeout(500);
 await page.evaluate(async()=>{await Promise.all([...document.images].map(img=>{img.loading='eager';return img.decode().catch(()=>{});}));await document.fonts.ready;});
 await page.screenshot({path:path.join(dir,`${phase}-${name}-full.png`),fullPage:true});
 await page.locator('.property-card .property-image-wrap').first().click();await page.waitForSelector('.gallery');await page.waitForTimeout(200);
 await page.screenshot({path:path.join(dir,`${phase}-${name}-listing.png`)});
 await page.close();
}await browser.close()})().catch(e=>{console.error(e);process.exit(1)});
