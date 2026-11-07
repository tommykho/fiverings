// Validate content JSON: source integrity, English/Japanese paragraph alignment, section IDs, schema,
// lengths, and the copy guard (no 8-word run shared with copyrighted translations or summaries).
// Prints OK or a list of problems. Optional filter: node scripts/validate-content.mjs tactics|lenses|en|challenge
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { firstHit } from './guard-lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const j = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const ja = j('data/sources/gorin-ja.json');
const en = j('data/scrolls.en.json');
const guard = new Set(j('data/guard/fingerprints.json').hashes.split(' '));
const errors = [], warns = [];
const words = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length;
const only = process.argv[2];
const files = (dir, re = /^s\d\.json$/) => (existsSync(join(root, dir)) ? readdirSync(join(root, dir)).filter((f) => re.test(f)).sort() : []);

// ---------- source + section IDs ----------
const jaSecs = ja.scrolls.flatMap((s) => s.sections);
const ids = new Set(jaSecs.map((s) => s.id));
const scrollOf = (id) => (id === '0.1' ? 1 : Number(id.split('.')[0])); // the preface opens the Ground scroll
if (jaSecs.length !== 89) errors.push(`source: ${jaSecs.length} sections, expected 89`);
for (const s of jaSecs) if (!s.paragraphs.length || s.paragraphs.some((p) => !p.length || p.some((c) => !c.ja))) errors.push(`source ${s.id}: empty paragraph or clause`);

// Copy guard over any string in a value.
function* strings(v, path) {
  if (typeof v === 'string') yield [path, v];
  else if (Array.isArray(v)) for (let i = 0; i < v.length; i++) yield* strings(v[i], `${path}[${i}]`);
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) yield* strings(x, `${path}.${k}`);
}
const guardCheck = (v, at) => { for (const [p, s] of strings(v, at)) { const run = firstHit(s, guard); if (run) errors.push(`COPY ${p}: shares "${run}" with a copyrighted text — rewrite in your own words`); } };

// ---------- English rendering ----------
if (!only || only === 'en') {
  const enById = new Map(en.sections.map((s) => [s.id, s]));
  for (const s of jaSecs) {
    const e = enById.get(s.id); const at = `en ${s.id}`;
    if (!e) { errors.push(`${at}: missing`); continue; }
    if (e.en.length !== s.paragraphs.length) errors.push(`${at}: ${e.en.length} paragraphs, Japanese has ${s.paragraphs.length}`);
    if (e.en.some((p) => !p || p.length < 8)) errors.push(`${at}: empty paragraph`);
    if (!e.title_en || words(e.title_en) > 10) errors.push(`${at}: title_en missing or > 10 words`);
    if (!e.gist || e.gist.length > 200) errors.push(`${at}: gist missing or > 200 chars`);
    if (!e.lesson || e.lesson.length > 280) errors.push(`${at}: lesson missing or > 280 chars`);
    // Paragraph length ratio check: English should be roughly proportional to the Japanese.
    s.paragraphs.forEach((p, i) => {
      const jl = p.map((c) => c.ja).join('').length, el = (e.en[i] || '').length;
      if (jl > 40 && (el < jl * 0.8 || el > jl * 6)) warns.push(`${at} ¶${i + 1}: English ${el} chars vs Japanese ${jl} — check completeness`);
    });
    guardCheck(e, at);
  }
  for (const e of en.sections) if (!ids.has(e.id)) errors.push(`en ${e.id}: unknown section`);
}

// ---------- scroll lenses ----------
if (!only || only === 'lenses') for (const f of files('data/lenses')) {
  const c = j(`data/lenses/${f}`); const at = `lenses/${f}`;
  if (`s${c.n}.json` !== f) errors.push(`${at}: n mismatch`);
  if (!c.essence || c.essence.length > 90) errors.push(`${at}: essence missing or > 90 chars`);
  if (!c.modern_lens) errors.push(`${at}: modern_lens missing`);
  if (!ids.has(c.key_verse) || scrollOf(c.key_verse) !== c.n) errors.push(`${at}: key_verse ${c.key_verse} unknown or not in this scroll`);
  if (!Array.isArray(c.principles) || c.principles.length < 3 || c.principles.length > 5) errors.push(`${at}: principles must be 3–5`);
  for (const p of c.principles || []) {
    for (const v of p.verses || []) if (!ids.has(v)) errors.push(`${at}: principle "${p.name}" section ${v} unknown`);
    if ((p.gloss || '').length > 170) warns.push(`${at}: gloss > 170 chars (${p.name})`);
  }
  guardCheck(c, at);
}

