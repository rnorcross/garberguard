# GarberGuard.com

Site for Garber Guard, the vehicle protection (F&I) division of Garber Automotive Group. No pricing is shown anywhere on the site.

## How it's built
Every URL is a finished HTML page generated at deploy time.

- `src/shell.html` — page template: head, header, footer, styles
- `src/site.js` — all content (plans, FAQ, contact info), URLs and page templates
- `src/app.js` — browser behavior: menus, home picker, the get-started flow
- `api/lead.js` — serverless relay: receives quote requests and forwards them to the lead endpoint with the secret token
- `build.mjs` — writes `dist/`: one page per URL, `404.html`, `sitemap.xml`, `robots.txt`
- `assets/`, `favicon.ico` — images and icons

Vercel runs `node build.mjs` and serves `dist/` (see `vercel.json`). To preview locally: `node build.mjs` then serve `dist/`.
Canonical URLs, the sitemap and structured data use `https://garberguard.com`; override with the `SITE_URL` environment variable.

## URLs
| Page | URL |
|---|---|
| Home | `/` |
| All plans | `/protection-plans` |
| Mechanical | `/protection-plans/vehicle-service-contract`, `/certified-pre-owned-wrap`, `/high-mileage-powertrain-coverage`, `/vehicle-technology-protection`, `/commercial-vehicle-service-contract` |
| Everyday | `/protection-plans/tire-wheel-protection`, `/windshield-protection`, `/key-replacement`, `/touchscreen-protection`, `/paintless-dent-repair`, `/5-in-1-protection-bundle` |
| Appearance & rust | `/protection-plans/appearance-protection`, `/rust-undercoat-protection` |
| Lease & maintenance | `/protection-plans/vehicle-protection-plus-lease`, `/lease-excess-wear-and-tear`, `/prepaid-maintenance` |
| Info | `/how-it-works`, `/claims`, `/faq` |
| Quote flow | `/get-started` (noindex) |

Product content follows the Garber Guard Product Suite Overview (July 2026). Groups are set in `GROUPS` in `src/site.js`.
Earlier URLs (`/tire-wheel`, `/plans`, `/protection-plans/prepaid-oil-change-program`, …) permanently redirect. `*.vercel.app` hosts send `X-Robots-Tag: noindex` so only the real domain gets indexed.

## Leads and dealer attribution
Each quote request is POSTed as JSON to `/api/lead`, which relays it to `https://garber-functions.vercel.app/f/garber-guard` with `Authorization: Bearer <token>`. That endpoint routes the lead to the store's email. If the send fails, the visitor sees an error and can retry with the same reference number.

Set these in Vercel (Project → Settings → Environment Variables), then redeploy:
- `GARBER_FUNCTIONS_TOKEN` (required) — the endpoint token. Never commit it or put it in `src/`.
- `GARBER_LEAD_URL` (optional) — overrides the endpoint URL.

**Which store gets the lead** (`dealer` in the JSON):
1. The store whose link the visitor arrived from (`assigned_by: "dealer_link"`). Any page accepts `?dealer=CODE`; the code is kept in the first-party cookie `gg_dealer` for 30 days, and the most recent valid code wins. Unknown codes are ignored.
2. Otherwise, the store picked in step 1 of the quote flow (`assigned_by: "customer_selected"`).
3. Otherwise none (`assigned_by: "none"`, empty code) — the endpoint should send these to a default inbox.

The store the visitor picked is always sent separately as `customer_selected_store`, and the link details (landing page, referrer, UTMs, first seen) as `attribution`. Treat `dealer.code` as untrusted input on the endpoint side: look it up in your own list and fall back to the default inbox if it's unknown.

Store names and codes live in `STORES` in `src/site.js`. Keep codes unchanged once links are live; add new stores there.

### Dealer website links
Swap `garberguard.com` for the Vercel URL until the domain is connected.

