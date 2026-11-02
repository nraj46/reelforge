export type BusinessType =
  | "salon"
  | "restaurant"
  | "gym"
  | "clinic"
  | "realestate"
  | "other";

export type Tone = "fun" | "professional" | "premium";

export type Language = "en" | "es" | "hi" | "te" | "vi";

export const LANGUAGE_OPTIONS: { value: Language; label: string; code: string }[] = [
  { value: "en", label: "English", code: "en-US" },
  { value: "es", label: "Spanish (Español)", code: "es-ES" },
  { value: "hi", label: "Hindi (हिन्दी)", code: "hi-IN" },
  { value: "te", label: "Telugu (తెలుగు)", code: "te-IN" },
  { value: "vi", label: "Vietnamese (Tiếng Việt)", code: "vi-VN" },
];

export interface BrandKit {
  logoUrl: string | null;
  photos: string[];
  color: string | null;
}

export interface ReelInput {
  businessName: string;
  type: BusinessType;
  offer: string;
  tone: Tone;
  language?: Language;
  brand?: BrandKit;
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
  langCode: string;
  brandColor: string | null;
  logoUrl: string | null;
  photoUrl: string | null;
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

/* ------------------------------------------------------------------ */
/* Localized voice packs. English is the fallback (the templates       */
/* above); each pack localizes the hook, both benefit lines, the       */
/* urgency line, and the CTA for its language. Display text stays in   */
/* English in this demo; the spoken script is fully localized.         */
/* ------------------------------------------------------------------ */

interface VoicePack {
  hooks: Record<Tone, (name: string, offer: string) => string>;
  urgency: Record<Tone, (name: string) => string>;
  benefits: Record<BusinessType, [string, string]>;
  cta: Record<BusinessType, string>;
  bye: string;
}

const VOICE_PACKS: Partial<Record<Language, VoicePack>> = {
  es: {
    hooks: {
      fun: (n, o) => `¡Deja de deslizar! ${n} tiene una oferta que no te puedes perder. ¡${o}!`,
      premium: (n, o) => `Una invitación exclusiva de ${n}. Por tiempo limitado: ${o}.`,
      professional: (n, o) => `${n} se complace en anunciar una oferta por tiempo limitado. ${o}.`,
    },
    urgency: {
      fun: () => "Pero date prisa. Es una oferta por tiempo limitado, y cuando se acabe, se acabó.",
      premium: (n) => `La disponibilidad es limitada, y ${n} acepta solo a unos pocos clientes nuevos para esta oferta.`,
      professional: () => "Esta oferta está disponible solo por tiempo limitado, así que actúa pronto.",
    },
    benefits: {
      salon: [
        "Nuestros estilistas usan productos premium y las últimas técnicas, para que salgas sintiéndote renovado.",
        "Reservar toma segundos. Llámanos, envía un mensaje o simplemente ven a vernos.",
      ],
      restaurant: [
        "Todo se prepara fresco, con ingredientes reales y sabores intensos, en porciones que nunca te dejan con hambre.",
        "Trae a todo el grupo. Somos ideales para familias, grupos y bolsillos.",
      ],
      gym: [
        "Entrena con entrenadores de verdad, equipo moderno y un plan que sí se adapta a tu vida.",
        "Todos los niveles son bienvenidos. Empieza donde estás y nosotros te ayudamos a progresar.",
      ],
      clinic: [
        "Nuestro equipo experto trabaja con un trato amable y honesto, para que siempre sepas qué esperar.",
        "Las citas son fáciles de reservar, con horarios esta misma semana y recordatorios amables.",
      ],
      realestate: [
        "Conocemos cada calle del barrio y te daremos consejos honestos en cada paso.",
        "Desde la primera visita hasta las llaves, nuestro proceso es claro y sin sorpresas.",
      ],
      other: [
        "Todo lo que hacemos está bien hecho, por gente local que de verdad se preocupa.",
        "Somos fáciles de contactar, amables en el trato y honestos con el precio.",
      ],
    },
    cta: {
      salon: "Reserva tu silla hoy antes de que termine esta oferta.",
      restaurant: "Ven con hambre y reserva tu mesa hoy.",
      gym: "Empieza hoy. El primer paso es el más difícil, y nosotros lo hacemos fácil.",
      clinic: "Reserva tu cita hoy. Tu salud no puede esperar.",
      realestate: "Reserva una visita esta semana y compruébalo tú mismo.",
      other: "Visítanos hoy y descubre por qué el barrio nos quiere.",
    },
    bye: "¡Hasta pronto!",
  },
  hi: {
    hooks: {
      fun: (n, o) => `रुकिए! ${n} के पास एक ऑफ़र है जो आप मिस नहीं करना चाहेंगे। ${o}!`,
      premium: (n, o) => `${n} की ओर से एक खास निमंत्रण। सीमित समय के लिए: ${o}।`,
      professional: (n, o) => `${n} खुशी के साथ एक सीमित समय का ऑफ़र पेश करता है। ${o}।`,
    },
    urgency: {
      fun: () => "लेकिन जल्दी कीजिए। यह सीमित समय का ऑफ़र है, और खत्म होने के बाद खत्म ही रहेगा।",
      premium: (n) => `जगह सीमित है, और ${n} इस ऑफ़र के लिए कुछ ही नए ग्राहक ले रहा है।`,
      professional: () => "यह ऑफ़र केवल सीमित समय के लिए है, इसलिए जल्द करें।",
    },
    benefits: {
      salon: [
        "हमारे स्टाइलिस्ट प्रीमियम प्रोडक्ट और नए तरीके इस्तेमाल करते हैं, ताकि आप बिल्कुल नए जैसे महसूस करें।",
        "बुकिंग में कुछ ही सेकंड लगते हैं। कॉल करें, मैसेज भेजें, या बस चले आएँ।",
      ],
      restaurant: [
        "सब कुछ ताज़ा बनता है, असली सामग्री और ज़ोरदार स्वाद के साथ, इतनी मात्रा में कि आप कभी भूखे नहीं रहेंगे।",
        "पूरी टीम को साथ लाएँ। हम परिवार, ग्रुप और बजट — सबके लिए सही हैं।",
      ],
      gym: [
        "असली कोच, आधुनिक उपकरण और आपकी ज़िंदगी के हिसाब से बना प्लान — यहीं ट्रेनिंग करें।",
        "हर फ़िटनेस स्तर का स्वागत है। जहाँ हैं वहीं से शुरू करें, हम आगे बढ़ने में मदद करेंगे।",
      ],
      clinic: [
        "हमारी अनुभवी टीम नरम और ईमानदार तरीके से काम करती है, ताकि आपको हमेशा पता रहे कि क्या होगा।",
        "अपॉइंटमेंट बुक करना आसान है, इसी हफ़्ते के स्लॉट और दोस्ताना रिमाइंडर के साथ।",
      ],
      realestate: [
        "हम मोहल्ले की हर गली जानते हैं, और हर कदम पर आपको ईमानदार सलाह देंगे।",
        "पहले विज़िट से चाबियाँ मिलने तक, हमारी प्रक्रिया साफ़ है और कोई सरप्राइज़ नहीं।",
      ],
      other: [
        "हम जो भी करते हैं, ठीक से करते हैं — स्थानीय लोग, जिन्हें सच में परवाह है।",
        "हमसे संपर्क करना आसान है, व्यवहार दोस्ताना है, और दाम ईमानदार हैं।",
      ],
    },
    cta: {
      salon: "ऑफ़र खत्म होने से पहले आज ही अपनी कुर्सी बुक करें।",
      restaurant: "भूख लेकर आएँ और आज ही अपनी टेबल बुक करें।",
      gym: "आज ही शुरू करें। पहला कदम सबसे कठिन होता है, और हम उसे आसान बनाते हैं।",
      clinic: "आज ही अपना अपॉइंटमेंट बुक करें। आपकी सेहत इंतज़ार नहीं कर सकती।",
      realestate: "इस हफ़्ते एक विज़िट बुक करें और खुद देख लें।",
      other: "आज ही आएँ और देखें कि मोहल्ला हमें क्यों पसंद करता है।",
    },
    bye: "जल्द मिलते हैं!",
  },
  te: {
    hooks: {
      fun: (n, o) => `ఆగండి! ${n} వద్ద మీరు మిస్ అవ్వకూడని ఆఫర్ ఉంది. ${o}!`,
      premium: (n, o) => `${n} నుండి ప్రత్యేక ఆహ్వానం. పరిమిత సమయం కోసం: ${o}.`,
      professional: (n, o) => `${n} సంతోషంగా పరిమిత కాల ఆఫర్‌ను ప్రకటిస్తోంది. ${o}.`,
    },
    urgency: {
      fun: () => "కానీ త్వరపడండి. ఇది పరిమిత కాల ఆఫర్, అయిపోతే మళ్లీ ఉండదు.",
      premium: (n) => `అవకాశం పరిమితం, ఈ ఆఫర్ కోసం ${n} కొద్దిమంది కొత్త కస్టమర్లను మాత్రమే తీసుకుంటోంది.`,
      professional: () => "ఈ ఆఫర్ పరిమిత సమయం మాత్రమే ఉంది, కాబట్టి త్వరగా స్పందించండి.",
    },
    benefits: {
      salon: [
        "మా స్టైలిస్టులు ప్రీమియం ప్రొడక్ట్స్ మరియు కొత్త టెక్నిక్స్ వాడతారు, మీరు పూర్తిగా కొత్తగా ఫీల్ అవుతారు.",
        "బుకింగ్‌కు కొన్ని సెకన్లే పడుతుంది. కాల్ చేయండి, మెసేజ్ పంపండి, లేదా నేరుగా వచ్చేయండి.",
      ],
      restaurant: [
        "అన్నీ తాజాగా తయారవుతాయి, నిజమైన పదార్థాలు, గొప్ప రుచులు, మీరు ఆకలితో ఉండని పరిమాణంలో.",
        "మీ టీమ్ అందరినీ తీసుకురండి. కుటుంబాలకు, గ్రూపులకు, బడ్జెట్‌కు అందరికీ అనుకూలం.",
      ],
      gym: [
        "నిజమైన కోచ్‌లు, ఆధునిక పరికరాలు, మీ జీవితానికి సరిపోయే ప్లాన్‌తో శిక్షణ పొందండి.",
        "అన్ని ఫిట్‌నెస్ స్థాయిల వారికి స్వాగతం. మీరు ఉన్న చోట నుండే మొదలుపెట్టండి, మేము ముందుకు సాగడంలో సహాయం చేస్తాం.",
      ],
      clinic: [
        "మా అనుభవజ్ఞులైన టీమ్ సున్నితంగా, నిజాయితీగా పనిచేస్తుంది, మీకు ఎప్పుడూ ఏమి జరుగుతుందో తెలుస్తుంది.",
        "అపాయింట్‌మెంట్లు బుక్ చేయడం సులభం, ఈ వారంలోనే స్లాట్లు మరియు ఫ్రెండ్లీ రిమైండర్లతో.",
      ],
      realestate: [
        "మా ప్రాంతంలోని ప్రతి వీధి మాకు తెలుసు, ప్రతి అడుగులో నిజాయితీగా సలహా ఇస్తాం.",
        "మొదటి టూర్ నుండి తాళాలు అందుకునే వరకు, మా ప్రక్రియ స్పష్టంగా ఉంటుంది, ఆశ్చర్యాలు ఉండవు.",
      ],
      other: [
        "మేము చేసే ప్రతి పని సరిగ్గా చేస్తాం, నిజంగా శ్రద్ధ చూపే స్థానికులతో.",
        "మమ్మల్ని సంప్రదించడం సులభం, వ్యవహారం స్నేహపూర్వకం, ధరలు నిజాయితీగా ఉంటాయి.",
      ],
    },
    cta: {
      salon: "ఈ ఆఫర్ ముగిసేలోపు ఈరోజే మీ కుర్చీ బుక్ చేసుకోండి.",
      restaurant: "ఆకలితో రండి, ఈరోజే మీ టేబుల్ రిజర్వ్ చేసుకోండి.",
      gym: "ఈరోజే మొదలుపెట్టండి. మొదటి అడుగే కష్టం, దాన్ని మేము సులభం చేస్తాం.",
      clinic: "ఈరోజే మీ అపాయింట్‌మెంట్ బుక్ చేసుకోండి. మీ ఆరోగ్యం ఆగదు.",
      realestate: "ఈ వారమే టూర్ బుక్ చేసుకుని, మీరే చూడండి.",
      other: "ఈరోజే రండి, మా ప్రాంతం మమ్మల్ని ఎందుకు ఇష్టపడుతుందో చూడండి.",
    },
    bye: "త్వరలో కలుద్దాం!",
  },
  vi: {
    hooks: {
      fun: (n, o) => `Dừng lướt đã! ${n} có ưu đãi bạn không muốn bỏ lỡ. ${o}!`,
      premium: (n, o) => `Lời mời độc quyền từ ${n}. Trong thời gian giới hạn: ${o}.`,
      professional: (n, o) => `${n} vui mừng thông báo ưu đãi trong thời gian giới hạn. ${o}.`,
    },
    urgency: {
      fun: () => "Nhưng nhanh lên. Ưu đãi này chỉ trong thời gian giới hạn, hết là hết luôn.",
      premium: (n) => `Số lượng có hạn, và ${n} chỉ nhận một số ít khách hàng mới cho ưu đãi này.`,
      professional: () => "Ưu đãi chỉ áp dụng trong thời gian giới hạn, hãy hành động sớm.",
    },
    benefits: {
      salon: [
        "Thợ của chúng tôi dùng sản phẩm cao cấp và kỹ thuật mới nhất, để bạn bước ra với cảm giác hoàn toàn mới.",
        "Đặt lịch chỉ trong vài giây. Gọi cho chúng tôi, nhắn tin, hoặc cứ ghé vào.",
      ],
      restaurant: [
        "Mọi món đều làm tươi, nguyên liệu thật, hương vị đậm đà, khẩu phần hào phóng không bao giờ để bạn đói.",
        "Hãy dẫn cả nhóm theo. Chúng tôi thân thiện với gia đình, nhóm bạn và ví tiền của bạn.",
      ],
      gym: [
        "Tập luyện với huấn luyện viên thật, thiết bị hiện đại và kế hoạch thật sự phù hợp với cuộc sống của bạn.",
        "Mọi trình độ thể lực đều được chào đón. Bắt đầu từ nơi bạn đang đứng, chúng tôi sẽ giúp bạn tiến bộ.",
      ],
      clinic: [
        "Đội ngũ giàu kinh nghiệm của chúng tôi làm việc nhẹ nhàng và trung thực, để bạn luôn biết điều gì sẽ diễn ra.",
        "Đặt lịch hẹn rất dễ, có lịch trong tuần và nhắc hẹn thân thiện.",
      ],
      realestate: [
        "Chúng tôi biết mọi con phố trong khu vực, và sẽ tư vấn trung thực ở từng bước.",
        "Từ buổi xem nhà đầu tiên đến khi nhận chìa khóa, quy trình của chúng tôi rõ ràng, không bất ngờ.",
      ],
      other: [
        "Mọi việc chúng tôi làm đều chỉn chu, bởi những người địa phương thật sự quan tâm.",
        "Chúng tôi dễ liên hệ, thân thiện và trung thực về giá.",
      ],
    },
    cta: {
      salon: "Đặt ghế ngay hôm nay trước khi ưu đãi kết thúc.",
      restaurant: "Hãy đến thật đói và đặt bàn ngay hôm nay.",
      gym: "Bắt đầu hôm nay. Bước đầu tiên là khó nhất, và chúng tôi sẽ giúp nó dễ dàng.",
      clinic: "Đặt lịch hẹn ngay hôm nay. Sức khỏe của bạn không thể chờ.",
      realestate: "Đặt lịch xem nhà tuần này và tự mình trải nghiệm.",
      other: "Ghé thăm chúng tôi hôm nay và xem vì sao khu phố yêu thích chúng tôi.",
    },
    bye: "Hẹn sớm gặp lại bạn!",
  },
};

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

  const lang = input.language ?? "en";
  const pack = VOICE_PACKS[lang];
  if (pack) {
    const offer = input.offer.trim();
    scenes[0].voice = pack.hooks[input.tone](name, offer);
    scenes[1].voice = pack.benefits[input.type][0];
    scenes[2].voice = pack.benefits[input.type][1];
    scenes[3].voice = pack.urgency[input.tone](name);
    scenes[4].voice = `${pack.cta[input.type]} ${name}. ${offer}. ${pack.bye}`;
  }

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
    langCode: LANGUAGE_OPTIONS.find((l) => l.value === lang)?.code ?? "en-US",
    brandColor: input.brand?.color ?? null,
    logoUrl: input.brand?.logoUrl ?? null,
    photoUrl: input.brand?.photos?.[0] ?? null,
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
