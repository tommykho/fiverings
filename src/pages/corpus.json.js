// Static JSON consumed by Ask Musashi (retrieval + section-citation checks). Built at deploy time from
// src/lib/content.js: sections (id, EN, 原文), scroll names and the tactic library.
import { corpus } from '../lib/content.js';
export function GET() {
  return new Response(JSON.stringify(corpus()), { headers: { 'content-type': 'application/json; charset=utf-8' } });
}
