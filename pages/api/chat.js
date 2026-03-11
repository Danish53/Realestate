
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
function detectPropertyType(text = "") {
  const t = text.toLowerCase();
  if (/\b(plot|plots|file)\b/.test(t)) return "plot";
  if (/\b(house|home|villa|portion)\b/.test(t)) return "house";
  if (/\b(flat|flats|apartment|apartments)\b/.test(t)) return "flat";
  if (/\b(shop|office|commercial)\b/.test(t)) return "commercial";
  return null;
}

function detectPurpose(text = "") {
  const t = text.toLowerCase();
  if (/\b(rent|rental|on rent|for rent)\b/.test(t)) return "rent";
  if (/\b(buy|purchase|for sale|sale|sell|investment|invest)\b/.test(t))
    return "sale";
  return "sale";
}

function detectBeds(text = "") {
  const m = text
    .toLowerCase()
    .match(/(\d+)\s*(bed|beds|bedroom|bedrooms|br)\b/i);
  return m ? parseInt(m[1], 10) : null;
}

function detectBaths(text = "") {
  const m = text
    .toLowerCase()
    .match(/(\d+)\s*(bath|baths|bathroom|bathrooms)\b/i);
  return m ? parseInt(m[1], 10) : null;
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

// --------------- Helper: Price range (simple numbers) ---------------
function extractPriceRange(message) {
  const text = message.toLowerCase().replace(/,/g, "");

  // Helper to convert lakh/crore to numbers
  const parseAmount = (num, unit) => {
    let val = parseFloat(num);
    if (unit.includes("lakh") || unit.includes("lac")) return val * 100000;
    if (unit.includes("crore") || unit.includes("cr")) return val * 10000000;
    return val;
  };

  let priceMin = null;
  let priceMax = null;

  // Regex for "under 50 lakh", "below 1 crore", etc.
  const underMatch = text.match(/(under|below|less than|upto)\s+(\d+(\.\d+)?)\s*(lakh|lac|crore|cr)?/);
  if (underMatch) {
    priceMax = parseAmount(underMatch[2], underMatch[4] || "");
  }

  // Range: "between 50 lakh and 1 crore"
  const betweenMatch = text.match(/between\s+(\d+(\.\d+)?)\s*(lakh|lac|crore|cr)?\s+(and|-)\s+(\d+(\.\d+)?)\s*(lakh|lac|crore|cr)?/);
  if (betweenMatch) {
    priceMin = parseAmount(betweenMatch[1], betweenMatch[3] || betweenMatch[7] || "");
    priceMax = parseAmount(betweenMatch[5], betweenMatch[7] || "");
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
  for (const name of Object.keys(CITY_SLUGS)) {
    if (t.includes(name)) return name; // e.g. "lahore"
  }
  return null;
}

function detectAreaFromText(text = "") {
  const t = text.toLowerCase();

  for (const [key, slug] of Object.entries(AREA_SLUGS)) {
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
  for (const [key, slug] of Object.entries(GRAANA_AREA_SLUGS)) {
    if (t.includes(key)) return slug;
  }
  return null;
}

function mapGraanaCitySlug(cityName) {
  if (!cityName) return null;
  return GRAANA_CITY_SLUGS[cityName.toLowerCase()] || null;
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
if (t === "plot") {
  if (/\bcommercial\s+plots?\b/.test(txt)) return "Commercial_Plots";
  return "Residential_Plots";
}

  // --- 2. Houses / Flats ---
  if (t === "house" || t === "home" || t === "villa" || t === "portion") return "Houses";
  if (t === "flat" || t === "apartment" || t === "flats") return "Flats";

  // --- 3. Office / Shop / Commercial detection ---
  if (/\b(office|offices)\b/.test(txt)) return "Offices";
  if (/\b(shop|shops)\b/.test(txt)) return "Retail_Shops";
  if (/\b(commercial)\b/.test(txt)) return "Commercial_Plots";

  // --- 4. Purpose fallback ---
  if (p === "commercial") return "Commercial_Plots";
  if (p === "residential" || p === "sale") return "Residential_Plots";

  return "Homes"; // final fallback
}

// --------------- Query classification ---------------
function isPropertySearchQuery(text = "") {
  const t = text.toLowerCase();
  return (
    /\b(plot|plots|file|house|home|villa|portion|flat|flats|apartment|apartments|shop|office|commercial)\b/.test(
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

// --------------- Main: extractSearchParams ---------------
function extractSearchParams(text, userLocation = null, isNearMe = false) {
  const t = text.toLowerCase();

  let cityFromText = detectCityFromText(t);
  let { areaSlug, areaLabel } = detectAreaFromText(t);

  let city =
    cityFromText ||
    (userLocation && userLocation.city
      ? userLocation.city.toLowerCase()
      : null);

        // --- ADD THIS (Graana slugs) ---
  const graanaAreaSlug = detectGraanaAreaFromText(t);
  const graanaCitySlug = mapGraanaCitySlug(city);

  const { priceMin, priceMax } = extractPriceRange(t);
  const { size, sizeUnit } = parseSizeFromText(t);
  const propertyType = detectPropertyType(t);
  const purpose = detectPurpose(t);
  const beds = detectBeds(t);
  const baths = detectBaths(t);

  // Zameen specific:
  const category = mapPropertyTypeToCategory(propertyType, purpose, t);
  const citySlug = mapCityNameToSlug(city); // e.g. "Lahore-1"

  const params = {};

  // High-level for frontend
  if (city) params.city = city; // "lahore"
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
    if (!city && userLocation.city) {
      params.city = userLocation.city.toLowerCase();
    }
  }

  params.q = text;

  // Backend / URL ke liye direct fields
  params.category = category; // e.g. Residential_Plots
  params.citySlug = citySlug; // e.g. Lahore-1
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
    try {
      const parsed = JSON.parse(lastUserContent);
      if (parsed && typeof parsed === "object" && parsed.text) {
        userMessage = parsed.text;
        if (parsed.location) {
          userLocation = parsed.location;
        }
        messages[lastIndex].content = parsed.text;
      }
    } catch (e) {
      console.error("Failed to parse user message as JSON:", e);
    }

    const isPropSearch = isPropertySearchQuery(userMessage);
    const nearMe = isNearMeQuery(userMessage);

    let searchInfo = null;
    if (isPropSearch) {
      searchInfo = extractSearchParams(userMessage, userLocation, nearMe);
    }

    // ---------- SYSTEM PROMPT ----------
    let systemPrompt = `
You are "AI Land MKT Assistant", a premium and highly professional real-estate expert for Pakistan.

CORE IDENTITY:
- You represent a trusted, high-end property platform.
- Your tone must always be confident, professional, and helpful.
- Never sound robotic, casual, or playful.
- Never mention that you are an AI.

LANGUAGE RULES:
- If the user writes in Urdu/Hindi (Roman Urdu included), respond in Urdu/Hindi.
- Otherwise, respond in clear professional English.
- Keep answers concise and well-structured.
- Use English for real-estate terms such as "marla", "kanal", "DHA", "possession", "installments", etc., even in Urdu responses.

--------------------------------------------------
PROPERTY SEARCH BEHAVIOR
--------------------------------------------------

When the user is searching for property (buy, sell, invest, under budget, in city/area, plots, houses, etc.):

STRICT RULES:
- DO NOT use bullet points, numbering, dashes, or headings.
- DO NOT list phases, blocks, or societies individually.
- DO NOT write markdown formatting like "###".
- DO NOT say "Here are some options" or "Here is a list".
- DO NOT provide fabricated or estimated prices per phase/block.
- DO NOT create fake listings.

RESPONSE FORMAT:
- Reply in ONE short paragraph only.
- Maximum 2 sentences.
- No manual line breaks.
- Speak generally about what type of properties are usually available in that area and budget.
- Assume the website will show live listings separately.
- Keep it polished and premium sounding.

SPELLING CORRECTION:
- If the user misspells a location (e.g., "riwand" instead of "Raiwind"), automatically detect the correct spelling.
- Start the response with:
  "I understand you are looking for properties in [Correct Spelling]..."
- Always use the correct spelling in the response.

--------------------------------------------------
INCOMPLETE INFORMATION HANDLING
--------------------------------------------------

- If the user is looking for a "House", "Flat", or "Apartment" but HAS NOT mentioned the number of bedrooms or bathrooms, you MUST include this exact question in your response: 
  "Would you like to specify the number of bedrooms (beds_in) and bathrooms (baths_in) to narrow down your search?"
- If the budget is missing, ask for their budget range (price_min to price_max).
- For all other cases, professionally ask for: Property category, City, Area, Budget, and Size.

STRICT RULE: Do not say "Here are some options". Keep the response as a professional overview + the missing info question.

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
- If unsure, provide safe general guidance.
- Always maintain credibility and authority.

Your goal is to behave like a top-tier real-estate consultant in Pakistan.
`;

    if (isPropSearch && searchInfo?.filtersForAI) {
      const f = searchInfo.filtersForAI;
      const needsBeds = ["house", "flat", "apartment"].includes(f.propertyType);
      systemPrompt += `
INTERNAL CONTEXT (do NOT repeat this text to the user):
- This is a PROPERTY SEARCH query.
- Approx filters:
- Property: ${f.propertyType}
- Missing Beds/Baths: ${needsBeds ? "YES" : "NO"}
- Instruction: If Missing Beds is YES, you MUST ask the user: "Would you like to specify the number of bedrooms (beds_in) and bathrooms (baths_in) to narrow down your search?"
  - City: ${f.city || "not specified"}
  - Area/Society: ${f.areaLabel || f.areaSlug || "not specified"}
  - Near-me based: ${f.nearMeUsed ? "yes" : "no"}
  - Purpose: ${f.purpose || "sale (default)"}
  - Property type: ${f.propertyType || "any"}
  - Min budget (PKR): ${f.minPrice || "not specified"}
  - Max budget (PKR): ${f.maxPrice || "not specified"}
  - Size: ${f.size ? `${f.size} ${f.sizeUnit || ""}`.trim() : "not specified"
        }
  - Bedrooms: ${f.beds || "not specified"}
  - Bathrooms: ${f.baths || "not specified"}

Use this only to understand intent better; do not expose as filter text.
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
          temperature: 0.2,
          max_tokens: 160,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || "OpenRouter API error");
    }

    let aiText = data.choices?.[0]?.message?.content || "";

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
      console.log("Generated page link:", pageLink);

      const finalResponse = pageLink && !aiText.includes("link below")
        ? `${aiText}\n\nYou can open the link below to see all matching listings.`
        : aiText;

      return res.status(200).json({
        text: finalResponse,
        params: pageLink ? params : null,
        pageLink: pageLink || null,
      });
    }
  } catch (err) {
    console.error("AI handler error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}

