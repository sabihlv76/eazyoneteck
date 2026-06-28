import { allowMethods, sendJson } from '../_lib/http.js';
import { getDb } from '../_lib/mongodb.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) {
    return;
  }

  const token = req.headers['x-admin-session'];

  if (token) {
    const db = await getDb();
    await db.collection('adminSessions').deleteOne({ token });
  }

  sendJson(res, 200, { success: true });
}
