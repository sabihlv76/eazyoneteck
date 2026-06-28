import { allowMethods, readJson, sendError, sendJson } from '../_lib/http.js';
import { createSessionToken, getDb, sanitizeUser } from '../_lib/mongodb.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) {
    return;
  }

  try {
    const db = await getDb();
    const payload = await readJson(req);
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password?.trim();

    if (!email || !password) {
      sendError(res, 400, 'Email and password are required.');
      return;
    }

    const user = await db.collection('users').findOne({ email });
    if (!user || user.password !== password) {
      sendError(res, 401, 'Incorrect email or password.');
      return;
    }

    const token = createSessionToken();
    await db.collection('sessions').insertOne({
      token,
      userEmail: email,
      createdAt: new Date(),
    });

    sendJson(res, 200, { token, user: sanitizeUser(user) });
  } catch (error) {
    sendError(res, 500, error.message || 'Unable to sign in.');
  }
}
