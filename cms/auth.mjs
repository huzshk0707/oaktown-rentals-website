import { createRemoteJWKSet, jwtVerify } from 'jose';

const keySets = new Map();
export async function authenticate(request, env, localKeySet) {
  const domain = env.ACCESS_TEAM_DOMAIN;
  const audience = env.ACCESS_AUD;
  const allowed = String(env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (!domain || !/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(domain) || !audience || !allowed.length) {
    throw Object.assign(new Error('Admin sign-in has not been configured.'), { status: 503 });
  }
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token || token.length > 20000) throw Object.assign(new Error('Sign in with an approved account.'), { status: 401 });
  const issuer = `https://${domain}`;
  if (!localKeySet && !keySets.has(issuer)) keySets.set(issuer, createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`)));
  try {
    const { payload } = await jwtVerify(token, localKeySet || keySets.get(issuer), {
      issuer, audience, algorithms: ['RS256'], requiredClaims: ['exp', 'iat', 'sub', 'email'], clockTolerance: 5
    });
    const email = typeof payload.email === 'string' ? payload.email.toLowerCase() : '';
    if (!allowed.includes(email) || payload.type !== 'app') throw new Error('Account is not approved.');
    return email;
  } catch {
    throw Object.assign(new Error('Sign in with an approved account.'), { status: 401 });
  }
}
