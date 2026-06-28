import crypto from 'node:crypto';
import { MongoClient } from 'mongodb';
import { defaultAdminSettings } from '../../src/lib/localStore.js';
import { products as defaultProducts } from '../../src/productsData.js';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || process.env.MONGODB_DB_NAME;

if (!uri) {
  throw new Error('Missing MONGODB_URI environment variable.');
}

if (!dbName) {
  throw new Error('Missing MONGODB_DB or MONGODB_DB_NAME environment variable.');
}

const globalCache = globalThis.__eazyMongoCache || {
  client: null,
  clientPromise: null,
  seeded: false,
};

globalThis.__eazyMongoCache = globalCache;

async function getClient() {
  if (globalCache.client) {
    return globalCache.client;
  }

  if (!globalCache.clientPromise) {
    const client = new MongoClient(uri);
    globalCache.clientPromise = client.connect();
  }

  globalCache.client = await globalCache.clientPromise;
  return globalCache.client;
}

export async function getDb() {
  const client = await getClient();
  const db = client.db(dbName);

  if (!globalCache.seeded) {
    await Promise.all([
      db.collection('users').createIndex({ email: 1 }, { unique: true }),
      db.collection('sessions').createIndex({ token: 1 }, { unique: true }),
      db.collection('adminSessions').createIndex({ token: 1 }, { unique: true }),
    ]);

    const [productCount, settingsCount] = await Promise.all([
      db.collection('products').countDocuments(),
      db.collection('settings').countDocuments({ key: 'store' }),
    ]);

    if (productCount === 0) {
      const productDocs = defaultProducts.map((product) => ({
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await db.collection('products').insertMany(productDocs);
    }

    if (settingsCount === 0) {
      await db.collection('settings').insertOne({
        key: 'store',
        ...defaultAdminSettings,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    globalCache.seeded = true;
  }

  return db;
}

export function createSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    email: user.email,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
  };
}

export function sanitizeSettings(settings, includeSensitive = false) {
  if (!settings) {
    return null;
  }

  const payload = {
    email: settings.email,
    phone: settings.phone,
    storeName: settings.storeName,
  };

  if (includeSensitive) {
    payload.pin = settings.pin;
  }

  return payload;
}
