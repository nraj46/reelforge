/* ------------------------------------------------------------------ */
/* "Refine your reel" chat — reply drafting.                           */
/*                                                                     */
/* Demo backend: replies are drafted by local templates on the server  */
/* (no LLM, no API keys), because the point of the feature is the      */
/* transport pattern — Anthropic's Message Threads (Nov 3, 2026):      */
/* the server keeps the transcript and the client sends only the new   */
/* message + thread ID, instead of re-sending the whole history on     */
/* every turn (the "Classic" mode, kept here for comparison).          */
/* ------------------------------------------------------------------ */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface RefineContext {
  businessName: string;
  typeLabel: string;
  offer: string;
  tone: string;
  language: string;
  caption: string;
  hashtags: string[];
}

export interface RefineReply {
  reply: string;
  /** A revised caption the user can apply with one tap, when relevant. */
  suggestion?: string;
}

/** The caption's first clause (up to the first "!"), without any prefix. */
function captionHead(ctx: RefineContext): string {
  const clean = ctx.caption.replace(/^.*?alert:\s*/i, "").trim();
  const bang = clean.indexOf("!");
  return (bang > 0 ? clean.slice(0, bang + 1) : clean).trim();
}

function offerLine(ctx: RefineContext): string {
  return ctx.offer.trim() || captionHead(ctx);
}

const GENERIC_VARIANTS: ((ctx: RefineContext) => string)[] = [
  (ctx) =>
    `${captionHead(ctx)} Limited spots for this one — when it's gone, it's gone ⏰ Tag someone who needs this 👇`,
  (ctx) =>
    `Who needs this? 👇 ${offerLine(ctx)} — now at ${ctx.businessName}. Book it before the weekend rush!`,
  (ctx) =>
    `${captionHead(ctx)} Our regulars keep coming back for this one — come see why. ${ctx.hashtags[0] ?? "#LocalBusiness"} love, guaranteed.`,
];

/**
 * Draft a reply from the conversation so far + reel context.
 * Pure function — the route handler owns transcript storage.
 */
export function draftRefineReply(
  history: ChatMessage[],
  ctx: RefineContext,
): RefineReply {
  const lastUser = [...history].reverse().find((m) => m.role === "user");
  const ask = (lastUser?.content ?? "").toLowerCase();
  const userTurns = history.filter((m) => m.role === "user").length;
  const name = ctx.businessName || "your business";

  if (/\bshort|shorter|brief|concise|tight/.test(ask)) {
    return {
      reply:
        "Trimmed it down — same offer, half the words. Short captions tend to get read fully before the scroll. Tap “Use this caption” to apply it.",
      suggestion: `${captionHead(ctx)} 👇`,
    };
  }
  if (/\bfun|punch|exciting|energy|playful|hype/.test(ask)) {
    return {
      reply:
        "Punched it up with more energy and a crew call-out. Here's the livelier version:",
      suggestion: `🔥 ${offerLine(ctx)} at ${name}!! 🎉 Bring your crew — this one won't last. Tag them below 👇`,
    };
  }
  if (/\bpremium|luxury|classy|elegant|upscale/.test(ask)) {
    return {
      reply:
        "Gave it the premium treatment — quieter, more exclusive, no hype words. Here's the polished version:",
      suggestion: `✨ ${offerLine(ctx)} — an exclusive invitation from ${name}. Availability is limited; reserve yours today.`,
    };
  }
  if (/\bprice|discount|deal|offer|sale|cheap|value/.test(ask)) {
    return {
      reply:
        "Led with the deal itself so the savings are the first thing people see:",
      suggestion: `💲 ${offerLine(ctx).toUpperCase()} at ${name}! Real savings, limited time — grab it while it lasts 👇`,
    };
  }
  if (/hashtag|tags?\b/.test(ask)) {
    return {
      reply:
        "Folded a stronger local tag set into the caption so it travels with the text wherever it's pasted:",
      suggestion: `${captionHead(ctx)} #SupportLocal #DealsNearMe #SmallBusinessLove #ShopLocal`,
    };
  }
  if (/spanish|hindi|telugu|vietnamese|language|translate/.test(ask)) {
    return {
      reply: `Good news: the reel's voiceover already speaks ${ctx.language} — the ${ctx.typeLabel.toLowerCase()} script and voice pack switch with the Language picker in the studio, so no caption change is needed for that. Want me to make the caption shorter or more premium instead?`,
    };
  }
  if (/\bcta|book|call to action|action/.test(ask)) {
    return {
      reply:
        "Strengthened the ending so it tells people exactly what to do next:",
      suggestion: `${captionHead(ctx)} 📲 Book now — tap the link, send a DM, or walk in today. Don't wait on this one!`,
    };
  }

  const variant = GENERIC_VARIANTS[(userTurns - 1) % GENERIC_VARIANTS.length];
  return {
    reply:
      "Here's a fresh angle on the caption — new hook, same offer. You can apply it, or tell me “shorter”, “more fun”, “premium”, or “stronger CTA” and I'll steer it that way.",
    suggestion: variant(ctx),
  };
}
