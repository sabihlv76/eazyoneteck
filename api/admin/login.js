import { allowMethods, readJson, sendError, sendJson } from '../_lib/http.js';
import { createSessionToken, getDb, sanitizeSettings } from '../_lib/mongodb.js';

const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function getAttemptKey(email) {
  return `admin-login:${email.toLowerCase()}`;
}

function checkRateLimit(email) {
  const key = getAttemptKey(email);
  const now = Date.now();
  const attempt = loginAttempts.get(key);

  if (!attempt) {
    return true;
  }

  if (now - attempt.firstAttempt > LOCKOUT_MINUTES * 60 * 1000) {
    loginAttempts.delete(key);
    return true;
  }

  return attempt.count < MAX_ATTEMPTS;
}

function recordFailedAttempt(email) {
  const key = getAttemptKey(email);
  const now = Date.now();
  const attempt = loginAttempts.get(key);

  if (!attempt) {
    loginAttempts.set(key, { count: 1, firstAttempt: now });
  } else {
    attempt.count += 1;
  }
}

function clearAttempts(email) {
  const key = getAttemptKey(email);
  loginAttempts.delete(key);
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) {
    return;
  }

  try {
    const db = await getDb();
    const payload = await readJson(req);
    const email = payload.email?.trim().toLowerCase();
    const pin = payload.pin?.trim();

    if (!email || !pin) {
      sendError(res, 400, 'Email and PIN are required.');
      return;
    }

    if (!checkRateLimit(email)) {
      sendError(res, 429, `Too many login attempts. Try again in ${LOCKOUT_MINUTES} minutes.`);
      return;
    }

    const settings = await db.collection('settings').findOne({ key: 'store' });

    if (
      email !== settings.email.toLowerCase() ||
      pin !== settings.pin
    ) {
      recordFailedAttempt(email);
      sendError(res, 401, 'Incorrect email or PIN.');
      return;
    }

    clearAttempts(email);
    const token = createSessionToken();
    await db.collection('adminSessions').insertOne({
      token,
      createdAt: new Date(),
    });

    sendJson(res, 200, {
      token,
      settings: sanitizeSettings(settings, true),
    });
  } catch (error) {
    sendError(res, 500, error.message || 'Unable to sign in as admin.');
  }
}
