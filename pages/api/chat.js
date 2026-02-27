// // pages/api/chat.js
// import { google } from '@ai-sdk/google';
// import { streamText } from 'ai';

// export const config = {
//   runtime: 'edge', // Gemini streaming ke liye edge runtime zarori hai
// };

// export default async function handler(req) {
//   if (req.method !== 'POST') {
//     return new Response('Method not allowed', { status: 405 });
//   }

//   const { messages } = await req.json();

//   const result = await streamText({
//     model: google('gemini-1.5-flash'), // Gemini ka fast aur sasta model
//     messages,
//   });

//   return result.toDataStreamResponse();
// }


// import { GoogleGenerativeAI } from "@google/generative-ai";

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const { messages } = req.body;

//     const genAI = new GoogleGenerativeAI(
//       process.env.GOOGLE_GENERATIVE_AI_API_KEY
//     );

//     // ✅ guaranteed working model
//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.0-flash"
//     });

//     const lastUserMsg =
//       messages[messages.length - 1]?.content || "hello";

//     const result = await model.generateContent(lastUserMsg);

//     const text = result.response.text();

//     res.status(200).json({ text });

//   } catch (err) {
//     console.error("Gemini error:", err);
//     res.status(500).json({ error: err.message });
//   }
// }


// import { GoogleGenerativeAI } from "@google/generative-ai";

// export default async function handler(req, res) {
//   if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

//   try {
//     const { messages } = req.body;
//     const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

//     // AI ko Expert banane ke liye instructions
// const model = genAI.getGenerativeModel({
//       model: "gemini-embedding-1.0", 
//       systemInstruction: `
//         You are a highly professional Real Estate Expert named 'AI Land MKT Assistant'. 
//         Your primary goal is to assist users with buying, selling, and investing in real estate property.

//         Strict Rules:
//         1. Only answer questions related to Real Estate and Property.
//         2. If a user asks an unrelated question (e.g., about food, sports, general knowledge), politely decline and state that you are specifically a real estate advisor.
//         3. Provide expert guidance on market trends, Return on Investment (ROI), and popular locations (such as DHA, Bahria Town, Gulberg, etc.).
//         4. Maintain a polite, professional, and helpful tone at all times.
//         5. Proactively ask users about their budget and preferred location to provide better recommendations.
//         6. If the user's language is Roman Urdu/Hindi, respond in a natural, professional Roman Urdu/Hindi mix to stay helpful.
//       `,
//     });
//     // History format karna taake AI purani baatein yaad rakhe
//     const chat = model.startChat({
//       history: messages.slice(0, -1).map(m => ({
//         role: m.role === 'user' ? 'user' : 'model',
//         parts: [{ text: m.content }],
//       })),
//     });

//     const lastUserMsg = messages[messages.length - 1]?.content || "Hello";

//     // Response generate karein
//     const result = await chat.sendMessage(lastUserMsg);
//     const text = result.response.text();

//     res.status(200).json({ text });

//   } catch (err) {
//     console.error("Gemini error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// }



// export default async function handler(req, res) {
//   if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

//   try {
//     const { messages } = req.body;
//     const apiKey = process.env.OPENROUTER_API_KEY; // .env mein ye key lagayen

//     // System Instruction jo aapne di thi
//     const systemInstruction = {
//       role: "system",
//       content: `You are a highly professional Real Estate Expert named 'AI Land MKT Assistant'. 
//         Your primary goal is to assist users with buying, selling, and investing in real estate property in Pakistan.
//         Strict Rules:
//         1. Only answer questions related to Real Estate and Property.
//         2. If a user asks an unrelated question, politely decline and state you are a real estate advisor.
//         3. Provide expert guidance on market trends, ROI, and locations like DHA, Bahria, Gulberg.
//         4. Maintain a polite, professional tone.
//         5. Ask about budget and preferred location.
//         6. If the user uses Roman Urdu/Hindi, respond in the same natural mix.`
//     };

//     // Messages array mein system instruction add karna
//     const formattedMessages = [systemInstruction, ...messages];

//     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${apiKey}`,
//         "Content-Type": "application/json",
//         "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:3000",
//         "X-Title": "AI Land MKT Web",
//       },
//       body: JSON.stringify({
//         model: "deepseek/deepseek-chat", // OpenRouter par Gemini Flash ka model name
//         messages: formattedMessages,
//         temperature: 0.6 
//       })
//     });

