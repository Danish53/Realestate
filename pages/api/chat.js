import { stripChatMarkdown } from "@/utils/stripChatMarkdown";

// pages/api/chat.js
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
function isPropertySearchQuery(text = "") {
  const t = text.toLowerCase();
  return (
    /\b(plot|plots|file|house|homes|home|villa|villas|portion|houses|bungalow|bungalows|flat|flats|apartment|apartments|shop|office|commercial)\b/.test(
      t
    ) ||
    /\bmarla|kanal|sq ft|square feet|sq yd|rent|sale|buy|purchase|invest\b/.test(
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
    return "User wrote in Urdu/Arabic script — reply in polished Roman Urdu (professional), with English real-estate terms where natural.";
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
    /\b(plot|plots|house|flat|road|block|phase|dha|bahria|society)\b|\d+\s*marla|marla|kanal/i.test(
      lower
    ) && /\b(in|under|around|near|for|sale|rent|lac|lakh|crore|pk)\b/i.test(lower);

  if (romanUrdu) {
    return "User wrote in Roman Urdu — reply in professional Roman Urdu with **depth** (2–4 paragraphs when area/size/budget given): **2025–2026** context, **broad PKR band**, **budget vs reality**, plus **2–3 clear suggestions** (priorities / trade-offs / what to verify). No empty hospitality closings.";
  }
  if (englishLean || compactEnglishProperty) {
    return "User wrote in English — reply like **ChatGPT/Cursor product advice**: fluent, **opinionated**, **actionable**. Use **2–4 paragraphs** (blank lines between) when they gave area/size/budget: (1) acknowledge ask without robotic \"You are looking for…\" every time — vary the opening; (2) **2025–2026** market framing + **broad PKR range** for that corridor; (3) **budget fit** + ✅/❌ or clear trade-offs; (4) **2–3 concrete suggestions** (e.g. \"I'd prioritize…\", \"If budget is tight, lean toward…\", \"Verify first:…\"). Never end with generic \"let me know / assist you further\" filler.";
  }
  return "Mirror the user's language (English vs Roman Urdu); default to English if unclear.";
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

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "OPENROUTER_API_KEY is not configured" });
    }

    const lastIndex = messages.length - 1;
    const lastUserContent = messages[lastIndex]?.content || "";
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
          messages[lastIndex].content = parsed.text; // OpenRouter ko plain text
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

    let searchInfo = null;
    if (isPropSearch) {
      searchInfo = extractSearchParams(
        extractText,
        userLocation,
        nearMe,
        userMessageNorm
      );
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
- **Advice style (ChatGPT / Cursor-like):** Give **clear suggestions and priorities** — what to check first, how to trade off possession vs price, file vs plot, established vs emerging society — not vague reassurance. Every property-search reply with budget + area should include **at least two explicit recommendation-style sentences** (could start with \"I'd suggest…\", \"In your situation I'd prioritize…\", \"A practical path is…\").

LANGUAGE RULES:
- Match the user's language as directed above. Do not answer in Roman Urdu if they wrote in English-only prompts.
- Use English for real-estate terms such as "marla", "kanal", "DHA", "possession", "installments", etc., even in Roman Urdu responses.

--------------------------------------------------
PROPERTY SEARCH BEHAVIOR
--------------------------------------------------

When the user is searching for property (buy, sell, invest, budget, city/area, plots, houses, flats, marla/kanal size, etc.):

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

RESPONSE FORMAT (property search — ChatGPT/Cursor-level usefulness, not brochure text):
- When the user gave **area + size + budget** (or plot/house + size + corridor + budget): write **at least 3 paragraphs** (each separated by a **blank line**). Shorter replies are only OK when the query is vague or missing key numbers.
- **Do NOT** open every reply with the same robotic mirror: **"You are looking for…"** — rotate natural openings (e.g. direct answer, short context hook, or \"For this brief…\").
- **Do NOT** write empty filler like **"In this price range you can typically find options in established societies where amenities are well-developed"** without adding **specific** trade-offs, numbers (broad bands), or next-step judgment — that sentence pattern is **banned** unless followed by concrete segment insight.
- **Paragraph 1:** Acknowledge their ask (type, size, area, budget) with correct spellings + one **2025–2026** framing line.
- **Paragraph 2 (segment):** Corridor dynamics + **typical PKR band** for that size (broad range, disclaimer) + what usually drives price (possession, block, file vs plot).
- **Paragraph 3 (budget + judgment):** Honest **budget vs band** fit + short lines starting with **✅ / ❌ / 👍 / 🔥** where useful (no `*` markdown) + **2–3 explicit suggestions** (priorities, alternatives, verification order).
- **Mandatory:** Include **at least two sentences** that read as **recommendations** (suggestion / priority / \"if… then…\"), not just description.

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
- Answer clearly and professionally.
- You may use short bullet points if helpful.
- Keep it informative but concise.
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
- **DEPTH REQUIRED:** User gave budget + location — you MUST deliver: (1) 2025–2026 framing, (2) **broad PKR band** for that size in that corridor, (3) **budget vs band** + trade-offs, (4) **≥2 explicit suggestion sentences** (priorities / if-then / verify-first). Minimum **3 paragraphs**, blank lines between. **Vary opening** — do not default to "You are looking for…". **No** generic "amenities well-developed" filler paragraphs. No "let me know / assist further" endings.`
        : "")
    : ""
}
`;
    }

    const systemInstruction = {
      role: "system",
      content: systemPrompt.trim(),
    };

    const openRouterMessages = [systemInstruction, ...messages];

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
          model: "openai/gpt-4o-mini",
          messages: openRouterMessages,
          temperature: 0.45,
          max_tokens: 900,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || "OpenRouter API error");
    }

    // let aiText = data.choices?.[0]?.message?.content || "";
    const msg = data?.choices?.[0]?.message;
    let aiText = "";

    if (typeof msg?.content === "string") {
      aiText = msg.content;
    } else if (Array.isArray(msg?.content)) {
      aiText = msg.content.map((part) => part?.text || "").join("");
    }

    if (isPropSearch && aiText) {
      aiText = sanitizeListingCtaFromAssistantText(aiText);
    }
    if (aiText) {
      aiText = stripChatMarkdown(aiText);
    }

    // --------- Link generation only for property search ---------
    let params = null;
    let pageLink = null;
    let linkMessage = "";

    if (isPropSearch && searchInfo?.params) {
      params = searchInfo.params;

      const searchParams = new URLSearchParams();

      // Zameen-compatible params for /properties-list-all → /api/searchscrape
      if (params.category) {
        searchParams.append("category", params.category); // e.g. Residential_Plots
      }

      if (params.areaSlug) {
        searchParams.append("areaSlug", params.areaSlug); // e.g. Lahore_Johar_Town-93
      } else if (params.citySlug) {
        searchParams.append("citySlug", params.citySlug); // e.g. Lahore-1
      }

      // Default page = 1
      searchParams.append("page", "1");

      // Optional filters (hamari apni filtering ke liye)
      if (params.area_min)
        searchParams.append("area_min", params.area_min);

      if (params.area_max)
        searchParams.append("area_max", params.area_max);
      if (params.minPrice)
        searchParams.append("price_min", String(params.minPrice));
      if (params.maxPrice)
        searchParams.append("price_max", String(params.maxPrice));
      if (params.beds) searchParams.append("beds_in", String(params.beds));
      if (params.baths) searchParams.append("baths_in", String(params.baths));

      appendGraanaParams(searchParams, params);

      pageLink = `/properties-list-all?${searchParams.toString()}`;

      return res.status(200).json({
        text: (aiText || "").trim(),
        params: pageLink ? params : null,
        pageLink: pageLink || null,
      });
    }
    return res.status(200).json({
      text: aiText || "How can I help you with real estate today?",
      params: null,
      pageLink: null,
    });
  } catch (err) {
    console.error("AI handler error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}

