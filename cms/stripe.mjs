import { fail } from './model.mjs';
export async function stripe(env, path, params, key, transport=fetch) {
  let response;
  try {
    response=await transport('https://api.stripe.com/v1/'+path,{
      method:params?'POST':'GET',headers:{Authorization:'Bearer '+env.STRIPE_SECRET_KEY,'Stripe-Version':'2026-11-18.endive',...(params?{'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':key}:{})},
      body:params?new URLSearchParams(params).toString():undefined,signal:AbortSignal.timeout(15000)
    });
  } catch { fail('payment_unavailable',503); }
  if (!response.ok) fail('payment_unavailable',503);
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
  const payload=new TextEncoder().encode(`${timestamp}.${raw}`);
  for (const [name,value] of entries) {
    if (name!=='v1' || !/^[0-9a-f]{64}$/.test(value)) continue;
    const signature=Uint8Array.from(value.match(/../g),x=>parseInt(x,16));
    if (await crypto.subtle.verify('HMAC',key,signature,payload)) return;
  }
  fail('invalid_signature');
}
export function paymentReady(env) {
  const mode=env.BOOKING_MODE;
  return !!(env.DB && ['test','live'].includes(mode) && env.STRIPE_SECRET_KEY?.startsWith(mode==='live'?'sk_live_':'sk_test_') && env.STRIPE_WEBHOOK_SECRET && env.TURNSTILE_SECRET_KEY && env.TURNSTILE_SITE_KEY && /^https:\/\/[^/]+$/.test(env.BOOKING_ORIGIN||'') && (mode!=='live' || env.BOOKING_LIVE_ENABLED==='true'));
}
export async function verifyHuman(env, token, transport=fetch) {
  if (typeof token!=='string' || !token || token.length>2048) fail('verification_required');
  let result;
  try {
    const response=await transport('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:token}),signal:AbortSignal.timeout(10000)});
    result=await response.json();
  } catch { fail('verification_required',503); }
  if (!result.success || result.hostname!==new URL(env.BOOKING_ORIGIN).hostname || result.action!=='booking') fail('verification_required',403);
}
