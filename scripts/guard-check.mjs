// Check one or more files (JSON or text) for 8-word runs shared with the copyrighted texts fingerprinted in
// data/guard/fingerprints.json. Usage: node scripts/guard-check.mjs <file> [...]
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { firstHit } from './guard-lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const set = new Set(JSON.parse(readFileSync(join(root, 'data/guard/fingerprints.json'), 'utf8')).hashes.split(' '));

// Walk JSON and report the path of each string with a hit.
function* strings(v, path = '') {
  if (typeof v === 'string') yield [path, v];
  else if (Array.isArray(v)) for (let i = 0; i < v.length; i++) yield* strings(v[i], `${path}[${i}]`);
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) yield* strings(x, path ? `${path}.${k}` : k);
}

let hits = 0;
for (const f of process.argv.slice(2)) {
  const raw = readFileSync(f, 'utf8');
  let data; try { data = JSON.parse(raw); } catch { data = raw; }
  for (const [p, s] of strings(data)) {
    const run = firstHit(s, set);
    if (run) { hits++; console.log(`HIT ${f} ${p}: "${run}"`); }
  }
}
console.log(hits ? `${hits} hit(s): rewrite those strings in your own words` : 'CLEAN');
process.exit(hits ? 1 : 0);