//     const data = await response.json();

//     if (data.error) {
//       throw new Error(data.error.message || "OpenRouter Error");
//     }

//     const text = data.choices[0].message.content;
//     res.status(200).json({ text });

//   } catch (err) {
//     console.error("OpenRouter error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// }


// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const { messages } = req.body;
//     const apiKey = process.env.OPENROUTER_API_KEY;

//     // Extract location from last message if present
//     const lastUserMsg = messages[messages.length - 1]?.content || "";
//     let userMessage = lastUserMsg;
//     let userLocation = null;

//     // Check if message contains location data
//     try {
//       const parsedMsg = JSON.parse(lastUserMsg);
//       if (parsedMsg.location) {
//         userLocation = parsedMsg.location;
//         userMessage = parsedMsg.text; // Actual message text
//       }
//     } catch (e) {
//       // Not JSON, normal message
//     }

//           function isStrictPropertyQuery(text = "") {
//       // Strict checking - only if clearly asking for property
//       const propertyKeywords = [
//         'want', 'need', 'looking for', 'show me', 'properties',
//         'plot', 'house', 'flat', 'kanal', 'marla', 'land', "price", "budget", "for sale", "available in", "options in", "dikhhao", "dikhao", "mujhe", "chahiye", "hai koi", "kya hai", "kya available hai", "near me", "in lahore", "in islamabad", "in karachi", "dha", "gulberg", "bahria", "emaar", "f-7", "f-8", "g-9"
//       ];

//       const t = text.toLowerCase();
//       return propertyKeywords.some(keyword => t.includes(keyword));
//     }

//     // ------------------ NEAR ME DETECTOR ------------------
//     function isNearMeQuery(text = "") {
//       const t = text.toLowerCase();
//       return t.includes("near me") || t.includes("around me") || t.includes("close to me");
//     }

//     // ------------------ LOCATION BASED SEARCH ------------------
//     function handleNearMeQuery(text, location) {
//       if (isNearMeQuery(text) && location) {
//         // If we have user location, use it
//         if (location.lat && location.lng) {
//           return {
//             type: "nearby",
//             lat: location.lat,
//             lng: location.lng,
//             city: location.city || "your area"
//           };
//         } 
//         // If we only have city from IP
//         else if (location.city) {
//           return {
//             type: "city",
//             city: location.city
//           };
//         }
//       }
//       return null;
//     }

//     // ------------------ AREA & CITY DETECTOR (enhanced) ------------------
//     function detectAreaAndCity(text = "", userLoc = null) {
//       const t = text.toLowerCase();

//       // First check if user mentioned specific area
//       const areas = {
//         gulberg: { area: "gulberg", city: "lahore" },
//         dha: { area: "dha", city: "lahore" },
//         bahria: { area: "bahria-town", city: "lahore" },
//         emaar: { area: "emaar", city: "islamabad" }
//       };

//       for (const [key, value] of Object.entries(areas)) {
//         if (t.includes(key)) return value;
//       }

//       // If "near me" and we have location
//       if (isNearMeQuery(t) && userLoc) {
//         if (userLoc.city) {
//           return { area: "nearby", city: userLoc.city };
//         }
//         return { area: "nearby", city: "your location" };
//       }

//       return { area: null, city: null };
//     }

//     // Check for near me query
//     const nearMeInfo = handleNearMeQuery(userMessage, userLocation);

//     // Add location context to system prompt if needed
//     let locationContext = "";
//     if (nearMeInfo) {
//       if (nearMeInfo.type === "nearby") {
//         locationContext = `User is looking for properties near coordinates: ${nearMeInfo.lat}, ${nearMeInfo.lng}. Prioritize nearby listings.`;
//       } else if (nearMeInfo.type === "city") {
//         locationContext = `User is looking for properties in ${nearMeInfo.city}.`;
//       }
//     }

//     // ------------------ SYSTEM PROMPT (with location context) ------------------
//     const systemInstruction = {
//       role: "system",
//       content: `
// You are "AI Land MKT Assistant", a premium Real Estate Expert in Pakistan.
// ${locationContext ? `\nCONTEXT: ${locationContext}` : ''}

