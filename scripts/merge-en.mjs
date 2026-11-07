// Merge research outputs (one JSON array per packet) into data/scrolls.en.json, checking that every
// section of the Japanese source has an English entry with one paragraph per Japanese paragraph.
// Usage: node scripts/merge-en.mjs <dir-with-packet-json>
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = process.argv[2];
const ja = JSON.parse(readFileSync(join(root, 'data/sources/gorin-ja.json'), 'utf8'));
const byId = new Map();
for (const f of readdirSync(dir).filter((f) => /^[A-Z]\.json$/.test(f)).sort())
  for (const s of JSON.parse(readFileSync(join(dir, f), 'utf8'))) byId.set(s.id, s);

const problems = [];
const out = { note: 'Original English rendering of 五輪書, written for this project from the public-domain Japanese. Paragraph k of "en" renders Japanese paragraph k.', sections: [] };
for (const sc of ja.scrolls) for (const sec of sc.sections) {
  const e = byId.get(sec.id);
  if (!e) { problems.push(`${sec.id}: missing`); continue; }
  if (!Array.isArray(e.en) || e.en.length !== sec.paragraphs.length) problems.push(`${sec.id}: ${e.en?.length} en paragraphs, need ${sec.paragraphs.length}`);
  out.sections.push({
    id: sec.id,
    title_en: (e.title_en || '').trim(),
    en: (e.en || []).map((p) => p.trim()),
    gist: (e.gist || '').trim(),
    lesson: (e.lesson || '').trim(),
    terms: (e.terms || []).slice(0, 3),
  });
}
writeFileSync(join(root, 'data/scrolls.en.json'), JSON.stringify(out, null, 1) + '\n');
console.log(problems.length ? problems.join('\n') + `\n${problems.length} problem(s)` : `OK: ${out.sections.length} sections`);
process.exit(problems.length ? 1 : 0);