| State | Store | Dealer code | Link for the dealer website |
|---|---|---|---|
| Michigan | Garber Buick — Saginaw | `garber-buick-saginaw` | `https://garberguard.com/?dealer=garber-buick-saginaw&utm_source=garber-buick-saginaw&utm_medium=dealer-website&utm_campaign=garber-guard` |
| Michigan | Garber Chevrolet Saginaw | `garber-chevrolet-saginaw` | `https://garberguard.com/?dealer=garber-chevrolet-saginaw&utm_source=garber-chevrolet-saginaw&utm_medium=dealer-website&utm_campaign=garber-guard` |
| Michigan | Garber Chevrolet Midland | `garber-chevrolet-midland` | `https://garberguard.com/?dealer=garber-chevrolet-midland&utm_source=garber-chevrolet-midland&utm_medium=dealer-website&utm_campaign=garber-guard` |
| Michigan | Garber Chevrolet Linwood | `garber-chevrolet-linwood` | `https://garberguard.com/?dealer=garber-chevrolet-linwood&utm_source=garber-chevrolet-linwood&utm_medium=dealer-website&utm_campaign=garber-guard` |
| Michigan | Garber Chevrolet Chesaning | `garber-chevrolet-chesaning` | `https://garberguard.com/?dealer=garber-chevrolet-chesaning&utm_source=garber-chevrolet-chesaning&utm_medium=dealer-website&utm_campaign=garber-guard` |
| Michigan | Garber CDJR Saginaw | `garber-cdjr-saginaw` | `https://garberguard.com/?dealer=garber-cdjr-saginaw&utm_source=garber-cdjr-saginaw&utm_medium=dealer-website&utm_campaign=garber-guard` |
| Michigan | Garber Ford Bay City | `garber-ford-bay-city` | `https://garberguard.com/?dealer=garber-ford-bay-city&utm_source=garber-ford-bay-city&utm_medium=dealer-website&utm_campaign=garber-guard` |
| Michigan | Garber Hyundai — Saginaw | `garber-hyundai-saginaw` | `https://garberguard.com/?dealer=garber-hyundai-saginaw&utm_source=garber-hyundai-saginaw&utm_medium=dealer-website&utm_campaign=garber-guard` |
| Michigan | Garber Nissan — Saginaw | `garber-nissan-saginaw` | `https://garberguard.com/?dealer=garber-nissan-saginaw&utm_source=garber-nissan-saginaw&utm_medium=dealer-website&utm_campaign=garber-guard` |
| Indiana | Garber Chevrolet Highland | `garber-chevrolet-highland` | `https://garberguard.com/?dealer=garber-chevrolet-highland&utm_source=garber-chevrolet-highland&utm_medium=dealer-website&utm_campaign=garber-guard` |
| Indiana | Garber CDJR Valparaiso | `garber-cdjr-valparaiso` | `https://garberguard.com/?dealer=garber-cdjr-valparaiso&utm_source=garber-cdjr-valparaiso&utm_medium=dealer-website&utm_campaign=garber-guard` |
| Illinois | Sunrise Chevrolet — Glendale Heights | `sunrise-chevrolet` | `https://garberguard.com/?dealer=sunrise-chevrolet&utm_source=sunrise-chevrolet&utm_medium=dealer-website&utm_campaign=garber-guard` |
| New York | Garber Honda — Rochester | `garber-honda-rochester` | `https://garberguard.com/?dealer=garber-honda-rochester&utm_source=garber-honda-rochester&utm_medium=dealer-website&utm_campaign=garber-guard` |
| New York | Acura of Rochester | `acura-of-rochester` | `https://garberguard.com/?dealer=acura-of-rochester&utm_source=acura-of-rochester&utm_medium=dealer-website&utm_campaign=garber-guard` |
| New York | Audi Rochester | `audi-rochester` | `https://garberguard.com/?dealer=audi-rochester&utm_source=audi-rochester&utm_medium=dealer-website&utm_campaign=garber-guard` |
| New York | Porsche Rochester | `porsche-rochester` | `https://garberguard.com/?dealer=porsche-rochester&utm_source=porsche-rochester&utm_medium=dealer-website&utm_campaign=garber-guard` |
| New York | Volvo Cars Rochester | `volvo-cars-rochester` | `https://garberguard.com/?dealer=volvo-cars-rochester&utm_source=volvo-cars-rochester&utm_medium=dealer-website&utm_campaign=garber-guard` |
| New York | Garber Randall Chevrolet — Canandaigua | `garber-randall-chevrolet` | `https://garberguard.com/?dealer=garber-randall-chevrolet&utm_source=garber-randall-chevrolet&utm_medium=dealer-website&utm_campaign=garber-guard` |
| New York | Garber Randall Buick GMC — Canandaigua | `garber-randall-buick-gmc` | `https://garberguard.com/?dealer=garber-randall-buick-gmc&utm_source=garber-randall-buick-gmc&utm_medium=dealer-website&utm_campaign=garber-guard` |
| New York | Garber Randall Cadillac — Canandaigua | `garber-randall-cadillac` | `https://garberguard.com/?dealer=garber-randall-cadillac&utm_source=garber-randall-cadillac&utm_medium=dealer-website&utm_campaign=garber-guard` |
| Florida | Garber Automall GM — Orange Park | `garber-automall-gm` | `https://garberguard.com/?dealer=garber-automall-gm&utm_source=garber-automall-gm&utm_medium=dealer-website&utm_campaign=garber-guard` |
| Florida | Garber Automall Ford — Orange Park | `garber-automall-ford` | `https://garberguard.com/?dealer=garber-automall-ford&utm_source=garber-automall-ford&utm_medium=dealer-website&utm_campaign=garber-guard` |
| Florida | Garber Automall CDJR — Orange Park | `garber-automall-cdjr` | `https://garberguard.com/?dealer=garber-automall-cdjr&utm_source=garber-automall-cdjr&utm_medium=dealer-website&utm_campaign=garber-guard` |
| Florida | Delray Buick GMC — Delray Beach | `delray-buick-gmc` | `https://garberguard.com/?dealer=delray-buick-gmc&utm_source=delray-buick-gmc&utm_medium=dealer-website&utm_campaign=garber-guard` |
| Florida | Garber Buick GMC — Fort Pierce | `garber-buick-gmc-fort-pierce` | `https://garberguard.com/?dealer=garber-buick-gmc-fort-pierce&utm_source=garber-buick-gmc-fort-pierce&utm_medium=dealer-website&utm_campaign=garber-guard` |
| Florida | Nissan of Bradenton | `nissan-of-bradenton` | `https://garberguard.com/?dealer=nissan-of-bradenton&utm_source=nissan-of-bradenton&utm_medium=dealer-website&utm_campaign=garber-guard` |
| South Carolina | Hilton Head Buick GMC — Bluffton | `hilton-head-buick-gmc` | `https://garberguard.com/?dealer=hilton-head-buick-gmc&utm_source=hilton-head-buick-gmc&utm_medium=dealer-website&utm_campaign=garber-guard` |
| South Carolina | Hilton Head Cadillac — Bluffton | `hilton-head-cadillac` | `https://garberguard.com/?dealer=hilton-head-cadillac&utm_source=hilton-head-cadillac&utm_medium=dealer-website&utm_campaign=garber-guard` |

## Before launch
- Set `GARBER_FUNCTIONS_TOKEN` in Vercel (see above) and send a test lead from each dealer link.
- Fill placeholders: consent language (legal review), callback response time (confirmation screen).
- Excess Wear & Tear shows "Not yet available in New York"; remove the `notice` on `ewt` in `src/site.js` once NY is approved.
- Connect GarberGuard.com in Vercel, then submit `https://garberguard.com/sitemap.xml` in Google Search Console.