// RULES:
// - Answer naturally in short professional English
// - If user asks "near me" and we have location, suggest nearby properties
// - Max 3 lines answer
// - Keep responses conversational and helpful
// `
//     };

//     // ------------------ MODEL CALL ------------------
//     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${apiKey}`,
//         "Content-Type": "application/json",
//         "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:3000",
//         "X-Title": "AI Land MKT Expert",
//       },
//       body: JSON.stringify({
//         model: "openai/gpt-4o-mini",
//         messages: [systemInstruction, ...messages],
//         temperature: 0.3,
//         max_tokens: 150
//       })
//     });

//     const data = await response.json();
//     if (data.error) throw new Error(data.error.message);

//     const aiText = data.choices[0].message.content;

//     // ------------------ SMART LINK GENERATION (with location) ------------------
//     let params = null;
//     let pageLink = null;
//     let linkMessage = "";

//     // Check if it's a property query (including near me)
//     if (isStrictPropertyQuery(userMessage) || isNearMeQuery(userMessage)) {
//       const { area, city } = detectAreaAndCity(userMessage, userLocation);

//       // For near me queries, add coordinates to params
//       if (isNearMeQuery(userMessage) && userLocation) {
//         params = {
//           nearMe: true
//         };

//         if (userLocation.lat && userLocation.lng) {
//           params.lat = userLocation.lat;
//           params.lng = userLocation.lng;
//         }

//         if (userLocation.city) {
//           params.city = userLocation.city;
//         }

//         pageLink = `/properties-list-all?${new URLSearchParams(params).toString()}`;
//         linkMessage = `\n\nClick the link below to view properties near you:`;
//       }
//       // Regular property query with area
//       else if (area || city) {
//         params = {};
//         if (area) params.area = area;
//         if (city) params.city = city;

//         pageLink = `/properties-list-all?${new URLSearchParams(params).toString()}`;
//         linkMessage = `\n\nClick the link below to view ${city || area} properties:`;
//       }
//     }

//     // Return response
//     res.status(200).json({ 
//       text: pageLink ? aiText + linkMessage : aiText,
//       params, 
//       pageLink 
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }


// pages/api/chat.js

// const CITY_LIST = [
//   "lahore",
//   "karachi",
//   "islamabad",
//   "rawalpindi",
//   "multan",
//   "peshawar",
//   "quetta",
//   "gujranwala",
//   "faisalabad",
//   "sialkot",
//   "bahawalpur",
//   "sargodha",
//   "gujrat",
//   "sheikhupura",
//   "sahiwal",
//   "abbottabad",
//   "hyderabad",
//   "sukkur",
//   "mirpur",
//   "muzaffarabad",
// ];

// const AREA_MAP = {
//   "bahria town karachi": "bahria-town-karachi",
//   "bahria town lahore": "bahria-town",
//   "bahria town": "bahria-town",
//   "bahria enclave": "bahria-enclave",
//   "dha phase 1": "dha-phase-1",
//   "dha phase 2": "dha-phase-2",
//   "dha phase 3": "dha-phase-3",
//   "dha phase 4": "dha-phase-4",
//   "dha phase 5": "dha-phase-5",
//   "dha phase 6": "dha-phase-6",
//   "dha phase 7": "dha-phase-7",
//   "dha phase 8": "dha-phase-8",
//   "dha defence": "dha",
//   "dha lahore": "dha",
//   "dha karachi": "dha-karachi",
//   "dha islamabad": "dha-islamabad",
//   "dha": "dha",
//   "gulberg lahore": "gulberg",
//   "gulberg": "gulberg",
//   "wapda town": "wapda-town",
//   "model town": "model-town",
//   "paragon city": "paragon-city",
// };

// const AREA_KEYS = Object.keys(AREA_MAP).sort((a, b) => b.length - a.length);

// function isNearMeQuery(text = "") {
//   const t = text.toLowerCase();
//   return (
//     t.includes("near me") ||
//     t.includes("around me") ||
//     t.includes("close to me") ||
//     t.includes("nearby")
//   );
// }

// function isPropertySearchQuery(text = "") {
//   const t = text.toLowerCase();

