import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';
import { products } from '../src/productsData.js';
import { defaultAdminSettings } from '../src/lib/localStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function loadEnvFile(fileName) {
  const fullPath = path.join(rootDir, fileName);

  if (!fs.existsSync(fullPath)) {
    return;
  }

  const envText = fs.readFileSync(fullPath, 'utf8');

  for (const line of envText.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) {
      continue;
    }

    const idx = line.indexOf('=');
    if (idx === -1) {
      continue;
    }

    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function withTimestamps(document) {
  const now = new Date();

  return {
    ...document,
    createdAt: now,
    updatedAt: now,
  };
}

loadEnvFile('.env');
loadEnvFile('.env.local');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || process.env.MONGODB_DB;

if (!uri) {
  throw new Error('Missing MONGODB_URI in .env or .env.local');
}

if (!dbName) {
  throw new Error('Missing MONGODB_DB or MONGODB_DB_NAME in .env or .env.local');
}

const client = new MongoClient(uri);

try {
  await client.connect();

  const db = client.db(dbName);

  await Promise.all([
    db.collection('users').createIndex({ email: 1 }, { unique: true }),
    db.collection('sessions').createIndex({ token: 1 }, { unique: true }),
    db.collection('adminSessions').createIndex({ token: 1 }, { unique: true }),
  ]);

  await db.collection('products').deleteMany({});
  await db.collection('settings').deleteMany({ key: 'store' });

  if (products.length > 0) {
    await db.collection('products').insertMany(products.map(withTimestamps));
  }

  await db.collection('settings').insertOne(
    withTimestamps({
      key: 'store',
      ...defaultAdminSettings,
    })
  );

  const [productCount, settingsCount] = await Promise.all([
    db.collection('products').countDocuments(),
    db.collection('settings').countDocuments({ key: 'store' }),
  ]);

  console.log(
    JSON.stringify({
      db: dbName,
      products: productCount,
      settings: settingsCount,
    })
  );
} finally {
  await client.close().catch(() => {});
}
