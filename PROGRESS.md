# The Elimination Game - Progress Tracker

## Stack
- Backend: Node.js + Express + Socket.IO - deployed live on Render
- Frontend: React + Vite - deployed live on Render
- Auth/Trial: Supabase
- Payments: Paddle (SANDBOX working end-to-end; live needs business verification first)
- Zero-cost stack throughout. Windows/PowerShell, VS Code auto-save.
- ALL file work done via terminal commands only - never manual editing.

## Core Game - Stages 0-9: COMPLETE (100%)
- [x] Stages 0-9 - full game loop, deployed, load-tested, live on Render

## Accounts / Trial - Stages A1-A8
- [x] A1-A6 - Supabase auth, signup/login, trial gate, upgrade screen, logout
- [x] A7 - Paddle checkout + webhook: CONFIRMED in sandbox on the live URL
- [~] A8 - End-to-end test: signup -> trial -> expire -> pay -> auto-redirect to /host CONFIRMED
      in sandbox. Still untested: monthly quota enforcement per tier (server side).

## Visual Redesign - Stage B: COMPLETE (100%) - LIVE
- Design tokens in client/src/theme.css: --void #120E16, --surface #1E1720,
  --danger #E23B4D, --alive #2FBF87, --warning #F2A93B, --victory #E8B93E,
  --ink #F5F1F0, --ink-muted #9C8FA0
- Fonts: Bebas Neue (drama moments only), Manrope (everything else)

## Stage C - Product & Monetization Overhaul
Decisions locked in:
- Avatars generated only (initials + deterministic color), no photo upload
- Quota is a ROLLING 30-day window from profiles.plan_started_at (set by the webhook on each paid transaction), not a calendar month. Only games that actually STARTED count toward quota.
- Currency: our own country-based price display, EXACT match to fixed Paddle prices per currency
- Pay-as-you-go plan: UNCAPPED
- Live tiers: Starter $15/mo = 10 games, Standard $25/mo = 25 games, Unlimited $55/mo = unlimited

- [x] C1 - Server-side auth (supabaseAuth.js verifies Supabase JWT on CREATE_GAME + HOST_REJOIN)
- [x] C2 - Usage tracking (game_creations table; started=true only when Start Game clicked)
- [x] C3 - Generated avatars (avatar.js + Avatar.jsx/css)
- [x] C4 - Voting screen: 3-col grid, no scroll, tap-to-select, centered confirm overlay
- [x] C5 - Country selector popup at signup, saved on profiles.country
- [x] C6 - 3-tier upgrade page + Paddle overlay checkout + webhook. CONFIRMED in sandbox:
      webhook (server/gameLogic/paddleWebhook.js, official Paddle SDK signature check) sets
      profiles plan_status=paid + plan_tier; UpgradePage polls profiles and redirects to /host.
- [ ] C7 - Exact-match localized pricing (fixed multi-currency Paddle prices + display table)
- [ ] C8 - Pay-as-you-go option (4th choice), billed monthly via Paddle Charges API off game_creations
- [ ] C9 - Trust/UX pass across new screens (consistent tokens, clear terms, secure-checkout signal)

## Paddle notes
- Sandbox only right now. Testing must use the live Render URL (only approved domain);
  localhost was never approved.
- Paddle dashboard settings that must stay pointed at the live URL:
  Default payment link -> https://elimination-game-k9fv.onrender.com/upgrade
  Notification destination -> https://elimination-game-k9fv.onrender.com/api/paddle-webhook
- Render needs 10 env vars: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
  PADDLE_API_KEY, PADDLE_ENV, PADDLE_WEBHOOK_SECRET, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,
  VITE_PADDLE_CLIENT_TOKEN, VITE_PADDLE_ENV. VITE_* values are baked in at build time.
- TO GO LIVE (later, after Paddle business/identity verification is approved): create live
  products/prices, then swap sandbox values for live ones in Render env (PADDLE_API_KEY,
  PADDLE_ENV, PADDLE_WEBHOOK_SECRET, VITE_PADDLE_CLIENT_TOKEN, VITE_PADDLE_ENV) AND the price IDs
  in BOTH client/src/tiers.js and server/gameLogic/tiers.js; add a live webhook destination.
- Verification needs: government ID + proof of address, as individual/sole trader.
  Security to do: rotate the live Paddle key that was once pasted in chat.

## Known issues / deferred
- SECURITY FIX IN PROGRESS: paddleWebhook.js was trusting the browser-sent customData.tier to set
  plan_tier (a buyer could pay for Starter and claim Unlimited). Rewritten to derive the tier from the
  paid price ID via getTierByPriceId. Code written; still needs deploy to Render + a sandbox purchase
  test to confirm plan_tier is set correctly.
- UpgradePage: logged-out visitors clicking Choose Plan see nothing (silent return).
- UpgradePage: if the checkout overlay is closed without paying, the button stays "Opening checkout...".
- C1 re-test pending: create game, get players in, refresh host tab mid-lobby, confirm it reconnects.
- Security cleanup planned: review keys that were pasted in chat, remove what is not needed.

## Working conventions (always apply)
- User is a complete beginner - spell out every step, no assumed knowledge
- All file creation/edits via terminal only (PowerShell heredoc: @'...'@ | Set-Content -Path "path")
- NEVER write actual secret values into PROGRESS.md or any committed file - only say "stored in server/.env"
- NEVER use Set-Content -Encoding utf8 for .env files (adds a BOM). Use [System.IO.File]::WriteAllText with UTF8Encoding($false).
- Prefer full-file rewrites over multi-line regex find/replace - regex has silently failed multiple times
- Give full cd path every time, never assume current directory
- Restart commands: "node index.js" in server/, "npm run dev" in client/
- Do NOT ask for verification pings after routine updates - just update and move on
- Keep responses concise; dramatic/premium for the game's feel, efficient for build steps


