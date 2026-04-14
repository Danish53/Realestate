import { stripChatMarkdown } from "@/utils/stripChatMarkdown";

// pages/api/chat.js

/** Shown when the user asks about non–real-estate topics — no LLM call. */
const OFF_TOPIC_ASSISTANT_REPLY =
  "I'm your AI real estate assistant on this app. I specialise in Pakistan property — houses, flats, plots, rent and sale, budgets, areas, societies, possession, file vs plot, and practical market guidance.\n\nAsk me anything property-related (for example a city, budget in lakh or crore, marla size, or house vs plot) and I'll give you a detailed, helpful answer. For topics outside real estate, I'm not the right assistant here.";

/** hello / hi / salam — always this path (even if chat history mentions property). No LLM. */
const GREETING_ASSISTANT_REPLY =
  "Hello! I'm your AI property assistant.\n\nI help you with Pakistan real estate — houses, flats, plots, rent or sale, budgets, marla or kanal size, and areas or societies. Just tell me what you need in simple words and I'll help you step by step.";

/** "How are you?" style — no LLM. */
const CASUAL_PLEASANTRY_REPLY =
  "I'm well, thank you.\n\nI'm your AI property assistant here — I focus on Pakistan property: buying, renting, plots, houses, budgets, and areas. Tell me what you'd like to look for next.";

/** Model returned no text but we still have a search link. */
const PROPERTY_SEARCH_FALLBACK_TEXT =
  "I'm your AI real estate assistant. I've prepared a property search from what you described. Use the action in the app to view matching listings.\n\nFor a fuller market brief (budget bands, trade-offs, what to verify), ask again or add your city, area, size, and budget in one message.";

/** Rare: model call failed — keep tone simple, no “technical issue” wording. */
const AI_UNAVAILABLE_ASSISTANT_REPLY =
  "I'm your AI property assistant for Pakistan. That reply didn't come through — please send your message again.\n\nI'm here for houses, flats, plots, budgets, areas, rent or sale, and general property guidance.";

const NO_API_KEY_WITH_SEARCH_REPLY =
  "I'm your AI real estate assistant. A property search link is ready from your message, but the AI explanation layer isn't configured on the server right now — so you'll get the listing view without the long written brief.\n\nAsk your host to set OPENROUTER_API_KEY if you want detailed answers here. You can still browse the matches from the app.";

const NO_API_KEY_GENERAL_REPLY =
  "I'm your AI real estate assistant for Pakistan property. Detailed AI answers need the assistant service to be configured (OPENROUTER_API_KEY) on the server.\n\nOnce that's set up, I can give long, specific guidance on areas, budgets, sizes, and market reality. For now, please try again later or contact support.";

/** Override via env, e.g. OPENROUTER_CHAT_MODEL=openai/gpt-4o-mini for lower cost. */
const OPENROUTER_CHAT_MODEL =
  process.env.OPENROUTER_CHAT_MODEL || "openai/gpt-4o-mini";

/**
 * Completion budget per call (not total chat cost). Lower = cheaper / fits small OpenRouter balances.
 * Set in .env e.g. OPENROUTER_MAX_COMPLETION_TOKENS=1024 if credits are tight (may truncate long replies).
 * Hard cap 8192, floor 256 (env override minimum).
 */
function resolveOpenRouterMaxCompletionTokens() {
  const raw = process.env.OPENROUTER_MAX_COMPLETION_TOKENS;
  /* Default 1536: slightly shorter replies than 2048; still enough for complete paragraphs. Override via env. */
  if (raw == null || String(raw).trim() === "") return 1536;
  const n = parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(n)) return 1536;
  return Math.min(8192, Math.max(256, n));
}

/** Max user+assistant messages sent after trimming (newest kept). Saves input tokens. */
function resolveOpenRouterMaxChatMessages() {
  const raw = process.env.OPENROUTER_MAX_CHAT_MESSAGES;
  if (raw == null || String(raw).trim() === "") return 12;
  const n = parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(n)) return 12;
  return Math.min(32, Math.max(4, n));
}

/** Second weak-reply pass doubles cost — set OPENROUTER_WEAK_REPLY_RETRY=0 to save credits. */
const OPENROUTER_WEAK_REPLY_RETRY_ENABLED =
  process.env.OPENROUTER_WEAK_REPLY_RETRY !== "0";

function formatOpenRouterErrorMessage(data) {
  if (!data) return "OpenRouter API error";
  const e = data.error;
  if (typeof e === "string") return e;
  if (e && typeof e.message === "string") return e.message;
  if (typeof data.message === "string") return data.message;
  return "OpenRouter API error";
}

function extractOpenRouterAssistantText(data) {
  const msg = data?.choices?.[0]?.message;
  if (typeof msg?.content === "string") return msg.content;
  if (Array.isArray(msg?.content)) {
    return msg.content.map((part) => part?.text || "").join("");
  }
  return "";
}

function countParagraphsByBlankLines(text) {
  if (!text || typeof text !== "string") return 0;
  return text
    .split(/\n\s*\n+/)
    .filter((p) => p.replace(/\s+/g, " ").trim().length > 50).length;
}

