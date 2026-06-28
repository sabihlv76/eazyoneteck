import { allowMethods, sendJson } from '../_lib/http.js';
import { getDb } from '../_lib/mongodb.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) {
    return;
  }

  const token =
    req.headers['x-session-token'] ||
    (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();

  if (token) {
    const db = await getDb();
    await db.collection('sessions').deleteOne({ token });
  }

  sendJson(res, 200, { success: true });
}
