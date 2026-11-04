"use client";

import { useRef, useState } from "react";
import type { RefineContext } from "@/lib/refine";

type Mode = "threads" | "classic";

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
  suggestion?: string;
}

interface ModeStats {
  turns: number;
  totalPayloadKB: number;
  totalLatencyMs: number;
}

const emptyStats = (): ModeStats => ({
  turns: 0,
  totalPayloadKB: 0,
  totalLatencyMs: 0,
});

/**
 * "Refine your reel" chat — demonstrates Anthropic's Message Threads
 * pattern vs the classic re-send-everything pattern, live:
 * Threads keeps the transcript on the server (client sends only the new
 * message + thread ID); Classic re-sends the full history every turn.
 * Payload size and latency are measured for real on every send.
 */
export default function RefineChat({
  context,
  onApplyCaption,
}: {
  context: RefineContext;
  onApplyCaption: (caption: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("threads");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<Mode, ModeStats>>({
    threads: emptyStats(),
    classic: emptyStats(),
  });
  const [last, setLast] = useState<{
    mode: Mode;
    payloadKB: number;
    latencyMs: number;
    serverMessages: number | null;
  } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);

    const body: Record<string, unknown> =
      mode === "threads"
        ? threadId
          ? { mode, threadId, message: text }
          : { mode, message: text, context }
        : {
            mode,
            message: text,
            context,
            history: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          };

    const payloadKB = new Blob([JSON.stringify(body)]).size / 1024;
    const startedAt = performance.now();
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const latencyMs = performance.now() - startedAt;
      if (!res.ok) throw new Error(data?.error ?? "Request failed.");

      if (mode === "threads" && typeof data.threadId === "string") {
        setThreadId(data.threadId);
      }
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text },
        {
          role: "assistant",
          content: String(data.reply ?? ""),
          suggestion: data.suggestion ?? undefined,
        },
      ]);
      setLast({
        mode,
        payloadKB,
        latencyMs,
        serverMessages:
          typeof data.serverMessages === "number" ? data.serverMessages : null,
      });
      setStats((prev) => ({
        ...prev,
        [mode]: {
          turns: prev[mode].turns + 1,
          totalPayloadKB: prev[mode].totalPayloadKB + payloadKB,
          totalLatencyMs: prev[mode].totalLatencyMs + latencyMs,
        },
      }));
      setInput("");
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong — try sending again.",
      );
    } finally {
      setSending(false);
    }
  };

  const avgLine = (m: Mode) => {
    const s = stats[m];
    if (s.turns === 0) return "no turns yet";
    return `avg payload ${(s.totalPayloadKB / s.turns).toFixed(2)} KB · avg latency ${Math.round(s.totalLatencyMs / s.turns)} ms · ${s.turns} turn${s.turns === 1 ? "" : "s"}`;
  };

  const modeBtn = (m: Mode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      data-testid={`refine-mode-${m}`}
      className={`flex-1 rounded-lg border px-3 py-2 text-left transition ${
        mode === m
          ? "border-fuchsia-400 bg-fuchsia-400/10"
          : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
      }`}
    >
      <span className="block text-xs font-bold text-zinc-100">{label}</span>
      <span className="block text-[10px] leading-snug text-zinc-400">
        {m === "threads"
          ? "Server keeps the transcript — send only the new message"
          : "Re-send the full history every turn"}
      </span>
    </button>
  );

  return (
    <div
      data-testid="refine-chat"
      className="mx-auto mt-5 max-w-[430px] rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"
    >
      <h4 className="text-sm font-bold text-zinc-100">💬 Refine your reel</h4>
      <p className="mt-1 text-xs leading-relaxed text-zinc-400">
        Chat to polish the caption. Compare Anthropic&apos;s{" "}
        <strong className="text-zinc-200">Message Threads</strong> pattern with
        the classic one — watch the payload size per send.
      </p>

      <div className="mt-3 flex gap-2">
        {modeBtn("threads", "⚡ Threads")}
        {modeBtn("classic", "🐘 Classic")}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
        {mode === "threads"
          ? threadId
            ? "Thread live on the server — your sends are just the new message + thread ID."
            : "First send also carries the reel context, once. After that, only deltas."
          : "Every send re-sends the reel context + the entire conversation so far."}
      </p>

      <div
        ref={listRef}
        className="mt-3 max-h-72 space-y-2.5 overflow-y-auto pr-1"
      >
        {messages.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 px-3.5 py-3 text-xs leading-relaxed text-zinc-500">
            Try: “Make it shorter”, “More fun please”, “Make it premium”, or
            “Stronger call to action”.
          </p>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-fuchsia-500/20 px-3.5 py-2 text-[13px] leading-relaxed text-zinc-100">
                {m.content}
              </p>
            </div>
          ) : (
            <div key={i} className="flex justify-start">
              <div
                data-testid="refine-msg-assistant"
                className="max-w-[88%] rounded-2xl rounded-bl-sm border border-zinc-800 bg-zinc-950/60 px-3.5 py-2"
              >
                <p className="text-[13px] leading-relaxed text-zinc-200">
                  {m.content}
                </p>
                {m.suggestion && (
                  <div className="mt-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
                    <p className="text-[13px] font-medium leading-relaxed text-emerald-100">
                      “{m.suggestion}”
                    </p>
                    <button
                      type="button"
                      onClick={() => onApplyCaption(m.suggestion!)}
                      className="mt-2 rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-bold text-emerald-950 transition hover:bg-emerald-400"
                    >
                      Use this caption
                    </button>
                  </div>
                )}
              </div>
            </div>
          ),
        )}
      </div>

      {error && (
        <p className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <input
          data-testid="refine-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="Ask for a tweak…"
          maxLength={500}
          className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-fuchsia-400"
        />
        <button
          type="button"
          data-testid="refine-send"
          onClick={() => void send()}
          disabled={sending || !input.trim()}
          className="shrink-0 rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-500 px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40"
        >
          {sending ? "…" : "Send"}
        </button>
      </div>

      <div
        data-testid="refine-stats"
        className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/50 px-3.5 py-2.5 text-[11px] leading-relaxed text-zinc-400"
      >
        {last ? (
          <p>
            Last send ({last.mode}):{" "}
            <strong className="text-zinc-100">
              {last.payloadKB.toFixed(2)} KB
            </strong>{" "}
            payload ·{" "}
            <strong className="text-zinc-100">
              {Math.round(last.latencyMs)} ms
            </strong>{" "}
            round trip
            {last.mode === "threads" && last.serverMessages !== null
              ? ` · server holds ${last.serverMessages} messages`
              : ""}
          </p>
        ) : (
          <p>No sends yet — payload and latency will show here.</p>
        )}
        <p className="mt-1">
          <span className="font-semibold text-zinc-300">Threads:</span>{" "}
          {avgLine("threads")}
        </p>
        <p>
          <span className="font-semibold text-zinc-300">Classic:</span>{" "}
          {avgLine("classic")}
        </p>
        <p className="mt-1 text-zinc-500">
          Demo assistant: replies are drafted by local templates on the
          server — the lesson is the transport pattern, not the prose.
        </p>
      </div>
    </div>
  );
}
