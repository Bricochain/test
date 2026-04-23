// api/pvc-price.js — Vercel Serverless Function (CommonJS)

const STORE      = process.env.SHOPIFY_STORE;
const TOKEN      = process.env.SHOPIFY_TOKEN;
const PRODUCT_ID = process.env.SHOPIFY_PRODUCT_ID;
const API_VER    = '2024-01';
const MAX_VARS   = 90;

async function shopifyFetch(path, opts = {}) {
  const res = await fetch(`https://${STORE}/admin/api/${API_VER}/${path}`, {
    ...opts,
    headers: {
      'X-Shopify-Access-Token': TOKEN,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`Shopify non-JSON: ${text.slice(0,200)}`); }
}

module.exports = async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  if (!STORE || !TOKEN || !PRODUCT_ID) {
    return res.status(500).json({
      error: 'ENV mancanti',
      hint: 'Imposta SHOPIFY_STORE, SHOPIFY_TOKEN, SHOPIFY_PRODUCT_ID su Vercel'
    });
  }

  let price;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    price = body?.price;
  } catch(e) {
    return res.status(400).json({ error: 'Body non valido' });
  }

  if (!price || isNaN(parseFloat(price))) {
    return res.status(400).json({ error: 'price mancante' });
  }

  const priceStr = parseFloat(price).toFixed(2);

  try {
    const { variants, errors: listErr } = await shopifyFetch(
      `products/${PRODUCT_ID}/variants.json?limit=250`
    );
    if (!variants) return res.status(500).json({ error: 'Errore lettura varianti', detail: listErr });

    const existing = variants.find(v => parseFloat(v.price).toFixed(2) === priceStr);
    if (existing) return res.status(200).json({ variantId: existing.id });

    if (variants.length >= MAX_VARS) {
      const sorted = [...variants].sort((a,b) => new Date(a.created_at)-new Date(b.created_at));
      if (sorted[1]) {
        await shopifyFetch(`products/${PRODUCT_ID}/variants/${sorted[1].id}.json`, { method: 'DELETE' });
      }
    }

    const createData = await shopifyFetch(`products/${PRODUCT_ID}/variants.json`, {
      method: 'POST',
      body: JSON.stringify({
        variant: {
          option1: priceStr, price: priceStr,
          inventory_management: null, inventory_policy: 'continue',
        },
      }),
    });

    if (!createData.variant) {
      return res.status(500).json({ error: 'Creazione variante fallita', detail: createData.errors || createData });
    }

    return res.status(200).json({ variantId: createData.variant.id });

  } catch(err) {
    return res.status(500).json({ error: 'Errore interno', detail: err.message });
  }
};
