# The Elimination Game - Progress Tracker

## Stack
- Backend: Node.js + Express + Socket.IO - deployed live on Render
- Frontend: React + Vite - deployed live on Render
- Auth/Trial: Supabase
- Payments: Paddle (sandbox active, live pending business verification)
- Zero-cost stack throughout. Windows/PowerShell, VS Code auto-save.
- ALL file work done via terminal commands only - never manual editing.

## Core Game - Stages 0-9: COMPLETE (100%)
- [x] Stages 0-9 - full game loop, deployed, load-tested, live on Render

## Accounts / Trial - Stages A1-A8
- [x] A1-A6 - Supabase auth, signup/login, trial gate, upgrade screen, logout
- [~] A7 - Real Paddle checkout - webhook handler built server-side, needs live
      end-to-end test (see C6 notes below - same missing link, same task)
- [ ] A8 - Full end-to-end test - blocked on A7

## Visual Redesign - Stage B: COMPLETE (100%) - LIVE, CONFIRMED
- Design tokens in client/src/theme.css: --void #120E16, --surface #1E1720,
  --danger #E23B4D, --alive #2FBF87, --warning #F2A93B, --victory #E8B93E,
  --ink #F5F1F0, --ink-muted #9C8FA0
- Fonts: Bebas Neue (drama moments only), Manrope (everything else)

## Paddle integration notes
- Product "Last Vote Standing" created, price pri_01m2hxc35c6drhryq0nhaftwx8 ($19/mo, OLD - superseded by 3-tier prices below)
- Sandbox CLIENT token (safe to expose, designed for frontend): test_30f34b518921e2bd43e329fec68
- Sandbox price IDs (not secrets, just IDs): starter pri_01m3e5w653ncg6xt2t9d6xhzwq,
  standard pri_01m3e5x97jy9pn5n2nvpsetzcv, unlimited pri_01m3e5y5sdas7r5hhrpdnyvj7n
- SECRET VALUES (Paddle API key, webhook signing secret, Supabase service role key)
  are stored ONLY in server/.env - NEVER write actual secret values into this file
  again. A past version of this file had real secrets typed in directly, caught by
  GitHub push protection before it reached the remote repo - fixed by redaction +
  commit amend. Lesson learned: reference "stored in server/.env" only, never the
  value itself, in any file that gets committed.
- Website approval: elimination-game-k9fv.onrender.com is APPROVED in Paddle.
  localhost was never successfully submitted/approved - use the live Render URL
  for all Paddle checkout testing going forward, not localhost.
- Full business/identity verification for LIVE payments not yet submitted (separate,
  bigger task - needs passport + proof of address, doing on a dedicated day)

## Stage C - Product & Monetization Overhaul (planning complete, partially built)
Key decisions locked in:
- Avatars: generated only for now (initials + deterministic color), no photo upload
- Quota reset: MONTHLY, not daily
- Currency: building OUR OWN country-based price display, EXACT MATCH to real
  fixed Paddle prices per currency (not live conversion)
- Pay-as-you-go plan: UNCAPPED, no safety ceiling
- FINAL 3-tier pricing (confirmed):
  Starter $15/mo = 10 games/month
  Standard $25/mo = 25 games/month
  Unlimited $55/mo = unlimited games

Stages, in dependency order:
- [x] C1 - Server-side auth enforcement: CONFIRMED BUILT. server/gameLogic/supabaseAuth.js
      verifies Supabase JWT server-side via verifyAccountAccess() on CREATE_GAME and
      HOST_REJOIN. HOST_REJOIN token bug found + fixed (was silently failing on
      page refresh) - needs re-test: create game, get players in, refresh host tab
      mid-lobby, confirm reconnect works instead of resetting.
- [x] C2 - Usage tracking: CONFIRMED BUILT. game_creations Supabase table.
      logGameCreated() logs on CREATE_GAME (started: false). markGameStarted()
      flips to started: true only when Start Game clicked.
- [x] C3 - Generated player avatars (client/src/avatar.js + Avatar.jsx/css).
- [x] C4 - Voting screen redesign: DONE, visual polish pass applied and confirmed
      (fluid avatars, colored tile accent stripes, gradient+shadow depth).
