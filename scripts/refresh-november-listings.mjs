// Reconcile this dated source snapshot through the normal versioned CMS routes.
// With an operator's Cloudflare Access session in OAKTOWN_ACCESS_COOKIE, run
// node scripts/refresh-november-listings.mjs to preview. --apply writes the plan.
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { validateProperty } from '../cms/model.mjs';

const scope = { window: {} };
runInNewContext(readFileSync(new URL('../data.js', import.meta.url), 'utf8'), scope);
const data = JSON.parse(JSON.stringify(scope.window.OAKTOWN_DATA));
const activeSlugs = ['115-colonial-drive', '4005-smallboat-ct', '1106-cherokee-rd-unit-8', '1824-w-madison'];
const retiredSlug = '1106-cherokee-rd-unit-6';

export async function refresh(request, apply = false) {
  const collection = '/api/admin/properties';
  const { properties } = await request(collection);
  const records = new Map(properties.map(record => [record.slug, record]));
  const plan = [];

  for (const slug of activeSlugs) {
    const source = data.properties.find(property => property.slug === slug);
    const record = records.get(slug);
    const isNewListing = slug === '1824-w-madison';
    if (!record && !isNewListing) throw new Error('Missing CMS record: ' + slug);
    if (record && record.state !== 'published' && !(isNewListing && record.state === 'draft')) {
      throw new Error('Review the current publication state of ' + slug);
    }
    const live = record?.publishedProperty;
    const photos = data.images[source.imageKey].map((url, i) =>
      live?.photos.find(photo => photo.url === url) ?? {url, alt:source.name + ' — photo ' + (i + 1)}
    );
    // Keep operator uploads belonging to this unit. Validation stops the whole
    // plan before writing if the resulting gallery exceeds the CMS limit.
    photos.push(...(live?.photos ?? []).filter(photo => photo.url.startsWith('/media/')));
    const next = {...(live ?? source), photos, availability:live?.availability ?? source.availability ?? 'unknown'};
    if (slug === '115-colonial-drive') {
      next.rent = source.rent;
      next.deposit = source.deposit;
    }
    const property = validateProperty(next, true);
    if (isDeepStrictEqual(live, property)) continue;
    const saved = isDeepStrictEqual(record?.property, property);
    if (record && !saved && (record.unpublishedChanges || !live)) {
      throw new Error('Review existing private edits on ' + slug);
    }
    plan.push({slug, record, property, saved});
  }
  const retired = records.get(retiredSlug);
  if (retired?.state === 'published') plan.push({slug:retiredSlug, record:retired, archive:true});

  if (apply) {
    for (const step of plan) {
      let row = step.record;
      if (step.archive) {
        await request(collection + '/' + row.id + '/archive', 'POST', {version:row.version});
        continue;
      }
      if (!row) row = await request(collection, 'POST', step.property);
      else if (!step.saved) row = await request(collection + '/' + row.id, 'PUT', {version:row.version, property:step.property});
      await request(collection + '/' + row.id + '/publish', 'POST', {version:row.version});
    }
  }
  return plan.map(step => (step.archive ? 'Archive ' : 'Publish ') + step.slug);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const origin = 'https://oaktown.rentals10.workers.dev';
  const cookie = process.env.OAKTOWN_ACCESS_COOKIE;
  if (!cookie) throw new Error('A signed-in Oaktown CMS operator session is required.');
  const request = async (path, method = 'GET', payload) => {
    const response = await fetch(origin + path, {method, redirect:'error',
      headers:{Cookie:cookie, Origin:origin, 'Content-Type':'application/json'},
      body:payload && JSON.stringify(payload)});
    if (!response.ok) throw new Error(method + ' ' + path + ' returned ' + response.status);
    return response.json();
  };
  console.log(await refresh(request, process.argv.includes('--apply')));
}
