const TIERS = {
  starter: { priceId: "pri_01m3e5w653ncg6xt2t9d6xhzwq", label: "Starter", priceUsd: 15, gameLimit: 10 },
  standard: { priceId: "pri_01m3e5x97jy9pn5n2nvpsetzcv", label: "Standard", priceUsd: 25, gameLimit: 25 },
  unlimited: { priceId: "pri_01m3e5y5sdas7r5hhrpdnyvj7n", label: "Unlimited", priceUsd: 55, gameLimit: null },
  // Pay-as-you-go: $0/month subscription that only saves the card. Games are billed at month end.
  payg: { priceId: "pri_01m40egg4zb3yn5rddkmz3w648", label: "Pay as you go", priceUsd: 0, gameLimit: null, usageBased: true, perGameUsd: 2 },
};

// One-time price used to bill started games to a pay-as-you-go subscription.
const PAYG_GAME_PRICE_ID = "pri_01m40ehjr1tppk1kw93xh6bf3h";

// One-time top-ups. Bonus games apply only for the buyer's current billing cycle.
const TOPUPS = {
  topup10: { priceId: "pri_01m3zjgyc0dp29r9bfz2gk08rj", label: "+10 games", priceUsd: 12, games: 10 },
  topup30: { priceId: "pri_01m3zjh099y443n71235df4dhw", label: "+30 games", priceUsd: 30, games: 30 },
};

function getTierByPriceId(priceId) {
  return Object.entries(TIERS).find(([, t]) => t.priceId === priceId)?.[0] || null;
}

function getTopupByPriceId(priceId) {
  return Object.entries(TOPUPS).find(([, t]) => t.priceId === priceId)?.[0] || null;
}

function isPaygGamePrice(priceId) {
  return priceId === PAYG_GAME_PRICE_ID;
}

module.exports = { TIERS, TOPUPS, PAYG_GAME_PRICE_ID, getTierByPriceId, getTopupByPriceId, isPaygGamePrice };
