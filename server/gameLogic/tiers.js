// Single source of truth for paid tiers. game_limit is checked server-side
// before allowing CREATE_GAME. null = unlimited.
// SANDBOX price IDs - swap to live IDs when business verification is approved.
const TIERS = {
  starter: {
    priceId: "pri_01m3e5w653ncg6xt2t9d6xhzwq",
    label: "Starter",
    priceUsd: 15,
    gameLimit: 10,
  },
  standard: {
    priceId: "pri_01m3e5x97jy9pn5n2nvpsetzcv",
    label: "Standard",
    priceUsd: 25,
    gameLimit: 25,
  },
  unlimited: {
    priceId: "pri_01m3e5y5sdas7r5hhrpdnyvj7n",
    label: "Unlimited",
    priceUsd: 55,
    gameLimit: null,
  },
};

function getTierByPriceId(priceId) {
  return Object.entries(TIERS).find(([, t]) => t.priceId === priceId)?.[0] || null;
}

module.exports = { TIERS, getTierByPriceId };