function isWeakPropertySearchReply(text) {
  const t = (text || "").trim();
  if (!t) return true;
  if (t.length < 380) return true;
  if (countParagraphsByBlankLines(t) < 2) return true;
  const low = t.toLowerCase();
  if (
    /\bplease let me know\b/.test(low) ||
    /\bif you have\b/.test(low) ||
    /\bif you've\b/.test(low) ||
    /\bfurther details\b/.test(low) ||
    /\bif you(?:'| a)re interested\b/.test(low) ||
    /\blet me know\b/.test(low) ||
    /\bdon't hesitate\b/.test(low) ||
    /\bfeel free to\b/.test(low)
  )
    return true;
  return false;
}

function buildPropertySearchWeakReplyRetryUserContent(
  lastUserNorm,
  filtersForAI
) {
  const summary =
    buildSearchSummaryForPrompt(filtersForAI) || "property search";
  return (
    "Your previous reply was too short or generic for a property search. Rewrite from scratch as a senior Pakistan real-estate consultant.\n\n" +
    `Latest user message:\n${String(lastUserNorm || "").trim()}\n\n` +
    `Parsed intent (stay consistent): ${summary}\n\n` +
    "Requirements: **3 concise full paragraphs** (complete sentences only; blank lines between); **2025–2026** framing; **broad PKR bands** (ranges + disclaimer); file vs possession; **≥1–2 recommendation sentences**. Keep it a bit shorter than a long essay. Forbidden: \"please let me know\", \"if you have a society\", \"further details\", \"View Listings\", \"browse listings\", URLs. Do not open with \"You are looking for…\"."
  );
}

// --------------- Helper: Size parsing ---------------
function parseSizeFromText(text = "") {
  const sizeRegex =
    /(\d+(\.\d+)?)\s*(marla|kanal|sq ?ft|square feet|sq ?yd|square yards?|sq ?y?d?s?|square meter|sq ?m|acre|acres)\b/i;
  const m = text.toLowerCase().match(sizeRegex);
  if (!m) return { size: null, sizeUnit: null };

  const num = parseFloat(m[1]);
  let unitRaw = m[3].toLowerCase();
  let unit = unitRaw;

  if (unitRaw.includes("marla")) unit = "marla";
  else if (unitRaw.includes("kanal")) unit = "kanal";
  else if (unitRaw.includes("sq m") || unitRaw.includes("square meter"))
    unit = "sqm";
  else if (unitRaw.includes("sq ft") || unitRaw.includes("square feet"))
    unit = "sqft";
  else if (unitRaw.includes("sq yd") || unitRaw.includes("square yard"))
    unit = "sqyd";
  else if (unitRaw.startsWith("acre")) unit = "acre";

  return { size: num, sizeUnit: unit };
}

// --------------- Helper: Property type / purpose ---------------
/** Type keywords in the latest user message only — wins over older lines in merged chat text. */
function detectPropertyTypeFromLastSegment(lastUserMessage = "") {
  const t = String(lastUserMessage || "").toLowerCase().trim();
  if (!t) return null;
  if (/\b(plot|plots|file)\b/.test(t)) return "plot";
  if (
    /\b(house|home|homes|villa|villas|portion|houses|bungalow|bungalows)\b/.test(t)
  )
    return "house";
  if (/\b(flat|flats|apartment|apartments)\b/.test(t)) return "flat";
  if (/\b(shop|office|commercial)\b/.test(t)) return "commercial";
  return null;
}

/** Full-text scan (order: plot before house). Used after prior-line inference. */
function detectPropertyTypeCore(text = "") {
  const t = String(text || "").toLowerCase();
  if (/\b(plot|plots|file)\b/.test(t)) return "plot";
  if (
    /\b(house|home|homes|villa|villas|portion|houses|bungalow|bungalows)\b/.test(t)
  )
    return "house";
  if (/\b(flat|flats|apartment|apartments)\b/.test(t)) return "flat";
  if (/\b(shop|office|commercial)\b/.test(t)) return "commercial";
  return null;
}

/**
 * If the last message is refinement-only (e.g. only beds/baths/price), infer house/flat/plot
 * from **earlier** conversation text so category matches the user's prior house/flat search.
 */
function detectPropertyType(text = "", lastUserMessage = "") {
  const fromLast = detectPropertyTypeFromLastSegment(lastUserMessage);
  if (fromLast) return fromLast;

  const last = String(lastUserMessage || "").trim();
  if (last && isRefinementOnlyMessage(last)) {
    const prior = getPriorConversationTextExcludingLast(text, lastUserMessage);
    if (prior.length > 5) {
      const fromPrior =
        detectPropertyTypeFromLastSegment(prior) || detectPropertyTypeCore(prior);
      if (fromPrior) return fromPrior;
    }
  }

  return detectPropertyTypeCore(text);
}

function detectPurpose(text = "") {
  const t = text.toLowerCase();
  if (/\b(rent|rental|on rent|for rent)\b/.test(t)) return "rent";
  if (/\b(buy|purchase|for sale|sale|sell|investment|invest)\b/.test(t))
    return "sale";
  return "sale";
}

function detectBeds(text = "") {
  const low = text.toLowerCase();
  let m = low.match(/(\d+)\s*(bed|beds|bedroom|bedrooms|br)\b/i);
  if (!m) m = low.match(/(\d+)(bed|beds|bedroom|bedrooms)\b/i);
  return m ? parseInt(m[1], 10) : null;
}

function detectBaths(text = "") {
  const low = text.toLowerCase();
  let m = low.match(/(\d+)\s*(bath|baths|bathroom|bathrooms)\b/i);
  if (!m) m = low.match(/(\d+)(bath|baths|bathroom|bathrooms)\b/i);
  return m ? parseInt(m[1], 10) : null;
}

/** Combined chat text with last user line removed (case-insensitive) — for type/category inference. */
function getPriorConversationTextExcludingLast(fullText, lastUserMessage) {
  const prior = String(fullText || "").trim();
  const last = String(lastUserMessage || "").trim();
  if (!last) return prior;
  const lower = prior.toLowerCase();
  const lastLow = last.toLowerCase();
  const ix = lower.lastIndexOf(lastLow);
  if (ix >= 0) return prior.slice(0, ix).replace(/\s+$/u, "").trim();
  const parts = prior.split(/\n/).map((s) => s.trim()).filter(Boolean);
  if (parts.length > 1) return parts.slice(0, -1).join(" \n ");
  return "";
}

function convertToSquareMeters(size, unit) {
  if (!size || !unit) return null;

  const SQFT_TO_SQM = 0.092903;

  if (unit === "marla") {
    const sqft = size * 225;   // Zameen standard
    return sqft * SQFT_TO_SQM;
  }

  if (unit === "kanal") {
    const sqft = size * 4500;  // 1 kanal = 20 marla (225 sqft wala)
    return sqft * SQFT_TO_SQM;
  }

  if (unit === "sqft") return size * SQFT_TO_SQM;
  if (unit === "sqyd") return size * 0.836127;
  if (unit === "sqm") return size;

  if (unit === "acre") {
    const sqft = size * 43560;
    return sqft * SQFT_TO_SQM;
  }

  return null;
}

// --------------- Helper: Price range (PKR) ---------------
function extractPriceRange(message) {
  const text = String(message || "")
    .toLowerCase()
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const parseAmount = (num, unit) => {
    const val = parseFloat(num, 10);
    if (Number.isNaN(val)) return null;
    const u = (unit || "").toLowerCase();
    if (u.includes("crore") || u === "cr") return val * 10000000;
    if (u.includes("lakh") || u.includes("lac")) return val * 100000;
    if (u.includes("thousand") || u === "k") return val * 1000;
    return val;
  };

  let priceMin = null;
  let priceMax = null;

  const UNIT = "(lakh|lac|crore|cr|k|thousand)s?";
  const NUM = "(\\d+(?:\\.\\d+)?)";

  // "between 50 lakh and 1 crore" / "between 1.2 cr to 2 cr"
  const betweenRe = new RegExp(
    `between\\s+${NUM}\\s*${UNIT}?\\s+(?:and|-|to)\\s+${NUM}\\s*${UNIT}?`,
    "i"
  );
  const bm = text.match(betweenRe);
  if (bm) {
    const u1 = bm[2] || "";
    const u2 = (bm[4] || bm[2] || "").toLowerCase();
    priceMin = parseAmount(bm[1], u1);
    priceMax = parseAmount(bm[3], u2);
    if (
      priceMin != null &&
      priceMax != null &&
      priceMin > priceMax
    ) {
      const t = priceMin;
      priceMin = priceMax;
      priceMax = t;
    }
    return { priceMin, priceMax };
  }

  // under / below / less than / upto / max ...
  const underRe = new RegExp(
    `(?:under|below|less\\s+than|upto|up\\s+to|maximum|max)\\s+${NUM}\\s*${UNIT}?`,
    "i"
  );
  const um = text.match(underRe);
  if (um) {
    priceMax = parseAmount(um[1], um[2] || "");
    return { priceMin, priceMax };
  }

  // above / over / more than / min ...
  const overRe = new RegExp(
    `(?:above|over|more\\s+than|minimum|min)\\s+${NUM}\\s*${UNIT}?`,
    "i"
  );
  const om = text.match(overRe);
  if (om) {
    priceMin = parseAmount(om[1], om[2] || "");
    return { priceMin, priceMax };
  }

  // "in 35 lac", "at 1.5 crore", "budget 1 crore", "within 80 lakh" (budget-style)
  const budgetRe = new RegExp(
    `\\b(?:in|at|for|around|about|near|budget|within)\\s+${NUM}\\s*${UNIT}\\b`,
    "i"
  );
  const im = text.match(budgetRe);
  if (im) {
    const amt = parseAmount(im[1], im[2] || "");
    if (amt != null) {
      const fuzzy = /\b(around|about|near)\b/.test(im[0]);
      if (fuzzy) {
        priceMin = Math.round(amt * 0.85);
        priceMax = Math.round(amt * 1.15);
      } else {
        // "in 1 crore" / "budget 1 cr" = cap only — include everything below up to this amount
        priceMin = null;
        priceMax = amt;
      }
      return { priceMin, priceMax };
    }
  }

  // Last: first money amount in the line (e.g. "...lahore 1 crore" with no "in") — treat as **max budget only**, not min=max
  const soloRe = new RegExp(`\\b${NUM}\\s*${UNIT}\\b`, "i");
  const sm = text.match(soloRe);
  if (sm) {
    const amt = parseAmount(sm[1], sm[2] || "");
    if (amt != null) {
      priceMin = null;
      priceMax = amt;
    }
  }

  return { priceMin, priceMax };
}

// --------------- Location mapping (text → Zameen slug) ---------------

// City name → Zameen city slug
const CITY_SLUGS = {
  lahore: "Lahore-1",
  karachi: "Karachi-2",
  islamabad: "Islamabad-3",
  rawalpindi: "Rawalpindi-41",
  faisalabad: "Faisalabad-16",
  multan: "Multan-15",
  peshawar: "Peshawar-17",
  gujranwala: "Gujranwala-327",
  quetta: "Quetta-18",
  sialkot: "Sialkot-480",
  hyderabad: "Hyderabad-249",
  murree: "Murree-19",
  gwadar: "Gwadar-1065"

};

const AREA_SLUGS = {
  // --- LAHORE ---
  "johar town": "Lahore_Johar_Town-93",
  "dha": "Lahore_DHA_Defence-9",
  "dha defence": "Lahore_DHA_Defence-9",
  "bahria town": "Lahore_Bahria_Town-509",
  "gulberg": "Lahore_Gulberg-25",
  "raiwind road": "Lahore_Raiwind_Road-128",
  "model town": "Lahore_Model_Town-8",
  "wapda town": "Lahore_Wapda_Town-169",
  "askari": "Lahore_Askari-139",
  "allama iqbal town": "Lahore_Allama_Iqbal_Town-134",
  "cavalry ground": "Lahore_Cavalry_Ground-10",
  "state life": "Lahore_State_Life_Housing_Society-545",
  "lake city": "Lahore_Lake_City-510",

  // --- KARACHI ---
  "dha karachi": "Karachi_DHA_Defence-26",
  "bahria town karachi": "Karachi_Bahria_Town_Karachi-6625",
  "gulshan-e-iqbal": "Karachi_Gulshan_e_Iqbal-147",
  "clifton": "Karachi_Clifton-27",
  "north nazimabad": "Karachi_North_Nazimabad-150",
  "scheme 33": "Karachi_Scheme_33-162",
  "gadapi": "Karachi_Gadap_Town-156",
  "malir": "Karachi_Malir-157",
  "kda scheme 1": "Karachi_KDA_Scheme_1-28",

  // --- ISLAMABAD ---
  "dha islamabad": "Islamabad_DHA_Defence-89",
  "bahria town islamabad": "Islamabad_Bahria_Town-52",
  "gulberg islamabad": "Islamabad_Gulberg-3343",
  "e-7": "Islamabad_E_7-123",
  "f-6": "Islamabad_F_6-116",
  "f-7": "Islamabad_F_7-117",
  "f-8": "Islamabad_F_8-118",
  "f-10": "Islamabad_F_10-127",
  "f-11": "Islamabad_F_11-128",
  "g-11": "Islamabad_G_11-131",
  "g-13": "Islamabad_G_13-133",
  "b-17": "Islamabad_B_17-106",
  "i-8": "Islamabad_I_8-142",

  // --- RAWALPINDI ---
  "bahria town pindi": "Rawalpindi_Bahria_Town-221",
  "satellite town": "Rawalpindi_Satellite_Town-240",
  "saddar": "Rawalpindi_Saddar-239",
  "chaklala scheme": "Rawalpindi_Chaklala_Scheme-225",
  "adiala road": "Rawalpindi_Adiala_Road-1014",

  // --- MULTAN ---
  "dha multan": "Multan_DHA_Multan-8452",
  "wapda town multan": "Multan_Wapda_Town-650",
  "buch villas": "Multan_Buch_Villas-3342",

  // --- FAISALABAD ---
  "canal road": "Faisalabad_Canal_Road-676",
  "madina town": "Faisalabad_Madina_Town-612",

  // --- GWADAR ---
  "sangar housing": "Gwadar_Sangar_Housing_Scheme-1423",
  "balochward": "Gwadar_Balochward-3161"
};

// Graana location slugs (examples; tum apni required societies add karte jao)
const GRAANA_CITY_SLUGS = {
  islamabad: "islamabad-1",
  karachi: "karachi-169",
  lahore: "lahore-2",
  peshawar: "peshawar-176",
  rawalpindi: "rawalpindi-3",
  abbottabad: "abbottabad-182",
  attock: "attock-180",
  bahawalpur: "bahawalpur-175",
  bannu: "bannu-201",
  batgram: "batgram-218",
  bhimber: "bhimber-229",
  buner: "buner-213",
  chakwal: "chakwal-177",
  charsadda: "charsadda-197",
  chitral: "chitral-212",
  daska: "daska-188",
  dera_ghazi_khan: "dera-ghazi-khan-189",
  di_khan: "di-khan-203",
  dina: "dina-243",
  dir_lower: "dir-lower-211",
  dir_upper: "dir-upper-210",
  faisalabad: "faisalabad-170",
  fateh_jhang: "fateh-jhang-196",
  gilgit: "gilgit-184",
  gujar_khan: "gujar-khan-241",
  gujranwala: "gujranwala-174",
  gujrat: "gujrat-233",
  gwadar: "gwadar-179",
  hangu: "hangu-202",
  haripur: "haripur-214",
  hasanabdal: "hasanabdal-181",
  hyderabad: "hyderabad-183",
  jhelum: "jhelum-193",
  karak: "karak-200",
  kasur: "kasur-273",
  khanewal: "khanewal-240",
  khanpur: "khanpur-185",
  kharian: "kharian-235",
  kohat: "kohat-199",
  kohistan: "kohistan-216",
  kotli: "kotli-220",
  lakki_marwat: "lakki-marwat-205",
  lalamusa: "lalamusa-234",
  mansehra: "mansehra-215",
  mardan: "mardan-171",
  mirpur_azad_kashmir: "mirpur-192",
  multan: "multan-168",
  murree: "murree-167",
  muzaffarabad: "muzaffarabad-219",
  nawabshah: "nawabshah-232",
  nowshera: "nowshera-195",
  okara: "okara-194",
  quetta: "quetta-187",
  sadiqabad: "sadiqabad-339",
  sahiwal: "sahiwal-306",
  sarai_alamgir: "sarai-alamgir-230",
  sargodha: "sargodha-172",
  shangla: "shangla-209",
  sheikhupura: "sheikhupura-186",
  sialkot: "sialkot-190",
  skardu: "skardu-227",
  sukkur: "sukkur-207",
  swabi: "swabi-198",
  swat: "swat-206",
  talagang: "talagang-178",
  tank: "tank-204",
  taxila: "taxila-166",
  wah: "wah-173",
  wazirabad: "wazirabad-236",
};

const GRAANA_AREA_SLUGS = {
  // Lahore
  "bahria town": "bahria-town-lahore-2-492",
  "dha": "defence-housing-authority-dha-lahore-2-638",
  "johar town": "johar-town-lahore-2-6459",
  "gulberg": "gulberg-lahore-2-9577",
  "wapda town": "wapda-town-lahore-2-321",
  "valencia town": "valencia-housing-society-lahore-2-654",
  "lake city": "lake-city-lahore-2-800",
  "paragon city": "paragon-city-lahore-2-801",
  "askari": "askari-lahore-2-9579",
  "faisal town": "faisal-town-lahore-2-803",
  "model town": "model-town-lahore-2-536",
  "pak arab housing society": "pak-arab-housing-society-lahore-2-805",
  "state life housing society": "state-life-housing-society-lahore-2-806",
  "paradise town": "paradise-town-lahore-2-807",
  "raiwind": "raiwind-road-lahore-2-2349",

  // Karachi
  "dha karachi": "dha-defence-karachi-169-210",
  "clifton karachi": "clifton-karachi-169-211",
  "gulshan e iqbal karachi": "gulshan-e-iqbal-karachi-169-212",
  "gulistan e johar karachi": "gulistan-e-johar-karachi-169-213",
  "north nazimabad karachi": "north-nazimabad-karachi-169-214",
  "malir karachi": "malir-karachi-169-215",
  "scheme 33 karachi": "scheme-33-karachi-169-216",
  "defence view karachi": "defence-view-karachi-169-217",
  "bahadurabad karachi": "bahadurabad-karachi-169-218",
  "clifton block 8 karachi": "clifton-block-8-karachi-169-219",

  // Islamabad
  "bahria town islamabad": "bahria-town-islamabad-1-310",
  "dha islamabad": "dha-defence-islamabad-1-311",
  "g 11 islamabad": "g-11-islamabad-1-312",
  "g 13 islamabad": "g-13-islamabad-1-313",
  "f 10 islamabad": "f-10-islamabad-1-314",
  "f 11 islamabad": "f-11-islamabad-1-315",
  "i 8 islamabad": "i-8-islamabad-1-316",
  "i 10 islamabad": "i-10-islamabad-1-317",
  "g 9 islamabad": "g-9-islamabad-1-318",
  "g 14 islamabad": "g-14-islamabad-1-319",

  // Rawalpindi
  "bahria town rawalpindi": "bahria-town-rawalpindi-3-410",
  "dha rawalpindi": "dha-defence-rawalpindi-3-411",
  "saddar rawalpindi": "saddar-rawalpindi-3-412",
  "chaklala scheme rawalpindi": "chaklala-scheme-rawalpindi-3-413",
  "adiala road rawalpindi": "adiala-road-rawalpindi-3-414",
  "askari rawalpindi": "askari-rawalpindi-3-415",
  "pak secretariat housing society rawalpindi": "pak-secretariat-housing-society-rawalpindi-3-416",
  "allahabad housing society rawalpindi": "allahabad-housing-society-rawalpindi-3-417",
  "faizabad housing society rawalpindi": "faizabad-housing-society-rawalpindi-3-418",
  "g 15 society rawalpindi": "g-15-society-rawalpindi-3-419"
};

function detectCityFromText(text = "") {
  const t = text.toLowerCase();
  const keys = [
    ...new Set([
      ...Object.keys(CITY_SLUGS),
      ...Object.keys(GRAANA_CITY_SLUGS),
    ]),
  ].sort((a, b) => b.length - a.length);
  for (const name of keys) {
    const phrase = name.replace(/_/g, " ");
    if (t.includes(phrase)) return name;
  }
  return null;
}

function detectAreaFromText(text = "") {
  const t = text.toLowerCase();

  const entries = Object.entries(AREA_SLUGS).sort(
    (a, b) => b[0].length - a[0].length
  );
  for (const [key, slug] of entries) {
    if (t.includes(key)) {
      let areaLabel = key;

      if (key === "johar town") areaLabel = "Johar Town, Lahore";
      else if (key === "dha defence" || key === "dha")
        areaLabel = "DHA Defence, Lahore";
      else if (key === "bahria town") areaLabel = "Bahria Town, Lahore";

      return { areaSlug: slug, areaLabel };
    }
  }
  return { areaSlug: null, areaLabel: null };
}

function detectGraanaAreaFromText(text = "") {
  const t = text.toLowerCase();
  const entries = Object.entries(GRAANA_AREA_SLUGS).sort(
    (a, b) => b[0].length - a[0].length
  );
  for (const [key, slug] of entries) {
    if (t.includes(key)) return slug;
  }
  return null;
}

function inferCityFromZameenAreaSlug(areaSlug) {
  if (!areaSlug || typeof areaSlug !== "string") return null;
  const prefix = areaSlug.split("_")[0];
  const map = {
    Lahore: "lahore",
    Karachi: "karachi",
    Islamabad: "islamabad",
    Rawalpindi: "rawalpindi",
    Multan: "multan",
    Faisalabad: "faisalabad",
    Peshawar: "peshawar",
    Gujranwala: "gujranwala",
    Quetta: "quetta",
    Gwadar: "gwadar",
  };
  return map[prefix] || null;
}

function mapGraanaCitySlug(cityName) {
  if (!cityName) return null;
  const raw = String(cityName).toLowerCase().trim();
  const underscored = raw.replace(/\s+/g, "_");
  return (
    GRAANA_CITY_SLUGS[underscored] ||
    GRAANA_CITY_SLUGS[raw] ||
    null
  );
}

function mapCityNameToSlug(cityName) {
  if (!cityName) return null;
  return CITY_SLUGS[cityName.toLowerCase()] || null;
}

// --------------- Property type → Zameen category ---------------
function mapPropertyTypeToCategory(propertyType, purpose, text = "") {
  const t = (propertyType || "").toLowerCase();
  const p = (purpose || "").toLowerCase();
  const txt = (text || "").toLowerCase();

  // --- 1. Detect plot type more precisely ---
  if (t === "plot" || t === "plots") {
    if (/\bcommercial\s+plots?\b/.test(txt)) return "Commercial_Plots";
    return "Residential_Plots";
  }

  // --- 2. Houses / Flats ---
  if (
    t === "house" ||
    t === "home" ||
    t === "villa" ||
    t === "portion" ||
    t === "houses"
  )
    return "Houses";
  if (t === "flat" || t === "apartment" || t === "flats") return "Flats";

  // --- 3. Office / Shop / Commercial detection ---
  if (/\b(office|offices)\b/.test(txt)) return "Offices";
  if (/\b(shop|shops)\b/.test(txt)) return "Retail_Shops";
  if (/\b(commercial)\b/.test(txt)) return "Commercial_Plots";

  // --- 4. Purpose fallback ---
  if (p === "commercial") return "Commercial_Plots";
  // Do NOT map generic "sale" to Residential_Plots — that mis-tags house searches when type is unclear.

  return "Homes"; // default when category cannot be inferred
}

// --------------- Query classification ---------------
/**
 * User is asking about societies / corridors / areas (often without "5 marla plot" wording).
 * Fresh chats failed before when "societies" was misspelled or only area names were used.
 */
function isAreaOrSocietyDiscoveryQuery(text = "") {
  const t = String(text || "").toLowerCase();
  if (!t) return false;
  const pkCity =
    /\b(lahore|karachi|islamabad|rawalpindi|multan|faisalabad|peshawar|quetta|hyderabad|gujranwala|sialkot|murree|gwadar)\b/.test(
      t
    );
  if (!pkCity) return false;

  if (
    /\b(societ(y|ies)|housing\s*scheme|township|locality|neighbourhood|neighboru?hood|developers?)\b/.test(
      t
    )
  )
    return true;

  const corridor =
    /\b(raiwind|multan\s+road|firozpur\s+road|ring\s+road|gt\s*road|canal\s+bank|mm\s*alam|johar|gulberg|dha|bahria|askari|eden|state\s*life|fdf|valencia|model\s*town)\b/.test(
      t
    );
  const placeShape =
    /\b(road|society|societies|phase|block|sector|avenue|boulevard)\b/.test(t);
  const propertyLean =
    /\b(societ|plot|house|flat|file|buy|rent|sale|invest|best|good|which|what|tell|list|compare|market|living|residential|cheap|expensive|budget|pkr|lakh|crore|marla|kanal)\b/.test(
      t
    );

  if (corridor && placeShape && propertyLean) return true;

  return false;
}

function isPropertySearchQuery(text = "") {
  const t = text.toLowerCase();
  return (
    /\b(plot|plots|file|house|homes|home|villa|villas|portion|houses|bungalow|bungalows|flat|flats|apartment|apartments|shop|office|commercial)\b/.test(
      t
    ) ||
    /\bmarla|kanal|sq ft|square feet|sq yd|rent|sale|buy|purchase|invest\b/.test(
      t
    ) ||
    isAreaOrSocietyDiscoveryQuery(t)
  );
}

/**
 * Broader than {@link isPropertySearchQuery}: advisory / context without a full "search" shape.
 * Used only to decide whether to call the model; structured search + `pageLink` still require `isPropSearch` in the handler.
 */
function hasBroadRealEstateIntent(text = "") {
  const t = String(text || "").toLowerCase().trim();
  if (!t) return false;
  if (isPropertySearchQuery(t)) return true;
  return (
    /\b(property|properties|real\s*estate|realty|realtor|zameen|graana|listings?\b|makaan|makkan|ghar|kothi|bangla|townhouse|duplex)\b/.test(
      t
    ) ||
    /\b(scocieties|socities|socieites)\b/.test(t) ||
    /\b(possession|transfer|ballot|balloting|noc|installment|installments|file\s+plot|plot\s+file|corner\s+plot|park\s+facing)\b/.test(
      t
    ) ||
    /\b(dha|bahria|society|societies|housing\s*scheme|township|developers?|high-?rise)\b/.test(
      t
    ) ||
    /\b(mortgage|home\s*loan|lease|tenant|landlord|valuation|rental\s*yield|construction\s*cost)\b/.test(
      t
    ) ||
    /\b(khayaban|johar|gulberg|raiwind|fdf|smart\s*city|blue\s*world)\b/.test(t) ||
    /\b(where\s*to\s*(live|rent|buy)|which\s*area|what\s*area|recommend\s+(an?\s*)?(area|society|locality|neighbourhood|neighborhood)|good\s+society|safe\s+neighborhood)\b/.test(
      t
    )
  );
}

function isNearMeQuery(text = "") {
  const t = text.toLowerCase();
  return /\bnear me|mere qareeb|around me|pass mein\b/.test(t);
}

/** Last N user messages joined — used to merge follow-up filters (beds/baths/budget) with earlier search. */
function buildCombinedUserSearchText(messages) {
  const users = (messages || [])
    .filter((m) => m && m.role === "user")
    .map((m) => normalizePropertySearchText(String(m.content || "").trim()))
    .filter(Boolean);
  const maxMsgs = 12;
  return users.slice(-maxMsgs).join(" \n");
}

function hasPrimaryPropertyKeyword(text = "") {
  const t = text.toLowerCase();
  return (
    /\b(plot|plots|file|house|homes|home|villa|villas|portion|houses|bungalow|bungalows|flat|flats|apartment|apartments|shop|office|commercial)\b/.test(
      t
    ) ||
    /\bmarla|kanal|sq ft|square feet|sq yd|rent|sale|buy|purchase|invest\b/.test(t)
  );
}

/** True if message looks like a filter tweak (beds, baths, price, size, area) without a full new property query. */
function looksLikeSearchRefinement(text = "") {
  const t = String(text || "").trim();
  if (!t) return false;
  if (detectBeds(t) || detectBaths(t)) return true;
  const { priceMin, priceMax } = extractPriceRange(t);
  if (priceMin != null || priceMax != null) return true;
  if (parseSizeFromText(t).size) return true;
  if (detectAreaFromText(t).areaSlug || detectGraanaAreaFromText(t)) return true;
  return false;
}

function isRefinementOnlyMessage(text = "") {
  const t = String(text || "").trim();
  if (!t) return false;
  if (hasPrimaryPropertyKeyword(t)) return false;
  return looksLikeSearchRefinement(t);
}

/**
 * User is adding detail (e.g. "good houses on Raiwind") without restating budget/size — merge with earlier turns for link params, while last message still wins for property type.
 */
function isAdditivePropertyFollowUp(userMessage = "") {
  const t = String(userMessage || "").trim();
  if (!t) return false;
  if (isRefinementOnlyMessage(t)) return false;
  if (!hasPrimaryPropertyKeyword(t)) return false;
  const { priceMin, priceMax } = extractPriceRange(t);
  if (priceMin != null || priceMax != null) return false;
  const { size } = parseSizeFromText(t.toLowerCase());
  if (size != null) return false;
  return true;
}

/**
 * Guides the model to mirror user language: English vs Roman Urdu vs Urdu script.
 */
function inferUserLanguageHint(text = "") {
  const raw = String(text || "").trim();
  if (!raw) return "Mirror the user's language.";

  if (/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(raw)) {
    return "User wrote in Urdu/Arabic script — reply in polished Roman Urdu (professional), with English real-estate terms where natural. **Usually 2–3 concise complete paragraphs**, blank lines between (add a 4th only if truly needed); **never stop mid-sentence**.";
  }

  const lower = raw.toLowerCase();
  const romanUrdu =
    /\b(kay|kya|hai|hain|ke liye|mujhe|aapko|aap|mera|mere|chahiye|talash|dhoondh|dhoond|raha|rahi|rahe|hoon|hon|par|mein|main|wala|wali|acha|achhi|bata|dekho|yeh|ye|kuch|nahi|nahin|agar|warna|bhi|isko|uss|liye|mil|milte|mil sakte|zaroorat)\b/i.test(
      lower
    ) || /[؟]/u.test(raw);

  const englishLean =
    /\b(looking for|i want|i need|can you|please|show me|find|search|plot|house|flat|for sale|to rent|budget|lac|lakh|crore|marla|kanal)\b/i.test(
      lower
    ) && !romanUrdu;

  // Short English-style queries: "5marla plot raiwind road in 50lac" (spacing optional)
  const compactEnglishProperty =
    !romanUrdu &&
    /\b(plot|plots|house|flat|road|block|phase|dha|bahria|society|societies)\b|\d+\s*marla|marla|kanal/i.test(
      lower
    ) &&
    /\b(in|on|at|under|around|near|for|sale|rent|lac|lakh|crore|pk)\b/i.test(lower);

  if (romanUrdu) {
    return "User wrote in Roman Urdu — reply in professional Roman Urdu with **depth** lekin **thori chhoti length**: **2–3 pooray paragraphs** (ziyada zarurat ho to 4); blank lines between. **Beech jumlay par mat ruko.** Cover **2025–2026**, **broad PKR band**, **budget vs reality**, **1–2 clear suggestions**. No empty hospitality closings.";
  }
  if (englishLean || compactEnglishProperty) {
    return "User wrote in English — fluent, **opinionated**, **actionable**, **slightly shorter than a long essay**. **Usually 2–3 full paragraphs** (each ending with a complete sentence; blank lines between); use **4 short paragraphs** only for a very broad question. Cover: **2025–2026** framing + **broad PKR range** where relevant, trade-offs, **1–2 concrete suggestions**, brief verification note if helpful. Never end mid-sentence. Never end with generic \"let me know / assist you further\" filler.";
  }
  return "Mirror the user's language (English vs Roman Urdu); default to **English** if unclear. For property answers: **2–3 concise complete paragraphs** with blank lines unless the user asked for one line or a very short reply.";
}

function formatPkBudgetPhrase(minP, maxP) {
  const fmt = (n) => {
    if (n >= 10000000)
      return `${(n / 10000000).toFixed(Number.isInteger(n / 10000000) ? 0 : 2)} crore`;
    return `${(n / 100000).toFixed(Number.isInteger(n / 100000) ? 0 : 1)} lakh`;
  };
  if (minP != null && maxP != null && Math.abs(minP - maxP) > 1)
    return `around ${fmt(minP)} to ${fmt(maxP)} PKR`;
  if (maxP != null) return `around up to ${fmt(maxP)} PKR`;
  if (minP != null) return `from about ${fmt(minP)} PKR`;
  return null;
}

/** One-line summary for the model (English) — mirrors parsed filters */
function buildSearchSummaryForPrompt(f) {
  if (!f) return "";
  const bits = [];
  if (f.propertyType) bits.push(f.propertyType);
  if (f.size != null)
    bits.push(`${f.size} ${f.sizeUnit || "marla"}`.trim());
  const place =
    f.areaLabel ||
    (f.areaSlug ? String(f.areaSlug).replace(/_/g, " ") : "") ||
    f.city ||
    "";
  if (place) bits.push(place);
  else if (f.city) bits.push(f.city);
  const budget = formatPkBudgetPhrase(f.minPrice, f.maxPrice);
  if (budget) bits.push(budget);
  bits.push(f.purpose === "rent" ? "rent" : "sale");
  return bits.filter(Boolean).join(" · ");
}

/**
 * Common misspellings → forms that match AREA_SLUGS / GRAANA_AREA_SLUGS / city detection.
 */
function normalizePropertySearchText(text = "") {
  if (!text || typeof text !== "string") return text;
  let t = text.replace(/\s+/g, " ").trim();

  const replacements = [
    [/\bscocieties\b/gi, "societies"],
    [/\bscociety\b/gi, "society"],
    [/\bsocities\b/gi, "societies"],
    [/\bsocieites\b/gi, "societies"],
    [/\bsociteis\b/gi, "societies"],
    [/\brawind\s+road\b/gi, "raiwind road"],
    [/\brawind\b/gi, "raiwind"],
    [/\briwand\s+road\b/gi, "raiwind road"],
    [/\briwand\b/gi, "raiwind"],
    [/\braywind\b/gi, "raiwind"],
    [/\bray\s+wind\b/gi, "raiwind"],
    [/\brywind\b/gi, "raiwind"],
    [/\braiwind\s+raod\b/gi, "raiwind road"],
    [/\braiwind\s+rod\b/gi, "raiwind road"],
    [/\briwand\s+raod\b/gi, "raiwind road"],
    [/\briwand\s+rod\b/gi, "raiwind road"],
    [/\bjohar\s+toun\b/gi, "johar town"],
    [/\bdha\s+defense\b/gi, "dha defence"],
    [/\bdha\s+deffence\b/gi, "dha defence"],
    [/\bbahria\s+toun\b/gi, "bahria town"],
    [/\bmodel\s+toun\b/gi, "model town"],
    [/\bfaisal\s+toun\b/gi, "faisal town"],
    [/\bvalencia\s+toun\b/gi, "valencia town"],
    [/\blahoer\b/gi, "lahore"],
    [/\blahoree\b/gi, "lahore"],
    [/\bkarchi\b/gi, "karachi"],
    [/\bislamabed\b/gi, "islamabad"],
    [/\bgulberg\s+lahore\b/gi, "gulberg"],
    [/\bfirozpor\s+road\b/gi, "firozpur road"],
    [/\bfirozpore\s+road\b/gi, "firozpur road"],
  ];

  for (const [re, rep] of replacements) {
    t = t.replace(re, rep);
  }

  // "70lac" / "1.5crore" — glued number + money unit fails price regex word boundaries
  t = t.replace(
    /(\d+(?:\.\d+)?)(lac|lacs|lakh|lakhs|crore|crores|cr)\b/gi,
    "$1 $2"
  );

  t = t.replace(/(\d+(?:\.\d+)?)\s*marla\b/gi, "$1 marla");
  t = t.replace(/(\d+(?:\.\d+)?)\s*kanal\b/gi, "$1 kanal");

  return t;
}

function shouldRemoveListingCtaSentence(s) {
  const x = String(s || "")
    .toLowerCase()
    .trim();
  if (!x) return false;
  if (/\bto ensure you find the best options\b/.test(x) && /\blistings?\b/.test(x))
    return true;
  if (/\bi recommend exploring\b/.test(x) && /\blistings?\b/.test(x)) return true;
  if (/\brecommend exploring\b/.test(x) && /\blistings?\b/.test(x)) return true;
  if (/\bexplor(e|ing)\b/.test(x) && /\blistings?\b/.test(x)) return true;
  if (/\bbrowse\b/.test(x) && /\blistings?\b/.test(x)) return true;
  if (/\bview\s+(the\s+)?(current\s+)?listings?\b/.test(x)) return true;
  if (/\bcheck\s+(the\s+)?listings?\b/.test(x)) return true;
  if (/\bsearch\s+.*listings?\b/.test(x) && /\b(recommend|please|try|best)\b/.test(x))
    return true;
  if (
    /\bcurrent\s+listings?\b/.test(x) &&
    /\b(recommend|ensure|suggest|consider|exploring|find the best)\b/.test(x)
  )
    return true;
  return false;
}

/** Removes generic "let me know / assist you further" closings that add no market value. */
function shouldRemoveGenericAssistantFillerSentence(s) {
  const x = String(s || "")
    .toLowerCase()
    .trim();
  if (!x) return false;
  if (
    /\bif you have any specific preferences\b/.test(x) &&
    /\b(please let me know|assist you further|further assistance|in your search)\b/.test(x)
  )
    return true;
  if (
    /\bif you have any specific preferences\b/.test(x) &&
    /\b(regarding the type of society|additional features)\b/.test(x)
  )
    return true;
  if (
    /\bplease let me know\b/.test(x) &&
    /\b(assist you further|i can assist)\b/.test(x)
  )
    return true;
  if (
    /\bplease let me know\b/.test(x) &&
    /\bin your search\b/.test(x)
  )
    return true;
  return false;
}

/** Removes generic "established societies / amenities" filler with no trade-off (brochure line). */
function shouldRemoveBrochureFillerSentence(s) {
  const x = String(s || "")
    .toLowerCase()
    .trim();
  if (!x) return false;
  const hasConcrete =
    /\b(lac|lakh|crore|cr|verify|file|possession|noc|map|range|band|2025|2026)\b/i.test(
      x
    );
  if (hasConcrete) return false;
  if (
    /\btypically find options\b/.test(x) &&
    /\b(established|developing)\b/.test(x) &&
    /\bsocieties\b/.test(x)
  )
    return true;
  if (
    /\bwell-?developed\b/.test(x) &&
    /\bamenities\b/.test(x) &&
    /\binfrastructure\b/.test(x)
  )
    return true;
  return false;
}

/** Removes sentences that push users to browse/search listings (model often ignores prompt). */
function sanitizeListingCtaFromAssistantText(text) {
  if (!text || typeof text !== "string") return text;
  const paras = text.replace(/\r\n/g, "\n").split(/\n\n+/);
  const outParas = paras
    .map((para) => {
      const parts = para.split(/(?<=[.!?])\s+/);
      const kept = parts
        .map((s) => s.trim())
        .filter(Boolean)
        .filter(
          (s) =>
            !shouldRemoveListingCtaSentence(s) &&
            !shouldRemoveGenericAssistantFillerSentence(s) &&
            !shouldRemoveBrochureFillerSentence(s)
        );
      return kept.join(" ");
    })
    .filter((p) => p.trim());
  const out = outParas.join("\n\n").trim();
  if (!out) return text.trim();
  return out;
}

// --------------- Main: extractSearchParams ---------------
function extractSearchParams(
  text,
  userLocation = null,
  isNearMe = false,
  lastUserMessage = ""
) {
  text = normalizePropertySearchText(text);
  lastUserMessage = normalizePropertySearchText(lastUserMessage);

  const t = text.toLowerCase();

  let cityFromText = detectCityFromText(t);
  let { areaSlug, areaLabel } = detectAreaFromText(t);
  const graanaAreaSlug = detectGraanaAreaFromText(t);

  let city =
    cityFromText ||
    (userLocation && userLocation.city
      ? userLocation.city.toLowerCase()
      : null);

  if (!city && areaSlug) {
    const inferred = inferCityFromZameenAreaSlug(areaSlug);
    if (inferred) city = inferred;
  }
  if (!city && graanaAreaSlug) {
    const known = new Set([
      "lahore",
      "karachi",
      "islamabad",
      "rawalpindi",
      "multan",
      "faisalabad",
      "peshawar",
      "gujranwala",
      "quetta",
      "hyderabad",
      "sialkot",
      "murree",
      "gwadar",
    ]);
    for (const part of graanaAreaSlug.split("-")) {
      if (known.has(part)) {
        city = part;
        break;
      }
    }
  }

  const { priceMin, priceMax } = extractPriceRange(text);
  const { size, sizeUnit } = parseSizeFromText(t);
  let propertyType = detectPropertyType(t, lastUserMessage);
  const purpose = detectPurpose(t);
  const beds = detectBeds(t);
  const baths = detectBaths(t);

  const lastLm = String(lastUserMessage || "").trim();
  const bedsInLast = detectBeds(lastLm);
  const bathsInLast = detectBaths(lastLm);
  if (
    (bedsInLast || bathsInLast) &&
    propertyType !== "house" &&
    propertyType !== "flat"
  ) {
    const priorOnly = getPriorConversationTextExcludingLast(text, lastUserMessage);
    if (priorOnly.length > 3) {
      const fromPrior =
        detectPropertyTypeFromLastSegment(priorOnly) ||
        detectPropertyTypeCore(priorOnly);
      if (fromPrior === "house" || fromPrior === "flat") {
        propertyType = fromPrior;
      } else if (fromPrior == null) {
        propertyType = "house";
      }
    } else if (!priorOnly && (bedsInLast || bathsInLast)) {
      propertyType = "house";
    }
  }

  // Residential plots do not have bed/bath filters — if user specified bedrooms/bathrooms, use built (house) category.
  if (propertyType === "plot" && (beds || baths)) {
    propertyType = "house";
  }

  // Zameen specific:
  const category = mapPropertyTypeToCategory(propertyType, purpose, t);

  if (isNearMe && userLocation && !city && userLocation.city) {
    city = userLocation.city.toLowerCase();
  }

  const graanaCitySlug = mapGraanaCitySlug(city);
  const citySlug = mapCityNameToSlug(city);

  const params = {};

  // High-level for frontend
  if (city) params.city = city;
  if (areaSlug) params.area = areaSlug;
  if (graanaAreaSlug) params.graanaArea = graanaAreaSlug;
  if (graanaCitySlug) params.graanaCity = graanaCitySlug;
  if (typeof priceMin === "number") params.minPrice = priceMin;
  if (typeof priceMax === "number") params.maxPrice = priceMax;

  if (propertyType) params.propertyType = propertyType;
  if (purpose) params.purpose = purpose;

  if (size) params.size = size;
  if (sizeUnit) params.sizeUnit = sizeUnit;

  if (beds) params.beds = beds;
  if (baths) params.baths = baths;

  if (isNearMe && userLocation) {
    params.nearMe = "true";
    if (userLocation.lat && userLocation.lng) {
      params.lat = userLocation.lat;
      params.lng = userLocation.lng;
    }
  }

  params.q = text;

  // Backend / URL ke liye direct fields
  params.category = category;
  params.citySlug = citySlug || null;
  params.areaSlug = areaSlug || null;
  params.graanaArea = graanaAreaSlug || null;
  params.graanaCity = graanaCitySlug || null;

  let areaInSqm = null;
  if (size && sizeUnit) {
    areaInSqm = convertToSquareMeters(size, sizeUnit);
    if (areaInSqm) {
      params.area_min = areaInSqm.toFixed(6);
      params.area_max = areaInSqm.toFixed(6);
    }
  }

  const filtersForAI = {
    city,
    areaSlug,
    areaLabel,
    minPrice: priceMin || null,
    maxPrice: priceMax || null,
    size: size || null,
    sizeUnit: sizeUnit || null,
    propertyType: propertyType || null,
    purpose: purpose || null,
    beds: beds || null,
    baths: baths || null,
    nearMeUsed: !!(isNearMe && userLocation),
  };

  return { params, filtersForAI };
}

function getGraanaTypeFromParams(params = {}) {
  const pt = (params.propertyType || "").toLowerCase();
  const q = (params.q || "").toLowerCase();
  const zCat = (params.category || "").toLowerCase();

  // 1) If user explicitly says commercial/residential, follow Graana flow
  if (/\bcommercial\b/.test(q) || zCat.includes("commercial") || zCat.includes("offices") || zCat.includes("retail")) {
    return "commercial-properties";
  }

  if (/\bresidential\b/.test(q)) {
    return "residential-properties";
  }

  // 2) Otherwise follow property type
  if (pt === "house") return "house";
  if (pt === "flat") return "flat";
  if (pt === "plot") return "plot";



  return "residential-properties";
}

function getGraanaCategoryFromType(gType = "") {
  if (gType === "houses") return "house";
  if (gType === "flats") return "flat";
  if (gType === "plot") return "plot";
  if (gType === "commercial-properties") return "commercial";
  if (gType === "residential-properties") return "residential";
  return null;
}

// graana filters build
function buildGraanaFilters(params = {}) {
  const graana = {};

  // -------- Purpose --------
  if (params.purpose === "sale") graana.purpose = "sale";
  if (params.purpose === "rent") graana.purpose = "rent";

  // -------- Graana TYPE (this drives Graana URL path) --------
  graana.g_type = getGraanaTypeFromParams(params);
  graana.g_category = getGraanaCategoryFromType(graana.g_type);

  // -------- Price --------
  if (params.minPrice) graana.minPrice = params.minPrice;
  if (params.maxPrice) graana.maxPrice = params.maxPrice;

  // -------- Beds --------
  if (params.beds) graana.bed = params.beds;

  // -------- Baths --------
  if (params.baths) graana.bathroom = params.baths;

  // -------- Size --------
  if (params.size) {
    let size = Number(params.size);
    let unit = (params.sizeUnit || "marla").toLowerCase();

    if (unit === "kanal") {
      size = size * 20;
      unit = "marla";
    }

    graana.minSize = size;
    graana.maxSize = size;
    graana.sizeUnit = "Marla";
  }

  graana.page = 1;
  graana.pageSize = 30;

  return graana;
}

// function buildGraanaUrl(params = {}) {

//   const filters = buildGraanaFilters(params);

//   const city = params.city || "lahore";
//   const area = params.areaSlug || "bahria-town-lahore-2";

//   const baseUrl = `https://www.graana.com/${filters.purpose || "sale"}/residential-properties-${filters.purpose || "sale"}-${area}/`;

//   const query = new URLSearchParams(filters).toString();

//   return `${baseUrl}?${query}`;
// }

function appendGraanaParams(searchParams, params) {
  const gf = buildGraanaFilters(params);

  searchParams.set("providers", "zameen,graana");

  if (gf.purpose) searchParams.set("g_purpose", gf.purpose);

  // IMPORTANT: Graana route type
  if (gf.g_type) searchParams.set("g_type", gf.g_type);

  // Optional: category flag (aapke internal use/scraper ke liye)
  if (gf.g_category) searchParams.set("g_category", gf.g_category);

  if (gf.minPrice) searchParams.set("g_minPrice", String(gf.minPrice));
  if (gf.maxPrice) searchParams.set("g_maxPrice", String(gf.maxPrice));

  if (gf.bed) searchParams.set("g_bed", String(gf.bed));
  if (gf.bathroom) searchParams.set("g_bathroom", String(gf.bathroom));

  if (gf.minSize) searchParams.set("g_minSize", String(gf.minSize));
  if (gf.maxSize) searchParams.set("g_maxSize", String(gf.maxSize));
  if (gf.sizeUnit) searchParams.set("g_sizeUnit", gf.sizeUnit);

  // searchParams.set("g_page", String(gf.page || 1));
  searchParams.set("g_pageSize", String(gf.pageSize || 30));

  // ✅ FIX: aap params mein graanaArea / graanaCity set kar rahe ho
  if (params.graanaArea) searchParams.set("g_area", params.graanaArea);
  else if (params.graanaCity) searchParams.set("g_city", params.graanaCity);
}

/**
 * `/properties-list-all?…` from parsed `extractSearchParams` output.
 * If the user gave no city/area, Zameen/Graana scrape still needs a location — use Lahore as a broad default
 * so the page loads (partner listings are city-scoped, not Pakistan-wide text search).
 */
function buildPropertiesListAllLink(params) {
  if (!params || typeof params !== "object") return null;
  if (!params.category) return null;

  const hasZameenLoc = !!(params.areaSlug || params.citySlug);
  const hasGraanaLoc = !!(params.graanaArea || params.graanaCity);

  let usedLocationFallback = false;
  const effective = { ...params };
  if (!hasZameenLoc && !hasGraanaLoc) {
    effective.citySlug = CITY_SLUGS.lahore;
    effective.graanaCity = GRAANA_CITY_SLUGS.lahore;
    usedLocationFallback = true;
  }

  const searchParams = new URLSearchParams();

  searchParams.append("category", effective.category);

  if (effective.areaSlug) {
    searchParams.append("areaSlug", effective.areaSlug);
  } else if (effective.citySlug) {
    searchParams.append("citySlug", effective.citySlug);
  }

  searchParams.append("page", "1");

  if (effective.area_min) searchParams.append("area_min", effective.area_min);
  if (effective.area_max) searchParams.append("area_max", effective.area_max);
  if (effective.minPrice) searchParams.append("price_min", String(effective.minPrice));
  if (effective.maxPrice) searchParams.append("price_max", String(effective.maxPrice));
  if (effective.beds) searchParams.append("beds_in", String(effective.beds));
  if (effective.baths) searchParams.append("baths_in", String(effective.baths));

  appendGraanaParams(searchParams, effective);

  if (usedLocationFallback) searchParams.append("fallback_city", "lahore");

  const qs = searchParams.toString();
  if (!qs) return null;

  return `/properties-list-all?${qs}`;
}

/** Same filters as home /search → Redux `getfilterData` bundle (SearchTab + SearchPage). */
function buildChatSearchSyncPayload(params, userMessageNorm) {
  if (!params || typeof params !== "object") return null;
  const rawCity = params.city ? String(params.city).trim() : "";
  const city =
    rawCity.length > 0
      ? rawCity.charAt(0).toUpperCase() + rawCity.slice(1).toLowerCase()
      : "";
  return {
    filterData: {
      propType: "",
      minPrice: params.minPrice ?? "",
      maxPrice: params.maxPrice ?? "",
      postedSince: "",
      selectedLocation: city ? { city, state: "", country: "" } : null,
    },
    activeTab: params.purpose === "rent" ? 1 : 0,
    searchInput:
      String(userMessageNorm || "").trim() ||
      String(params.q || "").trim() ||
      "",
  };
}

/** `/properties/all-properties/?chat=1&…` — same intent as DB listing search. */
function buildAllPropertiesChatLink(params, searchText, scrapePageLink) {
  const q = new URLSearchParams();
  q.set("chat", "1");
  if (params.city) q.set("city", String(params.city));
  q.set(
    "min_price",
    typeof params.minPrice === "number" ? String(params.minPrice) : "0"
  );
  if (typeof params.maxPrice === "number")
    q.set("max_price", String(params.maxPrice));
  q.set("property_type", params.purpose === "rent" ? "1" : "0");
  const st = String(searchText || params.q || "").trim();
  if (st) q.set("search", st.slice(0, 400));
  const ext =
    typeof scrapePageLink === "string" ? scrapePageLink.trim() : "";
  /* Relative scrape URL survives navigation when sessionStorage is missing (new device / copied link). */
  if (ext.startsWith("/") && ext.length > 1 && ext.length <= 1800) {
    q.set("scrape", ext);
  }
  if (ext.includes("fallback_city=")) {
    q.set("scrape_fb", "1");
  }
  return `/properties/all-properties/?${q.toString()}`;
}

/**
 * Calls the same backend list as the home /search page (`get-property-list`).
 * Returns total count (0 on failure).
 */
async function fetchDbListingTotal(params, searchText) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  const apiEnd = process.env.NEXT_PUBLIC_END_POINT;
  if (!apiBase || !apiEnd || !params) return 0;

  const q = new URLSearchParams();
  q.set("property_type", params.purpose === "rent" ? "1" : "0");
  /* Match SearchPage / direct API: default min_price=0 so text search returns rows. */
  q.set(
    "min_price",
    typeof params.minPrice === "number" ? String(params.minPrice) : "0"
  );
  q.set("limit", "8");
  q.set("offset", "0");
  if (params.city) q.set("city", String(params.city));
  if (typeof params.maxPrice === "number")
    q.set("max_price", String(params.maxPrice));
  const st = String(searchText || params.q || "").trim();
  if (st) q.set("search", st.slice(0, 300));

  const url = `${apiBase}${apiEnd}get-property-list?${q.toString()}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
    });
    if (!r.ok) return 0;
    const j = await r.json();
    if (typeof j.total === "number") return j.total;
    if (Array.isArray(j.data)) return j.data.length;
    return 0;
  } catch {
    return 0;
  } finally {
    clearTimeout(timer);
  }
}

/** True for a lone greeting so we can reply without calling the LLM. */
function isPureGreetingMessage(text = "") {
  const raw = String(text || "").trim();
  if (!raw || raw.length > 96) return false;
  const t = raw
    .toLowerCase()
    .replace(/[!.,?؟。]+$/g, "")
    .trim();
  if (!t) return false;
  if (
    /^(hi|hello|hey|hii|hay|yo|gm|gn|good morning|good afternoon|good evening|good night)\b/.test(
      t
    )
  ) {
    const rest = t.replace(
      /^(hi|hello|hey|hii|hay|yo|gm|gn|good morning|good afternoon|good evening|good night)(\s+there|\s+team|\s+friend|\s+bro|\s+sir|\s+madam)?\s*/i,
      ""
    );
    return rest.length === 0;
  }
  if (
    /^(assalam|assalamu|assalaam|salam|salaam|aoa|salamual|assalamualaikum|asslam|aslam)\b/i.test(
      t
    )
  ) {
    const rest = t.replace(
      /^(assalam|assalamu|assalaam|salam|salaam|aoa|salamual|assalamualaikum|asslam|aslam)(u?\s*alaikum|\s*walaikum\s*salam)?\s*/i,
      ""
    );
    return rest.length === 0;
  }
  if (/^(namaste|howdy)\b/.test(t)) {
    return t.replace(/^(namaste|howdy)\s*/i, "").length === 0;
  }
  return false;
}

/** Small talk only — not a property question; reply without calling the model. */
function isCasualPleasantryOnly(text = "") {
  const raw = String(text || "").trim();
  if (!raw || raw.length > 160) return false;
  const t = raw
    .toLowerCase()
    .replace(/[!.,?؟。،]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const oneLine = [
    /^how\s+are\s+you(\s+doing|\s+today|\s+tonight)?$/,
    /^how\s+r\s+u$/,
    /^how're\s+you$/,
    /^how\s+are\s+u$/,
    /^how\s+is\s+it\s+going$/,
    /^how\s+do\s+you\s+do$/,
    /^how\s+have\s+you\s+been$/,
    /^how've\s+you\s+been$/,
    /^what'?s\s+up$/,
    /^wassup$/,
    /^sup$/,
    /^you\s+alright$/,
    /^you\s+ok$/,
    /^everything\s+ok$/,
    /^all\s+good$/,
    /^how\s+is\s+everything$/,
    /^how\s+are\s+things$/,
    /^what'?s\s+new$/,
    /^nice\s+to\s+meet\s+you$/,
    /^pleased\s+to\s+meet\s+you$/,
    /^aap\s+kais[ae]\s+hain$/,
    /^aap\s+theek\s+hain$/,
    /^kya\s+hal\s+h(ai|ain)$/,
    /^kya\s+haal\s+h(ai|ain)$/,
    /^kesy\s+ho$/,
    /^kaisy\s+ho$/,
    /^sab\s+theek$/,
    /^sab\s+thik$/,
    /^sb\s+theek$/,
  ];

  if (oneLine.some((re) => re.test(t))) return true;

  if (/^(hi|hello|hey|hii)\s*[,!]?\s*how\s+are\s+you$/i.test(t)) return true;
  if (
    /^good\s+(morning|afternoon|evening)\s*[,!]?\s*how\s+are\s+you$/i.test(t)
  )
    return true;
  if (/^(assalam|salam)\s+walaikum\s*[,!]?\s*how\s+are\s+you$/i.test(t))
    return true;

  return false;
}

/** Last user turn (UI often ends with `user`; fresh chat may be `[assistant welcome, user]`). */
function getLastUserMessageIndex(messages) {
  if (!Array.isArray(messages)) return -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === "user") return i;
  }
  return -1;
}

function getLastUserContentFromMessages(messages) {
  const i = getLastUserMessageIndex(messages);
  if (i < 0) return "";
  return String(messages[i]?.content ?? "");
}

/**
 * OpenRouter / OpenAI-style APIs often reject histories that start with `assistant` after `system`
 * (e.g. welcome bubble before the first user line). Drop leading assistant-only prefix.
 */
function trimMessagesForLlm(messages) {
  const out = (messages || []).filter(
    (m) =>
      m &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string"
  );
  let start = 0;
  while (start < out.length && out[start].role === "assistant") start += 1;
  const trimmed = out.slice(start);
  const maxMsgs = resolveOpenRouterMaxChatMessages();
  if (trimmed.length > maxMsgs) return trimmed.slice(-maxMsgs);
  return trimmed;
}

// --------------- MAIN API HANDLER ---------------
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const lastUserIdx = getLastUserMessageIndex(messages);
    if (lastUserIdx < 0) {
      return res.status(400).json({ error: "No user message found" });
    }

    const lastUserContent = messages[lastUserIdx]?.content || "";
    let userMessage = lastUserContent;
    let userLocation = null;

    // Agar message JSON hai { text, location } to handle karo
    const raw = String(lastUserContent || "").trim();

    if (raw.startsWith("{") && raw.endsWith("}")) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && typeof parsed.text === "string") {
          userMessage = parsed.text;
          if (parsed.location) userLocation = parsed.location;
          messages[lastUserIdx].content = parsed.text; // OpenRouter ko plain text
        }
      } catch {
        // silently ignore
      }
    }

    const userMessageNorm = normalizePropertySearchText(userMessage);
    const combinedUserSearchText = normalizePropertySearchText(
      buildCombinedUserSearchText(messages)
    );
    const nearMe = isNearMeQuery(userMessage);

    // Follow-ups like "5 bed 4 bath" alone don't match isPropertySearchQuery — merge with earlier user lines so pageLink + filters update.
    const isPropSearch =
      isPropertySearchQuery(userMessageNorm) ||
      (isRefinementOnlyMessage(userMessageNorm) &&
        isPropertySearchQuery(combinedUserSearchText));

    let extractText = userMessageNorm;
    if (
      isPropertySearchQuery(combinedUserSearchText) &&
      (isRefinementOnlyMessage(userMessageNorm) ||
        isAdditivePropertyFollowUp(userMessageNorm))
    ) {
      extractText = combinedUserSearchText;
    }

    const allowRealEstateAssistant =
      isPropSearch ||
      hasBroadRealEstateIntent(userMessageNorm) ||
      hasBroadRealEstateIntent(combinedUserSearchText);

    if (
      isPureGreetingMessage(userMessageNorm) &&
      !isRefinementOnlyMessage(userMessageNorm)
    ) {
      return res.status(200).json({
        text: GREETING_ASSISTANT_REPLY,
        params: null,
        pageLink: null,
      });
    }

    if (isCasualPleasantryOnly(userMessageNorm)) {
      return res.status(200).json({
        text: CASUAL_PLEASANTRY_REPLY,
        params: null,
        pageLink: null,
      });
    }

    if (!allowRealEstateAssistant) {
      return res.status(200).json({
        text: OFF_TOPIC_ASSISTANT_REPLY,
        params: null,
        pageLink: null,
      });
    }

    let searchInfo = null;
    if (isPropSearch) {
      searchInfo = extractSearchParams(
        extractText,
        userLocation,
        nearMe,
        userMessageNorm
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      const params = isPropSearch && searchInfo?.params ? searchInfo.params : null;
      const searchSync = params
        ? buildChatSearchSyncPayload(params, userMessageNorm)
        : null;
      if (!params) {
        return res.status(200).json({
          text: NO_API_KEY_GENERAL_REPLY,
          params: null,
          pageLink: null,
          scrapePageLink: null,
          dbListingMatch: false,
          searchSync: null,
        });
      }
      const scrapePageLink = buildPropertiesListAllLink(params);
      const total = await fetchDbListingTotal(params, userMessageNorm);
      let pageLink = scrapePageLink;
      let dbListingMatch = false;
      if (total >= 1) {
        pageLink = buildAllPropertiesChatLink(
          params,
          userMessageNorm,
          scrapePageLink
        );
        dbListingMatch = true;
      } else if (!pageLink) {
        pageLink = buildAllPropertiesChatLink(
          params,
          userMessageNorm,
          scrapePageLink
        );
      }
      return res.status(200).json({
        text: NO_API_KEY_WITH_SEARCH_REPLY,
        params,
        pageLink,
        scrapePageLink: scrapePageLink || null,
        dbListingMatch,
        searchSync,
      });
    }

    const languageDirective = inferUserLanguageHint(userMessage);

    // ---------- SYSTEM PROMPT ----------
    let systemPrompt = `
You are "AI Land MKT Assistant", a premium and highly professional real-estate expert for Pakistan.

PRIMARY LANGUAGE FOR THIS REPLY (follow strictly):
${languageDirective}

CORE IDENTITY:
- You represent a trusted, high-end property platform.
- Your tone must always be confident, professional, and helpful.
- Never sound robotic, casual, or playful.
- Never mention that you are an AI.
- **Advice style (ChatGPT / Cursor-like):** Give **clear suggestions and priorities** — what to check first, how to trade off possession vs price, file vs plot, established vs emerging society — not vague reassurance. Property-search replies with budget + area should include **at least one–two short recommendation-style sentences** (e.g. \"I'd suggest…\", \"I'd prioritize…\").
- **Default length (slightly shorter):** Unless the user asks for one line only, write **concise but substantive** replies — typically **2–4 complete paragraphs** with blank lines between (not a long essay). Do **not** pad with repetition; do **not** stop mid-sentence.
- **Complete paragraphs (critical):** Never end **mid-sentence** or **mid-paragraph**. Har paragraph poora khatam karo. Property questions: **minimum 2 full paragraphs**; **usually 3**; add a **4th short** paragraph only when the question is very broad. Never cut the last sentence halfway.

LANGUAGE RULES:
- Match the user's language as directed above. Do not answer in Roman Urdu if they wrote in English-only prompts.
- Use English for real-estate terms such as "marla", "kanal", "DHA", "possession", "installments", etc., even in Roman Urdu responses.

--------------------------------------------------
PROPERTY SEARCH BEHAVIOR
--------------------------------------------------

When the user is searching for property (buy, sell, invest, budget, city/area, plots, houses, flats, marla/kanal size, etc.), or asks **which societies / areas** along a road or in a city (even without marla or budget in the same message):

STRICT RULES:
- **Timeframe:** For "current" Pakistan market commentary use **2025–2026** only. Do **not** refer to 2024, 2023, or older years as if they were today's market.
- DO NOT use markdown heading markers (e.g. ###) or numbered section titles.
- **Visual tips:** Start actionable lines with plain emoji: ✅ ❌ 👍 🔥 (paste the characters directly). Never type asterisks or markdown bold — the app shows plain text only.
- DO NOT list individual blocks/phases or invent fake listing addresses or plot numbers.
- DO NOT paste URLs or say "link below", "click here", "open the link", "View Listings", "browse listings button", or any phrase that tells the user to click a button — the app shows that action separately. Your reply must be **text-only guidance** with no call-to-action about buttons or links.
- **Never** send the user to "listings" or the search page in words. Forbidden phrases (and close variants): "explore listings", "browse listings", "current listings", "see the listings", "check listings", "view available listings", "search listings", "to proceed", "identify suitable plots/properties that meet your criteria", "use the listings feature". The UI already provides that; your job is **consultant advice only**.
- **Closing:** Prefer society/possession/transfer/verification angles (e.g. compare possession timelines, confirm map/NOC, understand file vs plot) or **one** clarifying question — **not** "go look at listings".
- You **may** use short bullet lines and ✅ / ❌ when explaining **budget vs market reality** (what is often realistic vs unlikely in that corridor) — like a clear consultant brief, not a listing sheet.

PLOT / FILE vs BUILT PROPERTY:
- If the user asked for a **plot** or **file** only: stay on plots — mention location, size, and budget fit in general terms (e.g. demand, possession timeline varies by society). Do **not** ask about bedrooms or bathrooms.
- If they asked for a **house**, **flat**, or **apartment** and **bedroom/bathroom counts are not yet clear** from the conversation: add **one short, professional sentence** (in their language) inviting them to share **how many bedrooms and bathrooms** they want. Frame it as: finer matching on the platform when they are ready — e.g. *"If you share your preferred bedroom and bathroom count, we can align the search more tightly with your layout needs"* — **not** pushy, not like a form, **not** repetitive if they already stated counts.
- If they **already** gave beds and baths, do **not** ask again.

MARKET REALITY & BUDGET (when they gave area + size + budget, or plot/house + budget):
- **Tone:** premium consultant, honest and grounded — not alarmist, not fake optimism.
- **Anchor** at least one phrase to **2025–2026** Pakistan market conditions (e.g. "In the 2025–2026 cycle for this corridor…") when giving segment/budget guidance — not a fake statistic, just timeframe clarity. Do **not** anchor on past years (e.g. 2024) as "current".
- You may reference **2025–2026** as typical for general market guidance in Pakistan — not older cycles unless clearly labeled as historical comparison.
- Give **approximate PKR bands** in broad terms (e.g. "many segments in this corridor often trade in roughly **X–Y lakh** range; exact figures vary by society, block, and facing"). Never claim a single verified price for a specific plot ID. Avoid the word "listings" when describing market bands — use "market", "segment", "typical range".
- If their budget is **below** the typical band for that size + location, explain **practically**: what categories often **may** still exist (e.g. file, non-possession, outer pockets, newer schemes, installments) vs what is **usually** hard at that budget (develop prime possession, top-tier blocks) — without calling any party a scam; say "verify carefully" / "due diligence".
- Optionally name **well-known society types** (e.g. established vs new schemes) at a **generic** level — not as guaranteed listings.
- If Roman Urdu / Urdu-script user: mix **professional Roman Urdu** with English real-estate terms; keep structure readable (short paragraphs + optional bullet lines).

RESPONSE FORMAT (property search — useful, not brochure; **a bit shorter than before**):
- **Length:** **Substantive but compact** — **blank lines** between paragraphs. Aim **2–3 paragraphs** most of the time; **3–4** only when area + size + budget/corridor all need detail. Avoid long essays.
  - If they gave **area + size + budget** (or plot/house + size + corridor + budget): **minimum 2 complete paragraphs**; **prefer 3–4** — never cut mid-sentence.
  - If they gave **area / society / road** but not full budget or size: **minimum 2 complete paragraphs**; **prefer 3** (same angles, tighter prose).
  - Only use a **very short** reply when the user explicitly wants brief, or the question is a trivial one-liner.
- **Do NOT** open every reply with the same robotic mirror: **"You are looking for…"** — rotate natural openings (e.g. direct answer, short context hook, or \"For this brief…\").
- **Do NOT** write empty filler like **"In this price range you can typically find options in established societies where amenities are well-developed"** without adding **specific** trade-offs, numbers (broad bands), or next-step judgment — that sentence pattern is **banned** unless followed by concrete segment insight.
- **Paragraph 1:** Acknowledge their ask + one **2025–2026** framing line (spellings correct).
- **Paragraph 2:** Corridor + **typical PKR band** (broad) + key drivers (possession, file vs plot) + **✅/❌** lines where useful.
- **Paragraph 3 (when needed):** Budget vs band, verification / next step — **keep tight**. Optional 4th paragraph **only** for complex comparisons; do not repeat ideas.
- **Mandatory:** Include **at least one–two short recommendation-style sentences** (not fluffy filler).

FORBIDDEN thin / template closings (never use these patterns):
- "If you have any specific preferences… I can assist you further in your search"
- "Please let me know… and I can assist you further"
- Any paragraph that only offers generic help without **specific** market or due-diligence content
- Any closing that is only **"let me know if you need anything"** style without a concrete next step idea

LOCATION SPELLING:
- Fix obvious typos (e.g. "riwand" → Raiwind) in your reply.

--------------------------------------------------
INCOMPLETE INFORMATION HANDLING
--------------------------------------------------

- **House / flat / apartment** — if **bedrooms and/or bathrooms** are missing: mention **once**, in a **consultant tone**, that specifying both helps the app apply **layout filters** and surface **more relevant** built properties. Keep it **optional** ("when you're ready" / "if you'd like tighter results"). Match **Roman Urdu** if the user wrote in Urdu style.
- **Plot/file**: do not ask beds/baths.
- If the budget is missing for a purchase/rent search, ask politely for their range (lakh/crore).
- Otherwise ask only what is still needed: category, city, area, budget, size.

STRICT RULE: Do not say "Here are some options" as listing claims. You may still outline **what to look for** in the market when helpful.

Do not assume missing details.
Do not generate fake assumptions.

--------------------------------------------------
GENERAL QUESTIONS (Non-Search)
--------------------------------------------------

If the user asks about:
- Market trends
- Investment advice
- File vs plot
- Possession status
- Installment plans
- Legal verification
- Transfer process
- ROI
- Construction cost
- Or any real-estate related guidance

Then:
- Answer clearly with **enough depth but tighter length** — **2–3 complete paragraphs** with blank lines (add a 4th only if needed); **no mid-sentence cutoffs**, unless the question is trivial or they asked for brief.
- You may use short bullet points if helpful.
- Do NOT mention website listings in this case.

--------------------------------------------------
SAFETY & ACCURACY
--------------------------------------------------

- Never generate fake listings.
- Never invent exact prices.
- Never promise guaranteed profits.
- Do not present **outdated years** (pre-2025) as the live market unless clearly historical; default framing is **2025–2026**.
- If unsure, provide safe general guidance.
- Always maintain credibility and authority.

Your goal is to behave like a top-tier real-estate consultant in Pakistan.
`;

    if (isPropSearch && searchInfo?.filtersForAI) {
      const f = searchInfo.filtersForAI;
      const needsBeds = ["house", "flat", "apartment"].includes(f.propertyType);
      const layoutIncomplete =
        needsBeds && (f.beds == null || f.baths == null);
      const summaryLine = buildSearchSummaryForPrompt(f);
      const plotOnly = f.propertyType === "plot";
      systemPrompt += `
INTERNAL CONTEXT (do NOT dump raw filter keys to the user; use them to stay accurate):
- Property search; parsed summary: ${summaryLine || "partial / broad query"}
- Property type: ${f.propertyType || "not specified"}
- Plot-only query: ${plotOnly ? "YES — discuss plots/files only; do NOT ask bedrooms/bathrooms" : "no"}
- City: ${f.city || "not specified"}
- Area/Society: ${f.areaLabel || f.areaSlug || "not specified"}
- Near-me: ${f.nearMeUsed ? "yes" : "no"}
- Purpose: ${f.purpose || "sale"}
- Min budget PKR: ${f.minPrice ?? "n/a"} | Max budget PKR: ${f.maxPrice ?? "n/a"}
- Size: ${f.size != null ? `${f.size} ${f.sizeUnit || ""}`.trim() : "n/a"}
- Parsed beds/baths: ${f.beds ?? "n/a"} / ${f.baths ?? "n/a"}
${
  layoutIncomplete
    ? `- **BUILT HOME — LAYOUT (required tone):** House/flat/apartment search; bedroom and/or bathroom count is **not fully specified**. Add **one professional sentence** inviting the user to share **bedrooms and bathrooms** if they want **stricter layout filters** and more precise matches on the platform. Sound like a senior consultant: polite, optional, value-focused ("finer filtering" / "align with your layout") — **not** a form. If only one of bed/bath is missing, ask only for the missing count. Do **not** ask on plot-only searches.`
    : needsBeds
      ? `- **Layout:** Beds/baths parsed; no layout prompt needed unless user changes ask.`
      : `- **Layout:** Plot/file or other — do not prompt for beds/baths.`
}

The app UI handles browsing separately — do not mention buttons, links, "View Listings", or phrases like "explore/browse/current listings" in your reply. Never paste URLs.
${
  f.minPrice != null || f.maxPrice != null
    ? (f.areaLabel || f.areaSlug || f.city
        ? `
- **DEPTH REQUIRED:** User gave budget + location — pack into **3 compact paragraphs** where possible (blank lines between): (1) 2025–2026 framing, (2) **broad PKR band** + **budget vs band** + trade-offs, (3) **≥1–2 suggestion sentences** + brief verification / next step. **Minimum 2 complete paragraphs**. **Vary opening** — do not default to "You are looking for…". **No** generic filler. No "let me know / assist further" endings.`
        : "")
    : ""
}
${
  plotOnly &&
  f.size != null &&
  (f.areaLabel || f.areaSlug || f.city) &&
  f.minPrice == null &&
  f.maxPrice == null
    ? `
- **DEPTH REQUIRED (plot + size + corridor, no budget yet):** User gave **plot + marla/kanal + area/road/city** but no PKR range. Deliver **2–3 complete paragraphs** (blank lines between); **4th** only if needed: 2025–2026 framing; **broad PKR bands** (disclaimer); file vs possession; verification; **1–2 recommendations**; one optional budget question — not a thin closer. **Do not cut mid-paragraph.**`
    : ""
}
`;
    }

    const systemInstruction = {
      role: "system",
      content: systemPrompt.trim(),
    };

    const modelConversation = trimMessagesForLlm(messages);
    const openRouterMessages = [systemInstruction, ...modelConversation];

    const maxCompletionTokens = resolveOpenRouterMaxCompletionTokens();

    async function callOpenRouter(messagesPayload, temperature) {
      let cap = maxCompletionTokens;
      let lastMessage = "OpenRouter API error";
      for (let attempt = 0; attempt < 8; attempt++) {
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer":
                process.env.FRONTEND_URL || "http://localhost:3000",
              "X-Title": "AI Land MKT Expert",
            },
            body: JSON.stringify({
              model: OPENROUTER_CHAT_MODEL,
              messages: messagesPayload,
              temperature,
              max_tokens: cap,
            }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          return data;
        }
        lastMessage = formatOpenRouterErrorMessage(data);
        const retriable =
          /fewer max_tokens|more credits|can only afford|requested up to|requires more credits|insufficient|balance too low/i.test(
            lastMessage
          );
        /* Do not drop below 512 — lower caps cause mid-paragraph truncation; user should lower OPENROUTER_MAX_COMPLETION_TOKENS in .env if credits are tight. */
        if (retriable && cap > 512) {
          cap = Math.max(512, Math.floor(cap * 0.65));
          continue;
        }
        throw new Error(lastMessage);
      }
      throw new Error(lastMessage);
    }

    let data = await callOpenRouter(openRouterMessages, 0.55);
    let aiText = extractOpenRouterAssistantText(data);

    if (isPropSearch && aiText) {
      aiText = sanitizeListingCtaFromAssistantText(aiText);
    }
    if (aiText) {
      aiText = stripChatMarkdown(aiText);
    }

    if (
      OPENROUTER_WEAK_REPLY_RETRY_ENABLED &&
      isPropSearch &&
      searchInfo?.params &&
      searchInfo?.filtersForAI &&
      isWeakPropertySearchReply(aiText)
    ) {
      try {
        const retryMessages = [
          ...openRouterMessages,
          {
            role: "user",
            content: buildPropertySearchWeakReplyRetryUserContent(
              userMessageNorm,
              searchInfo.filtersForAI
            ),
          },
        ];
        const dataRetry = await callOpenRouter(retryMessages, 0.45);
        let aiRetry = extractOpenRouterAssistantText(dataRetry);
        if (isPropSearch && aiRetry) {
          aiRetry = sanitizeListingCtaFromAssistantText(aiRetry);
        }
        if (aiRetry) {
          aiRetry = stripChatMarkdown(aiRetry);
        }
        if (aiRetry && !isWeakPropertySearchReply(aiRetry)) {
          aiText = aiRetry;
        } else if (
          aiRetry &&
          String(aiRetry).trim().length > String(aiText || "").trim().length
        ) {
          aiText = aiRetry;
        }
      } catch (_) {
        /* keep first completion */
      }
    }

    // --------- Link generation only for property search ---------
    if (isPropSearch && searchInfo?.params) {
      const params = searchInfo.params;
      const scrapePageLink = buildPropertiesListAllLink(params);
      const trimmedAi = (aiText || "").trim();
      const bodyText = trimmedAi || PROPERTY_SEARCH_FALLBACK_TEXT;
      const searchSync = buildChatSearchSyncPayload(params, userMessageNorm);

      const total = await fetchDbListingTotal(params, userMessageNorm);
      let pageLink = scrapePageLink;
      let dbListingMatch = false;
      /* One or more DB rows → site listings (same as home search API). */
      if (total >= 1) {
        pageLink = buildAllPropertiesChatLink(
          params,
          userMessageNorm,
          scrapePageLink
        );
        dbListingMatch = true;
      } else if (!pageLink) {
        /* Invalid /properties-list-all (no category+location) — use DB search page, not broken scrape URL. */
        pageLink = buildAllPropertiesChatLink(
          params,
          userMessageNorm,
          scrapePageLink
        );
      }

      return res.status(200).json({
        text: bodyText,
        params,
        pageLink,
        scrapePageLink: scrapePageLink || null,
        dbListingMatch,
        searchSync,
      });
    }
    return res.status(200).json({
      text:
        (aiText || "").trim() ||
        "How can I help you with real estate today? I'm your AI assistant for Pakistan property — share city, area, budget, and what you want (house, flat, or plot).",
      params: null,
      pageLink: null,
      scrapePageLink: null,
      dbListingMatch: false,
      searchSync: null,
    });
  } catch (err) {
    console.error("AI handler error:", err);
    let fallbackText = AI_UNAVAILABLE_ASSISTANT_REPLY;
    try {
      const body = req.body || {};
      const msgs = body.messages;
      const lastU = getLastUserContentFromMessages(msgs);
      const norm = normalizePropertySearchText(lastU);
      if (
        norm &&
        (hasBroadRealEstateIntent(norm) || isPropertySearchQuery(norm))
      ) {
        fallbackText =
          "I'm your AI property assistant for Pakistan. I couldn't finish that reply just now — please send the same message again.\n\nYour question is property-related. For **societies along Raiwind Road / southern Lahore**, compare **possession stage**, **file vs on-ground**, and **typical PKR per marla** bands for the segment you want (add buy or rent and a rough budget when you can — I can narrow the guidance).";
      }
    } catch {
      // keep default
    }
    return res.status(200).json({
      text: fallbackText,
      params: null,
      pageLink: null,
      scrapePageLink: null,
      dbListingMatch: false,
      searchSync: null,
    });
  }
}