//   const propertyWords = [
//     "plot",
//     "plots",
//     "house",
//     "home",
//     "villa",
//     "flat",
//     "flats",
//     "apartment",
//     "apartments",
//     "shop",
//     "office",
//     "commercial",
//     "residential",
//     "file",
//     "portion",
//     "farmhouse",
//     "penthouse",
//     "room",
//     "studio",
//     "property",
//     "properties",
//     "real estate",
//     "marla",
//     "kanal",
//   ];

//   const actionWords = [
//     "buy",
//     "purchase",
//     "need",
//     "want",
//     "looking for",
//     "search",
//     "find",
//     "show me",
//     "list",
//     "lists",
//     "options",
//     "for sale",
//     "for rent",
//     "rent",
//     "investment",
//     "invest",
//     "available",
//     "price",
//     "budget",
//     "under",
//     "below",
//     "upto",
//     "up to",
//   ];

//   const locationWords = [
//     "lahore",
//     "karachi",
//     "islamabad",
//     "rawalpindi",
//     "dha",
//     "bahria",
//     "gulberg",
//     "town",
//     "society",
//     "phase",
//     "sector",
//     "block",
//     "near me",
//     "around me",
//     "close to me",
//   ];

//   const hasProperty = propertyWords.some((w) => t.includes(w));
//   const hasAction = actionWords.some((w) => t.includes(w));
//   const hasLocation = locationWords.some((w) => t.includes(w));

//   if (hasProperty && (hasAction || hasLocation)) return true;
//   if (hasLocation && hasAction) return true;

//   if (
//     t.includes("list of properties") ||
//     t.includes("properties in") ||
//     t.includes("plots in") ||
//     t.includes("houses in")
//   ) {
//     return true;
//   }

//   return false;
// }

// function detectCityFromText(text = "") {
//   const t = text.toLowerCase();
//   for (const city of CITY_LIST) {
//     if (t.includes(city)) return city;
//   }
//   return null;
// }

// function detectAreaFromText(text = "") {
//   const t = text.toLowerCase();
//   for (const key of AREA_KEYS) {
//     if (t.includes(key)) {
//       return {
//         areaSlug: AREA_MAP[key],
//         areaLabel: key,
//       };
//     }
//   }
//   return { areaSlug: null, areaLabel: null };
// }

// function toPKR(num, unitRaw) {
//   const unit = unitRaw.toLowerCase();
//   if (["crore", "cr", "crores"].includes(unit)) return num * 10000000;
//   if (["lac", "lakh", "lacs", "lakhs"].includes(unit)) return num * 100000;
//   if (["million", "m"].includes(unit)) return num * 1000000;
//   return num;
// }

// function parseBudgetFromText(text = "") {
//   const t = text.toLowerCase();
//   let minPrice = null;
//   let maxPrice = null;

//   const rangeRegex =
//     /(\d+(\.\d+)?)\s*(crore|cr|crores|lac|lakh|lacs|lakhs|million|m)\s*(to|-|–|and)\s*(\d+(\.\d+)?)\s*(crore|cr|crores|lac|lakh|lacs|lakhs|million|m)/i;
//   const rangeMatch = t.match(rangeRegex);
//   if (rangeMatch) {
//     const num1 = parseFloat(rangeMatch[1]);
//     const unit1 = rangeMatch[3];
//     const num2 = parseFloat(rangeMatch[5]);
//     const unit2 = rangeMatch[7];

//     const p1 = toPKR(num1, unit1);
//     const p2 = toPKR(num2, unit2);

//     minPrice = Math.min(p1, p2);
//     maxPrice = Math.max(p1, p2);
//     return { minPrice, maxPrice };
//   }

//   const upperRegex =
//     /(under|below|upto|up to|less than|maximum|max)\s+(\d+(\.\d+)?)\s*(crore|cr|crores|lac|lakh|lacs|lakhs|million|m)\b/i;
//   const upperMatch = t.match(upperRegex);
//   if (upperMatch) {
//     const num = parseFloat(upperMatch[2]);
//     const unit = upperMatch[4];
//     maxPrice = toPKR(num, unit);
//     return { minPrice, maxPrice };
//   }

//   const lowerRegex =
//     /(above|more than|min|minimim|minimum|at least|starting from|from)\s+(\d+(\.\d+)?)\s*(crore|cr|crores|lac|lakh|lacs|lakhs|million|m)\b/i;
//   const lowerMatch = t.match(lowerRegex);
//   if (lowerMatch) {
//     const num = parseFloat(lowerMatch[2]);
//     const unit = lowerMatch[4];
//     minPrice = toPKR(num, unit);
//     return { minPrice, maxPrice };
//   }

