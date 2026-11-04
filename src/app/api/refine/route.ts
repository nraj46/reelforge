import { connection, NextResponse } from "next/server";
import {
  draftRefineReply,
  type ChatMessage,
  type RefineContext,
} from "@/lib/refine";

/* ------------------------------------------------------------------ */
/* /api/refine — the "Refine your reel" chat backend.                  */
/*                                                                     */
/* Two modes, mirroring Anthropic's Message Threads pattern:           */
/*  - "threads": the server keeps the transcript in memory, keyed by   */
/*    thread ID. The first message carries the reel context; every     */
/*    later message is just { mode, threadId, message }.               */
/*  - "classic": stateless — the client re-sends the full history +    */
/*    context with every message, like a plain chat completions call.  */
/*                                                                     */
/* Demo store: in-memory only (matches the rest of this demo app).     */
/* Threads vanish on server restart; nothing is persisted or sent      */
/* anywhere else. Replies are drafted by local templates — see         */
/* src/lib/refine.ts. No API keys are involved.                        */
/* ------------------------------------------------------------------ */

interface Thread {
  context: RefineContext;
  messages: ChatMessage[];
}

const threads = new Map<string, Thread>();
const MAX_THREADS = 200;

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

function isContext(v: unknown): v is RefineContext {
  if (!v || typeof v !== "object") return false;
  const c = v as Record<string, unknown>;
  return (
    typeof c.businessName === "string" &&
    typeof c.offer === "string" &&
    typeof c.caption === "string" &&
    Array.isArray(c.hashtags)
  );
}

export async function POST(req: Request) {
  // Opt out of prerendering/caching: thread state is request-time, in-memory.
  await connection();
  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) return badRequest("Invalid JSON body.");

  const message =
    typeof body.message === "string" ? body.message.trim().slice(0, 500) : "";
  if (!message) return badRequest("A non-empty message is required.");

  if (body.mode === "threads") {
    let threadId = typeof body.threadId === "string" ? body.threadId : null;
    let thread = threadId ? threads.get(threadId) : undefined;

    if (!thread) {
      // Starting a thread: the context rides along with the first message,
      // exactly once — after that, only deltas cross the wire.
      if (!isContext(body.context)) {
        return badRequest("Context is required to start a thread.");
      }
      threadId = crypto.randomUUID();
      thread = { context: body.context, messages: [] };
      threads.set(threadId, thread);
      if (threads.size > MAX_THREADS) {
        const oldest = threads.keys().next().value;
        if (oldest) threads.delete(oldest);
      }
    }

    thread.messages.push({ role: "user", content: message });
    const { reply, suggestion } = draftRefineReply(
      thread.messages,
      thread.context,
    );
    thread.messages.push({ role: "assistant", content: reply });

    return NextResponse.json({
      reply,
      suggestion: suggestion ?? null,
      threadId,
      serverMessages: thread.messages.length,
    });
  }

  if (body.mode === "classic") {
    if (!isContext(body.context)) {
      return badRequest("Context is required in classic mode.");
    }
    const history: ChatMessage[] = Array.isArray(body.history)
      ? (body.history as ChatMessage[]).filter(
          (m) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string",
        )
      : [];
    const full = [...history, { role: "user" as const, content: message }];
    const { reply, suggestion } = draftRefineReply(full, body.context);
    return NextResponse.json({
      reply,
      suggestion: suggestion ?? null,
      threadId: null,
      serverMessages: full.length + 1,
    });
  }

  return badRequest('Mode must be "threads" or "classic".');
}
