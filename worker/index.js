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

    // Preflight — toujours accepté, y compris pour une origine non autorisée : le préflight ne
    // donne accès à rien, il déclare seulement ce qui est permis. Le contrôle réel se fait sur la
    // requête POST ci-dessous, qui peut ainsi répondre un 403 *lisible* par le navigateur.
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: cors || { ...CORS_HEADERS, 'Access-Control-Allow-Origin': origin || '*', Vary: 'Origin' },
      });
    }
    if (!cors) {
      // Renvoyer les en-têtes CORS même sur un refus : sans eux, le navigateur bloque la réponse
      // et l'app ne voit qu'un « TypeError: Failed to fetch » opaque, impossible à diagnostiquer.
      // Aucun risque : la requête vers Z.AI n'est pas effectuée, on ne divulgue rien.
      return new Response(JSON.stringify({
        error: {
          code: 'ORIGIN_REFUSEE',
          message: `Origine « ${origin || '(absente)'} » non autorisée. Utilisez https://ricard-ai.surge.sh `
                 + `(le HTTP simple est refusé : la clé API ne doit pas transiter en clair).`,
        },
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin || '*' },
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
