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
- **Pre-made samples** — salon, taco restaurant, and gym cards. Each sample is
  now a **real rendered MP4** (in `public/samples/`) with studio TTS voiceover,
  rendered with the DailyByte pipeline (PIL-designed 1080×1920 slides → TTS →
  ffmpeg per-scene assembly, H.264 + AAC, ~30s each). Cards also offer a
  "Remix in the studio" button that loads the same business into the
  interactive player.

Honest-demo note: the interactive studio plays its reel live in the browser;
the three samples are real server-rendered MP4 files, exactly what the full
version produces. Accounts and payments are phase 2 (see below). All demo data
is in-memory only; no external API keys are used.

## Fast decision layer (the router)

Before the studio generates anything, every request passes through a **local
decision router** (`src/lib/router.ts`) — a small, fast layer in front of the
generation step, the same pattern as **Sarvam AI's Prism**, a decision model
that answers in ~44 ms so the big model only runs when it has to.

The router classifies the request instantly with local rules and keyword
scoring — business category (auto-detected from the name + offer when the type
is "Other"), offer intent (percentage discount, BOGO, freebie, fixed-price,
launch, general), scene template, caption style, and hashtag seeds — and
reports each decision in the studio with its real measured time (typically
well under a millisecond) and an **"AI calls avoided"** session counter: every
decision the router answers locally is one the AI never has to make.

Honest-demo note: this router is rules-based and runs entirely in the browser
— no network call, no AI call. The production version swaps the rules for a
small hosted decision model; the architecture (fast router in front, heavy
generation behind) stays the same.

## Pricing (launching soon) — one simple plan

| Plan | Price | Includes |
| --- | --- | --- |
| Everything | $20 / mo | Up to 30 reels/mo, studio AI voiceover, your own voice or an AI voice in any language, brand kit (logo, colors, photos), custom reels & custom requests, caption + hashtag packs, all templates (new monthly). Fair use: up to 30 reels/month. |

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
- Stripe subscription checkout ($20/mo single plan, test mode with dummy bank until launch)
- Logo/photo upload and brand kits per business
