// Dojo Trial modes: practice, match, live blade.
export const MODES = [
  { id: 'keiko', ja: '稽古', en: 'Keiko · Practice', n: 6, blurb: 'Six quick bouts. A fast check of your instincts.' },
  { id: 'shiai', ja: '試合', en: 'Shiai · Match', n: 12, blurb: 'Twelve bouts across the five scrolls. The standard trial.' },
  { id: 'shinken', ja: '真剣', en: 'Shinken · Live Blade', n: 20, blurb: 'Twenty bouts, every scroll. No second chances.' },
];
export const modeById = (id) => MODES.find((m) => m.id === id) || MODES[1];
