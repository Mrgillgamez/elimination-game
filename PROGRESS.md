# The Elimination Game — Progress Tracker
Last updated: check bottom of file

## Stack
- Backend: Node.js + Express + Socket.IO — deployed live on Render
- Frontend: React + Vite — deployed live on Render
- Auth/Trial: Supabase
- Payments: Paddle (on hold, pending business approval)
- Zero-cost stack throughout. Windows/PowerShell, VS Code auto-save.
- ALL file work done via terminal commands only — never manual editing.

## Core Game — Stages 0-9: COMPLETE (100%)
- [x] Stage 0 — Backend + frontend scaffolding, socket test connection
- [x] Stage 1 — Core state machine (lobby/round/vote/tally/eliminate/final-two)
- [x] Stage 2 — Lobby + join flow, QR code, live player list
- [x] Stage 3 — Voting round (timer, cast vote, tally)
- [x] Stage 4 — (tie handling groundwork, folded into Stage 5)
- [x] Stage 5 — Full tie-break chain
- [x] Stage 6 — Final two resolution
- [x] Stage 7 — Disconnect handling (LEFT status, PLAYER_LEFT broadcast)
- [x] Stage 8 — Suspense/polish: sounds (tick, spoken countdown, drumroll, reveal, tie, winner), dramatic reveals on host + player, eliminated spectator mode, winner screen + confetti
- [x] Stage 9 — Deployed live on Render, single combined server+frontend, cross-network tested, 12-15 tab load test passed clean

## Accounts / Trial — Stages A1-A8
- [x] A1 — Supabase project + profiles table + RLS
- [x] A2 — Landing page + Terms of Service + Privacy Policy pages
- [x] A3 — Signup (email+password, no card, starts 3-day trial)
- [x] A4 — Login
- [x] A5 — Gate /host behind login + trial/plan check (useRequireActiveAccount hook)
- [x] A6 — /upgrade screen ($19/month, placeholder button)
- [x] Extra — Logout button + Terms/Privacy links (HostTopBar component)
- [ ] A7 — Real Paddle checkout — BLOCKED on Paddle business/identity approval
- [ ] A8 — Full end-to-end test (signup -> host -> trial expires -> pay -> unlocked) — blocked on A7

## Visual Redesign — Stage B: COMPLETE (100%), pending final push to live
Design tokens in client/src/theme.css:
- Colors: --void #120E16, --surface #1E1720, --surface-raised #271E2B, --danger #E23B4D,
  --alive #2FBF87, --warning #F2A93B, --victory #E8B93E, --ink #F5F1F0, --ink-muted #9C8FA0, --border #332A38
- Fonts: --font-display: Bebas Neue (countdown/reveals/winner name ONLY), --font-body: Manrope (everything else)
- Sharp radii, no soft rounded cards, danger red reserved for elimination only

- [x] Landing page redesigned
- [x] Login page redesigned
- [x] Signup page redesigned
- [x] Upgrade page redesigned
- [x] Host view redesigned + live playtested (lobby/voting/reveal/tie/winner all confirmed)
- [x] Player view redesigned + live playtested (join/wait/vote/locked/eliminated confirmed)
- [x] Legal pages (Terms/Privacy) — tokens applied, VISUALLY CONFIRMED
- [x] HostTopBar — tokens applied, VISUALLY CONFIRMED

## Immediate next steps
1. Screenshot /terms, /privacy, and host top bar on /host to close out Stage B visual check
2. Push Stage B redesign live to Render (currently only confirmed on localhost)
3. Resume A7 (Paddle) + A8 (e2e test) once Paddle approval comes through

## Working conventions (always apply)
- User is a complete beginner — spell out every step, no assumed knowledge
- All file creation/edits via terminal only (PowerShell heredoc: @'...'@ | Set-Content -Path "path" )
- Always verify edits with Select-String or Get-Content after writing — never assume a script edit landed
- Give full cd path every time, never assume current directory
- Give both restart commands proactively after any pause: "node index.js" in server/, "npm run dev" in client/
- Keep responses concise; be dramatic/premium about the game's feel, efficient/no-nonsense about build steps
