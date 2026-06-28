import { requireAdminSession } from '../_lib/auth.js';
import { allowMethods, readJson, sendError, sendJson } from '../_lib/http.js';
import { getDb } from '../_lib/mongodb.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['PUT', 'DELETE'])) {
    return;
  }

  try {
    const admin = await requireAdminSession(req);
    if (admin.error) {
      sendError(res, 401, admin.error);
      return;
    }

    const db = await getDb();
    const id = req.query?.id || req.params?.id;

    if (!id) {
      sendError(res, 400, 'Product id is required.');
      return;
    }

    if (req.method === 'DELETE') {
      await db.collection('products').deleteOne({ id });
      sendJson(res, 200, { success: true });
      return;
    }

    const payload = await readJson(req);
    const update = {
      ...payload,
      updatedAt: new Date(),
    };

    await db.collection('products').updateOne({ id }, { $set: update });
    const product = await db.collection('products').findOne({ id });
    sendJson(res, 200, { product });
  } catch (error) {
    sendError(res, 500, error.message || 'Unable to update the product.');
  }
}
