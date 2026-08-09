import crypto from 'node:crypto';
import { requireAdminSession } from './_lib/auth.js';
import { allowMethods, sendError, sendJson } from './_lib/http.js';

const UPLOAD_FOLDER = 'eazy1teck/products';

// Issues a short-lived signature so the admin's browser can upload an image
// straight to Cloudinary. The file itself never passes through this server,
// which keeps us clear of serverless request-body limits.
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

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      sendError(res, 500, 'Image uploads are not configured: missing Cloudinary credentials.');
      return;
    }

    // Cloudinary requires the signed params sorted alphabetically.
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash('sha1')
      .update(`folder=${UPLOAD_FOLDER}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    sendJson(res, 200, {
      cloudName,
      apiKey,
      timestamp,
      folder: UPLOAD_FOLDER,
      signature,
    });
  } catch (error) {
    sendError(res, 500, error.message || 'Unable to prepare the image upload.');
  }
}
