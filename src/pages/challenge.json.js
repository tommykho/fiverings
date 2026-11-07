// Dojo Trial question bank: scroll info and verse excerpts resolved at build time.
import { getVerse, chapterOf, verseHref, excerpt, tactics } from '../lib/content.js';

const sets = import.meta.glob('../../data/challenge/set*.json', { eager: true, import: 'default' });
const tacticTitle = new Map(tactics.map((t) => [t.slug, t.title]));

export function GET() {
  const questions = Object.values(sets)
    .flat()
    .map((q) => {
      const ch = chapterOf(q.chapter);
      return {
        id: q.id,
        chapter: q.chapter,
        chapterTitle: ch.title_en,
        chapterJa: ch.title_ja,
        kanji: ch.el.kanji,
        key: ch.key,
        color: ch.el.color,
        domain: q.domain,
        difficulty: q.difficulty,
        title: q.title,
        scenario: q.scenario,
        options: q.options.map((o) => ({ text: o.text, correct: o.correct, why: o.why })),
        verses: q.verses
          .map((id) => {
            const v = getVerse(id);
            if (!v) return null;
            const ja = v.ja || '';
            return {
              id,
              label: id,
              title: v.title_en,
              en: excerpt(v.en, 260),
              ja: ja.length > 90 ? `${ja.slice(0, 90)}…` : ja,
              href: verseHref(id),
            };
          })
          .filter(Boolean),
        tactic: q.tactic && tacticTitle.has(q.tactic) ? { slug: q.tactic, title: tacticTitle.get(q.tactic) } : null,
        lesson: q.lesson,
      };
    })
    .sort((a, b) => a.chapter - b.chapter);
  return new Response(JSON.stringify({ v: 1, count: questions.length, questions }), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
