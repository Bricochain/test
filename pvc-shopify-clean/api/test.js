// api/test.js — endpoint di verifica configurazione
// Visita: https://TUO-APP.vercel.app/api/test

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const STORE      = process.env.SHOPIFY_STORE;
  const TOKEN      = process.env.SHOPIFY_TOKEN;
  const PRODUCT_ID = process.env.SHOPIFY_PRODUCT_ID;

  const config = {
    SHOPIFY_STORE:      STORE      ? `✅ ${STORE}`      : '❌ MANCANTE',
    SHOPIFY_TOKEN:      TOKEN      ? `✅ ***${TOKEN.slice(-4)}` : '❌ MANCANTE',
    SHOPIFY_PRODUCT_ID: PRODUCT_ID ? `✅ ${PRODUCT_ID}` : '❌ MANCANTE',
  };

  // Se tutto configurato, testa la connessione a Shopify
  if (STORE && TOKEN && PRODUCT_ID) {
    try {
      const r = await fetch(
        `https://${STORE}/admin/api/2024-01/products/${PRODUCT_ID}.json`,
        { headers: { 'X-Shopify-Access-Token': TOKEN } }
      );
      const data = await r.json();
      if (data.product) {
        config.shopify_connection = `✅ Prodotto trovato: "${data.product.title}" (${data.product.variants.length} varianti)`;
      } else {
        config.shopify_connection = `❌ Errore: ${JSON.stringify(data.errors || data)}`;
      }
    } catch(e) {
      config.shopify_connection = `❌ Errore connessione: ${e.message}`;
    }
  }

  res.status(200).json({ status: 'PVC Price API', config });
};
