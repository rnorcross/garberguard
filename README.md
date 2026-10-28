# GarberGuard.com

Site for Garber Guard, the vehicle protection (F&I) division of Garber Automotive Group. No pricing is shown anywhere on the site.

## How it's built
Every URL is a finished HTML page generated at deploy time.

- `src/shell.html` — page template: head, header, footer, styles
- `src/site.js` — all content (plans, FAQ, contact info), URLs and page templates
- `src/app.js` — browser behavior: menus, home picker, the get-started flow
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

## Before launch
- The get-started flow does not submit leads yet; it keeps the request in the visitor's browser. Connect it to the F&I lead destination and remove the "Prototype" note on the confirmation screen.
- Fill placeholders: consent language (legal review), callback response time (confirmation screen).
- Excess Wear & Tear shows "Not yet available in New York"; remove the `notice` on `ewt` in `src/site.js` once NY is approved.
- Connect GarberGuard.com in Vercel, then submit `https://garberguard.com/sitemap.xml` in Google Search Console.
