"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Reel } from "@/lib/reel";

let instanceCounter = 0;

function estimateMs(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(2200, (words / 2.5) * 1000 + 700);
}

export default function ReelPlayer({
  reel,
  playSignal = 0,
  voiceMode = "ai",
  recordings = {},
}: {
  reel: Reel;
  /** Increment to (re)start playback from scene 0 — set from a user gesture where possible. */
  playSignal?: number;
  /** "ai" = browser speech synthesis; "record" = user's own recordings where available. */
  voiceMode?: "ai" | "record";
  /** Scene index -> recorded voiceover object URL (record mode). */
  recordings?: Record<number, string>;
}) {
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "playing" | "paused" | "done">("idle");
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const runId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const idRef = useRef(0);
  if (idRef.current === 0) idRef.current = ++instanceCounter;

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
  }, []);

  const stopSpeech = useCallback(() => {
    runId.current += 1;
    if (timer.current) clearTimeout(timer.current);
    stopAudio();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [stopAudio]);

  const speakScene = useCallback(
    (i: number, run: number) => {
      const scene = reel.scenes[i];
      if (!scene) return;
      const fallbackMs = estimateMs(scene.voice) * 1.8 + 1200;

      const advance = () => {
        if (runId.current !== run) return;
        if (i + 1 < reel.scenes.length) {
          setIndex(i + 1);
          speakScene(i + 1, run);
        } else {
          setStatus("done");
        }
      };

      // Record mode: play the user's own recording for this scene when one exists.
      const recUrl = voiceMode === "record" ? recordings[i] : undefined;
      if (recUrl) {
        let advanced = false;
        const go = () => {
          if (!advanced) {
            advanced = true;
            advance();
          }
        };
        const audio = new Audio(recUrl);
        audioRef.current = audio;
        audio.onended = go;
        audio.onerror = go;
        timer.current = setTimeout(go, fallbackMs * 1.6);
        audio.play().catch(() => {
          // Autoplay blocked — let the user press Play themselves.
          if (runId.current === run) {
            stopSpeech();
            setStatus("paused");
            setVoiceNote("Tap ▶ Play to hear your recordings.");
          }
        });
        return;
      }

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const synth = window.speechSynthesis;
        const utter = new SpeechSynthesisUtterance(scene.voice);
        utter.rate = 1.02;
        utter.lang = reel.langCode;
        const voices = synth.getVoices();
        const prefix = reel.langCode.split("-")[0].toLowerCase();
        const match =
          voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ||
          (prefix === "en"
            ? voices.find((v) => /female|samantha|zira/i.test(v.name))
            : undefined);
        if (match) utter.voice = match;
        if (prefix !== "en" && voices.length > 0 && !match) {
          setVoiceNote(
            "No voice for this language on this device — scenes advance on a timer; the script is in your language.",
          );
        }
        let advanced = false;
        utter.onend = () => {
          if (!advanced) {
            advanced = true;
            advance();
          }
        };
        utter.onerror = () => {
          if (!advanced) {
            advanced = true;
            advance();
          }
        };
        synth.speak(utter);
        // Fallback: some browsers never fire onend (e.g. voice unavailable).
        timer.current = setTimeout(() => {
          if (!advanced) {
            advanced = true;
            advance();
          }
        }, fallbackMs);
      } else {
        setVoiceNote("Voice isn't available in this browser — playing scenes on a timer.");
        timer.current = setTimeout(advance, estimateMs(scene.voice));
      }
    },
    [reel, voiceMode, recordings, stopSpeech],
  );

  const play = useCallback(
    (from = 0) => {
      // Only one reel talks at a time across the page.
      window.dispatchEvent(new CustomEvent("reelforge-play", { detail: idRef.current }));
      stopSpeech();
      const run = runId.current;
      setIndex(from);
      setStatus("playing");
      speakScene(from, run);
    },
    [speakScene, stopSpeech],
  );

  // Pause when another player starts.
  useEffect(() => {
    const handler = (e: Event) => {
      const other = (e as CustomEvent<number>).detail;
      if (other !== idRef.current) {
        stopSpeech();
        setStatus((s) => (s === "playing" ? "paused" : s));
      }
    };
    window.addEventListener("reelforge-play", handler);
    return () => window.removeEventListener("reelforge-play", handler);
  }, [stopSpeech]);

  // Reset when the reel changes; optionally autoplay when playSignal increments.
  useEffect(() => {
    stopSpeech();
    setIndex(0);
    setStatus("idle");
    if (playSignal > 0) {
      const run = runId.current;
      setStatus("playing");
      const t = setTimeout(() => {
        if (runId.current === run) speakScene(0, run);
      }, 250);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reel, playSignal]);

  // Warm up the voice list (loads async in some browsers).
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
    return () => stopSpeech();
  }, [stopSpeech]);

  const pause = () => {
    stopSpeech();
    setStatus("paused");
  };

  const resume = () => {
    window.dispatchEvent(new CustomEvent("reelforge-play", { detail: idRef.current }));
    stopSpeech();
    const run = runId.current;
    setStatus("playing");
    speakScene(index, run);
  };

  const scene = reel.scenes[Math.min(index, reel.scenes.length - 1)];
  const progress = ((index + (status === "done" ? 1 : 0)) / reel.scenes.length) * 100;

  return (
    <div className="w-full">
      {/* Phone frame, 9:16 */}
      <div
        className={`relative mx-auto aspect-[9/16] w-full max-w-[340px] overflow-hidden rounded-[2rem] border border-zinc-700 bg-gradient-to-br ${reel.gradient} shadow-2xl ${reel.glow}`}
        style={
          reel.brandColor
            ? { boxShadow: `0 25px 55px -12px ${reel.brandColor}90` }
            : undefined
        }
      >
        {/* brand accent strip */}
        {reel.brandColor && (
          <div
            className="absolute inset-x-0 top-0 z-30 h-1.5"
            style={{ backgroundColor: reel.brandColor }}
          />
        )}
        {/* brand photo background on the first benefit scene */}
        {index === 1 && reel.photoUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={reel.photoUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </>
        )}
        {/* segment bars */}
        <div className="absolute inset-x-4 top-3 z-20 flex gap-1.5">
          {reel.scenes.map((_, i) => (
            <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{
                  width:
                    status === "done" || i < index ? "100%" : i === index ? "45%" : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <div key={index} className="scene-enter absolute inset-0 flex flex-col px-6 pb-8 pt-12">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80"
            style={reel.brandColor ? { color: reel.brandColor } : undefined}
          >
            {scene.kicker}
          </p>
          <div className="mt-6 text-6xl drop-shadow-lg">{scene.emoji}</div>
          <h3 className="mt-5 text-[32px] font-extrabold leading-[1.08] text-white drop-shadow">
            {scene.headline}
          </h3>
          <p className="mt-4 text-[15px] font-medium leading-snug text-white/90">{scene.sub}</p>
          <div className="mt-auto flex items-center gap-3">
            {(index === 0 || index === reel.scenes.length - 1) && reel.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={reel.logoUrl}
                alt="Business logo"
                className="h-11 w-11 shrink-0 rounded-xl bg-white object-contain p-1 shadow"
              />
            )}
            <div>
              <p className="text-sm font-semibold text-white/95">{reel.businessName}</p>
              <p className="text-[11px] uppercase tracking-widest text-white/60">
                {reel.typeLabel} · Made with ReelForge AI
              </p>
            </div>
          </div>
        </div>

        {/* center play overlay when idle */}
        {status === "idle" && (
          <button
            onClick={() => play(0)}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/25 transition hover:bg-black/35"
            aria-label="Play reel"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl text-zinc-900 shadow-xl">
              ▶
            </span>
          </button>
        )}
        {status === "done" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/45 px-6 text-center">
            <div className="text-5xl">🎉</div>
            <p className="mt-3 text-xl font-bold text-white">Your reel is ready!</p>
            <p className="mt-1 text-sm text-white/80">
              In the full version this exports as a 1080×1920 MP4, ready to post.
            </p>
            <button
              onClick={() => play(0)}
              className="mt-5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 shadow"
            >
              ↻ Watch again
            </button>
          </div>
        )}
      </div>

      {/* controls */}
      <div className="mx-auto mt-4 flex max-w-[340px] items-center justify-center gap-2">
        {status === "playing" ? (
          <button
            onClick={pause}
            className="rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-bold text-zinc-900 transition hover:bg-white"
          >
            ⏸ Pause
          </button>
        ) : status === "paused" ? (
          <button
            onClick={resume}
            className="rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-bold text-zinc-900 transition hover:bg-white"
          >
            ▶ Resume
          </button>
        ) : (
          <button
            onClick={() => play(0)}
            className="rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-bold text-zinc-900 transition hover:bg-white"
          >
            {status === "done" ? "↻ Replay" : "▶ Play reel"}
          </button>
        )}
        <span className="text-xs text-zinc-400">
          Scene {Math.min(index + 1, reel.scenes.length)} of {reel.scenes.length} ·{" "}
          {Math.round(progress)}%
        </span>
      </div>
      {voiceNote && <p className="mt-2 text-center text-xs text-amber-300/90">{voiceNote}</p>}
      <p className="mt-2 text-center text-[11px] text-zinc-500">
        🔊 Voice plays from your browser — turn sound on.
      </p>
    </div>
  );
}
