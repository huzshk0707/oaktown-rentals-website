import { fail } from './model.mjs';
const DAY = 86400000;
export const hash = async value => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map(b=>b.toString(16).padStart(2,'0')).join('');
export function dateDay(value) {
  if (typeof value !== 'string' || !/^20\d{2}-\d{2}-\d{2}$/.test(value)) fail('invalid_dates');
  const ms = Date.parse(value+'T00:00:00Z');
  if (!Number.isFinite(ms) || new Date(ms).toISOString().slice(0,10)!==value) fail('invalid_dates');
  return ms;
}
export function today(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const get = type => parts.find(p=>p.type===type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
export function nightsBetween(arrival, departure) {
  const first=dateDay(arrival), last=dateDay(departure), count=(last-first)/DAY;
  if (count < 1 || count > 90) fail('invalid_dates');
  return Array.from({length:count},(_,i)=>new Date(first+i*DAY).toISOString().slice(0,10));
}
export function integer(value, min, max) {
  if (!Number.isSafeInteger(value) || value < min || value > max) fail('invalid_settings');
  return value;
}
export function settings(input) {
  if (!input || typeof input!=='object' || typeof input.enabled!=='boolean') fail('invalid_settings');
  const out={enabled:input.enabled,currency:'usd',minNights:integer(input.minNights,1,90),maxNights:integer(input.maxNights,1,90),maxGuests:integer(input.maxGuests,1,8),cleaningCents:integer(input.cleaningCents,0,1000000),taxBps:integer(input.taxBps,0,10000)};
  if (out.maxNights<out.minNights) fail('invalid_settings');
  for (const key of ['termsEn','termsEs','cancellationEn','cancellationEs']) {
    if (typeof input[key]!=='string' || input[key].trim().length<10 || input[key].length>8000 || /[\u0000-\u0008]/.test(input[key])) fail('invalid_settings');
    out[key]=input[key].trim();
  }
  if (input.enabled && input.exclusiveInventoryAcknowledged!==true) fail('inventory_confirmation_required');
  out.exclusiveInventoryAcknowledged=input.exclusiveInventoryAcknowledged===true;
  return out;
}
export function stay(input, config) {
  if (!input || typeof input!=='object') fail('invalid_dates');
  const nights=nightsBetween(input.arrival,input.departure);
  if (input.arrival<=today() || dateDay(input.departure)>dateDay(today())+730*DAY) fail('invalid_dates');
  if (nights.length<config.minNights || nights.length>config.maxNights) fail('stay_length');
  if (!Number.isSafeInteger(input.guests) || input.guests<1 || input.guests>config.maxGuests) fail('invalid_guests');
  return nights;
}
export async function makeQuote(input, config, version, rows) {
  const days=stay(input,config);
  if (rows.length!==days.length || rows.some((r,i)=>r.day!==days[i] || !r.open || r.occupied)) fail('unavailable',409);
  const accommodationCents=rows.reduce((sum,r)=>sum+r.rate_cents,0);
  const taxCents=Math.round((accommodationCents+config.cleaningCents)*config.taxBps/10000);
  const totalCents=accommodationCents+config.cleaningCents+taxCents;
  if (!Number.isSafeInteger(totalCents) || totalCents<50 || totalCents>99999999) fail('invalid_total');
  const quote={arrival:input.arrival,departure:input.departure,guests:input.guests,nights:rows.map(r=>({day:r.day,rateCents:r.rate_cents})),accommodationCents,cleaningCents:config.cleaningCents,taxCents,totalCents,currency:'usd',version,termsEn:config.termsEn,termsEs:config.termsEs,cancellationEn:config.cancellationEn,cancellationEs:config.cancellationEs};
  return {...quote,key:await hash(JSON.stringify(quote))};
}