// ---------- tactics ----------
const DOMAINS = ['work', 'career', 'business', 'personal', 'family', 'self'];
const slugs = new Map();
if (!only || only === 'tactics') for (const f of files('data/tactics')) {
  const arr = j(`data/tactics/${f}`);
  if (!Array.isArray(arr)) { errors.push(`tactics/${f}: not an array`); continue; }
  for (const t of arr) {
    const at = `tactics/${f}:${t.slug}`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.slug || '') || t.slug.length > 40) errors.push(`${at}: bad slug`);
    if (slugs.has(t.slug)) errors.push(`${at}: duplicate slug (also in ${slugs.get(t.slug)})`); else slugs.set(t.slug, f);
    if (!t.title || words(t.title) > 6) errors.push(`${at}: title missing or > 6 words`);
    if (!t.situation || t.situation.length > 140) errors.push(`${at}: situation missing or > 140 chars`);
    if (!DOMAINS.includes(t.domain)) errors.push(`${at}: domain "${t.domain}" invalid`);
    if (!Array.isArray(t.tags) || t.tags.length < 3 || t.tags.length > 6) errors.push(`${at}: tags must be 3–6`);
    if (`s${t.chapter}.json` !== f) errors.push(`${at}: scroll ${t.chapter} does not match file`);
    if (!Array.isArray(t.verses) || t.verses.length < 1 || t.verses.length > 3) errors.push(`${at}: sections must be 1–3`);
    for (const v of t.verses || []) if (!ids.has(v)) errors.push(`${at}: section ${v} unknown`);
    if (!(t.verses || []).some((v) => scrollOf(v) === t.chapter)) errors.push(`${at}: needs a section from its own scroll`);
    const sw = words(t.scene); if (sw < 55 || sw > 150) warns.push(`${at}: scene ${sw} words`);
    if (!Array.isArray(t.moves) || t.moves.length < 3 || t.moves.length > 5) errors.push(`${at}: moves must be 3–5`);
    for (const m of t.moves || []) { if (!m.title || !m.detail) errors.push(`${at}: move missing title/detail`); else if (words(m.detail) > 75) warns.push(`${at}: move detail ${words(m.detail)} words`); }
    if (!t.script || !t.script.label || !t.script.text) errors.push(`${at}: script missing`);
    if (!t.backfire) errors.push(`${at}: backfire missing`);
    if (!t.signals) errors.push(`${at}: signals missing`);
    if (!['minutes', 'hours', 'days'].includes(t.effort)) errors.push(`${at}: effort invalid`);
    if (![1, 2, 3].includes(t.difficulty)) errors.push(`${at}: difficulty invalid`);
    if (/["“”]/.test(t.title)) warns.push(`${at}: quotes in title`);
    guardCheck(t, at);
  }
}

// ---------- Dojo Trial questions ----------
const tacticSlugs = new Set(files('data/tactics').flatMap((f) => j(`data/tactics/${f}`).map((t) => t.slug)));
const qids = new Map();
if (!only || only === 'challenge') for (const f of files('data/challenge', /^set\d+\.json$/)) {
  let arr;
  try { arr = j(`data/challenge/${f}`); } catch (e) { errors.push(`challenge/${f}: invalid JSON (${e.message})`); continue; }
  if (!Array.isArray(arr)) { errors.push(`challenge/${f}: not an array`); continue; }
  for (const q of arr) {
    const at = `challenge/${f}:${q.id}`;
    if (!/^c-[a-z0-9]+(-[a-z0-9]+)*$/.test(q.id || '') || q.id.length > 40) errors.push(`${at}: bad id`);
    if (qids.has(q.id)) errors.push(`${at}: duplicate id (also in ${qids.get(q.id)})`); else qids.set(q.id, f);
    if (!Number.isInteger(q.chapter) || q.chapter < 1 || q.chapter > 5) errors.push(`${at}: scroll invalid`);
    if (!DOMAINS.includes(q.domain)) errors.push(`${at}: domain "${q.domain}" invalid`);
    if (![1, 2, 3].includes(q.difficulty)) errors.push(`${at}: difficulty invalid`);
    if (!q.title || words(q.title) > 6) errors.push(`${at}: title missing or > 6 words`);
    const sw = words(q.scenario); if (sw < 40 || sw > 130) errors.push(`${at}: scenario ${sw} words (40–130)`);
    if (!Array.isArray(q.options) || q.options.length !== 5) { errors.push(`${at}: needs exactly 5 options`); continue; }
    const nCorrect = q.options.filter((o) => o.correct === true).length;
    if (nCorrect < 1 || nCorrect > 3) errors.push(`${at}: ${nCorrect} correct options (need 1–3)`);
    for (const o of q.options) {
      if (!o.text || typeof o.correct !== 'boolean' || !o.why) errors.push(`${at}: option missing text/correct/why`);
      else {
        if (words(o.text) > 26) warns.push(`${at}: option text ${words(o.text)} words`);
        if (words(o.why) > 45) warns.push(`${at}: why ${words(o.why)} words`);
        if (/all of the above|none of the above/i.test(o.text)) errors.push(`${at}: "all/none of the above" not allowed`);
      }
    }
    if (!Array.isArray(q.verses) || q.verses.length < 1 || q.verses.length > 2) errors.push(`${at}: sections must be 1–2`);
    for (const v of q.verses || []) if (!ids.has(v)) errors.push(`${at}: section ${v} unknown`);
    if (!(q.verses || []).some((v) => scrollOf(v) === q.chapter)) errors.push(`${at}: needs a section from its own scroll`);
    if (q.tactic && !tacticSlugs.has(q.tactic)) errors.push(`${at}: tactic "${q.tactic}" unknown`);
    if (!q.lesson || q.lesson.length > 160) errors.push(`${at}: lesson missing or > 160 chars`);
    guardCheck(q, at);
  }
}

for (const w of warns) console.log('warn  ' + w);
for (const e of errors) console.log('ERROR ' + e);
console.log(errors.length ? `${errors.length} error(s)` : 'OK');
process.exit(errors.length ? 1 : 0);
