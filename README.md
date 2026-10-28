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
| Plans | `/protection-plans/tire-wheel-protection`, `/windshield-protection`, `/key-replacement`, `/touchscreen-protection`, `/paintless-dent-repair`, `/rust-undercoat-protection`, `/appearance-protection`, `/prepaid-oil-change-program`, `/5-in-1-protection-bundle` |
| Info | `/how-it-works`, `/claims`, `/faq` |
| Quote flow | `/get-started` (noindex) |

Earlier short URLs (`/tire-wheel`, `/plans`, …) permanently redirect. `*.vercel.app` hosts send `X-Robots-Tag: noindex` so only the real domain gets indexed.

## Before launch
- The get-started flow does not submit leads yet; it keeps the request in the visitor's browser. Connect it to the F&I lead destination and remove the "Prototype" note on the confirmation screen.
- Fill placeholders: non-Garber vehicle eligibility (FAQ), consent language (legal review), callback response time (confirmation screen).
- Connect GarberGuard.com in Vercel, then submit `https://garberguard.com/sitemap.xml` in Google Search Console.
