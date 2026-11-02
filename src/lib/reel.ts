export type BusinessType =
  | "salon"
  | "restaurant"
  | "gym"
  | "clinic"
  | "realestate"
  | "other";

export type Tone = "fun" | "professional" | "premium";

export interface ReelInput {
  businessName: string;
  type: BusinessType;
  offer: string;
  tone: Tone;
}

export interface Scene {
  kicker: string;
  headline: string;
  sub: string;
  voice: string;
  emoji: string;
}

export interface Reel {
  businessName: string;
  typeLabel: string;
  emoji: string;
  gradient: string;
  glow: string;
  scenes: Scene[];
  caption: string;
  hashtags: string[];
}

interface TypeConfig {
  label: string;
  emoji: string;
  gradient: string;
  glow: string;
  benefitA: { headline: string; sub: string; voice: string };
  benefitB: { headline: string; sub: string; voice: string };
  cta: string;
  ctaVoice: string;
  hashtags: string[];
}

const TYPES: Record<BusinessType, TypeConfig> = {
  salon: {
    label: "Salon",
    emoji: "💇‍♀️",
    gradient: "from-pink-500 via-rose-500 to-fuchsia-700",
    glow: "shadow-rose-500/40",
    benefitA: {
      headline: "Fresh look, zero effort",
      sub: "Top stylists, premium products, relaxing vibe",
      voice:
        "Our stylists use premium products and the latest techniques, so you walk out feeling brand new.",
    },
    benefitB: {
      headline: "Book in seconds",
      sub: "Call, DM, or walk in — we will handle the rest",
      voice: "Booking takes seconds. Call us, send a message, or just walk in.",
    },
    cta: "Book your chair today",
    ctaVoice: "Book your chair today before this offer ends.",
    hashtags: ["#SalonLife", "#HairGoals", "#FreshLook", "#BeautyDeals"],
  },
  restaurant: {
    label: "Restaurant",
    emoji: "🍽️",
    gradient: "from-amber-500 via-orange-500 to-red-600",
    glow: "shadow-orange-500/40",
    benefitA: {
      headline: "Made fresh, served hot",
      sub: "Real ingredients, bold flavors, generous portions",
      voice:
        "Everything is made fresh with real ingredients and bold flavors, in portions that never leave you hungry.",
    },
    benefitB: {
      headline: "Bring the whole crew",
      sub: "Family-friendly, group-friendly, wallet-friendly",
      voice: "Bring the whole crew. We are family friendly, group friendly, and wallet friendly.",
    },
    cta: "Come hungry — reserve your table",
    ctaVoice: "Come hungry, and reserve your table today.",
    hashtags: ["#Foodie", "#LocalEats", "#FoodDeals", "#EatLocal"],
  },
  gym: {
    label: "Gym",
    emoji: "💪",
    gradient: "from-lime-500 via-emerald-500 to-teal-700",
    glow: "shadow-emerald-500/40",
    benefitA: {
      headline: "Real coaches, real results",
      sub: "Modern equipment and plans that fit your life",
      voice:
        "Train with real coaches, modern equipment, and a plan that actually fits your life.",
    },
    benefitB: {
      headline: "No pressure, just progress",
      sub: "Every fitness level welcome — start where you are",
      voice: "Every fitness level is welcome here. Start where you are, and we will help you progress.",
    },
    cta: "Start your first week today",
    ctaVoice: "Start today. Your first step is the hardest, and we make it easy.",
    hashtags: ["#FitnessGoals", "#GymLife", "#TrainHard", "#HealthyLiving"],
  },
  clinic: {
    label: "Clinic",
    emoji: "🩺",
    gradient: "from-sky-500 via-cyan-500 to-blue-700",
    glow: "shadow-sky-500/40",
    benefitA: {
      headline: "Care you can trust",
      sub: "Experienced professionals, gentle approach",
      voice:
        "Our experienced team takes a gentle, honest approach, so you always know what to expect.",
    },
    benefitB: {
      headline: "Easy appointments",
      sub: "Same-week slots and friendly reminders",
      voice: "Appointments are easy to book, with same-week slots and friendly reminders.",
    },
    cta: "Book your appointment today",
    ctaVoice: "Book your appointment today. Your health cannot wait.",
    hashtags: ["#Healthcare", "#Wellness", "#HealthyLife", "#LocalClinic"],
  },
  realestate: {
    label: "Real Estate",
    emoji: "🏡",
    gradient: "from-violet-500 via-purple-500 to-indigo-700",
    glow: "shadow-violet-500/40",
    benefitA: {
      headline: "Local experts, honest advice",
      sub: "We know every street in the neighborhood",
      voice:
        "We know every street in the neighborhood, and we will give you honest advice at every step.",
    },
    benefitB: {
      headline: "From tour to keys, faster",
      sub: "Clear process, no surprises, full support",
      voice: "From your first tour to getting the keys, our process is clear, with no surprises.",
    },
    cta: "Book a tour this week",
    ctaVoice: "Book a tour this week, and see it for yourself.",
    hashtags: ["#RealEstate", "#DreamHome", "#HouseHunting", "#LocalExpert"],
  },
  other: {
    label: "Local Business",
    emoji: "✨",
    gradient: "from-indigo-500 via-blue-500 to-cyan-600",
    glow: "shadow-indigo-500/40",
    benefitA: {
      headline: "Quality you can feel",
      sub: "Done right, by people who care",
      voice: "Everything we do is done right, by local people who genuinely care.",
    },
    benefitB: {
      headline: "Easy to reach, easy to love",
      sub: "Friendly service, honest prices",
      voice: "We are easy to reach, friendly to deal with, and honest on price.",
    },
    cta: "Visit us today",
    ctaVoice: "Visit us today, and see why the neighborhood loves us.",
    hashtags: ["#LocalBusiness", "#ShopLocal", "#SupportLocal", "#Community"],
  },
};

