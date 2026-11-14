const {chromium}=require('playwright');const assert=require('node:assert/strict');
const base=(process.env.OAKTOWN_BASE_URL||'http://127.0.0.1:8787').replace(/\/$/,'');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});let checks=0;
for(const lang of ['en','es'])for(const width of [320,390,768,1024,1280,1920]){
const p=await b.newPage({viewport:{width,height:800}});await p.addInitScript(l=>localStorage.setItem('oaktown-language',l),lang);await p.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());await p.goto(base+'/');await p.waitForSelector('.story-title');
const box=await p.locator('.story-explore').boundingBox();assert.ok(box.y+box.height<800,`${lang} ${width} hero CTA above fold`);checks++;
if(width<=1050){const menu=await p.locator('#menu-button').boundingBox();assert.ok(menu.x+menu.width<=width,`${lang} ${width} menu visible`);await p.locator('#menu-button').click();assert.equal(await p.locator('#mobile-nav').isVisible(),true);checks++;}
await p.locator('[data-scene-button="2"]').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('[data-scene-image="2"]').getAttribute('aria-hidden'),'false');checks++;
await p.close();}
const p=await b.newPage();await p.route('**/api/properties',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({mode:'database',properties:[]})}));await p.goto(base+'/');await p.waitForSelector('.collection-empty');assert.equal(await p.locator('.property-card').count(),0);assert.equal(await p.locator('.story-image').count(),0);checks++;
await p.unroute('**/api/properties');await p.route('**/api/properties',r=>r.fulfill({status:503}));await p.reload();await p.waitForSelector('.collection-empty');assert.match(await p.locator('.collection-empty').innerText(),/cannot load/);assert.equal(await p.locator('.property-card').count(),0);checks++;
await p.close();const nojs=await b.newPage({javaScriptEnabled:false});await nojs.goto(base+'/');assert.equal(await nojs.locator('noscript h1').isVisible(),true);checks++;await b.close();console.log(`${checks} supplemental checks passed: bilingual CTA/navigation/keyboard at six widths, authoritative empty/outage, no-JS contact.`)})().catch(e=>{console.error(e);process.exitCode=1});
