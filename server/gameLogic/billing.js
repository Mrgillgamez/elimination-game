const { Paddle, Environment } = require("@paddle/paddle-node-sdk");
const { createClient } = require("@supabase/supabase-js");
const { PAYG_GAME_PRICE_ID } = require("./tiers");

const paddleEnv = process.env.PADDLE_ENV === "production" ? Environment.production : Environment.sandbox;
const paddle = new Paddle(process.env.PADDLE_API_KEY, { environment: paddleEnv });
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const BATCH_SIZE = 50;

async function runBilling({ dryRun }) {
  const summary = { dryRun, users: 0, gamesBilled: 0, failures: [] };

  const { data: users, error } = await db
    .from("profiles")
    .select("id, paddle_subscription_id, payg_since")
    .eq("plan_status", "paid")
    .eq("plan_tier", "payg")
    .not("paddle_subscription_id", "is", null)
    .not("payg_since", "is", null);
  if (error) throw new Error("Could not load payg users: " + error.message);

  for (const user of users) {
    summary.users++;

    const { data: games, error: gamesError } = await db
      .from("game_creations")
      .select("id")
      .eq("user_id", user.id)
      .eq("started", true)
      .is("billed_at", null)
      .gte("created_at", user.payg_since);
    if (gamesError) {
      summary.failures.push({ userId: user.id, step: "load games", message: gamesError.message });
      continue;
    }
    if (games.length === 0) continue;

    if (dryRun) {
      summary.gamesBilled += games.length;
      continue;
    }

    for (let i = 0; i < games.length; i += BATCH_SIZE) {
      const ids = games.slice(i, i + BATCH_SIZE).map((g) => g.id);

      // Claim first: only rows still unbilled get marked. A second run finds nothing to claim.
      const { data: claimed, error: claimError } = await db
        .from("game_creations")
        .update({ billed_at: new Date().toISOString() })
        .in("id", ids)
        .is("billed_at", null)
        .select("id");
      if (claimError || !claimed || claimed.length === 0) continue;
      const claimedIds = claimed.map((c) => c.id);

      try {
        await paddle.subscriptions.createOneTimeCharge(user.paddle_subscription_id, {
          effectiveFrom: "next_billing_period",
          items: [{ priceId: PAYG_GAME_PRICE_ID, quantity: claimedIds.length }],
        });
        summary.gamesBilled += claimedIds.length;
        console.log(`Billing: charged ${claimedIds.length} game(s) for user ${user.id}`);
      } catch (err) {
        const { error: undoError } = await db
          .from("game_creations")
          .update({ billed_at: null })
          .in("id", claimedIds);
        if (undoError) {
          console.error(`MANUAL ACTION NEEDED: charge failed AND could not unmark games ${claimedIds.join(",")} for user ${user.id}`);
        }
        summary.failures.push({ userId: user.id, step: "charge", message: err.message });
        console.error(`Billing charge failed for user ${user.id}: ${err.message}`);
      }
    }
  }
  return summary;
}

module.exports = { runBilling };