import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';
import { products } from '../src/productsData.js';

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(__filename), '..');

function loadEnvFile(fileName) {
  const fullPath = path.join(rootDir, fileName);
  if (!fs.existsSync(fullPath)) return;

  for (const line of fs.readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    if (!(key in process.env)) process.env[key] = line.slice(separator + 1).trim();
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || process.env.MONGODB_DB;

if (!uri || !dbName) {
  throw new Error('MongoDB connection settings are missing.');
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const collection = client.db(dbName).collection('products');
  const now = new Date();

  await collection.deleteMany({});
  await collection.insertMany(products.map((product) => ({
    ...product,
    createdAt: now,
    updatedAt: now,
  })));

  console.log(`Synced ${await collection.countDocuments()} products to ${dbName}.`);
} finally {
  await client.close().catch(() => {});
}
