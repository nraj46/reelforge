# ReelForge AI 🎬

**A promo reel for your business in 60 seconds.**

ReelForge AI turns a local business's offer into a ready-to-post vertical promo
reel (1080×1920) with AI voiceover, in about a minute. Built for salons,
restaurants, gyms, clinics, and real-estate agents — businesses that need social
content but can't hire a video person.

🔗 Live: https://reelforge-five-sooty.vercel.app

## What it does

- **Landing page** — hero, how-it-works, samples, planned pricing, FAQ, and a
  Data & Privacy page (`/data-policy`).
- **Studio demo (interactive)** — type a business name, pick a business type,
  describe an offer, choose a tone (fun / professional / premium), and
  ReelForge generates a 5-scene vertical reel in the browser:
  - Template-generated script tailored per business type (hook → benefits →
    urgency → call to action)
  - Designed scenes with per-type brand gradients and auto-advance
  - Voiceover via the browser's built-in speech synthesis, synced to scenes,
    with Play / Pause / Replay and story-style progress bars
  - Auto-generated caption + hashtag block with a copy button
- **Pre-made samples** — salon, taco restaurant, and gym cards that load canned
  reels into the same player.

Honest-demo note: this MVP plays the reel live in the browser. Server-side MP4
rendering, accounts, and payments are phase 2 (see below). All demo data is
in-memory only; no external API keys are used.

## Planned pricing (launching soon)

| Plan | Price | Includes |
| --- | --- | --- |
| Pay per reel | $5 / reel | 1 reel, AI voiceover, caption + hashtags |
| Starter | $29 / mo | 10 reels/mo, all templates |
| Growth | $59 / mo | 30 reels/mo, per-platform caption packs, priority rendering |

## Stack

Next.js 16 + TypeScript + Tailwind CSS 4, deployed on Vercel.

## Run locally

```bash
npm install
npm run dev   # http://localhost:3000
```

## Phase 2

- Accounts (Clerk) + project storage (Supabase)
- Server-side render to downloadable 1080×1920 MP4 with studio AI voices
- Stripe subscriptions ($29/$59) and $5 pay-per-reel checkout
- Logo/photo upload and brand kits per business
