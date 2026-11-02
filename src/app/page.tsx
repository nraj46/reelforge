"use client";

import { useRef, useState } from "react";
import Studio from "@/components/Studio";
import { generateReel, SAMPLES, type Reel } from "@/lib/reel";

const STEPS = [
  {
    n: "1",
    title: "Describe your offer",
    body: "Type your business name and the deal you're running — a discount, a new menu item, a free first visit. That's all we need.",
  },
  {
    n: "2",
    title: "AI writes + voices it",
    body: "ReelForge writes a punchy script for your kind of business, designs the scenes, and records a voiceover — in about a minute.",
  },
  {
    n: "3",
    title: "Download & post",
    body: "Get a vertical 1080×1920 video plus a ready-made caption and hashtags. Post it to Reels, TikTok, or Shorts and watch the bookings come in.",
  },
];

const PLANS = [
  {
    name: "Pay per reel",
    price: "$5",
    per: "per reel",
    features: ["No subscription", "1 vertical reel (1080×1920)", "AI voiceover included", "Caption + hashtags"],
    cta: "Try the demo",
    highlight: false,
  },
  {
    name: "Starter",
    price: "$29",
    per: "per month",
    features: ["10 reels / month", "AI voiceover included", "Caption + hashtags", "All business templates"],
    cta: "Launching soon",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$59",
    per: "per month",
    features: [
      "30 reels / month",
      "Caption + hashtag packs tuned per platform",
      "Priority rendering",
      "New templates every month",
    ],
    cta: "Launching soon",
    highlight: true,
  },
];

const FAQS = [
  {
    q: "Do I need to film anything or be on camera?",
    a: "No. ReelForge builds the whole reel from your offer text — designed scenes, big readable text, and an AI voiceover. No camera, no microphone, no editing software.",
  },
  {
    q: "What exactly do I get?",
    a: "A vertical 1080×1920 video ready for Instagram Reels, TikTok, and YouTube Shorts, plus a written caption and hashtag set for the post. In this public demo the reel plays live in your browser instead of downloading.",
  },
  {
    q: "How long does it take?",
    a: "About a minute. You spend 30 seconds describing your offer; the script, scenes, and voiceover are generated automatically after that.",
  },
  {
    q: "I'm not technical. Can I still use it?",
    a: "Yes — if you can type one sentence about your offer, you can make a reel. There are no timelines, layers, or export settings to learn.",
  },
  {
    q: "When can I sign up and pay?",
    a: "Paid plans are launching soon. The pricing on this page is the planned launch pricing — try the interactive demo today, and plans with downloads, accounts, and payments arrive in the next release.",
  },
];

