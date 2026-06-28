export function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload);
}

export function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message });
}

export async function readJson(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string' && req.body.length > 0) {
    return JSON.parse(req.body);
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export function allowMethods(req, res, methods) {
  if (methods.includes(req.method)) {
    return true;
  }

  res.setHeader('Allow', methods);
  sendError(res, 405, `Method ${req.method} not allowed.`);
  return false;
}

export function getSessionToken(req) {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  return req.headers['x-session-token'] || req.headers['x-admin-session'] || '';
}
