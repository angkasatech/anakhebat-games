const encoder = new TextEncoder();
const prefix = '/member/games/';

function deny(status) {
  return new Response(status === 503 ? 'Service unavailable' : 'Access denied', {
    status, headers: { 'Cache-Control': 'private, no-store', 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export default {
  async fetch(request, env) {
    const secret = env.GAMES_ORIGIN_SECRET;
    if (typeof secret !== 'string' || secret.length < 32) return deny(503);
    const url = new URL(request.url);
    if (!['GET', 'HEAD'].includes(request.method) || !url.pathname.startsWith(prefix)) return deny(403);
    const timestamp = request.headers.get('X-AH-Games-Timestamp');
    const signature = request.headers.get('X-AH-Games-Signature');
    if (!timestamp || !signature) return deny(401);
    if (!/^(0|[1-9]\d*)$/.test(timestamp) || !/^[a-f0-9]{64}$/.test(signature)) return deny(403);
    const seconds = Number(timestamp);
    const age = Math.floor(Date.now() / 1000) - seconds;
    if (!Number.isSafeInteger(seconds) || age < -5 || age > 30) return deny(403);
    try {
      const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
      const payload = ['v1', timestamp, request.method, url.origin, url.pathname + url.search].join('\n');
      const bytes = Uint8Array.from(signature.match(/../g), byte => parseInt(byte, 16));
      if (!await crypto.subtle.verify('HMAC', key, bytes, encoder.encode(payload))) return deny(403);
      // Credentials end at this boundary; the static asset server needs none.
      const headers = new Headers(request.headers);
      for (const name of ['Cookie', 'Authorization', 'X-AH-Games-Timestamp', 'X-AH-Games-Signature']) headers.delete(name);
      const asset = await env.ASSETS.fetch(new Request(request, { headers, redirect: 'manual' }));
      const responseHeaders = new Headers(asset.headers);
      for (const name of ['Set-Cookie', 'X-AH-Games-Timestamp', 'X-AH-Games-Signature', 'CDN-Cache-Control', 'Cloudflare-CDN-Cache-Control']) responseHeaders.delete(name);
      responseHeaders.set('Cache-Control', 'private, no-store');
      return new Response(request.method === 'HEAD' ? null : asset.body, { status: asset.status, statusText: asset.statusText, headers: responseHeaders });
    } catch {
      return deny(503);
    }
  },
};
