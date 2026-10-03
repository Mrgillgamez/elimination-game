// Approved C7 price table (tax-inclusive). Must match Paddle's local prices exactly.
// Countries not listed here are shown USD, which is Paddle's base price.
const REGIONS = {
  IN: { currency: 'INR', symbol: '₹' },
  GB: { currency: 'GBP', symbol: '£' },
  DE: { currency: 'EUR', symbol: '€' },
  FR: { currency: 'EUR', symbol: '€' },
  IT: { currency: 'EUR', symbol: '€' },
  ES: { currency: 'EUR', symbol: '€' },
  NL: { currency: 'EUR', symbol: '€' },
  IE: { currency: 'EUR', symbol: '€' },
  AU: { currency: 'AUD', symbol: 'A$' },
  CA: { currency: 'CAD', symbol: 'C$' },
};

const USD_REGION = { currency: 'USD', symbol: '$' };

const PRICE_TABLE = {
  starter:   { USD: 15, INR: 999,  GBP: 11, EUR: 14, AUD: 22, CAD: 20 },
  standard:  { USD: 25, INR: 1699, GBP: 19, EUR: 23, AUD: 38, CAD: 34 },
  unlimited: { USD: 55, INR: 3999, GBP: 42, EUR: 50, AUD: 85, CAD: 75 },
  topup10:   { USD: 12, INR: 799,  GBP: 9,  EUR: 11, AUD: 18, CAD: 16 },
  topup30:   { USD: 30, INR: 1999, GBP: 23, EUR: 28, AUD: 45, CAD: 41 },
};

export function formatPrice(itemKey, countryCode) {
  const region = REGIONS[countryCode] || USD_REGION;
  const amount = PRICE_TABLE[itemKey]?.[region.currency];
  if (amount === undefined) return '';
  return `${region.symbol}${amount.toLocaleString('en-US')}`;
}
