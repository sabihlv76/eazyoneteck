// Applies scripts/iphone-catalog.json to the products collection.
//
// Each entry becomes ONE listing with color + storage pickers (the `variants`
// field ProductDetail.jsx renders). Entries with an `id` are updated in place,
// entries without one are inserted, and any `deleteIds` are removed.
//
//   node scripts/apply-iphone-catalog.js            # dry run: prints the plan
//   node scripts/apply-iphone-catalog.js --write    # applies it (backs up first)
//
// To change prices later: edit the JSON, run with --write. Images stay as they are.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const INSTRUCTIONS = 'Pick your color and storage on this page, then add it to your cart or order on WhatsApp.';

function loadEnv() {
  const lines = readFileSync(join(root, '.env'), 'utf8').split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) env[match[1]] = match[2].trim();
  }
  return { ...env, ...process.env };
}

const fmt = (n) => Number(n).toLocaleString('en-US');
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function main() {
  const env = loadEnv();
  const catalog = JSON.parse(readFileSync(join(root, 'scripts', 'iphone-catalog.json'), 'utf8'));
  const client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  const col = client.db(env.MONGODB_DB || env.MONGODB_DB_NAME).collection('products');

  const all = await col.find({}).toArray();
  const byId = new Map(all.map((d) => [d.id, d]));
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = join(root, 'migration-backups');
  mkdirSync(backupDir, { recursive: true });
  writeFileSync(join(backupDir, `products-before-iphone-catalog-${stamp}.json`), JSON.stringify(all, null, 2));

  const now = new Date();
  const plan = [];
  let problems = 0;

  for (const m of catalog.models) {
    const existing = m.id ? byId.get(m.id) : null;
    if (m.id && !existing) { console.log('!! id not found:', m.id); problems++; continue; }
    const colors = m.keepColors ? existing?.variants?.colors || [] : m.colors;
    if (!colors.length || colors.some((c) => !c.image)) { console.log('!! missing color images for', m.name); problems++; }
    const storages = m.storages;
    const cheapest = Math.min(...storages.map((s) => s.price));
    const legacy = existing
      ? [...new Set([existing.image, ...(existing.extraImages || []), ...(existing.legacyImages || [])].filter(Boolean))]
      : [];

    const base = {
      name: m.name,
      category: 'Smartphones',
      subcategory: 'Apple',
      price: cheapest,
      oldPrice: null,
      size: `${storages.map((s) => s.label).join(' / ')} | ${colors.length} color${colors.length === 1 ? '' : 's'}`,
      color: colors.map((c) => c.name).join(' / '),
      image: colors[0]?.image || existing?.image || '',
      extraImages: m.keepColors ? existing?.extraImages || [] : [],
      legacyImages: legacy,
      instructions: INSTRUCTIONS,
      variants: { storages, colors },
      updatedAt: now,
    };
    if (!m.keepColors) {
      Object.assign(base, {
        description: m.description,
        benefits: m.benefits,
        ingredients: m.materials,
        videoUrl: existing?.videoUrl || '',
        videoCaption: existing?.videoCaption || '',
      });
    }

    if (existing) {
      plan.push({ op: 'update', id: existing.id, label: `${existing.name} @ ${fmt(existing.price)} -> ${m.name}: ${storages.map((s) => `${s.label} ${fmt(s.price)}`).join(', ')}`, $set: { ...base, badge: existing.badge || '' } });
    } else {
      const id = `${slugify(m.name.replace(/\(.*\)/, '').trim())}-${Date.now()}`;
      plan.push({ op: 'insert', id, label: `${m.name}: ${storages.map((s) => `${s.label} ${fmt(s.price)}`).join(', ')}`, doc: { id, ...base, badge: 'New Arrival', createdAt: now } });
    }
    for (const d of m.deleteIds || []) {
      if (byId.has(d)) plan.push({ op: 'delete', id: d, label: byId.get(d).name });
    }
  }

  for (const p of plan) console.log(`${p.op.toUpperCase().padEnd(6)} ${p.id}  ${p.label}`);
  console.log(`\n${plan.length} operations, ${problems} problems`);

  if (!WRITE) { console.log('Dry run — add --write to apply.'); await client.close(); return; }
  if (problems) { console.log('Refusing to write with problems.'); await client.close(); process.exit(1); }

  for (const p of plan) {
    if (p.op === 'update') await col.updateOne({ id: p.id }, { $set: p.$set });
    if (p.op === 'insert') await col.insertOne(p.doc);
    if (p.op === 'delete') await col.deleteOne({ id: p.id });
  }
  console.log('Applied.');
  await client.close();
}

main().catch((error) => { console.error(error); process.exit(1); });
