const USER_SESSION_KEY = 'e1t_user_session';
const ADMIN_SESSION_KEY = 'e1t_admin_session';

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
    throw new Error(payload.error || 'Request failed.');
  }

  return payload;
}

function getStoredToken(key) {
  return window.localStorage.getItem(key) || '';
}

function setStoredToken(key, token) {
  if (token) {
    window.localStorage.setItem(key, token);
    return;
  }

  window.localStorage.removeItem(key);
}

export function getUserSessionToken() {
  return getStoredToken(USER_SESSION_KEY);
}

export function getAdminSessionToken() {
  return getStoredToken(ADMIN_SESSION_KEY);
}

export function clearUserSessionToken() {
  setStoredToken(USER_SESSION_KEY, '');
}

export function clearAdminSessionToken() {
  setStoredToken(ADMIN_SESSION_KEY, '');
}

export async function fetchProducts() {
  const payload = await request('/api/products');
  return payload.products || [];
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

  setStoredToken(USER_SESSION_KEY, response.token);
  return response.user;
}

export async function signUp(payload) {
  const response = await request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  setStoredToken(USER_SESSION_KEY, response.token);
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

  setStoredToken(ADMIN_SESSION_KEY, response.token);
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
