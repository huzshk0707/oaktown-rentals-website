import fs from 'node:fs';
import vm from 'node:vm';
import { validateProperty } from '../cms/model.mjs';
const scope = { window:{} };
vm.runInNewContext(fs.readFileSync(new URL('../data.js',import.meta.url),'utf8'),scope);
const data=scope.window.OAKTOWN_DATA;
const quote=value=>"'"+String(value).replaceAll("'","''")+"'";
let order=Date.now();
const statements=['-- Explicit one-time import. Existing IDs are preserved; existing rows are never overwritten.'];
for(const record of data.properties){
  const now=new Date(order++).toISOString();
  const property=validateProperty({...record,availability:'unknown',photos:data.images[record.imageKey].map((url,i)=>({url,alt:record.name+' — photo '+(i+1)}))},true);
  const value=JSON.stringify(property);
  statements.push(`INSERT OR IGNORE INTO properties (id,slug,draft_json,published_json,state,version,created_at,updated_at,published_at) VALUES (${[record.slug,record.slug,value,value,'published'].map(quote).join(',')},1,${[now,now,now].map(quote).join(',')});`);
}
const target=process.argv[2]||'.wrangler/import-properties.sql';
fs.mkdirSync(new URL('../.wrangler/',import.meta.url),{recursive:true});
fs.writeFileSync(target,statements.join('\n')+'\n');console.log(`Prepared ${data.properties.length} properties in ${target}. Apply explicitly to the intended database.`);
