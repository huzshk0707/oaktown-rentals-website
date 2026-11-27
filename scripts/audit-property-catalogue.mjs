// Read-only inventory audit. Never contacts or writes the production CMS.
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const source=fs.readFileSync(new URL('../data.js',import.meta.url),'utf8');
const scope={window:{}};vm.runInNewContext(source,scope);
const data=scope.window.OAKTOWN_DATA;
const report={source:'data.js',sha256:crypto.createHash('sha256').update(source).digest('hex'),properties:data.properties.map(p=>({
 slug:p.slug,address:p.name,neighborhood:p.neighborhood,city:p.city,rent:p.rent,deposit:p.deposit,bedrooms:p.bedrooms,bathrooms:p.bathrooms,
 squareFootage:null,parkingStructured:null,petPolicyStructured:null,
 availability:p.availability||'unknown',sourceUrl:p.sourceUrl,
 detailRoute:'#home/'+p.slug,applicationUrl:data.applicationUrl,
 showingUrl:'sms:+15025001070?body='+encodeURIComponent('Hi, I’d like to request a showing at '+p.name+'.'),
 features:p.features,terms:p.terms,
 photos:(data.images[p.imageKey]||[]).map((url,index)=>({index:index+1,role:index===0?'main':'gallery',propertySlug:p.slug,imageKey:p.imageKey,url,host:new URL(url).hostname,originalWidth:null,originalHeight:null,quality:'Unverified: original bytes unavailable in this environment',altSource:data.photoAlts?.[url]||'Address + photo number (current fallback)'}))
}))};
const urls=report.properties.flatMap(p=>p.photos.map(photo=>photo.url));
report.photoCount=urls.length;report.duplicateUrls=urls.filter((url,index)=>urls.indexOf(url)!==index);
const out=new URL('../docs/oaktown-signature/phase2a/catalogue-audit.json',import.meta.url);
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log(`Audited ${report.properties.length} properties, ${urls.length} exact photo URLs, ${report.duplicateUrls.length} duplicates. No inventory changes.`);
