// POST /api/lead — receives a quote request from the get-started flow and relays it, as JSON, to the
// garber-functions lead endpoint, which routes it to the store's email.
//
// Vercel environment variables (Project → Settings → Environment Variables):
//   GARBER_FUNCTIONS_TOKEN  required — bearer token for the garber-functions endpoint (never commit it)
//   GARBER_LEAD_URL         optional — defaults to https://garber-functions.vercel.app/f/garber-guard

const DEFAULT_URL = 'https://garber-functions.vercel.app/f/garber-guard';
const MAX_BYTES = 20000;

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BYTES) throw new Error('too large');
  }
  return JSON.parse(raw || 'null');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }
  const token = process.env.GARBER_FUNCTIONS_TOKEN;
  if (!token) {
    console.error('GARBER_FUNCTIONS_TOKEN is not set');
    return res.status(500).json({ ok: false, error: 'not_configured' });
  }

  let lead;
  try {
    lead = await readBody(req);
  } catch (e) {
    return res.status(400).json({ ok: false, error: 'bad_json' });
  }
  const c = lead && lead.customer;
  if (!c || !c.first_name || !c.last_name || !/^\d{10}$/.test(c.phone || '') || !c.email || !(lead.consent && lead.consent.given)) {
    return res.status(400).json({ ok: false, error: 'missing_fields' });
  }
  if (JSON.stringify(lead).length > MAX_BYTES) return res.status(413).json({ ok: false, error: 'too_large' });

  lead.received_at = new Date().toISOString();
  lead.user_agent = String(req.headers['user-agent'] || '').slice(0, 300);

  try {
    const r = await fetch(process.env.GARBER_LEAD_URL || DEFAULT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(12000),
    });
    if (!r.ok) {
      console.error('Lead endpoint returned', r.status, (await r.text()).slice(0, 500));
      return res.status(502).json({ ok: false, error: 'upstream_error' });
    }
    return res.status(200).json({ ok: true, reference: lead.reference || null });
  } catch (e) {
    console.error('Lead endpoint unreachable:', e && e.message);
    return res.status(502).json({ ok: false, error: 'upstream_unreachable' });
  }
};
