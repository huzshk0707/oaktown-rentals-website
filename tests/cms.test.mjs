import test from 'node:test';
import assert from 'node:assert/strict';
import { SignJWT, generateKeyPair, exportJWK, createLocalJWKSet } from 'jose';
import { authenticate } from '../cms/auth.mjs';
import worker from '../cms/worker.mjs';
import { harness,example } from './cms-harness.mjs';

test('Access requires a signed, unexpired app token for the right issuer, audience and approved account',async()=>{
  const {privateKey,publicKey}=await generateKeyPair('RS256');const key=await exportJWK(publicKey);key.kid='test';const keys=createLocalJWKSet({keys:[key]});
  const env={ACCESS_TEAM_DOMAIN:'oaktown-test.cloudflareaccess.com',ACCESS_AUD:'admin-audience',ADMIN_EMAILS:'editor@example.com'};
  const token=(extra={},aud='admin-audience',issuer='https://oaktown-test.cloudflareaccess.com',exp='5m')=>new SignJWT({email:'editor@example.com',type:'app',...extra}).setProtectedHeader({alg:'RS256',kid:'test'}).setIssuer(issuer).setAudience(aud).setSubject('user-1').setIssuedAt().setExpirationTime(exp).sign(privateKey);
  const request=value=>new Request('https://site.example/api/admin/session',{headers:{'Cf-Access-Jwt-Assertion':value}});
  assert.equal(await authenticate(request(await token()),env,keys),'editor@example.com');
  for(const value of [await token({email:'outsider@example.com'}),await token({type:'service'}),await token({},'wrong-audience'),await token({},'admin-audience','https://evil.example'),await token({},'admin-audience','https://oaktown-test.cloudflareaccess.com',1),'not-a-token'])await assert.rejects(authenticate(request(value),env,keys),{status:401});
  await assert.rejects(authenticate(request(await token()),{},keys),{status:503});
  const response=await worker.fetch(request(await token()),{});assert.equal(response.status,503);
});

test('draft/save/publish/archive lifecycle, stale writes, duplicate URLs, CSRF, audit trail and private photos',async()=>{
  const h=await harness();const origin='https://site.example';
  const call=(route,method='GET',body,auth=true,extra={})=>h.app.fetch(new Request(origin+route,{method,headers:{...(auth?{'X-Test-Admin':'editor@example.com'}:{}),...(method!=='GET'?{'Origin':origin,'Content-Type':'application/json'}:{}),...extra},body:body===undefined?undefined:typeof body==='string'?body:JSON.stringify(body)}),h.env);
  try{
    assert.equal((await call('/admin/', 'GET',undefined,false)).status,401);
    assert.equal((await call('/api/admin/properties','GET',undefined,false)).status,401);
    assert.equal((await call('/%61dmin/index.html','GET',undefined,false)).status,404);
    assert.equal((await call('/ad%6din/admin.js','GET',undefined,false)).status,404);
    assert.equal((await call('/api/admin/properties','POST','x'.repeat(128*1024+1))).status,413);
    assert.equal((await call('/api/admin/properties','POST',example(),true,{'Origin':'https://evil.example'})).status,403);
    let response=await call('/api/admin/properties','POST',example());assert.equal(response.status,201);let row=await response.json();const id=row.id;
    assert.deepEqual((await (await call('/api/properties')).json()).properties,[]);
    assert.equal((await call('/api/admin/properties','POST',example())).status,409);
    response=await call(`/api/admin/properties/${id}/publish`,'POST',{version:row.version});assert.equal(response.status,200);row=await response.json();
    assert.equal((await (await call('/api/properties')).json()).properties[0].rent,1400);
    const edited={...row.property,rent:1600};response=await call(`/api/admin/properties/${id}`,'PUT',{version:row.version,property:edited});row=await response.json();assert.equal(row.unpublishedChanges,true);
    assert.equal((await (await call('/api/properties')).json()).properties[0].rent,1400,'draft edits cannot change the published snapshot');
    assert.equal((await call(`/api/admin/properties/${id}`,'PUT',{version:1,property:edited})).status,409);
    assert.equal((await call(`/api/admin/properties/${id}`,'PUT',{version:row.version,property:{...edited,rent:-1}})).status,400);
    assert.equal((await call(`/api/admin/properties/${id}`,'PUT',{version:row.version,property:{...edited,photos:Array.from({length:21},(_,i)=>({url:`https://images.squarespace-cdn.com/content/photo-${i}.jpg`,alt:`Photo ${i+1}`}))}})).status,400);
    assert.equal((await call(`/api/admin/properties/${id}`,'PUT',{version:row.version,property:{...edited,photos:[{url:'javascript:alert(1)',alt:'bad'}]}})).status,400);
    const upload=bytes=>h.app.fetch(new Request(origin+`/api/admin/properties/${id}/photos`,{method:'POST',headers:{'X-Test-Admin':'editor@example.com','Origin':origin,'Content-Type':'image/jpeg'},body:bytes}),h.env);
    assert.equal((await upload(new TextEncoder().encode('<svg onload="alert(1)"/>'))).status,400);
    response=await upload(new Uint8Array([255,216,255,224,0,1,2,3]));assert.equal(response.status,201);const photo=await response.json();photo.alt='Kitchen';
    assert.equal((await call(photo.url)).status,404,'draft photo cannot be fetched through public media');
    assert.equal((await call('/api/admin'+photo.url)).status,200);
    row=await (await call(`/api/admin/properties/${id}`,'PUT',{version:row.version,property:{...edited,photos:[photo]}})).json();
    row=await (await call(`/api/admin/properties/${id}/publish`,'POST',{version:row.version})).json();
    assert.equal((await call(photo.url)).status,200);assert.equal((await (await call('/api/properties')).json()).properties[0].rent,1600);
    assert.equal((await call(`/api/admin/properties/${id}/archive`,'POST',{version:row.version})).status,200);
    assert.deepEqual((await (await call('/api/properties')).json()).properties,[]);assert.equal((await call(photo.url)).status,404);
    const audit=await h.env.DB.prepare('SELECT actor, action FROM activity').all();assert.ok(audit.results.length>=6);assert.ok(audit.results.every(r=>r.actor==='editor@example.com'));
    const privateResponse=await call('/api/admin/session');assert.match(privateResponse.headers.get('Cache-Control'),/no-store/);assert.match(privateResponse.headers.get('Content-Security-Policy'),/frame-ancestors 'none'/);
  }finally{h.close();}
});

test('empty database is authoritative and file fallback is explicit only when unconfigured',async()=>{
  const response=await worker.fetch(new Request('https://site.example/api/properties'),{});assert.deepEqual(await response.json(),{mode:'file'});
  const h=await harness();try{const response=await h.app.fetch(new Request('https://site.example/api/properties'),h.env);assert.deepEqual(await response.json(),{mode:'database',properties:[]});}finally{h.close();}
});
