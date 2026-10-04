const { Paddle, Environment } = require("@paddle/paddle-node-sdk");
const { createClient } = require("@supabase/supabase-js");
const { getTierByPriceId, getTopupByPriceId, isPaygGamePrice, TOPUPS } = require("./tiers");
const { currentCycleStart } = require("./supabaseAuth");
const { billLeavingUser } = require("./billing");

const paddleEnv = process.env.PADDLE_ENV === "production" ? Environment.production : Environment.sandbox;
const paddle = new Paddle(process.env.PADDLE_API_KEY, { environment: paddleEnv });

const serviceClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function handlePaddleWebhook(rawBody, signatureHeader) {
  let eventData;
  try {
    eventData = await paddle.webhooks.unmarshal(rawBody, process.env.PADDLE_WEBHOOK_SECRET, signatureHeader);
  } catch (err) {
    console.error("Paddle webhook signature verification failed:", err.message);
    return { ok: false, status: 401, message: "Invalid signature" };
  }
  if (!eventData) return { ok: false, status: 400, message: "Empty event" };

  if (eventData.eventType === "transaction.completed") {
    const customData = eventData.data.customData || {};
    const userId = customData.supabase_user_id;
    if (!userId) {
      console.error("transaction.completed missing supabase_user_id:", customData);
      return { ok: false, status: 400, message: "Missing customData" };
    }

    const items = eventData.data.items || [];
    if (items.some((it) => isPaygGamePrice(it.price?.id || it.priceId))) {
      console.log(`Pay-as-you-go usage transaction for user ${userId}; no plan change needed`);
      return { ok: true, status: 200 };
    }
    if (items.length !== 1) {
      console.error(`Unexpected item count (${items.length}) for user ${userId}`);
      return { ok: false, status: 400, message: "Unexpected items" };
    }
    const paidPriceId = items[0].price?.id || items[0].priceId;

    const topupKey = getTopupByPriceId(paidPriceId);
    if (topupKey) {
      const topup = TOPUPS[topupKey];
      const { data: profile, error: profileError } = await serviceClient
        .from("profiles")
        .select("plan_started_at, bonus_games, bonus_games_cycle_start")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        console.error("Top-up: could not load profile for", userId, profileError?.message);
        return { ok: false, status: 500, message: "Profile not found" };
      }

      const cycleStart = currentCycleStart(profile.plan_started_at);
      const sameCycle = profile.bonus_games_cycle_start &&
        new Date(profile.bonus_games_cycle_start).getTime() === cycleStart.getTime();
      const newBonus = (sameCycle ? profile.bonus_games || 0 : 0) + topup.games;

      const { error } = await serviceClient
        .from("profiles")
        .update({ bonus_games: newBonus, bonus_games_cycle_start: cycleStart.toISOString() })
        .eq("id", userId);

      if (error) {
        console.error("Failed to apply top-up:", error.message);
        return { ok: false, status: 500, message: "Database update failed" };
      }
      console.log(`Top-up applied for user ${userId}: +${topup.games} games (bonus now ${newBonus})`);
      return { ok: true, status: 200 };
    }

    const tier = getTierByPriceId(paidPriceId);
    if (!tier) {
      console.error(`Unknown price ID ${paidPriceId} for user ${userId}`);
      return { ok: false, status: 400, message: "Unknown price" };
    }
    if (customData.tier && customData.tier !== tier) {
      console.warn(`Tier mismatch for user ${userId}: browser said ${customData.tier}, paid for ${tier}. Using paid tier.`);
    }

    const newSubscriptionId = eventData.data.subscriptionId || null;

    const { data: existing, error: existingError } = await serviceClient
      .from("profiles")
      .select("paddle_subscription_id, plan_tier, payg_since")
      .eq("id", userId)
      .single();

    if (existingError) {
      console.error("Could not load profile before plan update for", userId, existingError.message);
      return { ok: false, status: 500, message: "Profile lookup failed" };
    }
    const oldSubscriptionId = existing?.paddle_subscription_id || null;

    const updateFields = {
      plan_status: "paid",
      plan_tier: tier,
      plan_started_at: new Date().toISOString(),
    };
    if (newSubscriptionId) updateFields.paddle_subscription_id = newSubscriptionId;
    if (tier === "payg" && !(existing?.plan_tier === "payg" && existing?.payg_since)) {
      updateFields.payg_since = new Date().toISOString();
    }

    const { error } = await serviceClient
      .from("profiles")
      .update(updateFields)
      .eq("id", userId);

    if (error) {
      console.error("Failed to update profile after payment:", error.message);
      return { ok: false, status: 500, message: "Database update failed" };
    }
    console.log(`Payment confirmed for user ${userId}, tier: ${tier}, subscription: ${newSubscriptionId}`);

    // Leaving pay-as-you-go: bill their unbilled games on the old subscription first.
    if (existing?.plan_tier === "payg" && tier !== "payg" && oldSubscriptionId && existing?.payg_since) {
      try {
        const n = await billLeavingUser(userId, oldSubscriptionId, existing.payg_since);
        console.log(`Leaving payg: billed ${n} game(s) for user ${userId}`);
      } catch (err) {
        console.error(`MANUAL ACTION NEEDED: could not bill leaving payg user ${userId}: ${err.message}`);
      }
    }

    // A different, new subscription was bought: stop the old one at the end of its paid period.
    if (newSubscriptionId && oldSubscriptionId && oldSubscriptionId !== newSubscriptionId) {
      try {
        await paddle.subscriptions.cancel(oldSubscriptionId, { effectiveFrom: "next_billing_period" });
        console.log(`Old subscription ${oldSubscriptionId} scheduled to cancel at period end for user ${userId}`);
      } catch (err) {
        console.error(`MANUAL ACTION NEEDED: could not cancel old subscription ${oldSubscriptionId} for user ${userId}: ${err.message}`);
      }
    }
  }

  return { ok: true, status: 200 };
}

module.exports = { handlePaddleWebhook };
