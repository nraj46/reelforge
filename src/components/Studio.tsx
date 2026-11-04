"use client";

import { useEffect, useRef, useState } from "react";
import ReelPlayer from "./ReelPlayer";
import {
  generateReel,
  LANGUAGE_OPTIONS,
  TONE_OPTIONS,
  TYPE_OPTIONS,
  type BusinessType,
  type Language,
  type Reel,
  type ReelInput,
  type Tone,
} from "@/lib/reel";
import { routeRequest, type RouteResult } from "@/lib/router";

const BRAND_SWATCHES = ["#ec4899", "#f97316", "#22c55e", "#0ea5e9", "#a855f7", "#eab308"];

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
  const [language, setLanguage] = useState<Language>("en");
  const [voiceMode, setVoiceMode] = useState<"ai" | "record">("ai");
  const [brandColor, setBrandColor] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [reel, setReel] = useState<Reel | null>(null);
  const [playSignal, setPlaySignal] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  // Decision router state: the latest routing pass, the session counter of
  // AI calls the router answered locally, and a short session log.
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [callsAvoided, setCallsAvoided] = useState(0);
  const [routeLog, setRouteLog] = useState<
    { business: string; summary: string; ms: number; saved: number }[]
  >([]);

  // Voice recording (MediaRecorder, everything stays in this browser).
  const [recordings, setRecordings] = useState<Record<number, string>>({});
  const [recScene, setRecScene] = useState<number | null>(null);
  const [recError, setRecError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recStreamRef = useRef<MediaStream | null>(null);
  const recChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (injected) {
      setReel(injected.reel);
      setRoute(null);
      setRecordings({});
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
    // Fast local decision router runs first: it classifies the request and
    // picks the template, caption style, and hashtag seeds with local rules
    // — no AI call — before the reel is generated.
    const routed = routeRequest({
      businessName,
      selectedType: type,
      offer,
      tone,
      language,
    });
    setRoute(routed);
    setCallsAvoided((n) => n + routed.callsAvoided);
    setRouteLog((prev) =>
      [
        {
          business: businessName.trim(),
          summary: `${routed.categoryLabel.split(" /")[0]} · ${routed.offerIntentLabel} · ${routed.toneLabel} · ${routed.languageLabel}`,
          ms: routed.durationMs,
          saved: routed.callsAvoided,
        },
        ...prev,
      ].slice(0, 5),
    );
    const input: ReelInput = {
      businessName,
      type: routed.category,
      offer,
      tone,
      language,
      brand: { logoUrl, photos: photoUrls, color: brandColor },
      captionAngle: routed.captionAngle || undefined,
      extraHashtags: routed.hashtagSeeds,
    };
    setReel(generateReel(input));
    setRecordings({});
    setPlaySignal((n) => n + 1);
    setCopied(false);
    requestAnimationFrame(() => {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setLogoUrl(URL.createObjectURL(f));
  };

  const onPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 3);
    if (files.length) setPhotoUrls(files.map((f) => URL.createObjectURL(f)));
  };

  const startRecording = async (sceneIdx: number) => {
    setRecError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setRecError("Recording isn't supported in this browser — switch back to AI voice.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recStreamRef.current = stream;
      recChunksRef.current = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (ev) => {
        if (ev.data.size > 0) recChunksRef.current.push(ev.data);
      };
      rec.onstop = () => {
        const blob = new Blob(recChunksRef.current, {
          type: rec.mimeType || "audio/webm",
        });
        setRecordings((prev) => ({ ...prev, [sceneIdx]: URL.createObjectURL(blob) }));
        recStreamRef.current?.getTracks().forEach((t) => t.stop());
        recStreamRef.current = null;
        setRecScene(null);
      };
      recorderRef.current = rec;
      rec.start();
      setRecScene(sceneIdx);
    } catch {
      setRecError(
        "Microphone permission was denied. Allow mic access in your browser settings, or switch back to AI voice — your reel still works.",
      );
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
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
            <p className="mt-1.5 text-[11px] text-zinc-500">
              Not sure? Pick “Other local business” — the decision router will
              detect your category from your name and offer.
            </p>
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

        <div className="mt-5 space-y-4">
          <div>
            <label className={labelCls} htmlFor="lang">Language</label>
            <select
              id="lang"
              className={inputCls}
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              {LANGUAGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] text-zinc-500">
              The script and voiceover are generated in this language.
            </p>
          </div>

          <div>
            <span className={labelCls}>Voice</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVoiceMode("ai")}
                className={`rounded-lg border px-3 py-2.5 text-left transition ${
                  voiceMode === "ai"
                    ? "border-fuchsia-400 bg-fuchsia-400/10"
                    : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
                }`}
              >
                <span className="block text-sm font-bold text-zinc-100">🤖 AI voice</span>
                <span className="block text-[11px] text-zinc-400">
                  Studio voice, any language
                </span>
              </button>
              <button
                type="button"
                onClick={() => setVoiceMode("record")}
                className={`rounded-lg border px-3 py-2.5 text-left transition ${
                  voiceMode === "record"
                    ? "border-fuchsia-400 bg-fuchsia-400/10"
                    : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
                }`}
              >
                <span className="block text-sm font-bold text-zinc-100">🎙️ Record my voice</span>
                <span className="block text-[11px] text-zinc-400">
                  Read each line yourself
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
            <span className={labelCls}>Brand kit (optional)</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-zinc-400">Color</span>
              {BRAND_SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Brand color ${c}`}
                  onClick={() => setBrandColor(c)}
                  className={`h-7 w-7 rounded-full border-2 transition ${
                    brandColor === c ? "scale-110 border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                aria-label="Custom brand color"
                value={brandColor ?? "#ec4899"}
                onChange={(e) => setBrandColor(e.target.value)}
                className="h-7 w-9 cursor-pointer rounded border border-zinc-700 bg-zinc-900"
              />
              {brandColor && (
                <button
                  type="button"
                  onClick={() => setBrandColor(null)}
                  className="text-[11px] font-semibold text-zinc-400 underline hover:text-zinc-200"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-zinc-400" htmlFor="logo">
                  Logo
                </label>
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={onLogoChange}
                  className="w-full text-[11px] text-zinc-400 file:mr-2 file:rounded-full file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-zinc-100"
                />
                {logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo preview" className="mt-2 h-10 w-10 rounded-lg bg-white object-contain p-0.5" />
                )}
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-zinc-400" htmlFor="photos">
                  Photos (up to 3)
                </label>
                <input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onPhotosChange}
                  className="w-full text-[11px] text-zinc-400 file:mr-2 file:rounded-full file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-zinc-100"
                />
                {photoUrls.length > 0 && (
                  <div className="mt-2 flex gap-1.5">
                    {photoUrls.map((u, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={u} alt={`Brand photo ${i + 1}`} className="h-10 w-10 rounded-lg object-cover" />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="mt-2.5 text-[11px] leading-relaxed text-zinc-500">
              Your logo appears on the first and last scenes, your first photo backs the
              benefit scene, and your color becomes the reel's accent. Files stay in your
              browser — nothing is uploaded.
            </p>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/25 transition hover:opacity-90"
        >
          🎬 Generate my reel
        </button>
        <p className="mt-3 text-center text-[11px] font-semibold text-emerald-300/90">
          ⚡ Decision router on: AI calls avoided this session: {callsAvoided}
        </p>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-zinc-500">
          Interactive demo: the reel plays live in your browser — AI voice in any
          language, or your own recorded voice (recordings never leave your browser).
          The full version renders a downloadable 1080×1920 MP4 with your brand kit —
          downloads and payments launch soon.
        </p>
      </form>

      <div ref={playerRef}>
        {reel ? (
          <div>
            {route && (
              <div className="mx-auto mb-5 max-w-[430px] rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-zinc-100">
                    ⚡ Decision router
                  </h4>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                    AI calls avoided: {callsAvoided}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                  Routed locally in{" "}
                  <strong className="text-emerald-300">
                    {route.durationMs.toFixed(2)} ms
                  </strong>{" "}
                  — no AI call. A fast decision layer (rules + keyword scoring)
                  classified this request before generation, the same pattern as
                  Sarvam Prism&apos;s 44&nbsp;ms decision model.
                </p>
                <dl className="mt-3 space-y-2">
                  {route.decisions.map((d) => (
                    <div key={d.kind} className="text-xs leading-relaxed">
                      <dt className="inline font-bold uppercase tracking-wider text-zinc-500">
                        {d.kind}:{" "}
                      </dt>
                      <dd className="inline text-zinc-200">{d.value}</dd>
                      <span className="block text-[11px] text-zinc-500">
                        {d.detail}
                      </span>
                    </div>
                  ))}
                  <div className="text-xs leading-relaxed">
                    <dt className="inline font-bold uppercase tracking-wider text-zinc-500">
                      Tone · Language:{" "}
                    </dt>
                    <dd className="inline text-zinc-200">
                      {route.toneLabel} · {route.languageLabel}
                    </dd>
                  </div>
                </dl>
                {routeLog.length > 0 && (
                  <div className="mt-4 border-t border-emerald-500/20 pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Session log
                    </p>
                    <ul className="mt-1.5 space-y-1">
                      {routeLog.map((entry, i) => (
                        <li key={i} className="text-[11px] leading-relaxed text-zinc-400">
                          <span className="font-semibold text-zinc-200">
                            {entry.business}
                          </span>{" "}
                          — {entry.summary} · {entry.ms.toFixed(2)} ms · +
                          {entry.saved} calls avoided
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <ReelPlayer
              reel={reel}
              playSignal={playSignal}
              voiceMode={voiceMode}
              recordings={recordings}
            />
            {voiceMode === "record" && (
              <div className="mx-auto mt-5 max-w-[430px] rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                <h4 className="text-sm font-bold text-zinc-100">🎙️ Record your voice</h4>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                  Read each line out loud. Playback uses your recordings scene by scene;
                  any line you skip falls back to the AI voice. Recordings stay in this
                  browser — nothing is uploaded.
                </p>
                {recError && (
                  <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs leading-relaxed text-red-200">
                    {recError}
                  </p>
                )}
                <div className="mt-4 space-y-3">
                  {reel.scenes.map((scene, i) => (
                    <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        Scene {i + 1} · {scene.kicker}
                      </p>
                      <p className="mt-1.5 text-[15px] font-semibold leading-snug text-zinc-100">
                        “{scene.voice}”
                      </p>
                      <div className="mt-2.5 flex items-center gap-2">
                        {recScene === i ? (
                          <button
                            onClick={stopRecording}
                            className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-red-400"
                          >
                            ⏹ Stop
                          </button>
                        ) : (
                          <button
                            onClick={() => startRecording(i)}
                            disabled={recScene !== null}
                            className="rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-bold text-zinc-900 transition hover:bg-white disabled:opacity-40"
                          >
                            {recordings[i] ? "↻ Re-record" : "⏺ Record"}
                          </button>
                        )}
                        {recScene === i && (
                          <span className="animate-pulse text-xs font-semibold text-red-300">
                            Recording… read the line now
                          </span>
                        )}
                        {recScene !== i && recordings[i] && (
                          <span className="text-xs font-semibold text-emerald-300">
                            ✓ Recorded
                          </span>
                        )}
                        {recScene !== i && !recordings[i] && (
                          <span className="text-xs text-zinc-500">Not recorded yet</span>
                        )}
                      </div>
                      {recordings[i] && (
                        <audio controls src={recordings[i]} className="mt-2.5 h-8 w-full" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
