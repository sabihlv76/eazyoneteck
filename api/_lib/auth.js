import { getDb, sanitizeSettings, sanitizeUser } from './mongodb.js';

export async function requireUserSession(req) {
  const token =
    req.headers['x-session-token'] ||
    (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return { error: 'Missing session token.' };
  }

  const db = await getDb();
  const session = await db.collection('sessions').findOne({ token });

  if (!session) {
    return { error: 'Invalid session token.' };
  }

  const user = await db.collection('users').findOne({ email: session.userEmail });

  if (!user) {
    return { error: 'User not found for this session.' };
  }

  return { db, session, token, user: sanitizeUser(user), userDoc: user };
}

export async function requireAdminSession(req) {
  const token =
    req.headers['x-admin-session'] ||
    (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return { error: 'Missing admin session token.' };
  }

  const db = await getDb();
  const session = await db.collection('adminSessions').findOne({ token });

  if (!session) {
    return { error: 'Invalid admin session token.' };
  }

  const settings = await db.collection('settings').findOne({ key: 'store' });

  return {
    db,
    session,
    token,
    settings: sanitizeSettings(settings, true),
    settingsDoc: settings,
  };
}
