const { createClient } = require("@supabase/supabase-js");
const { TIERS } = require("./tiers");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

function scopedClient(accessToken) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

// Finds the start of the current rolling 30-day billing cycle.
// e.g. if plan_started_at is Jan 1 and today is Feb 15, the cycle
// boundaries are every 30 days from Jan 1 - so this returns Jan 31
// (the most recent boundary at or before "now").
function currentCycleStart(planStartedAt) {
  const start = new Date(planStartedAt);
  const now = new Date();
  const msPerCycle = 30 * 24 * 60 * 60 * 1000;
  const elapsed = now.getTime() - start.getTime();
  const cyclesElapsed = Math.floor(elapsed / msPerCycle);
  return new Date(start.getTime() + cyclesElapsed * msPerCycle);
}

async function verifyAccountAccess(accessToken) {
  if (!accessToken) return { valid: false, reason: "NO_TOKEN" };

  const supabase = scopedClient(accessToken);

  const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !user) return { valid: false, reason: "INVALID_TOKEN" };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("plan_status, trial_ends_at, plan_tier, plan_started_at")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return { valid: false, reason: "NO_PROFILE" };

  const trialExpired = new Date(profile.trial_ends_at) < new Date();

  if (profile.plan_status === "manual") {
    return { valid: true, userId: user.id };
  }

  if (profile.plan_status === "trial") {
    if (trialExpired) return { valid: false, reason: "TRIAL_EXPIRED" };
    return { valid: true, userId: user.id };
  }

  if (profile.plan_status === "paid") {
    const tier = TIERS[profile.plan_tier];
    if (!tier) return { valid: false, reason: "NO_PROFILE" };

    if (tier.gameLimit === null) {
      return { valid: true, userId: user.id };
    }

    const cycleStart = currentCycleStart(profile.plan_started_at);
    const { count, error: countError } = await supabase
      .from("game_creations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("started", true)
      .gte("created_at", cycleStart.toISOString());

    if (countError) return { valid: false, reason: "NO_PROFILE" };

    if (count >= tier.gameLimit) {
      return { valid: false, reason: "QUOTA_EXCEEDED" };
    }

    return { valid: true, userId: user.id };
  }

  return { valid: false, reason: "TRIAL_EXPIRED" };
}

async function logGameCreated(accessToken, userId, roomCode) {
  const supabase = scopedClient(accessToken);
  const { data, error } = await supabase
    .from("game_creations")
    .insert({ user_id: userId, room_code: roomCode, started: false })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to log game creation:", error.message);
    return null;
  }
  return data.id;
}

async function markGameStarted(accessToken, recordId) {
  if (!recordId) return;
  const supabase = scopedClient(accessToken);
  const { error } = await supabase
    .from("game_creations")
    .update({ started: true })
    .eq("id", recordId);

  if (error) console.error("Failed to mark game as started:", error.message);
}

module.exports = { verifyAccountAccess, logGameCreated, markGameStarted };
