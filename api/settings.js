import { requireAdminSession } from './_lib/auth.js';
import { allowMethods, readJson, sendError, sendJson } from './_lib/http.js';
import { getDb, sanitizeSettings } from './_lib/mongodb.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'PUT'])) {
    return;
  }

  try {
    const db = await getDb();

    if (req.method === 'GET') {
      const settings = await db.collection('settings').findOne({ key: 'store' });
      const adminToken = req.headers['x-admin-session'];
      let includeSensitive = false;

      if (adminToken) {
        const admin = await requireAdminSession(req);
        includeSensitive = !admin.error;
      }

      sendJson(res, 200, { settings: sanitizeSettings(settings, includeSensitive) });
      return;
    }

    const admin = await requireAdminSession(req);
    if (admin.error) {
      sendError(res, 401, admin.error);
      return;
    }

    const payload = await readJson(req);
    const update = {
      email: payload.email,
      phone: payload.phone,
      pin: payload.pin,
      storeName: payload.storeName || admin.settingsDoc.storeName,
      updatedAt: new Date(),
    };

    await db.collection('settings').updateOne(
      { key: 'store' },
      { $set: update }
    );

    const settings = await db.collection('settings').findOne({ key: 'store' });
    sendJson(res, 200, { settings: sanitizeSettings(settings, true) });
  } catch (error) {
    sendError(res, 500, error.message || 'Unable to process settings.');
  }
}
