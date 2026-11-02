"use client";

import { useEffect, useRef, useState } from "react";
import ReelPlayer from "./ReelPlayer";
import {
  generateReel,
  TONE_OPTIONS,
  TYPE_OPTIONS,
  type BusinessType,
  type Reel,
  type ReelInput,
  type Tone,
} from "@/lib/reel";

export default function Studio({
  injected,
}: {
  /** A reel generated elsewhere (sample cards) to load into the studio player. */
  injected: { reel: Reel; nonce: number } | null;
}) {
  const [businessName, setBusinessName] = useState("");
  const [type, setType] = useState<BusinessType>("salon");
  const [offer, setOffer] = useState("");
  const [tone, setTone] = useState<Tone>("fun");
  const [reel, setReel] = useState<Reel | null>(null);
  const [playSignal, setPlaySignal] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (injected) {
      setReel(injected.reel);
      setPlaySignal((n) => n + 1);
      setCopied(false);
    }
  }, [injected]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !offer.trim()) {
      setError("Add your business name and your offer — that's all the AI needs.");
      return;
    }
    setError(null);
    const input: ReelInput = { businessName, type, offer, tone };
    setReel(generateReel(input));
    setPlaySignal((n) => n + 1);
    setCopied(false);
    requestAnimationFrame(() => {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const copyCaption = async () => {
    if (!reel) return;
    const text = `${reel.caption}\n\n${reel.hashtags.join(" ")}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-fuchsia-400";
  const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400";

  return (
    <div className="grid items-start gap-10 lg:grid-cols-2">
      <form
        onSubmit={submit}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"
      >
        <h3 className="text-lg font-bold text-zinc-50">Create your reel</h3>
        <p className="mt-1 text-sm text-zinc-400">
          Thirty seconds to fill in — about a minute to a finished reel.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className={labelCls} htmlFor="biz">Business name</label>
            <input
              id="biz"
              className={inputCls}
              placeholder="e.g. Luxe Locks Salon"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              maxLength={60}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="btype">Business type</label>
            <select
              id="btype"
              className={inputCls}
              value={type}
              onChange={(e) => setType(e.target.value as BusinessType)}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="offer">Your offer</label>
            <input
              id="offer"
              className={inputCls}
              placeholder="e.g. 50% off haircuts this week"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              maxLength={90}
            />
          </div>
          <div>
            <span className={labelCls}>Tone</span>
            <div className="grid grid-cols-3 gap-2">
              {TONE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setTone(o.value)}
                  className={`rounded-lg border px-3 py-2.5 text-left transition ${
                    tone === o.value
                      ? "border-fuchsia-400 bg-fuchsia-400/10"
                      : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
                  }`}
                >
                  <span className="block text-sm font-bold text-zinc-100">{o.label}</span>
                  <span className="block text-[11px] text-zinc-400">{o.hint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/25 transition hover:opacity-90"
        >
          🎬 Generate my reel
        </button>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-zinc-500">
          Interactive demo: the reel plays live in your browser with a device voice.
          The full version renders a downloadable 1080×1920 MP4 with studio AI voiceover —
          downloads and payments launch soon.
        </p>
      </form>

      <div ref={playerRef}>
        {reel ? (
          <div>
            <ReelPlayer reel={reel} playSignal={playSignal} />
            <div className="mx-auto mt-5 max-w-[430px] rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-zinc-100">📝 Caption &amp; hashtags</h4>
                <button
                  onClick={copyCaption}
                  className="rounded-full border border-zinc-600 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-zinc-400"
                >
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{reel.caption}</p>
              <p className="mt-2 text-sm leading-relaxed text-fuchsia-300">
                {reel.hashtags.join(" ")}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-8 text-center">
            <div className="text-5xl">🎬</div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
              Your reel preview appears here. Fill in the form, hit{" "}
              <strong className="text-zinc-200">Generate my reel</strong>, and watch it play
              with voiceover.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
