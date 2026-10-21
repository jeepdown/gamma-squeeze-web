// Prints supabase/seed.sql: the prototype's sample articles and premium datasets, marked as sample content.
// Usage: npm run seed, then paste supabase/seed.sql into the Supabase SQL editor (after schema.sql).
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const src = f => readFileSync(new URL(`../frontend/src/${f}`, import.meta.url), 'utf8');
// Extract `const NAME = {...};` or `[...]` by bracket matching (string-aware enough for these data literals).
const block = (text, name) => {
  const a = text.indexOf(`const ${name} =`); if (a < 0) throw new Error(`missing ${name}`);
  let i = text.indexOf('=', a) + 1; while (!'[{'.includes(text[i])) i++;
  let depth = 0, quote = null;
  for (; i < text.length; i++) {
    const c = text[i];
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = null; continue; }
    if (c === "'" || c === '"' || c === '`') quote = c;
    else if (c === '[' || c === '{') depth++;
    else if ((c === ']' || c === '}') && --depth === 0) return text.slice(a, i + 1) + ';';
  }
  throw new Error(`unterminated ${name}`);
};

const ctx = {}; vm.createContext(ctx);
vm.runInContext(src('data.js') + '\n' + src('data2.js') + '\n' + block(src('pages.js'), 'ART_SECTIONS') + '\n' + block(src('imgs.js'), 'ART_IMG') +
  '\n' + block(src('earn.js'), 'EARN') + '\n' + block(src('flows.js'), 'INSTS') + '\n' + block(src('flows.js'), 'CONGRESS') +
  '\nthis.out={ARTICLES, ART_SECTIONS, ART_META, ART_NOTES, ART_IMG, EARN, INSTS, CONGRESS};', ctx);
const { ARTICLES, ART_SECTIONS, ART_META, ART_NOTES, ART_IMG, EARN, INSTS, CONGRESS } = ctx.out;

const q = v => v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`;
const j = v => `${q(JSON.stringify(v))}::jsonb`;
const arr = a => `array[${a.map(q).join(',')}]::text[]`;
const lines = ['-- Sample content generated from the prototype (示例数据). Replace with real research before launch.', 'begin;'];
ARTICLES.forEach((a, i) => {
  const pub = new Date(Date.now() - i * 5 * 3600e3).toISOString();
  lines.push(`insert into public.articles (id,title,dek,cat,chan,syms,free,mins,img,body,secs,notes,meta,status,published_at) values (${[
    q(a.id), q(a.title), q(a.dek), q(a.cat), q(a.chan), arr(a.syms || []), a.free ? 'true' : 'false', a.mins || 5, q(ART_IMG[a.id] || null),
    j(a.body || []), j(ART_SECTIONS[a.id] || a.secs || []), j(ART_NOTES[a.id] || []), j(ART_META[a.id] || {}), q('published'), q(pub)].join(',')}) on conflict (id) do nothing;`);
});
for (const [kind, payload] of [['earn', EARN], ['insts', INSTS], ['congress', CONGRESS]])
  lines.push(`insert into public.datasets (kind,payload,source) values (${q(kind)},${j(payload)},${q('sample')}) on conflict (kind) do update set payload=excluded.payload, source=excluded.source, updated_at=now();`);
lines.push('commit;');
console.log(lines.join('\n'));
