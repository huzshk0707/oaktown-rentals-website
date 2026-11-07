import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { createApp } from '../cms/worker.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export async function database() {
  const sqlite=new DatabaseSync(':memory:');
  sqlite.exec(await fs.readFile(path.join(root,'cms/migrations/0001_properties.sql'),'utf8'));
  const db={
    sqlite,
    prepare(sql) {
      let args=[];
      return {bind(...values){args=values;return this;},async first(){return sqlite.prepare(sql).get(...args)||null;},async all(){return {results:sqlite.prepare(sql).all(...args)};},async run(){const result=sqlite.prepare(sql).run(...args);return {meta:{changes:Number(result.changes)}};}};
    },
    async batch(statements){sqlite.exec('BEGIN');try{const results=[];for(const statement of statements)results.push(await statement.run());sqlite.exec('COMMIT');return results;}catch(error){sqlite.exec('ROLLBACK');throw error;}}
  };return db;
}
export const example = () => ({slug:'test-home',name:'Test Home',city:'Louisville, Kentucky',neighborhood:'St. Matthews',label:'A fresh start',labelEs:'',summary:'A bright home.',summaryEs:'',rent:1400,deposit:1400,bedrooms:2,bathrooms:1,description:['A welcoming home.'],descriptionEs:[],features:['Garage'],featuresEs:[],terms:['Confirm current terms'],termsEs:[],availability:'unknown',sourceUrl:'',photos:[{url:'https://images.squarespace-cdn.com/content/test.jpg',alt:'Front of the house'}]});
export function bucket(){const objects=new Map();return {objects,async put(key,value,options){objects.set(key,{body:value.slice(),...options});},async get(key){return objects.get(key)||null;},async delete(key){objects.delete(key);}};}
export async function harness({seed=false}={}) {
  const DB=await database(),PHOTOS=bucket();
  if(seed){const {default:vm}=await import('node:vm');const {validateProperty}=await import('../cms/model.mjs');const scope={window:{}};vm.runInNewContext(await fs.readFile(path.join(root,'data.js'),'utf8'),scope);const data=scope.window.OAKTOWN_DATA;let order=Date.now();for(const p of data.properties){const now=new Date(order++).toISOString();const content=JSON.stringify(validateProperty({...p,availability:'unknown',photos:data.images[p.imageKey].map((url,i)=>({url,alt:p.name+' photo '+(i+1)}))},true));DB.sqlite.prepare("INSERT INTO properties VALUES (?,?,?,?,'published',1,?,?,?)").run(p.slug,p.slug,content,content,now,now,now);}}
  const ASSETS={async fetch(request){const url=new URL(request.url);const relative=url.pathname==='/'?'index.html':url.pathname==='/admin/'?'admin/index.html':url.pathname==='/mint-mojo/'?'mint-mojo/index.html':decodeURIComponent(url.pathname.slice(1));if(relative.includes('..')||relative.startsWith('.')||!(/^(admin\/|assets\/)/.test(relative)||['mint-mojo/index.html','mint-mojo/mint-mojo.js','mint-mojo/mint-mojo.css','index.html','data.js','app.js','effects.js','cms-client.js','brand.css','styles.css','cinematic.css','404.html'].includes(relative)))return new Response('Not found',{status:404});try{const file=await fs.readFile(path.join(root,relative));const ext=path.extname(relative);return new Response(file,{headers:{'Content-Type':({'.html':'text/html','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.woff2':'font/woff2'})[ext]||'application/octet-stream'}});}catch{return new Response('Not found',{status:404});}}};
  const app=createApp({authorize:async request=>{if(request.headers.get('X-Test-Admin')!=='editor@example.com')throw Object.assign(new Error('Sign in required.'),{status:401});return 'editor@example.com';}});
  return {app,env:{DB,PHOTOS,ASSETS},close(){DB.sqlite.close();}};
}
export async function startServer({seed=true}={}) {
  const h=await harness({seed});
  const server=http.createServer(async(req,res)=>{
    try{const origin=`http://${req.headers.host}`;const request=new Request(origin+req.url,{method:req.method,headers:req.headers,body:['GET','HEAD'].includes(req.method)?undefined:req,duplex:'half'});const response=await h.app.fetch(request,h.env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch(error){res.writeHead(500);res.end(error.message);}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  return {...h,base:`http://127.0.0.1:${server.address().port}`,async stop(){await new Promise(resolve=>server.close(resolve));h.close();}};
}
