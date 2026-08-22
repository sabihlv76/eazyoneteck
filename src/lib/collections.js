// Store-wide collection groups: the top-level "Phones / Accessories / Machines"
// buckets used by the catalogue filters, the About page showcase and the nav.
export const collectionGroups = [
  {
    id: 'phones',
    label: 'Phones',
    category: 'Smartphones',
    categories: ['Smartphones'],
    strapline: 'Choose the phone that fits you.',
    description: 'Compare Apple, Samsung and Android phones by storage, colour and RWF price.',
  },
  {
    id: 'accessories',
    label: 'Accessories',
    category: 'Accessories',
    categories: ['Accessories', 'Audio', 'Watches'],
    strapline: 'Complete your setup.',
    description: 'Choose the audio, watches, chargers and protection you need for your devices.',
  },
  {
    id: 'machines',
    label: 'Machines',
    category: 'Computers',
    categories: ['Computers'],
    strapline: 'Get the right machine for your work.',
    description: 'Compare laptops for work, study and creative projects, then order the one you want.',
  },
];

export function groupMatchesProduct(group, product) {
  return group.categories.includes(product.category);
}

export function formatRwf(price) {
  return `${Number(price).toLocaleString()} RWF`;
}