- [x] C5 - Country selector popup at signup, stored on profile. CONFIRMED WORKING.
- [~] C6 - PARTIALLY DONE, this is the active work.
      DONE: Backend quota enforcement (rolling 30-day window, supabaseAuth.js).
      DONE: 3-tier upgrade screen LIVE, CONFIRMED WORKING - client/src/tiers.js
      mirrors server/gameLogic/tiers.js price IDs, UpgradePage.jsx opens Paddle
      overlay checkout per tier with customData { supabase_user_id, tier }.
      DONE: server/.env has all 6 needed vars (SUPABASE_URL, SUPABASE_ANON_KEY,
      PADDLE_API_KEY, PADDLE_ENV, PADDLE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY)
      - confirmed clean, no BOM issues, verified via Get-Content.
      DONE: server/gameLogic/paddleWebhook.js built using official
      @paddle/paddle-node-sdk's webhooks.unmarshal() for signature verification
      (safer than hand-rolled HMAC). On verified transaction.completed event,
      updates profiles table (plan_status='paid', plan_tier, plan_started_at)
      via a service-role Supabase client that bypasses RLS.
      DONE: POST /api/paddle-webhook route wired in server/index.js using
      express.raw() scoped to ONLY this route - CONFIRMED via Select-String
      (3 matches: require, route path, handler call).
      DONE: Server confirmed starts clean with no errors after all above changes.
      BLOCKED/IN PROGRESS: first real sandbox payment test hit "Something went
      wrong" / transaction_default_checkout_url_not_set. Root cause: Default
      Payment Link + Website Approval were pointed at localhost, which was never
      actually approved by Paddle (only the live Render domain is approved).
      DECISION MADE: switch all testing to the live Render URL instead of
      localhost going forward - it's already approved, zero extra waiting.
      IMMEDIATE NEXT STEPS (nothing below this line done yet):
      1. Set Paddle Default Payment Link to https://elimination-game-k9fv.onrender.com/upgrade
      2. Set Paddle webhook notification destination back to
         https://elimination-game-k9fv.onrender.com/api/paddle-webhook
         (was temporarily pointed at a localtunnel URL for local testing - revert this)
      3. Push latest code (webhook route) live to Render - WAS BLOCKED by
         GitHub push protection (secrets in this file) - should be unblocked
         now that this file is redacted, retry push next
      4. Add all server/.env vars to Render's environment variables dashboard too
         (Render doesn't read local .env files - EASY TO FORGET, do before testing)
      5. Test full sandbox payment flow on the LIVE url with test card 4242 4242 4242 4242
      6. Confirm both: server logs show "Payment confirmed for user...", AND
         Supabase profiles table row actually flips to plan_status=paid
      This webhook completes BOTH C6 and A7 in one piece of work.
- [ ] C7 - Exact-match localized pricing (fixed multi-currency Paddle prices +
      matching display table, no exchange-rate API needed)
- [ ] C8 - Pay-as-you-go option (4th upgrade choice), uncapped, billed monthly
      via Paddle Charges API off C2's usage log (per-game rate TBD at build time)
- [ ] C9 - Trust/UX pass across all new screens (consistent tokens, clear terms,
      secure-checkout signal)

## Working conventions (always apply)
- User is a complete beginner - spell out every step, no assumed knowledge
- All file creation/edits via terminal only (PowerShell heredoc: @'...'@ | Set-Content -Path "path")
- NEVER write actual secret values (API keys, webhook secrets, service role keys)
  into PROGRESS.md or any other committed file - reference "stored in server/.env"
  only. This caused a GitHub push protection block once already - don't repeat it.
- NEVER use Set-Content -Encoding utf8 for .env files - it adds a BOM that breaks
  parsing. Use [System.IO.File]::WriteAllText with UTF8Encoding($false) instead.
- Prefer full-file rewrites over multi-line regex find/replace - regex has silently failed multiple times
- Give full cd path every time, never assume current directory
- Give both restart commands proactively after any pause: "node index.js" in server/, "npm run dev" in client/
- Do NOT ask for verification/confirmation pings after routine updates - just update and move on
- Keep responses concise; be dramatic/premium about the game's feel, efficient/no-nonsense about build steps

## Known issues / deferred (low priority)
- UpgradePage.jsx: if a visitor is NOT logged in, Choose Plan buttons do nothing (silent return).
  Fix later: redirect to /login when no session, and reset button text after checkout closes.

## Status update - payment flow
- Sandbox payment on the live URL: CONFIRMED completes. profiles row shows plan_status=paid and plan_tier set by the webhook.
- Render env vars: 10 required (6 server-side + 4 VITE_*), all added.
- UpgradePage: post-payment auto-redirect to /host added (polls profiles until paid, 45s timeout).
- Still to verify: Render log line "Payment confirmed for user" on a fresh test payment.
