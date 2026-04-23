# PVC Size Calculator v7 — Setup Guide

## Come funziona

```
Cliente → inserisce 160×100 cm
       → calcolatore calcola 238.40 zł
       → chiama API Vercel → crea variante Shopify a 238.40 zł
       → aggiunge al carrello: 1 × 238.40 zł ✓
```

---

## STEP 1 — Crea una Custom App in Shopify

1. Vai su: **Admin Shopify → Impostazioni → App e canali di vendita → Sviluppa app**
2. Clicca **"Crea un'app"**, dai un nome (es: `PVC Price API`)
3. Clicca su **"Configura scope API Admin"**
4. Abilita:
   - `write_products` ✓
   - `read_products` ✓
5. Clicca **"Salva"** poi **"Installa app"**
6. Copia il token: **"Token di accesso API Admin"** → tienilo segreto!

---

## STEP 2 — Prepara il prodotto Shopify

Il prodotto PVC deve avere **un'opzione con almeno un valore** per poter creare più varianti.

1. Vai al prodotto PVC in Admin Shopify
2. Scorri fino a **"Varianti"** → clicca **"Aggiungi opzione"**
3. Nome opzione: `Wymiar`  
   Valore: `Niestandardowy`
4. Clicca **"Salva"**
5. Copia l'**ID del prodotto** dall'URL della pagina:  
   `admin.shopify.com/store/TUO-STORE/products/`**`1234567890`**
6. Imposta la variante base (`Niestandardowy`) a **149.00 zł**
7. Inventario: **"Continua a vendere quando esaurito"** ✓

---

## STEP 3 — Deploy su Vercel (gratuito)

### Opzione A: GitHub (consigliata)

1. Crea un account gratuito su [github.com](https://github.com) e [vercel.com](https://vercel.com)
2. Crea un nuovo repository GitHub, carica i file di questa cartella
3. Vai su [vercel.com/new](https://vercel.com/new) → importa il repository
4. Vercel rileva automaticamente la funzione in `api/`

### Opzione B: Vercel CLI

```bash
npm install -g vercel
cd questa-cartella
vercel login
vercel --prod
```

---

## STEP 4 — Configura variabili d'ambiente su Vercel

Vai su **Vercel Dashboard → Il tuo progetto → Settings → Environment Variables**

| Nome variabile | Valore |
|---|---|
| `SHOPIFY_STORE` | `tuo-negozio.myshopify.com` |
| `SHOPIFY_TOKEN` | `il token copiato al Step 1` |
| `SHOPIFY_PRODUCT_ID` | `1234567890` (l'ID del prodotto PVC) |

Dopo aver aggiunto le variabili: **rideploya** (Deployments → Redeploy).

---

## STEP 5 — Installa il calcolatore in Shopify

1. Vai su **Admin Shopify → Online Store → Themes → Edit code**
2. Cartella `sections/` → **"Add a new section"** → nome: `pvc-size-calculator`
3. Incolla il contenuto di `pvc-size-calculator-v7.liquid`
4. Vai nel **Theme Customizer** → pagina prodotto → **"Add section"** → scegli **"PVC Calcolatore Misure"**
5. Nel campo **"URL della tua app Vercel"** incolla l'URL Vercel (es: `https://pvc-price.vercel.app`)
6. Aggiungi i blocchi "Misura preimpostata" per le taglie standard

---

## Risultato finale

| Misura | Prezzo esatto | Carrello |
|---|---|---|
| 140×100 cm | 149.00 zł | ✅ 1 × 149.00 zł |
| 160×100 cm | 238.40 zł | ✅ 1 × 238.40 zł |
| 150,5×100,5 cm | 225.45 zł | ✅ 1 × 225.45 zł |
| 20×150 cm | 149.00 zł (min) | ✅ 1 × 149.00 zł |

---

## Problemi comuni

**Errore CORS**: L'URL Vercel nel customizer deve corrispondere esattamente (senza `/` finale).

**"variantId mancante"**: Controlla le variabili d'ambiente su Vercel e rideploya.

**"Prodotto non trovato"**: Verifica che `SHOPIFY_PRODUCT_ID` sia corretto e che l'opzione `Wymiar` sia impostata.