//   const budgetRegex =
//     /(budget|around|approx(imate)?ly|approx)\s+(\d+(\.\d+)?)\s*(crore|cr|crores|lac|lakh|lacs|lakhs|million|m)\b/i;
//   const budgetMatch = t.match(budgetRegex);
//   if (budgetMatch) {
//     const num = parseFloat(budgetMatch[4]);
//     const unit = budgetMatch[6];
//     maxPrice = toPKR(num, unit);
//     return { minPrice, maxPrice };
//   }

//   const singleRegex =
//     /(\d+(\.\d+)?)\s*(crore|cr|crores|lac|lakh|lacs|lakhs|million|m)\b/i;
//   const singleMatch = t.match(singleRegex);
//   if (singleMatch) {
//     const num = parseFloat(singleMatch[1]);
//     const unit = singleMatch[3];
//     maxPrice = toPKR(num, unit);
//     return { minPrice, maxPrice };
//   }

//   return { minPrice, maxPrice };
// }

// working

// function parseSizeFromText(text = "") {
//   const sizeRegex =
//     /(\d+(\.\d+)?)\s*(marla|kanal|sq ?ft|square feet|sq ?yd|square yards?|sq ?y?d?s?|square meter|sq ?m|acre|acres)\b/i;
//   const m = text.toLowerCase().match(sizeRegex);
//   if (!m) return { size: null, sizeUnit: null };

//   const num = parseFloat(m[1]);
//   let unitRaw = m[3].toLowerCase();
//   let unit = unitRaw;

//   if (unitRaw.includes("marla")) unit = "marla";
//   else if (unitRaw.includes("kanal")) unit = "kanal";
//   else if (unitRaw.includes("sq m") || unitRaw.includes("square meter"))
//     unit = "sqm";
//   else if (unitRaw.includes("sq ft") || unitRaw.includes("square feet"))
//     unit = "sqft";
//   else if (unitRaw.includes("sq yd") || unitRaw.includes("square yard"))
//     unit = "sqyd";
//   else if (unitRaw.startsWith("acre")) unit = "acre";

//   return { size: num, sizeUnit: unit };
// }

// function detectPropertyType(text = "") {
//   const t = text.toLowerCase();
//   if (/\b(plot|plots|file)\b/.test(t)) return "plot";
//   if (/\b(house|home|villa|portion)\b/.test(t)) return "house";
//   if (/\b(flat|flats|apartment|apartments)\b/.test(t)) return "flat";
//   if (/\b(shop|office|commercial)\b/.test(t)) return "commercial";
//   return null;
// }

// function detectPurpose(text = "") {
//   const t = text.toLowerCase();
//   if (/\b(rent|rental|on rent|for rent)\b/.test(t)) return "rent";
//   if (/\b(buy|purchase|for sale|sale|sell|investment|invest)\b/.test(t))
//     return "sale";
//   return "sale";
// }

// function detectBeds(text = "") {
//   const m = text.toLowerCase().match(/(\d+)\s*(bed|beds|bedroom|bedrooms|br)\b/i);
//   return m ? parseInt(m[1], 10) : null;
// }

// function detectBaths(text = "") {
//   const m = text
//     .toLowerCase()
//     .match(/(\d+)\s*(bath|baths|bathroom|bathrooms)\b/i);
//   return m ? parseInt(m[1], 10) : null;
// }

// function extractPriceRange(message) {
//   const text = message.toLowerCase().replace(/,/g, "");

//   let priceMin = null;
//   let priceMax = null;

//   // Under / below / less than
//   const underMatch = text.match(/(under|below|less than)\s+(\d+)/);
//   if (underMatch) {
//     priceMax = parseInt(underMatch[2]);
//   }

//   // Above / greater than
//   const aboveMatch = text.match(/(above|more than|greater than)\s+(\d+)/);
//   if (aboveMatch) {
//     priceMin = parseInt(aboveMatch[2]);
//   }

//   // Between X and Y
//   const betweenMatch = text.match(/between\s+(\d+)\s+(and|-)\s+(\d+)/);
//   if (betweenMatch) {
//     priceMin = parseInt(betweenMatch[1]);
//     priceMax = parseInt(betweenMatch[3]);
//   }

