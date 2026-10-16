// PLACEHOLDER PRICES — not confirmed by Jokerz. Edit the numbers below once real prices are available,
// then set `confirmed: true` to remove the "placeholder" labels from the page.
export const pricing = {
  confirmed: false,
  currency: 'USD',
  locale: 'en-US',
};

// key -> { price, prefix?, unit? }  (keys match data-price attributes in index.html)
export const prices = {
  // Signature cakes (starting price, 6-inch)
  'black-forest-cake': { price: 32, prefix: 'from', unit: '6"' },
  'butterscotch-cake': { price: 30, prefix: 'from', unit: '6"' },
  'chocolate-mousse-cake': { price: 36, prefix: 'from', unit: '6"' },
  'pineapple-cake': { price: 28, prefix: 'from', unit: '6"' },
  'mango-cake': { price: 32, prefix: 'from', unit: '6"' },
  'rasamalai-cake': { price: 38, prefix: 'from', unit: '6"' },

  // Pastries (per slice)
  'black-forest-pastry': { price: 5.5 },
  'strawberry-pastry': { price: 5.5 },
  'butterscotch-pastry': { price: 5 },
  'pineapple-pastry': { price: 4.5 },
  'mango-pastry': { price: 5 },
  'vanilla-pastry': { price: 4.5 },

  // Coffee
  espresso: { price: 3.25 },
  'cafe-latte': { price: 4.75 },
  mocha: { price: 5.25 },

  // Boba
  'classic-milk-tea': { price: 5.5 },
  'brown-sugar-milk-tea': { price: 6.5 },
  'taro-milk-tea': { price: 6.25 },

  // Ice cream
  'hard-scoop': { price: 4.5, unit: 'single' },
  sundae: { price: 7.5 },
  'soft-serve': { price: 4 },

  // Crepes
  'nutella-crepe': { price: 8.5 },
  'strawberry-crepe': { price: 9 },
  'banana-chocolate-crepe': { price: 8.5 },
  'oreo-crumble-crepe': { price: 8.75 },
};

export function renderPrices(root = document) {
  const fmt = new Intl.NumberFormat(pricing.locale, {
    style: 'currency', currency: pricing.currency, minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
  root.querySelectorAll('[data-price]').forEach((el) => {
    const item = prices[el.dataset.price];
    if (!item) { el.remove(); return; }
    const amount = fmt.format(item.price).replace(/\.00$/, '');
    el.textContent = [item.prefix, amount, item.unit && `· ${item.unit}`].filter(Boolean).join(' ');
    el.classList.toggle('is-placeholder', !pricing.confirmed);
    if (!pricing.confirmed) el.title = 'Placeholder price — to be confirmed';
  });
  root.querySelectorAll('[data-price-note]').forEach((el) => { el.hidden = pricing.confirmed; });
}
