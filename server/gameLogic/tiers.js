const TIERS = {
  starter: { priceId: "pri_01m3e5w653ncg6xt2t9d6xhzwq", label: "Starter", priceUsd: 15, gameLimit: 10 },
  standard: { priceId: "pri_01m3e5x97jy9pn5n2nvpsetzcv", label: "Standard", priceUsd: 25, gameLimit: 25 },
  unlimited: { priceId: "pri_01m3e5y5sdas7r5hhrpdnyvj7n", label: "Unlimited", priceUsd: 55, gameLimit: null },
};

// One-time top-ups. Bonus games apply only for the buyer's current billing cycle.
const TOPUPS = {
  topup10: { priceId: "pri_01m3na12dm1v1p3pjp7scte0tk", label: "+10 games", priceUsd: 12, games: 10 },
  topup30: { priceId: "pri_01m3na1zfyhqvn4xt8y3gz1cea", label: "+30 games", priceUsd: 30, games: 30 },
};

function getTierByPriceId(priceId) {
  return Object.entries(TIERS).find(([, t]) => t.priceId === priceId)?.[0] || null;
}

function getTopupByPriceId(priceId) {
  return Object.entries(TOPUPS).find(([, t]) => t.priceId === priceId)?.[0] || null;
}

module.exports = { TIERS, TOPUPS, getTierByPriceId, getTopupByPriceId };
