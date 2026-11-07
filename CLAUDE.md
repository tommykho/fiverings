# CLAUDE.md — Five Rings · Modern Field Manual (五輪書)

Static Astro site that turns Miyamoto Musashi's *Book of Five Rings* (1643–1645) into practical tactics for
work, career, business, family and self. Sister of `tommykho/suntze` (Sun Tzu) and `tommykho/hopbit`
(Atomic Habits); same stack, features and deploy model. Live test site: https://tommykho.github.io/fiverings/

## Commands

```bash
npm ci                 # Node 20+ (CI uses 22)
npm run dev            # http://localhost:4321
npm run validate       # MUST print OK: schema, section IDs, EN/JA alignment, copy guard
npm run build          # validate + astro build → dist/ (58 pages)
npm test               # relay unit tests (24)
npm run guard -- <f>   # check a draft file for copied wording (prints CLEAN or HITs)
```
Sub-path build (as GitHub Pages): `SITE_URL=https://tommykho.github.io BASE_PATH=/fiverings npm run build`.
`astro preview` ignores BASE_PATH unless it is set in the env; to test the sub-path, serve `dist/` mounted at
`/fiverings/` with a static server (e.g. symlink `x/fiverings → dist`, `python3 -m http.server` in `x`).

## Content model (data/)

| File | What | Who writes it |
|---|---|---|
| `sources/gorin-ja.json` | 原文, 89 sections, 1,438 clauses, furigana `ruby` pairs, editorial `notes` | `scripts/build-source.mjs` from cached koten.net HTML |
| `scrolls.en.json` | Project's own English, **one paragraph per Japanese paragraph**, + title_en, gist, lesson, terms | `scripts/merge-en.mjs` from research batches |
| `lenses/sN.json` | Per-scroll essence, modern_lens, key_verse, 3–5 principles | hand/agent |
| `tactics/sN.json` | 45 tactics (10/12/12/7/4) | hand/agent |
| `challenge/setN.json` | 30 Dojo Trial bouts (set1: scrolls 1–2, set2: 3–5) | hand/agent |
| `guard/fingerprints.json` | Truncated SHA-1 of 8-word shingles of copyrighted texts — **no text** | `scripts/build-guard.mjs` |
| `community-demo.json` | Demo dojo-journal entries | hand |

Rules and schemas: `docs/CONTENT-GUIDE.md` (the brief every content writer follows).

**Section IDs** = `scroll.article`: `0.1` Preface (rendered at the top of the Ground page) · Ground `1.1–1.9` ·
Water `2.1–2.38` · Fire `3.1–3.29` · Wind `4.1–4.11` · Void `5.1`. `x.1` = scroll 序; last of 2/3/4 = 後書.
In code, "chapter" = scroll number (1–5) and "verses" = sections (kept from the suntze fork). `scrollOf('0.1') = 1`.

## Copyright — non-negotiable

- The Japanese 原文 is public domain. Every English translation in circulation (Harris 1974 — the user's PDF —,
  Cleary, Wilson) and summaries (Bookey, blogs) are **copyrighted**: research/meaning-check only.
- Never commit PDFs, extracted translation text, or scratch files. Only hashes go into `data/guard/`.
- Never type Musashi quotes into content; cite section IDs. The site renders text from the JSON.
- The validator fails on any 8-word run shared with the fingerprinted texts. Rebuild the guard only from local
  copies kept outside the repo: `node scripts/build-guard.mjs <txt…>`.
- Harris dates the preface "1645"; Kan'ei 20 = **1643** (colophon is Shōhō 2 = 1645). Keep 1643–1645.

## Sources & provenance (for the About page / re-runs)

- Primary 原文: 日本古典文学摘集 https://www.koten.net/gorin/gen/NNN/ (NNN = 001, 101–109, 201–238, 301–329,
  401–411, 501). Each `<li id="gV-NNNN">` is a clause; `<span class="y" title=reading>` = furigana;
  `<i class="edited|presumed" data-…>` = marked corrections (keep the shown text). Fetch politely (1 s apart).
  The parser must decode decimal **and hex** entities (`&#x3191;` = kanbun レ mark).
- Cross-check: Suzuki Shigeo e-text https://web575.art.coocan.jp/page023.html (Shift-JIS; different manuscript
  line, e.g. 岩戸山 vs 巌殿山). Manuscript reference: NDL 1071527 scan on Wikimedia Commons.
