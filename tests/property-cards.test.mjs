import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const scope={window:{},URL};vm.runInNewContext(fs.readFileSync(new URL('../property-cards.js',import.meta.url),'utf8'),scope);
const cards=scope.window.OaktownCards;
test('money never invents a zero or emits NaN for missing/invalid data',()=>{
 for(const value of [undefined,null,NaN,Infinity,-1,'950'])assert.equal(cards.formatMoney(value),'Ask for pricing');
 assert.equal(cards.formatMoney(undefined,'es'),'Consultar precio');
 assert.equal(cards.formatMoney(0),'$0');assert.equal(cards.formatMoney(1699),'$1,699');assert.equal(cards.formatMoney(950.5),'$950.50');
});
test('only explicit supported availability yields a badge label',()=>{
 for(const availability of [undefined,'unknown','Ready Now','','toString','constructor'])assert.equal(cards.availabilityLabel({availability}),'');
 assert.equal(cards.availabilityLabel({availability:'coming_soon'},'es'),'Próximamente');
 assert.equal(cards.availabilityLabel({availability:'rented'}),'Rented');
});
test('image resizing never rewrites private media or lookalike hosts',()=>{
 for(const src of ['/media/abc','/api/admin/media/abc','https://images.squarespace-cdn.com.evil.test/a','https://example.com/?images.squarespace-cdn.com','http://images.squarespace-cdn.com/a'])assert.equal(cards.imageUrl(src,500),src);
 assert.equal(cards.imageUrl('https://images.squarespace-cdn.com/content/a.jpg?format=100w',500),'https://images.squarespace-cdn.com/content/a.jpg?format=500w');
});
test('reusable renderer retains unit identity, CMS escaping, explicit total and language switches',()=>{
 let language='en';const p={slug:'unit-8',name:'Cherokee · #8 &amp; courtyard',neighborhood:'Cherokee',bedrooms:1,bathrooms:1,features:[],availability:'coming_soon'};
 const t=key=>({beds:language==='es'?'dormitorios':'beds',baths:language==='es'?'baño':'bath',photoUnavailable:'Photos temporarily unavailable',deposit:'Deposit'})[key]||key;
 const renderer=cards.create({data:{images:{}},getLanguage:()=>language,t,localized:(p,key)=>p[key],imageEl:()=>{throw Error('no image to render')},inquiryUrl:()=> 'sms:+15025001070'});
 const en=renderer.render(p,1,3);
 assert.match(en,/02 \/ 03/);assert.match(en,/href="#home\/unit-8"/);assert.match(en,/#8 &amp; courtyard/);assert.doesNotMatch(en,/&amp;amp;|undefined|NaN|property-deposit/);assert.match(en,/image-unavailable/);assert.match(en,/1 bed/);
 language='es';const es=renderer.render(p);assert.match(es,/1 dormitorios/);assert.match(es,/Próximamente/);assert.match(es,/Consultar precio/);
});
test('only present structured specifications are displayed; empty gallery is safe',()=>{
 assert.deepEqual([...cards.specifications({bathrooms:1},'en',k=>k)],['1 baths']);
 assert.equal(cards.gallery({},{}).length,0);assert.equal(cards.gallery({images:{a:[]}}, {imageKey:'a'}).length,0);
});
