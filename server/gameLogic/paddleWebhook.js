const { Paddle, Environment } = require("@paddle/paddle-node-sdk");
const { createClient } = require("@supabase/supabase-js");
const { getTierByPriceId } = require("./tiers");

const paddleEnv = process.env.PADDLE_ENV === "production" ? Environment.production : Environment.sandbox;

const paddle = new Paddle(process.env.PADDLE_API_KEY, { environment: paddleEnv });

// Service-role client: bypasses RLS entirely. Server-only, never expose this.
const serviceClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handlePaddleWebhook(rawBody, signatureHeader) {
  let eventData;
  try {
    eventData = await paddle.webhooks.unmarshal(
      rawBody,
      process.env.PADDLE_WEBHOOK_SECRET,
      signatureHeader
    );
  } catch (err) {
    console.error("Paddle webhook signature verification failed:", err.message);
    return { ok: false, status: 401, message: "Invalid signature" };
  }

  if (!eventData) {
    return { ok: false, status: 400, message: "Empty event" };
  }

  if (eventData.eventType === "transaction.completed") {
    const customData = eventData.data.customData || {};
    const userId = customData.supabase_user_id;

    if (!userId) {
      console.error("transaction.completed missing supabase_user_id:", customData);
      return { ok: false, status: 400, message: "Missing customData" };
    }

    // SECURITY: the tier is derived from the price Paddle says was actually
    // paid, NOT from customData (customData is set by the browser and can be
    // edited by the buyer).
    const items = eventData.data.items || [];
    if (items.length !== 1) {
      console.error(`Unexpected item count (${items.length}) for user ${userId}`);
      return { ok: false, status: 400, message: "Unexpected items" };
    }
    const paidPriceId = items[0].price?.id || items[0].priceId;
    const tier = getTierByPriceId(paidPriceId);

    if (!tier) {
      console.error(`Unknown price ID ${paidPriceId} for user ${userId}`);
      return { ok: false, status: 400, message: "Unknown price" };
    }

    // Tampering signal: browser claimed a different tier than what was paid.
    if (customData.tier && customData.tier !== tier) {
      console.warn(
        `Tier mismatch for user ${userId}: browser said ${customData.tier}, paid for ${tier}. Using paid tier.`
      );
    }

    const { error } = await serviceClient
      .from("profiles")
      .update({
        plan_status: "paid",
        plan_tier: tier,
        plan_started_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Failed to update profile after payment:", error.message);
      return { ok: false, status: 500, message: "Database update failed" };
    }

    console.log(`Payment confirmed for user ${userId}, tier: ${tier}`);
  }

  return { ok: true, status: 200 };
}

module.exports = { handlePaddleWebhook };