- Not available: Aozora Bunko has no 五輪書 (only Yoshikawa's novel); ja.wikisource has none either.

## Site architecture

- `src/lib/content.js` — single loader: `chapters` (5 scrolls with `key`, `el` {kanji, romaji, name, color}),
  `getVerse`, `verseHref` (→ `/scrolls/<key>/#s3-4`), `scrollHref`, `rubyHtml`, `excerpt`, `ELEMENTS`,
  `DOMAINS` (fields `label`, `ja` — no `zh`), `corpus()` for the AI.
- Pages: `/`, `/scrolls/`, `/scrolls/[key]/` (EN / 原文 / ふりがな toggles, contents, per-section gist, lesson,
  terms, notes, "Applied in"), `/tactics/`, `/tactics/[slug]/`, `/ask/` (Ask Musashi), `/trial/` (Dojo Trial),
  `/community/`, `/about/`, `/corpus.json`, `/challenge.json`.
- Design: lacquer/washi dark; per-scroll accent via `data-el="ground|water|fire|wind|void"` → `--el`
  (`--chi --sui --ka --fu --ku`). Fonts: Cormorant/EB Garamond + Shippori Mincho (`--f-ja`) + Yuji Syuku
  (`--f-brush`). Brand mark = `Enso.astro`. `--f-zh` is an alias of `--f-ja` for legacy CSS.
- Ranks (`src/lib/ranks.js`): 入門 → 初伝 → 目録 → 免許 → 皆伝 → 二天; unranked = 浪人. Modes: 稽古 6 / 試合 12 / 真剣 20.
- localStorage keys use prefix `fr.` (never `sz.` from suntze).
- AI citation regex: `/\[(\d)\.(\d{1,2})\]/`; quotes verified against `en` or `ja` (whitespace-stripped).

## Deploy (GitHub Pages)

- Default branch `main`; workflow `.github/workflows/pages.yml` builds with `BASE_PATH=/fiverings` and deploys
  `dist/` via official Pages actions.
- **Settings → Pages → Source must be "GitHub Actions".** "Deploy from a branch" runs Jekyll on raw Astro
  source → failed build → 404. This was the cause of the first 404.
- AI relay: reuse `https://suntze-relay.vercel.app/api/relay` (its `ALLOWED_ORIGINS=https://tommykho.github.io`
  covers this site). Never point `PUBLIC_RELAY_URL` at an unregistered Vercel name — someone could claim it and
  receive visitors' API keys.
- Cloudflare Pages (`wrangler.toml` name `fiverings`) remains the production option; see `docs/DEPLOY.md`.

## How this was built (repeatable workflow)

1. **/95p first**: the user prefers clarifying questions to 95% confidence; if they answer only part, proceed on
   stated recommended defaults and say so.
2. **Fork, don't rebuild**: copy the sister repo (minus `.git`, `node_modules`, `dist`, `data/`), then adapt.
   Clone sister repos read-only under `/home/user/tommykho/<repo>`.
3. **Haiku agents** (the user asks for them explicitly): use `model: "haiku"`, run in parallel in the background,
   one bounded packet each (~28 KB): Japanese paragraphs + reference translation "for meaning only". Each agent
   must run `guard-check` and the validator itself and report uncertain passages.
4. **Strict file ownership** when agents write code: list the files each agent owns, give a written contract of
   `content.js` exports/field names, and keep shared files (`content.js`, `Base.astro`, CSS, validator) for the
   integrator. Create stub data files (e.g. a provisional `scrolls.en.json`, empty `data/lenses/`) **before**
   agents run the validator, or it crashes.
5. Integrator review after agents: grep for stale names (`zh`, `ZH_NUMERALS`, `/chapters/`, `/field/`, `sz.`,
   "Sun Tzu", "General", "Chapter N" in content), then build, then Playwright screenshots (desktop 1400 +
   mobile 390, reduced motion) checking page errors and horizontal overflow.

## Pitfalls already hit (don't repeat)

- Misreading terse instructions: "then stop creating a GitHub page" was not a request to remove Pages. When an
  instruction would delete working infrastructure, confirm first.
- Sticky reading toolbar covers anchored sections: `scroll-margin-top: 240px` desktop; on ≤640px the toolbar is
  `position: static`.
- Pluralise counts (`1 section`, the Void scroll has one).
- Agent-written lenses said "Chapter 3…" — content must say "the Fire scroll".
- A leftover preview server can hold a port; check `ss -ltnp` before blaming the build.
- Network in the cloud env is allowlisted; archive.org, koten.net, Wikimedia, web575 etc. had to be added to the
  environment ("AI Studio") before fetching. GitHub raw and Hugging Face MCP were reachable by default.

## Open follow-ups

- Expert review of loose renderings: 2.32 喝咄, 3.13, 3.16 まぶるる, 4.7 (kemari/juggling passage), colophon names.
- Phase 2 (see `docs/ROADMAP.md`): Community accounts/shared storage, manuscript-variant viewer, audio 原文.

## User preferences

Concise, direct, tight bullets; actionable answers; no fluff. Commit and push only to the designated branch unless
told otherwise (the user asked for `main` to exist; pushes to `main` deploy the site). Commits end with the
Co-Authored-By / Claude-Session lines from the session's attribution reminder.
