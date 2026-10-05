const { Paddle, Environment } = require("@paddle/paddle-node-sdk");
const { createClient } = require("@supabase/supabase-js");
const { getUserId } = require("./supabaseAuth");
const { billLeavingUser } = require("./billing");

const paddleEnv = process.env.PADDLE_ENV === "production" ? Environment.production : Environment.sandbox;
const paddle = new Paddle(process.env.PADDLE_API_KEY, { environment: paddleEnv });
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const fail = (status, message) => ({ status, body: { message } });

async function cancelSubscription(accessToken) {
  const userId = await getUserId(accessToken);
  if (!userId) return fail(401, "Please log in again.");

  const { data: profile, error } = await db
    .from("profiles")
    .select("plan_status, plan_tier, paddle_subscription_id, payg_since, cancel_effective_at")
    .eq("id", userId)
    .single();
  if (error || !profile) return fail(500, "Could not load your account.");

  if (profile.plan_status !== "paid" || !profile.paddle_subscription_id) {
    return fail(400, "You have no active subscription to cancel.");
  }
  if (profile.cancel_effective_at) {
    return { status: 200, body: { endsNow: false, effectiveAt: profile.cancel_effective_at } };
  }

  const subId = profile.paddle_subscription_id;

  if (profile.plan_tier === "payg") {
    // Bill any unbilled games first. If this fails, stop: no games are lost.
    if (profile.payg_since) {
      try {
        const n = await billLeavingUser(userId, subId, profile.payg_since);
        console.log(`Cancel (payg): billed ${n} game(s) for user ${userId}`);
      } catch (err) {
        console.error(`Cancel (payg) billing failed for user ${userId}: ${err.message}`);
        return fail(502, "We could not settle your games just now. Please try again in a few minutes.");
      }
    }
    try {
      await paddle.subscriptions.cancel(subId, { effectiveFrom: "next_billing_period" });
    } catch (err) {
      console.error(`Cancel (payg) failed for user ${userId}: ${err.message}`);
      return fail(502, "We could not cancel just now. Please try again.");
    }
    await db.from("profiles").update({ plan_status: "cancelled", cancel_effective_at: null }).eq("id", userId);
    console.log(`Cancel (payg) done for user ${userId}`);
    return { status: 200, body: { endsNow: true } };
  }

  // Monthly plan: keep access until the end of the period already paid.
  let sub;
  try {
    sub = await paddle.subscriptions.cancel(subId, { effectiveFrom: "next_billing_period" });
  } catch (err) {
    console.error(`Cancel failed for user ${userId}: ${err.message}`);
    return fail(502, "We could not cancel just now. Please try again.");
  }
  const effectiveAt = sub?.scheduledChange?.effectiveAt || null;
  await db.from("profiles").update({ cancel_effective_at: effectiveAt }).eq("id", userId);
  console.log(`Cancel scheduled for user ${userId}, effective ${effectiveAt}`);
  return { status: 200, body: { endsNow: false, effectiveAt } };
}

module.exports = { cancelSubscription };

