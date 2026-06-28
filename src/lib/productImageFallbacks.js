export const categoryFallbackImages = {
  Smartphones:
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=90',
  Computers:
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=90',
  Audio:
    'https://images.unsplash.com/photo-1588423772273-dfc9ea5313fd?auto=format&fit=crop&w=900&q=90',
  Accessories:
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=900&q=90',
  Watches:
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=90',
};

export function applyProductImageFallback(event, category = 'Accessories') {
  const fallback =
    categoryFallbackImages[category] || categoryFallbackImages.Accessories;
  event.currentTarget.onerror = null;
  event.currentTarget.src = fallback;
}
