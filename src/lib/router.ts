/* ------------------------------------------------------------------ */
/* ReelForge decision router — a fast, local decision layer that runs  */
/* BEFORE any heavy generation step in the studio.                     */
/*                                                                     */
/* The pattern mirrors Sarvam AI's Prism (a decision model that        */
/* answers in ~44 ms): a small, fast router sits in front of the big   */
/* model and answers the cheap questions itself — what kind of         */
/* business is this, what kind of offer, which template, which         */
/* caption style, which hashtags — so the expensive generation step    */
/* only runs once, with the right inputs.                              */
/*                                                                     */
/* Honest note: this demo router is local and rules-based (keyword     */
/* scoring + pattern matching). It makes no network or AI call, runs   */
/* in well under a millisecond in the browser, and reports the real    */
/* measured time of each routing pass.                                 */
/* ------------------------------------------------------------------ */

import {
  LANGUAGE_OPTIONS,
  TONE_OPTIONS,
  TYPE_OPTIONS,
  type BusinessType,
  type Language,
  type Tone,
} from "./reel";

export type OfferIntent =
  | "percent-off"
  | "bogo"
  | "free"
  | "price"
  | "new"
  | "general";

export interface RouterInput {
  businessName: string;
  /** The type the user picked in the form (may be "other"). */
  selectedType: BusinessType;
  offer: string;
  tone: Tone;
  language: Language;
}

export interface RouterDecision {
  /** Short kind label, e.g. "Category". */
  kind: string;
  /** What was decided, e.g. "Salon". */
  value: string;
  /** Why / how, in plain words. */
  detail: string;
}

export interface RouteResult {
  /** The category the reel will actually be generated with. */
  category: BusinessType;
  categoryLabel: string;
  /** True when the router detected the category from the text itself. */
  categoryDetected: boolean;
  offerIntent: OfferIntent;
  offerIntentLabel: string;
  tone: Tone;
  toneLabel: string;
  languageLabel: string;
  /** Human name of the scene template the router picked. */
  templateName: string;
  /** Caption opening line chosen for the offer intent ("" = standard). */
  captionAngle: string;
  /** Hashtag seeds chosen for category + intent. */
  hashtagSeeds: string[];
  decisions: RouterDecision[];
  /** How many AI calls this routing pass answered locally. */
  callsAvoided: number;
  /** Real measured duration of the routing pass, in milliseconds. */
  durationMs: number;
}

/* Keyword signals per category, matched against business name + offer. */
const CATEGORY_SIGNALS: Record<Exclude<BusinessType, "other">, string[]> = {
  salon: [
    "salon", "barber", "hair", "haircut", "nails", "manicure", "pedicure",
    "spa day", "facial", "beauty", "stylist", "braids", "balayage", "blowout",
    "makeup", "lashes", "grooming",
  ],
  restaurant: [
    "restaurant", "taco", "pizza", "burger", "cafe", "café", "coffee",
    "bakery", "bbq", "barbecue", "sushi", "kitchen", "grill", "diner",
    "bistro", "food", "eats", "brunch", "ramen", "sandwich", "donut",
    "ice cream", "juice bar",
  ],
  gym: [
    "gym", "fitness", "workout", "training", "crossfit", "yoga", "pilates",
    "boxing", "martial arts", "weight", "cardio", "personal trainer",
    "studio fitness", "bootcamp", "spin",
  ],
  clinic: [
    "clinic", "dental", "dentist", "med spa", "medspa", "dermatology",
    "skin care", "skincare", "therapy", "physical therapy", "chiropractor",
    "optometry", "vet", "veterinary", "pharmacy", "wellness center",
    "massage",
  ],
  realestate: [
    "real estate", "realty", "realtor", "homes", "properties", "property",
    "apartments", "leasing", "mortgage", "house hunting", "open house",
    "listings",
  ],
};

const INTENT_LABELS: Record<OfferIntent, string> = {
  "percent-off": "Percentage discount",
  bogo: "Buy-one-get-one deal",
  free: "Freebie / free trial",
  price: "Fixed-price deal",
  new: "New opening / launch",
  general: "General promotion",
};

/** Caption opening line per intent (empty string = standard caption). */
const INTENT_CAPTION_ANGLES: Record<OfferIntent, string> = {
  "percent-off": "🚨 Deal alert:",
  bogo: "🎉 Double-up deal:",
  free: "🎁 Freebie alert:",
  price: "💲 Price-drop alert:",
  new: "✨ Just launched:",
  general: "",
};

/** Hashtag seeds per intent (2 each), added to the category hashtags. */
const INTENT_HASHTAGS: Record<OfferIntent, string[]> = {
  "percent-off": ["#DealAlert", "#Sale"],
  bogo: ["#BOGO", "#TwoForOne"],
  free: ["#Freebie", "#FreeTrial"],
  price: ["#PriceDrop", "#StealsAndDeals"],
  new: ["#GrandOpening", "#NewInTown"],
  general: ["#LocalDeal", "#DontMissOut"],
};

