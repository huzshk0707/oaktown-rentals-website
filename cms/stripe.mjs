import { fail } from './model.mjs';
import { emailReady } from './booking-email.mjs';
export async function stripe(env, path, params, key, transport=fetch) {
  let response;
  try {
    response=await transport('https://api.stripe.com/v1/'+path,{
      method:params?'POST':'GET',headers:{Authorization:'Bearer '+env.STRIPE_SECRET_KEY,'Stripe-Version':'2026-11-18.endive',...(params?{'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':key}:{})},
      body:params?new URLSearchParams(params).toString():undefined,signal:AbortSignal.timeout(15000),redirect:'error'
    });
  } catch { fail('payment_unavailable',503); }
  if (!response.ok) {
    let error;
    try { ({error}=await response.json()); } catch {}
    // A first-request validation rejection cannot create a session. Conflicts,
    // throttling, idempotency errors and provider 5xx are ambiguous.
    const rejected = path==='checkout/sessions' && params && response.status===400
      && error?.type==='invalid_request_error' && error.code!=='idempotency_key_in_use';
    throw Object.assign(new Error('payment_unavailable'),{status:503,rejected});
  }
  return response.json();
}
export async function verifyStripe(raw, header, secret, now=Math.floor(Date.now()/1000)) {
  if (!secret || !header || header.length>4096) fail('invalid_signature',400);
  const entries=header.split(',').map(x=>x.trim().split('='));
  const timestamps=entries.filter(([k])=>k==='t');
  if (timestamps.length!==1 || !/^\d+$/.test(timestamps[0][1])) fail('invalid_signature');
  const timestamp=Number(timestamps[0][1]);
  if (Math.abs(now-timestamp)>300) fail('invalid_signature');
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
  const prefix=new TextEncoder().encode(timestamps[0][1]+'.');
  const payload=new Uint8Array(prefix.length+raw.length);
  payload.set(prefix);
  payload.set(raw,prefix.length);
  for (const [name,value] of entries) {
    if (name!=='v1' || !/^[0-9a-f]{64}$/.test(value)) continue;
    const signature=Uint8Array.from(value.match(/../g),x=>parseInt(x,16));
    if (await crypto.subtle.verify('HMAC',key,signature,payload)) return;
  }
  fail('invalid_signature');
}
export function stripeReady(env) {
  const mode=env.BOOKING_MODE;
  if (!env.DB || !['test','live'].includes(mode)) return false;
  const key=env.STRIPE_SECRET_KEY||'';
  return key.startsWith('sk_'+mode+'_') || key.startsWith('rk_'+mode+'_');
}
export function paymentReady(env) {
  const origin=env.BOOKING_ORIGIN||'';
  return !!(stripeReady(env) && env.STRIPE_WEBHOOK_SECRET && env.TURNSTILE_SECRET_KEY
    && env.TURNSTILE_SITE_KEY && origin.startsWith('https://') && URL.canParse(origin) && new URL(origin).origin===origin
    && (env.BOOKING_MODE!=='live' || (env.BOOKING_LIVE_ENABLED==='true' && emailReady(env))));
}
export async function verifyHuman(env, token, transport=fetch) {
  if (typeof token!=='string' || !token || token.length>2048) fail('verification_required');
  let result;
  try {
    const response=await transport('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:token}),signal:AbortSignal.timeout(10000),redirect:'error'});
    result=await response.json();
  } catch { fail('verification_required',503); }
  if (!result.success || result.hostname!==new URL(env.BOOKING_ORIGIN).hostname || result.action!=='booking') fail('verification_required',403);
}
