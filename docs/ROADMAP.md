# Roadmap & open decisions

## Shipped (v0.1, static MVP)
- [x] The Book of Five Rings: 89 sections and 1,438 clauses of 原文 (public domain; transcription by 日本古典文学摘集, cross-checked against Suzuki Shigeo's e-text), with furigana
- [x] New English rendering, one paragraph per Japanese paragraph, written from the original, and the copy guard that rejects shared 8-word runs with copyrighted translations
- [x] Five scrolls (地 水 火 風 空): bilingual 原文 and English, furigana toggle, per-element design
- [x] 45 tactics, each with a scene, section citations, moves, a ready-to-send script, a backfire check and signals
- [x] Ink-wash scroll design: GSAP ScrollTrigger, Lenis, reduced-motion support
- [x] Dojo Trial: modes 稽古 6 · 試合 12 · 真剣 20 from the scenario bank; score = correct ÷ (correct + missed); ranks 入門 → 二天
- [x] Ask Musashi: 12 AI options (bring your own key, no key, on device, self-hosted), local retrieval, citation verification, manual-only mode
- [x] 30-second podcast: Kokoro on device plus Gemini/OpenAI/ElevenLabs keys, singing-bowl intro, MP3 download
- [x] Dojo journal preview (stored in the browser under `fr.` keys), relay with tests, Cloudflare Pages config
- [ ] First deployment: Cloudflare Pages from `main` (GitHub Pages intentionally not used)

## Decisions needed from the owner
1. **Licence for the code** (MIT or AGPL, for example) before accepting contributions. The English rendering needs its own statement.
2. **Brand and domain.** The working name is “Five Rings · Modern Field Manual” at `fiverings.pages.dev`. Run a trademark search on “Five Rings” before commercial use, and decide whether to add a custom domain (update `src/site.config.js` and `public/robots.txt`).
3. **Monetisation** (Cloudflare allows commercial use): supporter tier, tactic packs, sponsorships. Avoid ad scripts that weaken the CSP.

## Phase 2: community and scholarship (next)
- [ ] Accounts: GitHub and Google sign-in, public alias only
- [ ] Shared storage for the Dojo journal: Cloudflare D1 schema and `/api/posts`, `/api/ratings`, `/api/flags` Pages Functions, replacing browser storage
- [ ] Flag threshold auto-hide, admin queue, name masking on the server
- [ ] Turnstile on posting
- [ ] Manuscript-variant viewer: compare the 細川家本 line with other manuscript lines (for example the Suzuki e-text reading) section by section, with the differences marked
- [ ] Audio reading of the 原文, with per-section playback that follows the scroll
- [ ] Expert review of difficult passages, with the reviewer named on each page:
  - 2.32 喝咄 (kattō): the word and its meaning in the Water scroll
  - 3.16 まぶるる (mabururu), the word whose reading and sense are disputed
  - 4.7, the kemari passage in the Wind scroll

## Phase 3
- [ ] Full Japanese interface (日本語) alongside English, with the 原文 unchanged
- [ ] Daily 30-second episode page plus an RSS feed of generated episodes (visitor-generated, opt-in)
- [ ] Shareable answer cards (image), tactic packs (e.g. “New manager”, “Difficult family”)

## Known limits
- Free model names change often (OpenRouter `:free`, Gemini aliases); defaults are editable, and OpenRouter has a "Load free models" button.
- Kokoro first run downloads about 80 MB (q8, WASM). GPU mode is faster but larger.
- WebLLM needs WebGPU (desktop Chrome or Edge).
- The Gemini TTS model name is a preview name. It is editable in Settings.
- The English rendering is a single project draft: expert review (phase 2) will refine difficult passages.
