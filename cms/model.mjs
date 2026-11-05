export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const MAX_JSON_BYTES = 128 * 1024;
export function fail(message, status = 400) { throw Object.assign(new Error(message), { status }); }
export function validateProperty(input, publishing = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('A property is required.');
  const out = {};
  const text = (key, max, required = false) => {
    if (input[key] !== undefined && typeof input[key] !== 'string') fail(`${key} must be text.`);
    const value = (input[key] || '').trim();
    if (value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value) || (required && !value)) fail(`Check ${key}.`);
    return value;
  };
  out.slug = text('slug', 100, true);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(out.slug)) fail('Use lowercase words separated by hyphens for the web address.');
  out.name = text('name', 160, true);
  for (const key of ['city', 'neighborhood', 'label', 'labelEs']) out[key] = text(key, 160, publishing && ['city','neighborhood'].includes(key));
  if (!out.label) out.label = out.name;
  if (out.neighborhood.includes('|')) fail('Neighborhood cannot contain a vertical bar.');
  for (const key of ['summary','summaryEs']) out[key] = text(key, 1000, publishing && key === 'summary');
  for (const key of ['rent', 'deposit', 'bedrooms', 'bathrooms']) {
    const value = input[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > (['rent','deposit'].includes(key) ? 1000000 : 100)) fail(`Check ${key}.`);
    if (key === 'bedrooms' && !Number.isInteger(value)) fail('Bedrooms must be a whole number.');
    out[key] = value;
  }
  if (publishing && out.rent <= 0) fail('Enter the monthly rent before publishing.');
  for (const key of ['description','descriptionEs','features','featuresEs','terms','termsEs']) {
    if (!Array.isArray(input[key]) || input[key].length > 40 || input[key].some(v => typeof v !== 'string' || v.length > 5000)) fail(`Check ${key}.`);
    out[key] = input[key].map(v => v.trim()).filter(Boolean);
  }
  if (publishing && !out.description.length) fail('Add a description before publishing.');
  if (!['unknown','available','coming_soon','rented'].includes(input.availability)) fail('Choose an availability status.');
  out.availability = input.availability;
  out.sourceUrl = text('sourceUrl', 2048);
  if (out.sourceUrl && !safeExternalUrl(out.sourceUrl)) fail('The listing link must use HTTPS.');
  if (!Array.isArray(input.photos) || input.photos.length > 20) fail('Use at most 20 photos.');
  out.photos = input.photos.map(photo => {
    if (!photo || typeof photo.url !== 'string' || typeof photo.alt !== 'string' || photo.alt.length > 300) fail('Check each photo and caption.');
    const url = photo.url;
    const local = /^\/media\/[a-zA-Z0-9-]+$/.test(url);
    let external = false;
    try { const u = new URL(url); external = u.protocol === 'https:' && u.hostname === 'images.squarespace-cdn.com' && !u.username && !u.password && !u.hash; } catch {}
    if ((!local && !external) || /[<>"'\\\s]/.test(url)) fail('Upload a JPG, PNG or WebP photo using the photo control.');
    return { url, alt: photo.alt.trim() };
  });
  if (new Set(out.photos.map(p => p.url)).size !== out.photos.length) fail('Remove duplicate photos.');
  if (publishing && (!out.photos.length || out.photos.some(p => !p.alt))) fail('Add a photo and describe each photo before publishing.');
  return out;
}
function safeExternalUrl(value) {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password && !u.hash; } catch { return false; }
}
export function imageType(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return ['image/jpeg','jpg'];
  if ([137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v)) return ['image/png','png'];
  if (String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP') return ['image/webp','webp'];
  fail('Choose a JPG, PNG or WebP image.');
}
