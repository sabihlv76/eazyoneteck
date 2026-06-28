import { requireUserSession } from '../_lib/auth.js';
import { allowMethods, readJson, sendError, sendJson } from '../_lib/http.js';
import { sanitizeUser } from '../_lib/mongodb.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'PUT'])) {
    return;
  }

  try {
    const auth = await requireUserSession(req);
    if (auth.error) {
      sendError(res, 401, auth.error);
      return;
    }

    if (req.method === 'GET') {
      sendJson(res, 200, { user: auth.user });
      return;
    }

    const payload = await readJson(req);
    const nextEmail = payload.email?.trim().toLowerCase();

    if (!nextEmail) {
      sendError(res, 400, 'Email is required.');
      return;
    }

    const conflict =
      nextEmail !== auth.userDoc.email
        ? await auth.db.collection('users').findOne({ email: nextEmail })
        : null;

    if (conflict) {
      sendError(res, 409, 'Another account already uses this email.');
      return;
    }

    const update = {
      email: nextEmail,
      firstName: payload.firstName?.trim() || '',
      lastName: payload.lastName?.trim() || '',
      phone: payload.phone?.trim() || '',
      updatedAt: new Date(),
    };

    await auth.db.collection('users').updateOne(
      { email: auth.userDoc.email },
      { $set: update }
    );

    if (nextEmail !== auth.userDoc.email) {
      await auth.db.collection('sessions').updateOne(
        { token: auth.token },
        { $set: { userEmail: nextEmail } }
      );
    }

    sendJson(res, 200, { user: sanitizeUser(update) });
  } catch (error) {
    sendError(res, 500, error.message || 'Unable to update the account.');
  }
}
