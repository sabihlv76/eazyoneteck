import { requireAdminSession } from '../_lib/auth.js';
import { allowMethods, sendError, sendJson } from '../_lib/http.js';
import { getDb } from '../_lib/mongodb.js';
import { products as defaultProducts } from '../../src/productsData.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) {
    return;
  }

  try {
    const admin = await requireAdminSession(req);
    if (admin.error) {
      sendError(res, 401, admin.error);
      return;
    }

    const db = await getDb();
    await db.collection('products').deleteMany({});
    await db.collection('products').insertMany(
      defaultProducts.map((product) => ({
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    const products = await db.collection('products').find({}).sort({ createdAt: -1 }).toArray();
    sendJson(res, 200, { products });
  } catch (error) {
    sendError(res, 500, error.message || 'Unable to reset the catalog.');
  }
}
