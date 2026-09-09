// Ricard AI — Proxy CORS pour l'API Z.AI (GLM)
// api.z.ai ne renvoie pas les headers CORS sur le preflight OPTIONS,
// ce qui bloque tout appel navigateur direct. Ce Worker relaie les
// requêtes en ajoutant les headers CORS manquants.
// La clé API transite en header Authorization, jamais stockée.

const ALLOWED_ORIGINS = [
  'https://ricard-ai.surge.sh',
  'http://localhost:8765',
  'http://127.0.0.1:8765',
];

// localhost sur n'importe quel port (dev)
const LOCAL_RE = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function corsHeaders(origin) {
  if (!ALLOWED_ORIGINS.includes(origin) && !LOCAL_RE.test(origin)) return null;
  return { ...CORS_HEADERS, 'Access-Control-Allow-Origin': origin, Vary: 'Origin' };
}

const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: cors ? 204 : 403, headers: cors || {} });
    }
    if (!cors) {
      return new Response(JSON.stringify({ error: 'Origin non autorisée' }), {
        status: 403, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Relayage vers api.z.ai : /zai/api/paas/v4/... → https://api.z.ai/api/paas/v4/...
    const incoming = new URL(request.url);
    const upstream = 'https://api.z.ai' + incoming.pathname.replace(/^\/zai/, '') + incoming.search;

    const headers = new Headers();
    headers.set('Authorization', request.headers.get('Authorization') || '');
    headers.set('Content-Type', request.headers.get('Content-Type') || 'application/json');

    const init = {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    };

    const resp = await fetch(upstream, init);

    // Retourne la réponse avec les headers CORS ajoutés (streaming préservé)
    const outHeaders = new Headers(resp.headers);
    Object.entries(cors).forEach(([k, v]) => outHeaders.set(k, v));
    return new Response(resp.body, { status: resp.status, headers: outHeaders });
  },
};