export const TYPE_OPTIONS: { value: BusinessType; label: string }[] = [
  { value: "salon", label: "Salon / Barbershop" },
  { value: "restaurant", label: "Restaurant / Café" },
  { value: "gym", label: "Gym / Fitness Studio" },
  { value: "clinic", label: "Clinic / Dental / Med Spa" },
  { value: "realestate", label: "Real Estate" },
  { value: "other", label: "Other local business" },
];

export const TONE_OPTIONS: { value: Tone; label: string; hint: string }[] = [
  { value: "fun", label: "Fun", hint: "Playful, high-energy" },
  { value: "professional", label: "Professional", hint: "Clean and trustworthy" },
  { value: "premium", label: "Premium", hint: "Luxury, high-end feel" },
];

function hookFor(input: ReelInput, cfg: TypeConfig): Scene {
  const name = input.businessName.trim();
  const offer = input.offer.trim();
  switch (input.tone) {
    case "fun":
      return {
        kicker: "Stop scrolling 👀",
        headline: offer,
        sub: `at ${name}`,
        voice: `Stop scrolling! ${name} has an offer you do not want to miss. ${offer}!`,
        emoji: cfg.emoji,
      };
    case "premium":
      return {
        kicker: "An exclusive invitation",
        headline: offer,
        sub: `— ${name}`,
        voice: `An exclusive invitation from ${name}. For a limited time: ${offer}.`,
        emoji: cfg.emoji,
      };
    default:
      return {
        kicker: "Limited-time offer",
        headline: offer,
        sub: `from ${name}`,
        voice: `${name} is pleased to announce a limited-time offer. ${offer}.`,
        emoji: cfg.emoji,
      };
  }
}

function urgencyFor(input: ReelInput): Scene {
  const name = input.businessName.trim();
  switch (input.tone) {
    case "fun":
      return {
        kicker: "Don't sleep on this ⏰",
        headline: "When it's gone, it's gone!",
        sub: "Limited time — limited spots",
        voice: "But hurry. This is a limited-time offer, and when it is gone, it is gone.",
        emoji: "⏰",
      };
    case "premium":
      return {
        kicker: "By appointment",
        headline: "Availability is limited",
        sub: "A limited number of openings remain",
        voice: `Availability is limited, and ${name} is accepting a small number of new clients for this offer.`,
        emoji: "⏰",
      };
    default:
      return {
        kicker: "Act soon",
        headline: "This offer won't last",
        sub: "Available for a limited time only",
        voice: "This offer is available for a limited time only, so act soon.",
        emoji: "⏰",
      };
  }
}

export function generateReel(input: ReelInput): Reel {
  const cfg = TYPES[input.type];
  const name = input.businessName.trim() || "Your Business";
  const scenes: Scene[] = [
    hookFor({ ...input, businessName: name }, cfg),
    {
      kicker: `Why ${name}?`,
      headline: cfg.benefitA.headline,
      sub: cfg.benefitA.sub,
      voice: cfg.benefitA.voice,
      emoji: cfg.emoji,
    },
    {
      kicker: "Good to know",
      headline: cfg.benefitB.headline,
      sub: cfg.benefitB.sub,
      voice: cfg.benefitB.voice,
      emoji: cfg.emoji,
    },
    urgencyFor({ ...input, businessName: name }),
    {
      kicker: name,
      headline: cfg.cta,
      sub: `${input.offer.trim()} — only at ${name}`,
      voice: `${cfg.ctaVoice} ${name}. ${input.offer.trim()}. See you soon!`,
      emoji: "📍",
    },
  ];

  const caption =
    `${cfg.emoji} ${input.offer.trim()} at ${name}! ${cfg.cta} — offer available for a limited time. ` +
    `Tag someone who needs this 👇`;

  return {
    businessName: name,
    typeLabel: cfg.label,
    emoji: cfg.emoji,
    gradient: cfg.gradient,
    glow: cfg.glow,
    scenes,
    caption,
    hashtags: [
      ...cfg.hashtags,
      "#SmallBusiness",
      "#LocalBusiness",
      "#Promo",
      "#Reels",
      "#DailyByte",
    ],
  };
}

export interface SampleDef {
  id: string;
  input: ReelInput;
  blurb: string;
}

export const SAMPLES: SampleDef[] = [
  {
    id: "salon",
    blurb: "A Dallas salon filling weekday chairs with a flash discount.",
    input: {
      businessName: "Luxe Locks Salon",
      type: "salon",
      offer: "50% off all haircuts this week",
      tone: "fun",
    },
  },
  {
    id: "tacos",
    blurb: "A taco truck turning slow Tuesdays into the busiest night of the week.",
    input: {
      businessName: "Casa Fuego Tacos",
      type: "restaurant",
      offer: "2-for-1 tacos every Tuesday",
      tone: "fun",
    },
  },
  {
    id: "gym",
    blurb: "A neighborhood gym converting January browsers into members.",
    input: {
      businessName: "IronPeak Gym",
      type: "gym",
      offer: "First month free — no joining fee",
      tone: "professional",
    },
  },
];
