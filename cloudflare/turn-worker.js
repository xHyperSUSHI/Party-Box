/* Party Box – TURN-Zugangsdaten (Cloudflare Worker)
   Gibt kurzlebige TURN-Zugangsdaten (24 h) für die Party Box aus, damit Online-Spiele auch zwischen
   verschiedenen WLANs klappen. Das geheime API-Token liegt NUR bei Cloudflare (Worker-Secrets), nie im Quelltext.
   Secrets (Worker → Settings → Variables and Secrets, Typ „Secret“):
     TURN_KEY_ID        = „Turn Token ID“ aus Realtime → TURN Server
     TURN_KEY_API_TOKEN = „API Token“ desselben TURN-Schlüssels
   Test im Browser: <worker-url>/?test=1  →  {"ok":true,"servers":…}  (ohne Zugangsdaten)
   Wird nicht von der App ausgeliefert (nicht in sw.js), liegt nur zur Dokumentation im Repo. */
const ALLOWED = ['https://xhypersushi.github.io'];
export default {
  async fetch(req, env) {
    const url = new URL(req.url), origin = req.headers.get('Origin') || '';
    const cors = { 'Access-Control-Allow-Origin': ALLOWED.includes(origin) ? origin : ALLOWED[0], 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Vary': 'Origin', 'Cache-Control': 'no-store' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const test = url.searchParams.has('test');
    // Zugangsdaten nur für die Party-Box-Seite (Browser schicken den Origin mit); der Test geht ohne
    if (!test && !ALLOWED.includes(origin)) return new Response('forbidden', { status: 403, headers: cors });
    if (!env.TURN_KEY_ID || !env.TURN_KEY_API_TOKEN) return json({ ok: false, error: 'Secrets TURN_KEY_ID / TURN_KEY_API_TOKEN fehlen' }, 500, cors);
    const r = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`, {
      method: 'POST', headers: { Authorization: `Bearer ${env.TURN_KEY_API_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ ttl: 86400 })
    });
    if (!r.ok) return json({ ok: false, error: 'Cloudflare antwortet mit ' + r.status }, 502, cors);
    const j = await r.json();
    // Port 53 weglassen: Browser sperren ihn teils, das verzögert sonst den Verbindungsaufbau
    const ice = (j.iceServers || []).map(s => ({ ...s, urls: [].concat(s.urls).filter(u => !/:53(\?|$)/.test(u)) })).filter(s => s.urls.length);
    if (test) return json({ ok: true, servers: ice.length, urls: ice.reduce((n, s) => n + s.urls.length, 0) }, 200, cors);
    return json({ iceServers: ice, ttl: 86400 }, 200, cors);
  }
};
function json(o, status, h) { return new Response(JSON.stringify(o), { status, headers: { ...h, 'Content-Type': 'application/json' } }) }
