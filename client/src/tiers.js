// Mirrors server/gameLogic/tiers.js. Kept separate because browser code
// cannot require() server files. Used by the upgrade screen to render
// tier cards and pass the right price ID to Paddle checkout.
export const TIERS = [
  {
    key: "starter",
    label: "Starter",
    priceUsd: 15,
    gameLimit: 10,
    priceId: "pri_01m3e5w653ncg6xt2t9d6xhzwq",
  },
  {
    key: "standard",
    label: "Standard",
    priceUsd: 25,
    gameLimit: 25,
    priceId: "pri_01m3e5x97jy9pn5n2nvpsetzcv",
  },
  {
    key: "unlimited",
    label: "Unlimited",
    priceUsd: 55,
    gameLimit: null,
    priceId: "pri_01m3e5y5sdas7r5hhrpdnyvj7n",
  },
];