export default function Home() {
  const [injected, setInjected] = useState<{ reel: Reel; nonce: number } | null>(null);
  const studioRef = useRef<HTMLElement>(null);

  const playSample = (input: (typeof SAMPLES)[number]["input"]) => {
    setInjected({ reel: generateReel(input), nonce: Date.now() });
    studioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-900 bg-zinc-950/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
          <a href="#" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <span className="text-2xl">🎬</span> ReelForge{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
              AI
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm text-zinc-300 sm:flex">
            <a href="#studio" className="hover:text-white">Studio</a>
            <a href="#samples" className="hover:text-white">Samples</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
            <a
              href="#studio"
              className="rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-500 px-4 py-2 font-bold text-white shadow shadow-fuchsia-500/25 hover:opacity-90"
            >
              Make a reel
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-fuchsia-600/15 blur-3xl" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-16 text-center sm:pt-24">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-fuchsia-300">
            For salons · restaurants · gyms · clinics · realtors
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            A promo reel for your business in{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">
              60 seconds
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            Type your offer. ReelForge AI writes the script, designs the scenes, and voices
            the whole thing — a ready-to-post vertical video, no camera or editor required.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#studio"
              className="rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/25 transition hover:opacity-90"
            >
              🎬 Try the studio — free
            </a>
            <a
              href="#samples"
              className="rounded-full border border-zinc-700 px-7 py-3.5 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500"
            >
              See samples
            </a>
          </div>
          <p className="mt-5 text-xs text-zinc-500">
            No sign-up for the demo · Full version with downloads launching soon
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-900">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-amber-500 text-base font-extrabold text-white">
                  {s.n}
                </div>
                <h3 className="mt-4 text-base font-bold text-zinc-50">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Studio */}
      <section id="studio" ref={studioRef} className="scroll-mt-20 border-t border-zinc-900">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            The Studio <span className="text-fuchsia-400">— live demo</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-zinc-400">
            This is the real flow, running in your browser. Describe any offer and watch
            ReelForge build the reel.
          </p>
          <div className="mt-10">
            <Studio injected={injected} />
          </div>
        </div>
      </section>

      {/* Samples */}
      <section id="samples" className="scroll-mt-20 border-t border-zinc-900">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Made with ReelForge
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-zinc-400">
            Tap any sample to load it into the studio player and hear it.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {SAMPLES.map((s) => {
              const preview = generateReel(s.input);
              return (
                <button
                  key={s.id}
                  onClick={() => playSample(s.input)}
                  className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 text-left transition hover:border-zinc-600"
                >
                  <div
                    className={`relative flex h-44 flex-col justify-between bg-gradient-to-br ${preview.gradient} p-5`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                      {preview.typeLabel}
                    </span>
                    <div>
                      <div className="text-4xl">{preview.emoji}</div>
                      <p className="mt-2 text-lg font-extrabold leading-tight text-white drop-shadow">
                        {s.input.offer}
                      </p>
                    </div>
                    <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm text-zinc-900 shadow transition group-hover:scale-110">
                      ▶
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-bold text-zinc-50">{s.input.businessName}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{s.blurb}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 border-t border-zinc-900">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Simple pricing
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-zinc-400">
            Cheaper than one boosted post — and it makes the content for you. Planned launch
            pricing; paid plans launch soon.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl border p-6 ${
                  p.highlight
                    ? "border-fuchsia-400/60 bg-fuchsia-400/[0.06]"
                    : "border-zinc-800 bg-zinc-900/60"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-500 px-3 py-1 text-[11px] font-bold text-white">
                    MOST POPULAR
                  </span>
                )}
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                  {p.name}
                </h3>
                <p className="mt-3">
                  <span className="text-4xl font-extrabold text-zinc-50">{p.price}</span>{" "}
                  <span className="text-sm text-zinc-400">{p.per}</span>
                </p>
                <ul className="mt-5 space-y-2 text-sm text-zinc-300">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-emerald-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#studio"
                  className={`mt-6 block rounded-full px-5 py-2.5 text-center text-sm font-bold transition ${
                    p.highlight
                      ? "bg-gradient-to-r from-fuchsia-500 to-amber-500 text-white hover:opacity-90"
                      : "border border-zinc-600 text-zinc-100 hover:border-zinc-400"
                  }`}
                >
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 border-t border-zinc-900">
        <div className="mx-auto w-full max-w-3xl px-6 py-16">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Questions
          </h2>
          <div className="mt-10 space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
                <h3 className="text-sm font-bold text-zinc-50">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-6 py-10 text-center">
          <p className="text-sm font-bold">
            🎬 ReelForge <span className="text-fuchsia-400">AI</span>
          </p>
          <p className="max-w-md text-xs leading-relaxed text-zinc-500">
            Promo reels for local businesses, generated in about a minute. This site is an
            interactive demo — accounts, downloads, and payments arrive with the full launch.
          </p>
          <nav className="flex gap-5 text-xs text-zinc-400">
            <a href="#studio" className="hover:text-white">Studio</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="/data-policy" className="hover:text-white">Data &amp; Privacy</a>
          </nav>
          <p className="text-[11px] text-zinc-600">© 2026 ReelForge AI · A DailyByte product</p>
        </div>
      </footer>
    </main>
  );
}
