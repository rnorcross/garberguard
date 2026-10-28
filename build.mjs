// Builds the static site into dist/: one finished HTML file per URL, plus sitemap.xml and robots.txt.
// Run: node build.mjs   (Vercel runs this automatically; see vercel.json)
// SITE_URL sets the canonical domain (default https://garberguard.com).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const SITE = (process.env.SITE_URL || 'https://garberguard.com').replace(/\/+$/, '');
const OUT = 'dist';
const shell = fs.readFileSync('src/shell.html', 'utf8');
const siteCode = fs.readFileSync('src/site.js', 'utf8');

const G = vm.runInContext(
  siteCode + '\n;({P,ORDER,ALL,PATHS,FAQ,PHONE,TITLES,DESC,vHome,vPlans,vHow,vClaims,vFaq,vProduct,vNotFound,vStep1,ddPanelHTML})',
  vm.createContext({ console })
);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = p => SITE + (p === '/' ? '/' : p);
const ld = obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
const crumbs = list => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: list.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(p) })),
});
const faqLd = list => {
  const qs = list.filter(([, a]) => !a.trim().startsWith('['));
  return qs.length ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: qs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  } : null;
};
const org = {
  '@context': 'https://schema.org', '@type': 'Organization', name: 'Garber Guard', url: SITE + '/',
  logo: SITE + '/assets/logo-color.png',
  parentOrganization: { '@type': 'Organization', name: 'Garber Automotive Group', url: 'https://www.garberauto.com' },
  address: { '@type': 'PostalAddress', postOfficeBoxNumber: '18613', addressLocality: 'Charlotte', addressRegion: 'NC', postalCode: '28218', addressCountry: 'US' },
  contactPoint: [
    { '@type': 'ContactPoint', contactType: 'claims', telephone: '+1-877-884-7056', areaServed: 'US', availableLanguage: 'English' },
    { '@type': 'ContactPoint', contactType: 'roadside assistance', telephone: '+1-877-884-7056', areaServed: 'US', hoursAvailable: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], opens: '00:00', closes: '23:59' } },
    { '@type': 'ContactPoint', contactType: 'customer service', telephone: '+1-877-884-7056', areaServed: 'US', hoursAvailable: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '08:00', closes: '19:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '10:00', closes: '15:00' } ] },
  ],
};

// id, url, main html, title, description, nav key, json-ld, options
const pages = [];
const PLANS = ['Protection plans', G.PATHS.plans];
pages.push({ id: 'home', main: G.vHome(), nav: '', ld: [org, { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Garber Guard', url: SITE + '/' }], noCta: true });
pages.push({ id: 'plans', main: G.vPlans(), nav: 'plans', ld: [crumbs([['Home', '/'], PLANS]), {
  '@context': 'https://schema.org', '@type': 'ItemList', name: 'Garber Guard protection plans',
  itemListElement: G.ALL.map((id, i) => ({ '@type': 'ListItem', position: i + 1, name: G.P[id].seo, url: abs(G.PATHS[id]) })),
}] });
for (const id of G.ALL) {
  const p = G.P[id];
  pages.push({
    id, main: G.vProduct(id), nav: 'plans', dd: id,
    title: `${p.seo} | Garber Guard`,
    desc: `${p.sub} Optional coverage from Garber Automotive Group. Get a personalized quote.`,
    ld: [crumbs([['Home', '/'], PLANS, [p.seo, G.PATHS[id]]]), {
      '@context': 'https://schema.org', '@type': 'Service', name: p.seo, serviceType: 'Vehicle protection plan',
      description: p.sub, url: abs(G.PATHS[id]), areaServed: 'US',
      provider: { '@type': 'Organization', name: 'Garber Guard', url: SITE + '/' },
    }, faqLd(p.faq)].filter(Boolean),
  });
}
pages.push({ id: 'how-it-works', main: G.vHow(), nav: 'how-it-works', ld: [crumbs([['Home', '/'], ['How it works', G.PATHS['how-it-works']]])] });
pages.push({ id: 'claims', main: G.vClaims(), nav: 'claims', ld: [crumbs([['Home', '/'], ['Claims', G.PATHS.claims]])] });
pages.push({ id: 'faq', main: G.vFaq(), nav: 'faq', ld: [crumbs([['Home', '/'], ['FAQ', G.PATHS.faq]]), faqLd(G.FAQ)].filter(Boolean) });
pages.push({ id: 'get-started', main: G.vStep1(), flow: true, noindex: true, ld: [] });
pages.push({ id: '404', file: '404.html', main: G.vNotFound(), noindex: true, ld: [] });

function renderPage(pg) {
  const url = G.PATHS[pg.id] || '/';
  const title = pg.title || G.TITLES[pg.id];
  const desc = pg.desc || G.DESC[pg.id];
  let html = shell
    .replaceAll('{{TITLE}}', esc(title))
    .replaceAll('{{DESC}}', esc(desc))
    .replaceAll('{{CANONICAL}}', esc(abs(url)))
    .replaceAll('{{SITE}}', SITE)
    .replace('{{ROBOTS}}', pg.noindex ? '<meta name="robots" content="noindex, follow">\n' : '')
    .replace('{{JSONLD}}', pg.ld.map(ld).join('\n'))
    .replace('{{DDPANEL}}', () => G.ddPanelHTML(pg.dd || ''))
    .replace('{{MAIN}}', () => pg.main);
  if (pg.flow) html = html.replace(/<!--chrome-->[\s\S]*?<!--\/chrome-->/g, '');
  else html = html.replace(/<!--\/?chrome-->\n?/g, '');
  if (pg.noCta || pg.flow) html = html.replace(/<!--cta-->[\s\S]*?<!--\/cta-->/, '');
  else html = html.replace(/<!--\/?cta-->/g, '');
  if (pg.nav) html = html.replace(`data-nav="${pg.nav}"`, `data-nav="${pg.nav}" aria-current="page"`);
  if (html.includes('{{')) throw new Error('Unfilled placeholder on ' + pg.id);
  return html;
}

fs.rmSync(OUT, { recursive: true, force: true });
const copyDir = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) {
    const s = path.join(from, f), d = path.join(to, f);
    fs.statSync(s).isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
};
copyDir('assets', path.join(OUT, 'assets'));
fs.copyFileSync('favicon.ico', path.join(OUT, 'favicon.ico'));
fs.mkdirSync(path.join(OUT, 'js'), { recursive: true });
fs.copyFileSync('src/site.js', path.join(OUT, 'js/site.js'));
fs.copyFileSync('src/app.js', path.join(OUT, 'js/app.js'));

const today = new Date().toISOString().slice(0, 10);
const sitemap = [];
for (const pg of pages) {
  const url = G.PATHS[pg.id] || '/';
  const file = pg.file ? path.join(OUT, pg.file) : path.join(OUT, url, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, renderPage(pg));
  if (!pg.noindex) sitemap.push(`  <url><loc>${abs(url)}</loc><lastmod>${today}</lastmod></url>`);
}
fs.writeFileSync(path.join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Built ${pages.length} pages (${sitemap.length} in sitemap) for ${SITE}`);
