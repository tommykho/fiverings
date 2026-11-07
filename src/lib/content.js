// Build-time content loader. Merges the original 五輪書 (public domain), this project's English rendering,
// the scroll lenses and the tactic library. Quotes are never typed by hand: every passage on the site is
// rendered from data/sources/gorin-ja.json + data/scrolls.en.json and cited by section ID (e.g. 3.4).
import ja from '../../data/sources/gorin-ja.json';
import en from '../../data/scrolls.en.json';
import { u } from './url.js';

const lensFiles = import.meta.glob('../../data/lenses/s*.json', { eager: true, import: 'default' });
const tacticFiles = import.meta.glob('../../data/tactics/s*.json', { eager: true, import: 'default' });
const lensByN = new Map(Object.values(lensFiles).map((l) => [l.n, l]));
const enById = new Map(en.sections.map((s) => [s.id, s]));

// The five scrolls (五輪 = five rings / five elements). Colours drive the per-scroll accent.
export const ELEMENTS = {
  1: { key: 'ground', kanji: '地', romaji: 'Chi', name: 'Ground', color: '#c29a5b', blurb: 'Know the whole terrain' },
  2: { key: 'water', kanji: '水', romaji: 'Sui', name: 'Water', color: '#5b93c7', blurb: 'Adapt, flow, stay calm' },
  3: { key: 'fire', kanji: '火', romaji: 'Ka', name: 'Fire', color: '#e2583a', blurb: 'Take the initiative' },
  4: { key: 'wind', kanji: '風', romaji: 'Fū', name: 'Wind', color: '#8fb0a0', blurb: 'Study other schools' },
  5: { key: 'void', kanji: '空', romaji: 'Kū', name: 'Void', color: '#d8d2c4', blurb: 'Act from a clear, empty mind' },
};

export const DOMAINS = {
  work: { label: 'Work', ja: '仕事' },
  career: { label: 'Career', ja: '立身' },
  business: { label: 'Business', ja: '商い' },
  personal: { label: 'Personal', ja: '人間関係' },
  family: { label: 'Family', ja: '家族' },
  self: { label: 'Self', ja: '修身' },
};

export const tactics = Object.values(tacticFiles)
  .flat()
  .sort((a, b) => a.chapter - b.chapter || Number(!!b.featured) - Number(!!a.featured));

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** HTML for one Japanese clause with furigana as <ruby>. Ruby pairs are in document order. */
export function rubyHtml(c) {
  let s = esc(c.ja), at = 0;
  for (const [b, r] of c.ruby || []) {
    const eb = esc(b), i = s.indexOf(eb, at);
    if (i < 0) continue;
    const tag = `<ruby>${eb}<rt>${esc(r)}</rt></ruby>`;
    s = s.slice(0, i) + tag + s.slice(i + eb.length);
    at = i + tag.length;
  }
  return s;
}

function section(sec, n) {
  const e = enById.get(sec.id) || { en: [], title_en: '', gist: '', lesson: '', terms: [] };
  const paragraphs = sec.paragraphs.map((clauses, i) => ({
    ja: clauses.map((c) => c.ja).join(''),
    html: clauses.map(rubyHtml).join(''),
    en: e.en[i] || '',
    notes: clauses.flatMap((c) => c.notes || []),
  }));
  return {
    id: sec.id,
    ch: n,
    label: sec.id === '0.1' ? '序' : sec.id,
    title_ja: sec.title_ja,
    title_en: e.title_en,
    gist: e.gist,
    lesson: e.lesson,
    terms: e.terms || [],
    paragraphs,
    ja: paragraphs.map((p) => p.ja).join('\n'),
    en: paragraphs.map((p) => p.en).join('\n\n'),
  };
}

const preface = ja.scrolls.find((s) => s.n === 0);

export const chapters = ja.scrolls
  .filter((s) => s.n >= 1)
  .map((s) => {
    const el = ELEMENTS[s.n];
    const lens = lensByN.get(s.n) || {};
    // The preface (序) opens the Ground scroll, as in the original manuscript.
    const secs = [...(s.n === 1 ? preface.sections : []), ...s.sections].map((x) => section(x, s.n));
    return {
      n: s.n,
      key: el.key,
      el,
      roman: el.kanji,
      title_en: s.title_en,
      title_ja: s.title_ja,
      essence: lens.essence || '',
      modern_lens: lens.modern_lens || '',
      key_verse: lens.key_verse || `${s.n}.1`,
      principles: lens.principles || [],
      verses: secs,
      tactics: tactics.filter((t) => t.chapter === s.n),
    };
  });

export const verseMap = new Map(chapters.flatMap((c) => c.verses.map((v) => [v.id, v])));
export const getVerse = (id) => verseMap.get(id);
export const chapterOf = (n) => chapters[n - 1];
export const scrollHref = (n) => u(`/scrolls/${ELEMENTS[n].key}/`);
export const verseHref = (id) => {
  const v = verseMap.get(id);
  return `${scrollHref(v ? v.ch : 1)}#s${id.replace('.', '-')}`;
};
export const verseCount = verseMap.size;

/** A short, sentence-bounded excerpt of a section's English for cards and quotes. */
export function excerpt(text, max = 220) {
  if (!text || text.length <= max) return text || '';
  const cut = text.slice(0, max);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
  return (stop > max * 0.5 ? cut.slice(0, stop + 1) : cut.replace(/\s+\S*$/, '')) + ' …';
}

export function relatedTactics(t, limit = 3) {
  const score = (o) => (o.domain === t.domain ? 2 : 0) + (o.chapter === t.chapter ? 1 : 0) + o.tags.filter((x) => t.tags.includes(x)).length;
  return tactics
    .filter((o) => o.slug !== t.slug)
    .map((o) => [score(o), o])
    .sort((a, b) => b[0] - a[0])
    .slice(0, limit)
    .map(([, o]) => o);
}

export const featured = tactics.filter((t) => t.featured);

// Compact corpus shipped to the browser for retrieval and citation checking.
export function corpus() {
  return {
    v: 1,
    chapters: chapters.map((c) => ({ n: c.n, en: c.title_en, ja: c.title_ja, el: c.el.name, essence: c.essence })),
    verses: chapters.flatMap((c) => c.verses.map((v) => ({ id: v.id, t: v.title_en, tj: v.title_ja, g: v.gist, en: v.en, ja: v.ja }))),
    tactics: tactics.map((t) => ({
      slug: t.slug,
      title: t.title,
      situation: t.situation,
      domain: t.domain,
      tags: t.tags,
      chapter: t.chapter,
      principle: t.principle,
      verses: t.verses,
      moves: t.moves.map((m) => m.title),
      scene: t.scene,
      script: t.script,
      backfire: t.backfire,
    })),
  };
}
