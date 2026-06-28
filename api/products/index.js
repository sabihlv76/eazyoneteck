import { requireAdminSession } from '../_lib/auth.js';
import { allowMethods, readJson, sendError, sendJson } from '../_lib/http.js';
import { getDb } from '../_lib/mongodb.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'POST'])) {
    return;
  }

  try {
    const db = await getDb();

    if (req.method === 'GET') {
      const products = await db.collection('products').find({}).sort({ createdAt: -1 }).toArray();
      sendJson(res, 200, { products });
      return;
    }

    const admin = await requireAdminSession(req);
    if (admin.error) {
      sendError(res, 401, admin.error);
      return;
    }

    const payload = await readJson(req);
    const now = new Date();

    const product = {
      ...payload,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('products').insertOne(product);
    sendJson(res, 201, { product });
  } catch (error) {
    sendError(res, 500, error.message || 'Unable to process products request.');
  }
}