//   return { priceMin, priceMax };
// }

// function extractSearchParams(text, userLocation = null, isNearMe = false) {
//   const t = text.toLowerCase();

//   let cityFromText = detectCityFromText(t);
//   let { areaSlug, areaLabel } = detectAreaFromText(t);

//   let city =
//     cityFromText ||
//     (userLocation && userLocation.city
//       ? userLocation.city.toLowerCase()
//       : null);

//   // const { minPrice, maxPrice } = parseBudgetFromText(t);
//   const { priceMin, priceMax } = extractPriceRange(t);
//   const { size, sizeUnit } = parseSizeFromText(t);
//   const propertyType = detectPropertyType(t);
//   const purpose = detectPurpose(t);
//   const beds = detectBeds(t);
//   const baths = detectBaths(t);

//   const params = {};

//   if (city) params.city = city;
//   if (areaSlug) params.area = areaSlug;

//   if (typeof priceMin === "number") params.minPrice = priceMin;
//   if (typeof priceMax === "number") params.maxPrice = priceMax;

//   if (propertyType) params.propertyType = propertyType;
//   if (purpose) params.purpose = purpose;

//   if (size) params.size = size;
//   if (sizeUnit) params.sizeUnit = sizeUnit;

//   if (beds) params.beds = beds;
//   if (baths) params.baths = baths;

//   if (isNearMe && userLocation) {
//     params.nearMe = "true";
//     if (userLocation.lat && userLocation.lng) {
//       params.lat = userLocation.lat;
//       params.lng = userLocation.lng;
//     }
//     if (!city && userLocation.city) {
//       params.city = userLocation.city.toLowerCase();
//     }
//   }

//   params.q = text;

//   const filtersForAI = {
//     city,
//     areaSlug,
//     areaLabel,
//     minPrice: priceMin || null,
//     maxPrice: priceMax || null,
//     size: size || null,
//     sizeUnit: sizeUnit || null,
//     propertyType: propertyType || null,
//     purpose: purpose || null,
//     beds: beds || null,
//     baths: baths || null,
//     nearMeUsed: !!(isNearMe && userLocation),
//   };

//   return { params, filtersForAI };
// }

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const { messages } = req.body || {};
//     if (!Array.isArray(messages) || messages.length === 0) {
//       return res.status(400).json({ error: "Messages array is required" });
//     }

//     const apiKey = process.env.OPENROUTER_API_KEY;
//     if (!apiKey) {
//       return res
//         .status(500)
//         .json({ error: "OPENROUTER_API_KEY is not configured" });
//     }

//     const lastIndex = messages.length - 1;
//     const lastUserContent = messages[lastIndex]?.content || "";
//     let userMessage = lastUserContent;
//     let userLocation = null;

//     try {
//       const parsed = JSON.parse(lastUserContent);
//       if (parsed && typeof parsed === "object" && parsed.text) {
//         userMessage = parsed.text;
//         if (parsed.location) {
//           userLocation = parsed.location;
//         }
//         messages[lastIndex].content = parsed.text;
//       }
//     } catch {
//       // plain text
//     }

//     const isPropertySearch = isPropertySearchQuery(userMessage);
//     const nearMe = isNearMeQuery(userMessage);

//     let searchInfo = null;
//     if (isPropertySearch) {
//       searchInfo = extractSearchParams(userMessage, userLocation, nearMe);
//     }

//     // ---------- SYSTEM PROMPT (STRONG RULES) ----------
//     let systemPrompt = `
// You are "AI Land MKT Assistant", a premium real-estate expert for Pakistan.

// GENERAL STYLE:
// - Respond in clear, short, professional English.
// - Be conversational and helpful.
// - Keep answers concise.

// WHEN THE USER IS SEARCHING FOR PROPERTIES (list, options, under X budget, in some city/area):
// - Treat it as a PROPERTY SEARCH query.
// - You MUST NOT:
//   - List individual options, phases, blocks, or societies as a numbered/bullet list.
//   - Use headings, markdown titles, "1.", "2.", "-", "•", or "###".
//   - Start with phrases like "Here are some options" or "Here is a list".
//   - Give made-up or approximate price ranges for each phase/area.
// - Instead:
//   - Reply with ONE short paragraph only, maximum 2 sentences, no manual line breaks.
//   - Speak generally about what kind of properties are typically available in that area and within that budget.
//   - You may say things like "you can find different houses and plots in DHA Karachi within this budget" without listing them.
//   - Assume the detailed, live listings will be shown on the website via a link/button.

