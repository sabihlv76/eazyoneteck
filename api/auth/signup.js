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

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      sendError(res, 409, 'An account with this email already exists.');
      return;
    }

    const user = {
      email,
      firstName: payload.firstName?.trim() || '',
      lastName: payload.lastName?.trim() || '',
      phone: payload.phone?.trim() || '',
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const token = createSessionToken();

    await db.collection('users').insertOne(user);
    await db.collection('sessions').insertOne({
      token,
      userEmail: email,
      createdAt: new Date(),
    });

    sendJson(res, 201, { token, user: sanitizeUser(user) });
  } catch (error) {
    sendError(res, 500, error.message || 'Unable to create the account.');
  }
}
