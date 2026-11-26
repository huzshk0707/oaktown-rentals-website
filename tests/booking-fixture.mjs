import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { database } from './cms-harness.mjs';
import { createApp } from '../cms/worker.mjs';
export const ORIGIN='https://booking.example';
export const rules={enabled:true,minNights:2,maxNights:14,maxGuests:8,cleaningCents:12500,taxBps:1250,termsEn:'Fixture terms only. Full payment at checkout.',termsEs:'Condiciones de prueba. Pago total al reservar.',cancellationEn:'Fixture cancellation policy for automated tests only.',cancellationEs:'Política de cancelación de prueba para las pruebas.',exclusiveInventoryAcknowledged:true};
export const start='2027-06-01',end='2027-06-04';
export async function signature(raw,secret='whsec_fixture',timestamp=Math.floor(Date.now()/1000)) {
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const bytes=new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(timestamp+'.'+raw)));
  return `t=${timestamp},v1=${[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('')}`;
}
export async function bookingFixture({configure=true}={}) {
  const DB=await database();DB.sqlite.exec(await fs.readFile(new URL('../cms/migrations/0002_bookings.sql',import.meta.url),'utf8'));
  const sessions=new Map(),keys=new Map(),intents=new Map(),calls=[];
  let failCreate=false;
  const transport=async(url,options={})=>{
    calls.push({url,method:options.method||'GET'});
    if(url.includes('turnstile')){const good=options.body.get('response')==='valid';return Response.json({success:good,hostname:'booking.example',action:'booking'});}
    if(options.method==='POST'){
      const key=options.headers['Idempotency-Key'];
      if(keys.has(key))return Response.json(sessions.get(keys.get(key)));
      const p=new URLSearchParams(options.body),id='cs_test_'+(sessions.size+1);
      const session={id,url:'https://checkout.stripe.com/c/pay/'+id,status:'open',payment_status:'unpaid',currency:'usd',mode:'payment',livemode:false,amount_total:Number(p.get('line_items[0][price_data][unit_amount]')),client_reference_id:p.get('client_reference_id'),metadata:{reservation_id:p.get('metadata[reservation_id]')},expires_at:Number(p.get('expires_at')),payment_intent:null};
      sessions.set(id,session);keys.set(key,id);
      if(failCreate){failCreate=false;throw Error('Lost network response after Stripe created session');}
      return Response.json(session);
    }
    if(url.includes('payment_intents/'))return Response.json(intents.get(url.split('payment_intents/')[1].split('?')[0]));
    const id=url.split('/').pop();return sessions.has(id)?Response.json(sessions.get(id)):Response.json({error:'missing'}, {status:404});
  };
  const root=path.resolve(new URL('..',import.meta.url).pathname);
  const ASSETS={async fetch(request){let pathname=new URL(request.url).pathname;if(pathname.endsWith('/'))pathname+='index.html';if(!/^\/(booking|admin|assets|mint-mojo)\//.test(pathname) && !['/index.html','/styles.css','/effects.js','/brand.css','/app.js','/data.js','/cms-client.js','/cinematic.css'].includes(pathname))return new Response('Missing',{status:404});try{const file=await fs.readFile(path.join(root,pathname));return new Response(file,{headers:{'Content-Type':({'.js':'text/javascript','.css':'text/css','.html':'text/html','.jpg':'image/jpeg','.woff2':'font/woff2'})[path.extname(pathname)]||'application/octet-stream'}});}catch{return new Response('Missing',{status:404});}}};
  const env={DB,ASSETS,BOOKING_MODE:'test',BOOKING_ORIGIN:ORIGIN,STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_WEBHOOK_SECRET:'whsec_fixture',TURNSTILE_SITE_KEY:'site-fixture',TURNSTILE_SECRET_KEY:'secret-fixture'};
  const app=createApp({authorize:async request=>{if(request.headers.get('X-Test-Admin')!=='editor@example.com')throw Object.assign(Error('Sign in required.'),{status:401});return 'editor@example.com';},bookingTransport:transport});
  const call=(route,method='GET',body,headers={})=>app.fetch(new Request(ORIGIN+route,{method,headers:{'Origin':ORIGIN,'Content-Type':'application/json',...headers},body:body===undefined?undefined:typeof body==='string'?body:JSON.stringify(body)}),env);
  if(configure){DB.sqlite.prepare('UPDATE booking_settings SET config_json=?').run(JSON.stringify(rules));for(let day=1;day<=30;day++)DB.sqlite.prepare('INSERT INTO booking_inventory VALUES (?,?,1)').run('2027-06-'+String(day).padStart(2,'0'),30000);}
  const quote=async(input={})=>{const response=await call('/api/booking/quote','POST',{arrival:start,departure:end,guests:2,...input});return response.json();};
  const checkout=async(q,token='a'.repeat(64),extra={})=>call('/api/booking/checkout','POST',{arrival:q.arrival,departure:q.departure,guests:q.guests,quoteKey:q.key,token,verification:'valid',acceptedTerms:true,...extra});
  function pay(id){const s=sessions.get(id);s.status='complete';s.payment_status='paid';s.payment_intent='pi_'+id.slice(8);intents.set(s.payment_intent,{id:s.payment_intent,currency:'usd',amount:s.amount_total,metadata:s.metadata,latest_charge:{refunded:false,amount_refunded:0}});}
  async function webhook(id,type='checkout.session.completed',extra={}){const object=sessions.get(id);const raw=JSON.stringify({id:'evt_fixture',type,livemode:false,data:{object},...extra});return call('/api/booking/stripe-webhook','POST',raw,{'Stripe-Signature':await signature(raw)});}
  return {DB,env,app,call,quote,checkout,sessions,intents,calls,pay,webhook,loseCreateResponse(){failCreate=true;},close(){DB.sqlite.close();}};
}
export async function bookingServer(){
  const h=await bookingFixture();
  const server=http.createServer(async(req,res)=>{try{const headers=new Headers(req.headers);if(headers.get('origin')===`http://${req.headers.host}`)headers.set('Origin',ORIGIN);const request=new Request(ORIGIN+req.url,{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:req,duplex:'half'});const response=await h.app.fetch(request,h.env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch{res.writeHead(500);res.end('Fixture error');}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  return {...h,base:`http://127.0.0.1:${server.address().port}`,async stop(){await new Promise(resolve=>server.close(resolve));h.close();}};
}
