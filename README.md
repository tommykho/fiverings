# Five Rings · Modern Field Manual 五輪書

*Musashi's strategy, for the duels you actually face.*

**Deploy targets** (not live until first deploy, see [docs/DEPLOY.md](docs/DEPLOY.md)): https://fiverings.pages.dev (Cloudflare Pages, from `main`)

A static website that turns Miyamoto Musashi's *Book of Five Rings* (五輪書, written 1643–1645) into practical tactics
for work, career, business, family and self. The original Japanese is public domain. The English is a new rendering
written for this project from that Japanese. It includes:

- **The five scrolls:** 地 Ground, 水 Water, 火 Fire, 風 Wind and 空 Void. Each scroll shows its 原文 (original Japanese, with a furigana toggle) beside the English, in its own element colour. The book has 89 numbered sections and 1,438 clauses.
- **Tactic library:** 45 tactics. Each has a scene, section citations, moves, a ready-to-send script, a backfire check and signs that it is working.
- **Dojo Trial:** a skill test in three modes (稽古 6, 試合 12, 真剣 20 bouts). Pick every move Musashi would make. Score = correct ÷ (correct + missed), and you earn a rank from 入門 to 二天.
- **Ask Musashi (AI):** describe your situation and get a plan. Every section citation is checked against the dataset: exact quotes, paraphrases and invented IDs are labelled.
- **30-second podcast:** the plan becomes a spoken script, voiced on your device (Kokoro-82M) or with your own TTS key, and downloaded as an MP3.
- **Dojo journal** (preview): write up a duel, rate others' entries, flag reckless ones. Phase 2 adds accounts and shared storage.

**Cost to the site owner: $0.** The site is static. AI and voice run on the visitor's device or on the visitor's own
provider key. The only server code is a small stateless CORS relay, which runs within Cloudflare's free quota.

**Sister project:** [Sun Tzu · Modern Field Manual](https://github.com/tommykho/suntze) applies *The Art of War* in the same way ([live site](https://tommykho.github.io/suntze/)).

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # validates content, then builds to dist/
npm run validate   # schema, section IDs, lengths and the copy guard
npm test           # relay unit tests
npm run guard -- <file>   # check a draft for copyrighted wording
```

Node 20+ is required.

## AI providers (bring your own key)

| Provider | Cost to visitor | Route |
|---|---|---|
| Puter.js | free, no key (Puter sign-in) | browser |
| WebLLM on-device | free, no key, about a 2 GB download | browser (WebGPU) |
| OpenRouter `:free` models | free key | browser |
| Google Gemini | free key | browser (relay fallback) |
| Groq · Mistral · Cerebras · GitHub Models | free keys | browser (relay fallback) |
| NVIDIA NIM | free key | relay (NVIDIA blocks browsers) |
| Anthropic Claude | paid key | browser (official SDK) |
| Meta Muse Spark | paid key (public preview) | relay |
| Custom OpenAI-compatible, e.g. Ollama on your NAS | free | browser |

Podcast voice: Kokoro-82M on the device (default, free) · Gemini TTS · OpenAI TTS · ElevenLabs (visitor's key).

## Project layout

```
data/sources/    gorin-ja.json: the 原文 (public domain), 89 sections, furigana as ruby
data/            scrolls.en.json (English rendering) · lenses/ · tactics/ · challenge/ (Dojo Trial bank)
                 guard/fingerprints.json (hashes only) · community-demo.json (dojo journal demo entries)
scripts/         validate-content.mjs · build-guard.mjs · guard-check.mjs · guard-lib.mjs · build-source.mjs · merge-en.mjs
src/pages/       /, /scrolls/, /scrolls/<ground|water|fire|wind|void>/, /tactics/, /tactics/<slug>/, /ask/, /trial/, /community/, /about/
src/scripts/     motion.js (GSAP + Lenis) · ink.js · challenge.js · community.js · field/* (AI providers, retrieval, prompt, TTS, worker)
src/lib/         content.js (build-time loader) · url.js (base-path links) · modes.js · ranks.js
server/          relay-core.js (portable) · node-relay.mjs (NAS / self-host)
functions/api/   relay.js (Cloudflare Pages Function) · api/relay.js (Vercel)
docs/            ARCHITECTURE · DEPLOY · ROADMAP · CONTENT-GUIDE
```

## Content rules

The site never types a Musashi passage by hand. Content refers to the book by section ID (for example `3.4`), and the
site renders the 原文 and this project's English from the data. Every English draft must pass the copy guard, which
rejects any 8-word run shared with a copyrighted translation or summary. See
[docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md), and run `npm run validate` after any edit.

## Deploy

Cloudflare Pages + GitHub, free and commercial use allowed. Steps: [docs/DEPLOY.md](docs/DEPLOY.md).

## Licences

Text: the Japanese original is public domain; the transcription is by 日本古典文学摘集. The English rendering is this
project's own work. Code: add your preferred licence before accepting contributions. Third-party credits are on the About page.
