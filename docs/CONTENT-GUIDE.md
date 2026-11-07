# Content Guide: scroll text, lenses, tactics, Dojo Trial

All content is JSON in `data/`. Run `npm run validate` after every change. It must print `OK`.

## Golden rules

1. **Never type a Musashi quote.** Content refers to the book by **section ID** (`"3.4"`). The site renders the
   original Japanese from `data/sources/gorin-ja.json` and this project's English from `data/scrolls.en.json`.
2. **Never copy a modern translation or summary.** The Victor Harris (1974), Thomas Cleary, William Scott Wilson and
   other English translations, and commercial summaries (Bookey and the like), are under copyright. Use them only to
   check meaning. The validator holds hashed 8-word fingerprints of those texts (`data/guard/fingerprints.json`,
   built by `scripts/build-guard.mjs`; no text is stored) and rejects any content that shares an 8-word run.
   Check a draft file with `node scripts/guard-check.mjs <file>`.
3. **Ethics.** The book is about winning duels. This project applies it to work and life, and never advises lying,
   manipulation that harms people, harassment, retaliation, illegal surveillance or violence.

## Section IDs

`scroll.article`, following the order of the original articles (一 … 事):

| Scroll | IDs | Element |
|---|---|---|
| 序 Preface | `0.1` | shown at the start of the Ground scroll |
| 地之巻 Ground | `1.1`–`1.9` | 地 earth |
| 水之巻 Water | `2.1`–`2.38` | 水 water |
| 火之巻 Fire | `3.1`–`3.29` | 火 fire |
| 風之巻 Wind | `4.1`–`4.11` | 風 wind |
| 空之巻 Void | `5.1` | 空 void |

`x.1` is the scroll's own preface (序); the last section of Water, Fire and Wind is its afterword (後書).

## 1. English rendering: `data/scrolls.en.json`

One entry per section: `title_en` (≤ 10 words), `en` (array: **exactly one English paragraph per Japanese
paragraph**), `gist` (≤ 200 chars), `lesson` (≤ 280 chars, modern application) and `terms` (0–3 `{ja, romaji, en}`).
The English is written from the Japanese, in plain modern English and Musashi's first person, with no commentary.
Built from research batches by `scripts/merge-en.mjs`.

## 2. Scroll lens: `data/lenses/sN.json` (N = 1..5)

```json
{
  "n": 3,
  "essence": "Seize the initiative before the other side knows there is a contest.",
  "modern_lens": "2–3 sentences: what this scroll means for modern work and life.",
  "key_verse": "3.3",
  "principles": [
    { "name": "The Three Initiatives", "verses": ["3.3"], "gloss": "One sentence, modern meaning, ≤ 160 characters." }
  ]
}
```
- `essence` ≤ 90 characters, punchy, no quote marks. `principles`: 3–5; `name` ≤ 5 words; sections from this scroll
  (the Ground scroll may also use `0.1`). `key_verse` must be in this scroll.

## 3. Tactics: `data/tactics/sN.json` (array)

```json
{
  "slug": "pin-the-pillow",
  "title": "Pin the Pillow",
  "situation": "A colleague keeps launching side projects that pull your team off its roadmap.",
  "domain": "work",
  "tags": ["initiative", "roadmap", "colleague"],
  "chapter": 3,
  "principle": "Stop the move before it starts",
  "verses": ["3.4", "3.3"],
  "scene": "70–120 words, second person, present tense, vivid, ends with a one-line lesson.",
  "moves": [{ "title": "≤ 6 words", "detail": "25–60 words of concrete action." }],
  "script": { "label": "Slack message", "text": "40–110 words, ready to send, [placeholders]." },
  "backfire": "30–70 words: when NOT to use it, risks, the ethical line.",
  "signals": "15–40 words: how you know it is working.",
  "effort": "minutes | hours | days",
  "difficulty": 1,
  "featured": false
}
```
- `chapter` is the scroll number (1–5). `verses`: 1–3 section IDs, at least one from the tactic's own scroll.
- `slug` kebab-case, unique site-wide, ≤ 40 chars. `title` ≤ 6 words. `situation` ≤ 120 chars. `tags` 3–6.
- `domain`: `work`, `career`, `business`, `personal`, `family` or `self`. Mix per scroll: ≥ 40 % work/career,
  ≥ 25 % personal/family/self.
- Tone: Musashi as a calm master coach. Concrete and modern (1:1s, Slack, Jira, pitches, negotiations,
  gyms, practice routines, landlords, in-laws, group chats). Plain English, no clichés, no emojis. Use the
  book's own images (the pillow, the ford, the rat's head and ox's neck, the boulder body, rhythm, the gaze)
  as handles, explained in plain words.
- `featured: true` only for the three home-page cases.

## 4. Dojo Trial: `data/challenge/setN.json`

A bank of modern scenarios with 5 candidate moves each; players pick every move Musashi would make.

```json
{
  "id": "c-the-stalled-launch",
  "chapter": 3,
  "domain": "work",
  "difficulty": 2,
  "title": "The Stalled Launch",
  "scenario": "50–110 words, second person, present tense, concrete details.",
  "options": [{ "text": "≤ 22 words, imperative.", "correct": true, "why": "≤ 35 words: the principle." }],
  "verses": ["3.3"],
  "tactic": "pin-the-pillow",
  "lesson": "One-line takeaway, ≤ 140 characters."
}
```
- Exactly 5 options; 1–3 correct. Wrong options are plausible human reactions that break a Musashi principle
  (rigid stance, fixed gaze, losing rhythm, chasing speed, fighting on the opponent's terms, attachment to one
  favourite technique, panic). Never "all/none of the above".
- `verses` 1–2 IDs, at least one from the question's scroll. `tactic` optional, must exist.
