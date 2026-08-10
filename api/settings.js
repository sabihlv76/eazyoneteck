import { requireAdminSession } from './_lib/auth.js';
import { allowMethods, readJson, sendError, sendJson } from './_lib/http.js';
import { getDb, hashAdminPin, sanitizeSettings, verifyAdminPin } from './_lib/mongodb.js';

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
      storeName: payload.storeName || admin.settingsDoc.storeName,
      updatedAt: new Date(),
    };

    const ops = { $set: update };
    const newPin = typeof payload.newPin === 'string' ? payload.newPin.trim() : '';

    if (newPin) {
      const currentPin = typeof payload.currentPin === 'string' ? payload.currentPin.trim() : '';

      if (!currentPin) {
        sendError(res, 400, 'Enter your current PIN to set a new one.');
        return;
      }

      if (!(await verifyAdminPin(currentPin, admin.settingsDoc))) {
        sendError(res, 401, 'The current PIN is incorrect.');
        return;
      }

      if (newPin.length < 8) {
        sendError(res, 400, 'The new PIN must be at least 8 characters long.');
        return;
      }

      update.pinHash = await hashAdminPin(newPin);
      ops.$unset = { pin: '' };
    }

    await db.collection('settings').updateOne({ key: 'store' }, ops);

    const settings = await db.collection('settings').findOne({ key: 'store' });
    sendJson(res, 200, { settings: sanitizeSettings(settings, true) });
  } catch (error) {
    sendError(res, 500, error.message || 'Unable to process settings.');
  }
}
