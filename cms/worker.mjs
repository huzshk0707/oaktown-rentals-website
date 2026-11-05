import { authenticate } from './auth.mjs';
import { validateProperty, imageType, fail, MAX_JSON_BYTES, MAX_PHOTO_BYTES } from './model.mjs';

const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' } });
const idPattern = /^[a-zA-Z0-9-]{1,100}$/;
async function readJSON(request) {
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) fail('Use JSON for this request.', 415);
  const text = await readLimited(request, MAX_JSON_BYTES);
  try { return JSON.parse(new TextDecoder().decode(text)); } catch { fail('The request is not valid JSON.'); }
}
async function readLimited(request, max) {
  if (Number(request.headers.get('Content-Length')) > max) fail('The upload is too large.', 413);
  const reader = request.body?.getReader();
  if (!reader) fail('The request body is empty.');
  const chunks = []; let length = 0;
  while (true) {
    const { value, done } = await reader.read(); if (done) break;
    length += value.length;
    if (length > max) { await reader.cancel(); fail('The upload is too large.', 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}
const serialize = row => ({ id:row.id, slug:row.slug, property:JSON.parse(row.draft_json), state:row.state, version:row.version, updatedAt:row.updated_at, publishedAt:row.published_at, unpublishedChanges:row.state==='published' && row.draft_json!==row.published_json });
async function getProperty(db, id) {
  if (!idPattern.test(id)) fail('Property not found.',404);
  const row = await db.prepare('SELECT * FROM properties WHERE id = ?').bind(id).first();
  if (!row) fail('Property not found.',404); return row;
}
async function checkPhotos(db, id, photos) {
  for (const photo of photos) {
    if (!photo.url.startsWith('/media/')) continue;
    const media = await db.prepare('SELECT id FROM media WHERE id = ? AND property_id = ?').bind(photo.url.slice(7),id).first();
    if (!media) fail('One of the photos does not belong to this property.');
  }
}
async function mutate(db, statement, actor, id, action, now) {
  const result = await db.batch([statement, db.prepare('INSERT INTO activity (id, property_id, actor, action, created_at) SELECT ?, ?, ?, ?, ? WHERE changes() = 1').bind(crypto.randomUUID(), id, actor, action, now)]);
  if (result[0].meta.changes !== 1) fail('Someone changed this property. Reload it before saving.',409);
}
async function adminAPI(request, env, actor, path) {
  const db = env.DB;
  if (path === '/api/admin/session' && request.method==='GET') return json({ email:actor, photosEnabled:!!env.PHOTOS });
  if (path === '/api/admin/properties') {
    if (request.method==='GET') {
      const rows = await db.prepare('SELECT * FROM properties ORDER BY updated_at DESC, id').all();
      return json({ properties:rows.results.map(serialize) });
    }
    if (request.method==='POST') {
      const property = validateProperty(await readJSON(request));
      if (property.photos.some(p => p.url.startsWith('/media/'))) fail('Save the new property before uploading photos.');
      const id = crypto.randomUUID(), now = new Date().toISOString();
      await mutate(db,db.prepare('INSERT INTO properties (id,slug,draft_json,state,created_at,updated_at) VALUES (?,?,?,\'draft\',?,?)').bind(id,property.slug,JSON.stringify(property),now,now),actor,id,'created',now);
      return json(serialize(await getProperty(db,id)),201);
    }
  }
  const match = path.match(/^\/api\/admin\/properties\/([a-zA-Z0-9-]+)(?:\/(publish|archive|unpublish|photos))?$/);
  if (match) {
    const [,id,action] = match; const row = await getProperty(db,id);
    if (!action && request.method==='GET') return json(serialize(row));
    if (action==='photos' && request.method==='POST') {
      if (!env.PHOTOS) fail('Photo storage has not been connected.',503);
      const bytes = await readLimited(request,MAX_PHOTO_BYTES);
      const [contentType,ext] = imageType(bytes);
      const mediaId = crypto.randomUUID(), objectKey = `properties/${id}/${mediaId}.${ext}`, now = new Date().toISOString();
      await env.PHOTOS.put(objectKey,bytes,{httpMetadata:{contentType}});
      try { await db.batch([
        db.prepare('INSERT INTO media (id,property_id,object_key,content_type,size_bytes,created_at) VALUES (?,?,?,?,?,?)').bind(mediaId,id,objectKey,contentType,bytes.length,now),
        db.prepare('INSERT INTO activity VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),id,actor,'photo_uploaded',now)
      ]); } catch (error) { await env.PHOTOS.delete(objectKey); throw error; }
      return json({url:`/media/${mediaId}`,alt:''},201);
    }
    if ((!action && request.method==='PUT') || (['publish','archive','unpublish'].includes(action) && request.method==='POST')) {
      const input = await readJSON(request);
      if (!Number.isSafeInteger(input.version) || input.version!==row.version) fail('Someone changed this property. Reload it before saving.',409);
      const now = new Date().toISOString(); let statement;
      if (!action) {
        const property = validateProperty(input.property);
        if (property.slug!==row.slug) fail('The web address cannot be changed after creation.');
        await checkPhotos(db,id,property.photos);
        statement = db.prepare('UPDATE properties SET draft_json=?,version=version+1,updated_at=? WHERE id=? AND version=?').bind(JSON.stringify(property),now,id,row.version);
      } else if (action==='publish') {
        const property = validateProperty(JSON.parse(row.draft_json),true);
        await checkPhotos(db,id,property.photos);
        statement = db.prepare("UPDATE properties SET published_json=?,state='published',version=version+1,updated_at=?,published_at=? WHERE id=? AND version=?").bind(JSON.stringify(property),now,now,id,row.version);
      } else {
        statement = db.prepare('UPDATE properties SET state=?,published_json=NULL,version=version+1,updated_at=? WHERE id=? AND version=?').bind(action==='archive'?'archived':'draft',now,id,row.version);
      }
      await mutate(db,statement,actor,id,action||'draft_saved',now);
      return json(serialize(await getProperty(db,id)));
    }
  }
  const mediaMatch = path.match(/^\/api\/admin\/media\/([a-zA-Z0-9-]+)$/);
  if (mediaMatch && request.method==='GET') return servePhoto(env,mediaMatch[1],true);
  return json({error:'Not found.'},404);
}
async function servePhoto(env,id,admin=false) {
  if (!env.DB || !env.PHOTOS) return json({error:'Photo not found.'},404);
  const row = await env.DB.prepare('SELECT * FROM media WHERE id = ?').bind(id).first();
  if (!row) return json({error:'Photo not found.'},404);
  if (!admin) {
    const visible = await env.DB.prepare("SELECT p.id FROM properties p, json_each(p.published_json, '$.photos') photo WHERE p.state='published' AND json_extract(photo.value, '$.url')=? LIMIT 1").bind(`/media/${id}`).first();
    if (!visible) return json({error:'Photo not found.'},404);
  }
  const object = await env.PHOTOS.get(row.object_key);
  if (!object) return json({error:'Photo not found.'},404);
  return new Response(object.body,{headers:{'Content-Type':row.content_type,'Cache-Control':admin?'private, no-store':'public, max-age=60','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'"}});
}
function adminHeaders(response) {
  const result = new Response(response.body,response);
  result.headers.set('Cache-Control','private, no-store');
  result.headers.set('X-Robots-Tag','noindex, nofollow');
  result.headers.set('X-Frame-Options','DENY');
  result.headers.set('X-Content-Type-Options','nosniff');
  result.headers.set('Referrer-Policy','same-origin');
  result.headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' https://images.squarespace-cdn.com blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
  return result;
}
export function createApp({ authorize = authenticate } = {}) {
  return {
    async fetch(request, env) {
      const url = new URL(request.url), path = url.pathname;
      // All current asset/API paths use plain ASCII names. Reject encoded aliases
      // before the asset router can normalize them into protected admin paths.
      if (path.includes('%')) return json({error:'Not found.'},404);
      const admin = path==='/admin' || path.startsWith('/admin/') || path==='/api/admin' || path.startsWith('/api/admin/');
      try {
        if (admin) {
          const actor = await authorize(request,env);
          if (!env.DB) fail('The property database has not been connected.',503);
          if (!['GET','HEAD'].includes(request.method) && request.headers.get('Origin')!==url.origin) fail('Open the admin on this website before saving.',403);
          if (path.startsWith('/api/')) return adminHeaders(await adminAPI(request,env,actor,path));
          if (!['GET','HEAD'].includes(request.method)) return adminHeaders(json({error:'Method not allowed.'},405));
          if (path==='/admin') return adminHeaders(Response.redirect(url.origin+'/admin/',302));
          return adminHeaders(await env.ASSETS.fetch(request));
        }
        if (path==='/api/properties' && request.method==='GET') {
          if (!env.DB) return json({mode:'file'});
          const rows = await env.DB.prepare("SELECT published_json FROM properties WHERE state='published' ORDER BY created_at,id").all();
          return json({mode:'database',properties:rows.results.map(row=>JSON.parse(row.published_json))});
        }
        const media = path.match(/^\/media\/([a-zA-Z0-9-]+)$/);
        if (media && request.method==='GET') return await servePhoto(env,media[1]);
        if (path.startsWith('/api/')) return json({error:'Not found.'},404);
        return env.ASSETS.fetch(request);
      } catch (error) {
        const conflict = /UNIQUE constraint failed.*properties\.slug/.test(String(error));
        const status = conflict ? 409 : (error.status || 500);
        const response = json({error:conflict?'That web address is already in use.':status===500?'The request could not be completed. Try again.':error.message},status);
        return admin ? adminHeaders(response) : response;
      }
    }
  };
}
export default createApp();
