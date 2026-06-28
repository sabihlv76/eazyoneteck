import { allowMethods, readJson, sendError, sendJson } from '../_lib/http.js';
import { createSessionToken, getDb, sanitizeSettings } from '../_lib/mongodb.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) {
    return;
  }

  try {
    const db = await getDb();
    const payload = await readJson(req);
    const settings = await db.collection('settings').findOne({ key: 'store' });

    if (
      payload.email?.trim().toLowerCase() !== settings.email.toLowerCase() ||
      payload.pin?.trim() !== settings.pin
    ) {
      sendError(res, 401, 'Incorrect email or PIN.');
      return;
    }

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
