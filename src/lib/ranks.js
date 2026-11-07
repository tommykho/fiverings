// The licence ladder of a classical Japanese sword school (入門 → 皆伝). Used for two things:
//  1. AI advisors (Ask Musashi): an editorial estimate of model strength.
//  2. Players (Dojo Trial): the rank earned from the final score.
export const RANKS = [
  { id: 'nyumon', ja: '入門', en: 'Nyūmon · Entered the Gate', min: 0, blurb: 'Through the dojo gate: willing and quick, best for simple bouts.' },
  { id: 'shoden', ja: '初伝', en: 'Shoden · First Licence', min: 40, blurb: 'Knows the basic forms: solid on everyday duels, light on nuance.' },
  { id: 'mokuroku', ja: '目録', en: 'Mokuroku · Catalogue Licence', min: 55, blurb: 'Holds the school catalogue: reliable plans, good reading of people.' },
  { id: 'menkyo', ja: '免許', en: 'Menkyo · Full Licence', min: 70, blurb: 'Licensed to teach: strong judgment across work and family duels.' },
  { id: 'kaiden', ja: '皆伝', en: 'Kaiden · Complete Transmission', min: 85, blurb: 'Has received the whole teaching: deep strategy, subtle and precise.' },
  { id: 'niten', ja: '二天', en: 'Niten · Two Heavens', min: 95, blurb: 'Musashi’s own name for his school: the sharpest counsel available.' },
];
export const UNRANKED = { id: 'ronin', ja: '浪人', en: 'Rōnin', level: 0, blurb: 'A self-hosted or unknown model: rank not assessed.' };
export const rankById = (id) => RANKS.find((r) => r.id === id) || UNRANKED;
export const rankLevel = (r) => (r.id === 'ronin' ? 0 : RANKS.indexOf(r) + 1);

/** Player rank from a 0–100 score. */
export const rankForScore = (pct) => [...RANKS].reverse().find((r) => pct >= r.min) || RANKS[0];

/** Editorial rank of an AI provider + model (ordered rules: first match wins). */
const MODEL_RULES = [
  [/opus|fable|mythos/i, 'niten'],
  [/sonnet|muse-spark|gemini-[\d.]+-pro|gemini-pro|gpt-5(?!-nano|-mini)|gpt-4\.1(?!-)|o3\b/i, 'kaiden'],
  [/haiku|deepseek-(r1|v3|chat)|qwen3-235|gpt-oss-120b|gemini-flash(?!-lite)|gemini-[\d.]+-flash(?!-lite)|nemotron-super|gpt-4\.1-mini|mistral-medium/i, 'menkyo'],
  [/70b|72b|llama-3\.3|qwen2\.5-72|gemma-3-27b|gpt-oss-20b|mistral-small|qwen-3-32b/i, 'mokuroku'],
  [/flash-lite|8b|nemo|mini|nano|gemma|3b|1b|phi/i, 'shoden'],
];
export function generalRank(providerId, model = '') {
  if (providerId === 'puter' && !model) return rankById('nyumon'); // Puter's default model
  if (providerId === 'webllm') return rankById('nyumon'); // small on-device models
  for (const [re, id] of MODEL_RULES) if (re.test(model)) return rankById(id);
  if (providerId === 'custom') return UNRANKED;
  return rankById('shoden');
}

export const stars = (r) => {
  const lvl = rankLevel(r);
  return lvl ? '★'.repeat(lvl) + '☆'.repeat(6 - lvl) : '—';
};
