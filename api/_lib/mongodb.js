import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import { products as defaultProducts } from '../../src/productsData.js';

function getMongoConfig() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || process.env.MONGODB_DB_NAME;

  if (!uri) {
    throw new Error('Server database is not configured: missing MONGODB_URI.');
  }

  if (!dbName) {
    throw new Error('Server database is not configured: missing MONGODB_DB or MONGODB_DB_NAME.');
  }

  return { uri, dbName };
}

function getDefaultAdminSettings() {
  return {
    email: process.env.ADMIN_EMAIL || 'admin@eazy1teck.com',
    phone: process.env.ADMIN_PHONE || '+250783073733',
    pinHash: bcrypt.hashSync(process.env.ADMIN_PIN || '123456', 10),
    storeName: 'Eazy1teck',
  };
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
    const { uri } = getMongoConfig();
    const client = new MongoClient(uri);
    globalCache.clientPromise = client.connect();
  }

  globalCache.client = await globalCache.clientPromise;
  return globalCache.client;
}

export async function getDb() {
  const { dbName } = getMongoConfig();
  const client = await getClient();
  const db = client.db(dbName);

  if (!globalCache.seeded) {
    await Promise.all([
      db.collection('users').createIndex({ email: 1 }, { unique: true }),
      db.collection('sessions').createIndex({ token: 1 }, { unique: true }),
      db.collection('sessions').createIndex({ createdAt: 1 }, { expireAfterSeconds: 604800 }),
      db.collection('adminSessions').createIndex({ token: 1 }, { unique: true }),
      db.collection('adminSessions').createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 }),
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
        ...getDefaultAdminSettings(),
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

// The PIN is stored only as a bcrypt hash and is never returned to any client.
// The includeSensitive flag is kept for call-site compatibility but no longer
// adds anything.
export function sanitizeSettings(settings, includeSensitive = false) {
  void includeSensitive;

  if (!settings) {
    return null;
  }

  return {
    email: settings.email,
    phone: settings.phone,
    storeName: settings.storeName,
    featuredProductId: settings.featuredProductId || '',
    heroImage: settings.heroImage || '',
  };
}

// Verifies a PIN against the settings doc, supporting the legacy plaintext
// field. Returns true/false; upgrading legacy docs is the caller's choice.
export async function verifyAdminPin(pin, settingsDoc) {
  if (!pin || !settingsDoc) {
    return false;
  }

  if (settingsDoc.pinHash) {
    return bcrypt.compare(pin, settingsDoc.pinHash);
  }

  return typeof settingsDoc.pin === 'string' && settingsDoc.pin === pin;
}

export function hashAdminPin(pin) {
  return bcrypt.hash(pin, 10);
}
