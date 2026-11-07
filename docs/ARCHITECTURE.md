# Architecture

```
            ┌──────────────────────── Cloudflare Pages (static, free) ───────────────────────┐
 Visitor ──▶│  HTML/CSS/JS · /scrolls/ · /tactics/ · Kokoro worker + WASM (lazy)             │
 browser    │  /api/relay  ← Pages Function: stateless, allowlisted, streams, never stores    │
            └────────────────────────────────────────────────────────────────────────────────┘
   │  key stays in browser storage (session by default)
   ├──▶ OpenRouter / Gemini / Groq / Mistral / Cerebras / GitHub Models   (direct; relay if CORS blocked)
   ├──▶ Anthropic (official SDK, direct browser access)                   (direct)
   ├──▶ NVIDIA NIM / Meta Muse ──▶ /api/relay ──▶ provider                 (relay)
   ├──▶ Puter.js (no key) · WebLLM (on device) · Custom (e.g. NAS Ollama)
   └──▶ TTS: Kokoro-82M on device (default) · Gemini / OpenAI / ElevenLabs with the visitor's key → MP3 (lamejs)
```

## Content model

All content is data, merged at build time by `src/lib/content.js`:

| File | Holds |
|---|---|
| `data/sources/gorin-ja.json` | The 原文: 6 scrolls (序 plus the five), 89 sections, 1,438 clauses. Furigana is stored as `ruby` pairs and rendered as `<ruby>`. Only the Japanese is used from the source. |
| `data/scrolls.en.json` | One entry per section: English paragraphs (one per Japanese paragraph), title, gist, lesson and terms. |
| `data/lenses/s1–s5.json` | The essence and modern lens of each scroll, its principles and key section. |
| `data/tactics/s1–s5.json` | The 45 tactics: scene, moves, script, backfire, signals, section citations. |
| `data/challenge/` | The Dojo Trial bank: scenarios with five candidate moves each. |
| `data/guard/fingerprints.json` | Truncated SHA-1 hashes of 8-word shingles from copyrighted texts. No text. |
| `data/community-demo.json` | Six demo entries for the Dojo journal preview. |

Section IDs are `scroll.article`: `0.1` 序 Preface, `1.1`–`1.9` Ground, `2.1`–`2.38` Water, `3.1`–`3.29` Fire,
`4.1`–`4.11` Wind, `5.1` Void. The site cites IDs only; the text always comes from the 原文 and the English file.

## Ask Musashi pipeline

1. **Retrieve (local):** MiniSearch over the 89 sections and 45 tactics → top tactics, their sections, keyword-matched sections, plus one anchor section per scroll.
2. **Prompt:** the system prompt sets the stance (win without fighting), the ethics limits, a strict six-section format, and *cite only listed IDs*. The situation is wrapped as data, not instructions.
3. **Stream** the answer and render it with a whitelist markdown renderer (escaped HTML).
4. **Verify:** each `[scroll.section]` is checked against the dataset; each quoted phrase is checked for an exact match against its section (English or 原文). The UI shows *Exact quote*, *Paraphrased* or *Not in the book*, with the full section text.
5. **Podcast:** the *Podcast Script* section fills the studio → TTS → a synthesized singing-bowl intro and outro → MP3 Blob → download.

## Dojo Trial

Modes 稽古 (6 bouts), 試合 (12) and 真剣 (20). Per question, the score is correct ÷ (correct + missed), where a
reckless pick counts as missed. The final percentage sets the rank (入門 0, 初伝 40, 目録 55, 免許 70, 皆伝 85, 二天 95).
Results are kept in the browser.

## Validation and the copy guard

- `npm run validate` (run first by `npm run build`) checks schema, section and tactic IDs, length limits, and the copy guard. It exits with an error and the build stops on any failure.
- `scripts/build-guard.mjs <texts…>` builds `data/guard/fingerprints.json` from copyrighted texts. It stores only hashes.
- `scripts/guard-check.mjs <file>` (`npm run guard -- <file>`) checks a draft before it is merged into the data.
- `scripts/merge-en.mjs <dir>` merges English research batches into `data/scrolls.en.json`; `scripts/build-source.mjs <cached html dir>` rebuilds the 原文 source from cached transcription pages.

## Security notes

- CSP in `public/_headers`: no inline scripts (Astro is set to emit external scripts only). Scripts may come only from self, Puter, esm.run (WebLLM) and jsDelivr.
- Relay: origin check, https-only allowlisted prefixes, no ports or credentials in URLs, path-traversal check, 100 KB body cap, forwarded-header allowlist, no redirects, no logging. Unit tests in `tests/relay.test.mjs`.
- Dojo journal preview: all user text is escaped on render. Emails, URLs and phone numbers are masked before saving. Browser keys use the prefix `fr.` (`fr.community.posts`, `fr.community.draft`, and so on).

## Phase 2: community backend (planned)

- Cloudflare D1 tables: `users(id, provider, alias, created)`, `posts(id, user_id, domain, title, situation, tactic, outcome, tactic_slug, verses, status, created)`, `ratings(post_id, user_id, stars)`, `flags(post_id, user_id, reason)`.
- Auth: GitHub and Google OAuth via a Pages Function (for example Better Auth with the D1 adapter). Only the alias is ever public.
- Moderation: automatically hidden after N flags; admin queue. Optional AI pre-screen using the poster's own key.
- `src/scripts/community.js` already isolates storage in `store`; swap it for `fetch('/api/posts')`. The `verses` field keeps its section-ID format (`3.4`).
