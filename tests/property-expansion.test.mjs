import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const scope={window:{},URL};
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
vm.runInNewContext(read('data.js'),scope);
vm.runInNewContext(read('property-cards.js'),scope);
const DATA=scope.window.OAKTOWN_DATA, C=scope.window.OaktownCards;
const P=DATA.properties, s=P.find(p=>p.slug==='208-sloemer-ave'), tr=P.find(p=>p.slug==='8008-troutwood-ct');
test('six unique catalogue records and verified new facts',()=>{
 assert.equal(P.length,6);assert.equal(new Set(P.map(p=>p.slug)).size,6);
 assert.equal(s.city,'New Albany, IN 47150');assert.equal(s.bedrooms,3);assert.equal(s.bathrooms,2);
 assert.equal(s.squareFootage,1400);assert.equal(s.rent,null);assert.equal(s.deposit,null);
 assert.equal(tr.city,'Louisville, KY 40291');assert.equal(tr.availability,'coming_soon');
 assert.equal(tr.rent,null);assert.equal(tr.deposit,null);assert.equal(tr.bedrooms,null);assert.equal(tr.bathrooms,null);
 assert.equal(tr.hideRent,true);assert.equal(tr.contactOnly,true);
});
for(const language of ['en','es']){
 test(language+' card and detail output handles unconfirmed terms and photo absence',()=>{
  const t=k=>k, localized=(p,k)=>language==='es'&&p[k+'Es']?p[k+'Es']:p[k];
  const renderer=C.create({data:DATA,getLanguage:()=>language,t,localized,imageEl:()=>'<img>',inquiryUrl:()=> 'sms:test'});
  const price=language==='en'?'Ask for pricing':'Consultar precio';
  const status=language==='en'?'Coming January 2027':'Próximamente en enero de 2027';
  const sh=renderer.render(s,4,6),th=renderer.render(tr,5,6);
  assert.ok(sh.includes(price));assert.ok(sh.includes('05 / 06'));
  assert.ok(th.includes(status));assert.ok(!th.includes(price));
  assert.doesNotMatch(sh+th,/undefined|NaN|null beds|0 Photos/);
  const a=read('app.js'),detail=a.slice(a.indexOf('  function detailPage('),a.indexOf('  function syncCardPhotoControls('));
  const renderDetail=new Function('DATA','P','language','t','localized','photo','money','window','availabilityLabel','availabilityBadge','showingUrl','inquiryUrl','imageEl','arrow','contactSection','cards',detail+'\nreturn detailPage;')(DATA,P,language,t,localized,p=>C.gallery(DATA,p)[0],n=>C.formatMoney(n,language),scope.window,p=>C.availabilityLabel(p,language),p=>C.availabilityLabel(p,language),()=> 'sms:test',()=> 'sms:test',()=>'<img>','',()=> '',renderer);
  const sd=renderDetail(s),td=renderDetail(tr);
  assert.ok(sd.includes(price));assert.ok(td.includes(status));assert.doesNotMatch(td,/navApply|NaN|undefined|null beds/);
  if(!C.gallery(DATA,tr).length)assert.doesNotMatch(td,/id="gallery"|data-open-gallery/);
 });
}
