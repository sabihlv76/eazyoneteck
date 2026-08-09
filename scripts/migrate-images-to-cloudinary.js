// One-time migration: uploads every base64 product image to Cloudinary and
// replaces it with the hosted URL. Originals are written to a local backup
// file first, so the change can be rolled back.
//
// Run with: node scripts/migrate-images-to-cloudinary.js

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function loadEnvFile(fileName) {
  const fullPath = path.join(rootDir, fileName);
  if (!fs.existsSync(fullPath)) return;

  for (const line of fs.readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key && !(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

const {
  MONGODB_URI,
  CLOUDINARY_CLOUD_NAME: cloudName,
  CLOUDINARY_API_KEY: apiKey,
  CLOUDINARY_API_SECRET: apiSecret,
} = process.env;
const dbName = process.env.MONGODB_DB || process.env.MONGODB_DB_NAME;

if (!MONGODB_URI || !dbName || !cloudName || !apiKey || !apiSecret) {
  console.error('Missing MONGODB_* or CLOUDINARY_* variables in .env — aborting.');
  process.exit(1);
}

const UPLOAD_FOLDER = 'eazy1teck/products';
const isDataUri = (value) => typeof value === 'string' && value.startsWith('data:');

async function uploadDataUri(dataUri, label) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash('sha1')
    .update(`folder=${UPLOAD_FOLDER}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  const body = new URLSearchParams({
    file: dataUri,
    api_key: apiKey,
    timestamp: String(timestamp),
    folder: UPLOAD_FOLDER,
    signature,
  });

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`${label}: ${payload.error?.message || `upload failed (${response.status})`}`);
  }

  return payload.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
}

async function run() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const products = client.db(dbName).collection('products');

  const needsMigration = await products
    .find({
      $or: [{ image: { $regex: '^data:' } }, { extraImages: { $elemMatch: { $regex: '^data:' } } }],
    })
    .toArray();

  if (!needsMigration.length) {
    console.log('Nothing to migrate — no base64 images found.');
    await client.close();
    return;
  }

  const backupDir = path.join(rootDir, 'migration-backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `product-images-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(needsMigration, null, 2));
  console.log(`Backed up ${needsMigration.length} products to ${backupPath}`);

  let migrated = 0;
  const failures = [];

  for (const product of needsMigration) {
    try {
      const update = {};

      if (isDataUri(product.image)) {
        update.image = await uploadDataUri(product.image, `${product.id} main image`);
      }

      if (Array.isArray(product.extraImages) && product.extraImages.some(isDataUri)) {
        update.extraImages = await Promise.all(
          product.extraImages.map((image, index) =>
            isDataUri(image) ? uploadDataUri(image, `${product.id} extra image ${index + 1}`) : image
          )
        );
      }

      update.updatedAt = new Date();
      await products.updateOne({ _id: product._id }, { $set: update });
      migrated += 1;
      console.log(`[${migrated}/${needsMigration.length}] ${product.name || product.id}`);
    } catch (error) {
      failures.push({ id: product.id, error: error.message });
      console.error(`FAILED ${product.id}: ${error.message}`);
    }
  }

  console.log(`\nDone. Migrated ${migrated} of ${needsMigration.length} products.`);
  if (failures.length) {
    console.log('Failures (safe to re-run the script — already-migrated products are skipped):');
    for (const failure of failures) console.log(`  - ${failure.id}: ${failure.error}`);
  }

  await client.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