// WHEN IT IS A NORMAL QUESTION (not property search):
// - Answer normally and helpfully.
// - You may use short lists or bullets if useful.
// - Do NOT mention any property listings link in this case.
// `;

//     if (isPropertySearch && searchInfo?.filtersForAI) {
//       const f = searchInfo.filtersForAI;
//       systemPrompt += `
// INTERNAL CONTEXT (do NOT repeat this text to the user):
// - This is a PROPERTY SEARCH query.
// - Approx filters:
//   - City: ${f.city || "not specified"}
//   - Area/Society: ${f.areaLabel || f.areaSlug || "not specified"}
//   - Near-me based: ${f.nearMeUsed ? "yes" : "no"}
//   - Purpose: ${f.purpose || "sale (default)"}
//   - Property type: ${f.propertyType || "any"}
//   - Min budget (PKR): ${f.minPrice || "not specified"}
//   - Max budget (PKR): ${f.maxPrice || "not specified"}
//   - Size: ${f.size ? `${f.size} ${f.sizeUnit || ""}`.trim() : "not specified"
//         }
//   - Bedrooms: ${f.beds || "not specified"}
//   - Bathrooms: ${f.baths || "not specified"}

// Use this only to understand intent better; do not expose as filter text.
// `;
//     }

//     const systemInstruction = {
//       role: "system",
//       content: systemPrompt.trim(),
//     };

//     const openRouterMessages = [systemInstruction, ...messages];

//     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${apiKey}`,
//         "Content-Type": "application/json",
//         "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:3000",
//         "X-Title": "AI Land MKT Expert",
//       },
//       body: JSON.stringify({
//         model: "openai/gpt-4o-mini",
//         messages: openRouterMessages,
//         temperature: 0.2,
//         max_tokens: 160,
//       }),
//     });

//     const data = await response.json();
//     if (!response.ok) {
//       throw new Error(data?.error?.message || "OpenRouter API error");
//     }

//     let aiText = data.choices?.[0]?.message?.content || "";

//     // --------- Link generation only for property search ---------
//     let params = null;
//     let pageLink = null;
//     let linkMessage = "";

//     if (isPropertySearch && searchInfo?.params) {
//       params = searchInfo.params;

//       // const searchParams = new URLSearchParams();
//       // for (const [key, value] of Object.entries(params)) {
//       //   if (
//       //     value !== undefined &&
//       //     value !== null &&
//       //     value !== "" &&
//       //     value !== false
//       //   ) {
//       //     searchParams.append(key, String(value));
//       //   }
//       // }

//       const searchParams = new URLSearchParams();

//       // Top-level values
//       if (params.city) {
//         searchParams.append("city", params.city);
//       }

//       // 👉 Default category = "Homes"
//       const category = params.category && params.category.trim() !== ""
//         ? params.category
//         : "Homes";

//       searchParams.append("category", category);

//       // Nested filters object
//       if (params.filters && typeof params.filters === "object") {
//         Object.entries(params.filters).forEach(([key, value]) => {
//           if (
//             value !== undefined &&
//             value !== null &&
//             value !== "" &&
//             value !== false
//           ) {
//             searchParams.append(`filters[${key}]`, String(value));
//           }
//         });
//       }

//       pageLink = `/properties-list-all?${searchParams.toString()}`;
//       // FULL URL text main inject karein (clickable link ke liye)
//       // const normalizedBase = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
//       // const fullUrl = `${normalizedBase}${pageLink}`;
//       linkMessage =
//         `\n\nYou can open the link below to see all matching listings on our website`;
//     }

//     return res.status(200).json({
//       text: aiText + (pageLink ? linkMessage : ""),
//       params: pageLink ? params : null,
//       pageLink: pageLink || null,
//     });
//   } catch (err) {
//     console.error("AI handler error:", err);
//     return res.status(500).json({ error: err.message || "Server error" });
//   }
// }


// test test test


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

