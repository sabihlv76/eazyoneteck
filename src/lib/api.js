const USER_SESSION_KEY = 'e1t_user_session';
const ADMIN_SESSION_KEY = 'e1t_admin_session';
const SESSION_EXPIRY = {
  user: 7 * 24 * 60 * 60 * 1000,
  admin: 24 * 60 * 60 * 1000,
};

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      clearUserSessionToken();
      clearAdminSessionToken();
    }
    throw new Error(payload.error || 'Request failed.');
  }

  return payload;
}

function getStoredSession(key) {
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return null;

    const session = JSON.parse(stored);
    const isExpired = Date.now() > session.expiresAt;

    if (isExpired) {
      window.localStorage.removeItem(key);
      return null;
    }

    return session.token;
  } catch {
    return null;
  }
}

function setStoredSession(key, token, type = 'user') {
  if (!token) {
    window.localStorage.removeItem(key);
    return;
  }

  const expiryMs = type === 'admin' ? SESSION_EXPIRY.admin : SESSION_EXPIRY.user;
  window.localStorage.setItem(
    key,
    JSON.stringify({
      token,
      expiresAt: Date.now() + expiryMs,
    })
  );
}

export function getUserSessionToken() {
  return getStoredSession(USER_SESSION_KEY);
}

export function getAdminSessionToken() {
  return getStoredSession(ADMIN_SESSION_KEY);
}

export function clearUserSessionToken() {
  setStoredSession(USER_SESSION_KEY, '', 'user');
}

export function clearAdminSessionToken() {
  setStoredSession(ADMIN_SESSION_KEY, '', 'admin');
}

function setUserSessionToken(token) {
  setStoredSession(USER_SESSION_KEY, token, 'user');
}

function setAdminSessionToken(token) {
  setStoredSession(ADMIN_SESSION_KEY, token, 'admin');
}

export async function fetchProducts() {
  const payload = await request('/api/products');
  return payload.products || [];
}

export async function uploadProductImage(file) {
  const { cloudName, apiKey, timestamp, folder, signature } = await request('/api/upload', {
    method: 'POST',
    headers: {
      'x-admin-session': getAdminSessionToken(),
    },
  });

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', timestamp);
  form.append('folder', folder);
  form.append('signature', signature);

  // Straight to Cloudinary — the image never touches our own API.
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error?.message || 'The image upload failed. Try again.');
  }

  // f_auto,q_auto lets Cloudinary serve the smallest format each browser supports.
  return payload.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
}

export async function createProduct(product) {
  const payload = await request('/api/products', {
    method: 'POST',
    headers: {
      'x-admin-session': getAdminSessionToken(),
    },
    body: JSON.stringify(product),
  });

  return payload.product;
}

export async function updateProduct(id, product) {
  const payload = await request(`/api/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'x-admin-session': getAdminSessionToken(),
    },
    body: JSON.stringify(product),
  });

  return payload.product;
}

export async function deleteProduct(id) {
  await request(`/api/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      'x-admin-session': getAdminSessionToken(),
    },
  });
}

export async function resetProducts() {
  const payload = await request('/api/products/reset', {
    method: 'POST',
    headers: {
      'x-admin-session': getAdminSessionToken(),
    },
  });

  return payload.products || [];
}

export async function fetchSettings(includeAdmin = false) {
  const payload = await request('/api/settings', {
    headers: includeAdmin
      ? { 'x-admin-session': getAdminSessionToken() }
      : undefined,
  });

  return payload.settings;
}

export async function updateSettings(settings) {
  const payload = await request('/api/settings', {
    method: 'PUT',
    headers: {
      'x-admin-session': getAdminSessionToken(),
    },
    body: JSON.stringify(settings),
  });

  return payload.settings;
}

export async function signIn(payload) {
  const response = await request('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  setUserSessionToken(response.token);
  return response.user;
}

export async function signUp(payload) {
  const response = await request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  setUserSessionToken(response.token);
  return response.user;
}

export async function fetchCurrentUser() {
  const token = getUserSessionToken();
  if (!token) {
    return null;
  }

  try {
    const payload = await request('/api/auth/account', {
      headers: {
        'x-session-token': token,
      },
    });

    return payload.user;
  } catch {
    clearUserSessionToken();
    return null;
  }
}

export async function saveAccount(payload) {
  const response = await request('/api/auth/account', {
    method: 'PUT',
    headers: {
      'x-session-token': getUserSessionToken(),
    },
    body: JSON.stringify(payload),
  });

  return response.user;
}

export async function signOut() {
  await request('/api/auth/signout', {
    method: 'POST',
    headers: {
      'x-session-token': getUserSessionToken(),
    },
  });

  clearUserSessionToken();
}

export async function adminSignIn(payload) {
  const response = await request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  setAdminSessionToken(response.token);
  return response.settings;
}

export async function adminSignOut() {
  await request('/api/admin/logout', {
    method: 'POST',
    headers: {
      'x-admin-session': getAdminSessionToken(),
    },
  });

  clearAdminSessionToken();
}