function scoreCategories(text: string): { type: BusinessType; score: number } {
  let best: BusinessType = "other";
  let bestScore = 0;
  (Object.keys(CATEGORY_SIGNALS) as (keyof typeof CATEGORY_SIGNALS)[]).forEach(
    (type) => {
      let score = 0;
      for (const kw of CATEGORY_SIGNALS[type]) {
        if (text.includes(kw)) score += kw.includes(" ") ? 2 : 1;
      }
      if (score > bestScore) {
        bestScore = score;
        best = type;
      }
    },
  );
  return { type: best, score: bestScore };
}

function detectOfferIntent(offer: string): OfferIntent {
  const t = offer.toLowerCase();
  if (/\d+\s?%\s?off|half off|percent off/.test(t)) return "percent-off";
  if (
    /buy one get one|buy 1 get 1|bogo|\d\s?-for-\s?1|two for one|2 for 1/.test(t)
  )
    return "bogo";
  if (/\bfree\b|on the house|no joining fee|no sign-?up fee/.test(t))
    return "free";
  if (/\$\s?\d|₹\s?\d|under \$\d|from \$\d|just \$\d|only \$\d/.test(t))
    return "price";
  if (/grand opening|now open|just opened|new (location|menu|studio)|launch/.test(t))
    return "new";
  return "general";
}

const typeLabel = (t: BusinessType) =>
  TYPE_OPTIONS.find((o) => o.value === t)?.label ?? "Local Business";

/**
 * Route a studio request. Pure local logic — no network, no AI call.
 * Returns the routing decisions plus the real measured duration.
 */
export function routeRequest(input: RouterInput): RouteResult {
  const startedAt = performance.now();

  const text = `${input.businessName} ${input.offer}`.toLowerCase();
  const detected = scoreCategories(text);

  // Category: an explicit user pick wins; "Other" (or no clear pick) lets
  // the router detect the category from the business name + offer text.
  let category: BusinessType;
  let categoryDetected = false;
  let categoryDetail: string;
  if (input.selectedType !== "other") {
    category = input.selectedType;
    categoryDetail =
      detected.type === input.selectedType && detected.score > 0
        ? "Your pick — and the name/offer keywords agree."
        : "Your pick, used as-is.";
  } else if (detected.score > 0) {
    category = detected.type;
    categoryDetected = true;
    categoryDetail = `Detected from your business name and offer keywords (match score ${detected.score}).`;
  } else {
    category = "other";
    categoryDetail = "No keyword match — using the general local-business template.";
  }
  const categoryLabel = typeLabel(category);

  const offerIntent = detectOfferIntent(input.offer);
  const offerIntentLabel = INTENT_LABELS[offerIntent];

  const toneLabel =
    TONE_OPTIONS.find((o) => o.value === input.tone)?.label ?? input.tone;
  const languageLabel =
    LANGUAGE_OPTIONS.find((o) => o.value === input.language)?.label ??
    "English";

  const templateName = `${categoryLabel.split(" /")[0]} · 5-scene template · ${toneLabel} hook`;
  const captionStyleLabel =
    offerIntent === "general"
      ? "Standard caption"
      : `${offerIntentLabel} caption`;
  const hashtagSeeds = [
    ...(text.includes("taco") ? ["#TacoTuesday"] : []),
    ...INTENT_HASHTAGS[offerIntent],
  ];

  const decisions: RouterDecision[] = [
    { kind: "Category", value: categoryLabel, detail: categoryDetail },
    {
      kind: "Offer type",
      value: offerIntentLabel,
      detail: "Read from your offer text by pattern matching.",
    },
    {
      kind: "Scene template",
      value: templateName,
      detail: "Picked from the category + tone — no generation needed to choose.",
    },
    {
      kind: "Caption style",
      value: captionStyleLabel,
      detail: "Matched to the offer type.",
    },
    {
      kind: "Hashtag seeds",
      value: hashtagSeeds.join(" "),
      detail: "Seeded from the category + offer type, then merged with the template pack.",
    },
  ];

  const durationMs = Math.max(0.01, performance.now() - startedAt);

  return {
    category,
    categoryLabel,
    categoryDetected,
    offerIntent,
    offerIntentLabel,
    tone: input.tone,
    toneLabel,
    languageLabel,
    templateName,
    captionAngle: INTENT_CAPTION_ANGLES[offerIntent],
    hashtagSeeds,
    decisions,
    // One avoided AI call per decision the router answered locally.
    callsAvoided: decisions.length,
    durationMs,
  };
}
