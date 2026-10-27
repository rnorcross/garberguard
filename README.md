# GarberGuard.com

Site for Garber Guard, the vehicle protection (F&I) division of Garber Automotive Group.

- Static site: `index.html` plus images in `assets/`. No build step.
- Pages are hash routes: `#plans`, `#tire-wheel`, `#windshield`, `#key-remote`, `#touchscreen`, `#dent-repair`, `#rust-undercoat`, `#appearance`, `#oil-change`, `#combo`, `#how-it-works`, `#claims`, `#faq`, `#get-started`.
- No pricing is shown anywhere on the site.

## Before launch
- The get-started flow does not submit leads yet; it keeps the request in the visitor's browser. Connect it to the F&I lead destination.
- Fill placeholders: non-Garber vehicle eligibility (FAQ), consent language (legal review), callback response time (confirmation screen).

## Deploy
Import this repo in Vercel (Framework preset: Other, no build command, output directory `.`). Point GarberGuard.com at the project under Settings → Domains.
