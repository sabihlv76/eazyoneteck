export const PRODUCTS_KEY = 'e1t_products';
export const CART_KEY = 'e1t_cart';
export const WISHLIST_KEY = 'e1t_wishlist';
export const USER_KEY = 'e1t_user';
export const ADMIN_SETTINGS_KEY = 'e1t_admin_settings';

export const defaultAdminSettings = {
  email: 'admin@eazy1teck.com',
  phone: '+250783073733',
  pin: '0788',
  storeName: 'Eazy1teck',
};

export function readStorage(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Unable to write ${key} to localStorage`, error);
  }
}