// --------------- Helper: Price range (simple numbers) ---------------
function extractPriceRange(message) {
  const text = message.toLowerCase().replace(/,/g, "");

  let priceMin = null;
  let priceMax = null;

  const underMatch = text.match(/(under|below|less than)\s+(\d+)/);
  if (underMatch) {
    priceMax = parseInt(underMatch[2], 10);
  }

  const aboveMatch = text.match(/(above|more than|greater than)\s+(\d+)/);
  if (aboveMatch) {
    priceMin = parseInt(aboveMatch[2], 10);
  }

  const betweenMatch = text.match(/between\s+(\d+)\s+(and|-)\s+(\d+)/);
  if (betweenMatch) {
    priceMin = parseInt(betweenMatch[1], 10);
    priceMax = parseInt(betweenMatch[3], 10);
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
  "model town": "Lahore_Model_Town-114",
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

function mapCityNameToSlug(cityName) {
  if (!cityName) return null;
  return CITY_SLUGS[cityName.toLowerCase()] || null;
}

// --------------- Property type → Zameen category ---------------
function mapPropertyTypeToCategory(propertyType, purpose) {
  const t = (propertyType || "").toLowerCase();

  if (t === "plot") return "Residential_Plots";
  if (t === "house") return "Houses";
  if (t === "flat") return "Flats";
  if (t === "commercial") return "Commercial_Plots";

  return "Homes"; // fallback
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

  const { priceMin, priceMax } = extractPriceRange(t);
  const { size, sizeUnit } = parseSizeFromText(t);
  const propertyType = detectPropertyType(t);
  const purpose = detectPurpose(t);
  const beds = detectBeds(t);
  const baths = detectBaths(t);

  // Zameen specific:
  const category = mapPropertyTypeToCategory(propertyType, purpose);
  const citySlug = mapCityNameToSlug(city); // e.g. "Lahore-1"

  const params = {};

  // High-level for frontend
  if (city) params.city = city; // "lahore"
  if (areaSlug) params.area = areaSlug;

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

If the user does NOT provide enough details, politely ask them to provide:

- Property category (plot, house, commercial, apartment)
- City
- Area or society (if any)
- Budget range
- Required size (marla or kanal)

Ask in a professional way, such as:
"To assist you better, please share the property type, city, preferred area, budget range, and required size in marla or kanal."

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
      systemPrompt += `
INTERNAL CONTEXT (do NOT repeat this text to the user):
- This is a PROPERTY SEARCH query.
- Approx filters:
  - City: ${f.city || "not specified"}
  - Area/Society: ${f.areaLabel || f.areaSlug || "not specified"}
  - Near-me based: ${f.nearMeUsed ? "yes" : "no"}
  - Purpose: ${f.purpose || "sale (default)"}
  - Property type: ${f.propertyType || "any"}
  - Min budget (PKR): ${f.minPrice || "not specified"}
  - Max budget (PKR): ${f.maxPrice || "not specified"}
  - Size: ${
        f.size ? `${f.size} ${f.sizeUnit || ""}`.trim() : "not specified"
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
      if (params.size) searchParams.append("size", String(params.size));
      if (params.sizeUnit) searchParams.append("sizeUnit", params.sizeUnit);
      if (params.minPrice)
        searchParams.append("minPrice", String(params.minPrice));
      if (params.maxPrice)
        searchParams.append("maxPrice", String(params.maxPrice));
      if (params.beds) searchParams.append("beds", String(params.beds));
      if (params.baths) searchParams.append("baths", String(params.baths));

      pageLink = `/properties-list-all?${searchParams.toString()}`;

      linkMessage =
        `\n\nYou can open the link below to see all matching listings on our website`;
    }

    return res.status(200).json({
      text: aiText + (pageLink ? linkMessage : ""),
      params: pageLink ? params : null,
      pageLink: pageLink || null,
    });
  } catch (err) {
    console.error("AI handler error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}




// import OpenAI from "openai";

// export default async function handler(req, res) {
//   if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

//   try {
//     const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//     const { messages } = req.body;

//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: messages.map(m => ({ role: m.role, content: m.content })),
//       max_tokens: 300, // Free tier friendly
//       temperature: 0.7
//     });
//     console.log("OpenAI response:", completion);

//     const text = completion.choices[0].message.content;
//     console.log("Extracted text:", text);
//     res.status(200).json({ text });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// }
