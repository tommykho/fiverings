// Build data/sources/gorin-ja.json from cached 原文 pages of 日本古典文学摘集 (koten.net/gorin/gen/NNN/).
// Usage: node scripts/build-source.mjs <dir-with-NNN.html>
// The 1645 text of 五輪書 is public domain. Only the original text (原文) is extracted; the site's
// modern-Japanese translation (現代語訳) and notes are NOT used. Editorial fixes the site marks are kept as shown.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/build-source.mjs <html-dir>'); process.exit(1); }

const SCROLLS = [
  { n: 0, key: 'preface', title_ja: '序', title_en: 'Preface', count: 1, base: 0 },
  { n: 1, key: 'ground', title_ja: '地之巻', title_en: 'The Ground Scroll', count: 9, base: 100 },
  { n: 2, key: 'water', title_ja: '水之巻', title_en: 'The Water Scroll', count: 38, base: 200 },
  { n: 3, key: 'fire', title_ja: '火之巻', title_en: 'The Fire Scroll', count: 29, base: 300 },
  { n: 4, key: 'wind', title_ja: '風之巻', title_en: 'The Wind Scroll', count: 11, base: 400 },
  { n: 5, key: 'void', title_ja: '空之巻', title_en: 'The Void Scroll', count: 1, base: 500 },
];

const decode = (s) => s.replace(/&ensp;|&emsp;|&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)));

// Convert one <li> body to { ja, ruby: [[base, reading]], notes: [] }
function clause(html) {
  const ruby = [], notes = [];
  let h = html.replace(/<a class="l"[^>]*>`<\/a>/g, '');
  h = h.replace(/<span class="y" title="([^"]*)">([^<]*)<\/span>/g, (_, r, b) => { ruby.push([decode(b), decode(r)]); return b; });
  h = h.replace(/<i class="(edited|presumed)" data-\1="([^"]*)" data-\1-note="([^"]*)">([^<]*)<\/i>/g, (_, kind, orig, note, shown) => {
    notes.push({ kind, shown: decode(shown), original: decode(orig), note: decode(note) }); return shown;
  });
  const ja = decode(h.replace(/<[^>]+>/g, '')).replace(/\s+/g, '').trim();
  return { ja, ...(ruby.length ? { ruby } : {}), ...(notes.length ? { notes } : {}) };
}

const out = {
  title_ja: '五輪書',
  author: '宮本武蔵 (Miyamoto Musashi), 1645',
  licence: 'Public domain (original text written 1643–1645).',
  transcription: '原文 as transcribed by 日本古典文学摘集 (https://www.koten.net/gorin/), based on the 細川家本 lineage with corrections it marks from 岩波文庫『五輪書』. Only the original text is used; that site\'s modern translation is not.',
  cross_check: 'e-text by Suzuki Shigeo (https://web575.art.coocan.jp/page023.html), a different manuscript lineage (岩戸山 for 巌殿山 etc.).',
  scrolls: [],
};

let total = 0, clauses = 0;
for (const s of SCROLLS) {
  const scroll = { n: s.n, key: s.key, title_ja: s.title_ja, title_en: s.title_en, sections: [] };
  for (let k = 1; k <= s.count; k++) {
    const file = join(dir, `${String(s.base + k).padStart(3, '0')}.html`);
    if (!existsSync(file)) throw new Error(`missing ${file}`);
    const t = readFileSync(file, 'utf8');
    const h1 = (t.match(/<h1>([\s\S]*?)<\/h1>/) || [])[1] || '';
    const title = decode(h1.replace(/<span class="y" title="[^"]*">([^<]*)<\/span>/g, '$1').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim()
      .replace(/^[一二三四五六七八九〇十]+ /, '').replace('（段）', s.title_ja);
    const main = (t.match(/<article class="original_main">([\s\S]*?)<\/article>/) || [])[1];
    if (!main) throw new Error(`no original_main in ${file}`);
    const paragraphs = [...main.matchAll(/<ol class="paragraph">([\s\S]*?)<\/ol>/g)].map((m) =>
      [...m[1].matchAll(/<li id="([^"]+)">([\s\S]*?)<\/li>/g)].map((li) => ({ ref: li[1], ...clause(li[2]) })));
    clauses += paragraphs.flat().length;
    scroll.sections.push({ id: `${s.n}.${k}`, no: k, title_ja: title, paragraphs });
    total++;
  }
  out.scrolls.push(scroll);
}

writeFileSync(join(root, 'data/sources/gorin-ja.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`OK: ${total} sections, ${clauses} clauses → data/sources/gorin-ja.json`);
