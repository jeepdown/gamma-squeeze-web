// Builds public/ from the prototype sources (frontend/src) plus the production adapter (frontend/prod.js).
// The same public/ folder is the website and the Capacitor app's web bundle.
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'node:fs';

const ORDER = ['data','data2','snaps','core','live','books','pages','pages2','admin','markets','imgs','v8','earn','flows','oei','ux','wsj','main'];
const read = f => readFileSync(new URL(`../frontend/src/${f}`, import.meta.url), 'utf8');
const must = (s, find, repl, file) => { if (!s.includes(find)) throw new Error(`build: anchor not found in ${file}: ${find.slice(0, 60)}`); return s.replace(find, repl); };

const fix = {
  pages: s => must(s, 'function pageArticle(id){', 'function pageArticleBase(id){', 'pages.js'),
  pages2: s => {
    s = must(s, 'function pageMe(){', 'function pageMeBase(){', 'pages2.js');
    // Demo identity switcher and simulated referral are prototype-only.
    const a = s.indexOf('<section class="pad sec"><div class="box soft" style="border-style:dashed">');
    const b = s.indexOf('</div></div></section>` + footer();', a);
    if (a < 0 || b < 0) throw new Error('build: demo switcher block not found');
    s = s.slice(0, a) + '` + footer();' + s.slice(b + '</div></div></section>` + footer();'.length);
    return must(s, "    ${item('', '邀请好友，双方各得 1 个月 Pro', S.referral, 'invite')}\n", '', 'pages2.js');
  },
  admin: s => {
    s = must(s, "['settings','订阅设置']]", "['settings','订阅设置'],['publish','线上发布']]", 'admin.js');
    return must(s, 'settings:adminSettings}', 'settings:adminSettings, publish:adminPublish}', 'admin.js');
  },
};

let js = ORDER.map(f => (fix[f] || (x => x))(read(`${f}.js`))).join('\n');
js += '\n' + readFileSync(new URL('../frontend/prod.js', import.meta.url), 'utf8');

const head = read('head.html');
const meta = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Gamma Squeeze · Independent Macro &amp; Derivatives Research">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Gamma Squeeze">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="theme-color" content="#F4F5F8">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/icons/icon-180.png">
<link rel="icon" href="/icons/icon-192.png">
<style>@media (display-mode: standalone){body{padding-top:env(safe-area-inset-top)}}</style>
<script src="/vendor/supabase.js"></script>
`;
const html = `<!doctype html>\n<html lang="zh-CN">\n<head>\n${meta}${head}\n</head>\n<body>\n<div id="app"></div>\n<script>\n${js}\n</script>\n</body>\n</html>\n`;

rmSync(new URL('../public', import.meta.url), { recursive: true, force: true });
mkdirSync(new URL('../public', import.meta.url), { recursive: true });
writeFileSync(new URL('../public/index.html', import.meta.url), html);
cpSync(new URL('../frontend/static', import.meta.url), new URL('../public', import.meta.url), { recursive: true });
// Supabase client is served from our own origin so the site and the app bundle work without a CDN.
mkdirSync(new URL('../public/vendor', import.meta.url), { recursive: true });
cpSync(new URL('../node_modules/@supabase/supabase-js/dist/umd/supabase.js', import.meta.url), new URL('../public/vendor/supabase.js', import.meta.url));
console.log(`public/index.html ${(html.length / 1024).toFixed(0)} KB`);
