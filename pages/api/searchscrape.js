
// import puppeteer from "puppeteer";

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method not allowed" });
//   }

//   try {
//     const { 
//       city = 'Lahore',
//       category = 'Homes',
//       filters = {},
//       limit = 40,
//       maxPages = 10  // 👈 Kitne pages scrape karne hain
//     } = req.body;

//     if (!city) {
//       return res.status(400).json({ error: "City is required" });
//     }

//     let browser;
//     let allProperties = [];
//     let currentPage = 1;
//     let usedMethod = 'puppeteer';

//     try {
//       browser = await puppeteer.launch({
//         headless: true,
//         args: ["--no-sandbox", "--disable-setuid-sandbox"],
//       });

//       const page = await browser.newPage();
//       await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36");

//       // Multiple pages scrape karein
//       while (currentPage <= maxPages && allProperties.length < limit) {

//         // Build URL for current page 
//         const pageUrl = buildZameenUrl(city, category, currentPage, filters);
//         console.log(`📄 Scraping page ${currentPage}/${maxPages}: ${pageUrl}`);

//         try {
//           await page.goto(pageUrl, {
//             waitUntil: "networkidle2",
//             timeout: 60000,
//           });

//           // Wait for content
//           await new Promise(resolve => setTimeout(resolve, 1500));

//           // Scroll to load lazy content
//           // await autoScroll(page);

//           // Extract properties
//           const pageProperties = await extractPropertiesFromPage(page);

//           if (pageProperties.length === 0) {
//             console.log(`⚠️ No properties on page ${currentPage}`);
//             break;
//           }

//           console.log(`✅ Page ${currentPage}: Found ${pageProperties.length} properties`);
//           allProperties.push(...pageProperties);

//           // Increment page counter - FORCE next page
//           currentPage++;

//           // Delay between pages
//           await new Promise(resolve => setTimeout(resolve, 3000));

//         } catch (pageError) {
//           console.log(`⚠️ Error on page ${currentPage}:`, pageError.message);
//           break;
//         }
//       }

//       await browser.close();

//       // Apply filters
//       // Remove duplicates
// const uniqueProperties = removeDuplicates(allProperties);

// // Apply filters properly
// const filteredProperties = applyFilters(uniqueProperties, filters);

// // Apply limit after filtering
// const finalProperties = filteredProperties.slice(0, limit);

//       return res.status(200).json({
//         success: true,
//         count: finalProperties.length,
//         totalScraped: allProperties.length,
//         totalPagesScraped: currentPage - 1, // Actual pages scraped
//         data: finalProperties.map(formatProperty),
//         filters: filters,
//         method: usedMethod,
//         message: finalProperties.length === 0 
//           ? "No properties found matching your filters" 
//           : `Found ${finalProperties.length} properties from ${currentPage-1} pages`,
//         legal: {
//           notice: "All images contain original watermarks from Zameen.com.",
//           source: "Zameen.com"
//         }
//       });

//     } catch (error) {
//       if (browser) await browser.close();
//       throw error;
//     }

//   } catch (error) {
//     console.error("❌ Scrape Error:", error);
//     return res.status(500).json({ 
//       error: "Internal Server Error",
//       details: error.message 
//     });
//   }
// }

// // ============= HELPER FUNCTIONS =============

// function buildZameenUrl(city, category = 'Homes', page = 1, filters = {}) {
//   let url = `https://www.zameen.com/${category}/${city}-${page}-1.html`;

//   const filterParams = new URLSearchParams();

//   if (filters.price_min) filterParams.append('price_min', filters.price_min);
//   if (filters.price_max) filterParams.append('price_max', filters.price_max);
//   if (filters.area_min) filterParams.append('area_min', filters.area_min);
//   if (filters.area_max) filterParams.append('area_max', filters.area_max);
//   if (filters.bedrooms) filterParams.append('bedrooms', filters.bedrooms);
//   if (filters.bathrooms) filterParams.append('bathrooms', filters.bathrooms);
//   if (filters.purpose) filterParams.append('purpose', filters.purpose);
//   if (filters.property_type) filterParams.append('property_type', filters.property_type);

//   const filterString = filterParams.toString();
//   if (filterString) {
//     url += '?' + filterString;
//   }

//   return url;
// }

// async function autoScroll(page) {
//   await page.evaluate(async () => {
//     await new Promise((resolve) => {
//       let totalHeight = 0;
//       const distance = 100;
//       const timer = setInterval(() => {
//         const scrollHeight = document.body.scrollHeight;
//         window.scrollBy(0, distance);
//         totalHeight += distance;

//         if (totalHeight >= scrollHeight) {
//           clearInterval(timer);
//           resolve();
//         }
//       }, 200);
//     });
//   });
// }

// async function extractPropertiesFromPage(page) {
//   return await page.evaluate(() => {
//     const cards = document.querySelectorAll("article");

//     return Array.from(cards).map((card) => {
//       const title = card.querySelector("h2, h3, [class*='title']")?.innerText?.trim() || null;

//       const description =
//         card.querySelector('[class*="description"], p')?.innerText?.trim() || null;

//       const priceText = card.innerText;
//       let price = null;
//       let priceNumeric = null;

//       const priceMatch = priceText.match(/PKR\s*([0-9,]+(?:\.[0-9]+)?)?/);
//       if (priceMatch) {
//         price = priceMatch[0].trim();
//         const numericMatch = priceMatch[1]?.replace(/,/g, '');
//         priceNumeric = numericMatch ? parseFloat(numericMatch) : null;
//       }

//       const images = Array.from(card.querySelectorAll("img"))
//         .map(img => img.src || img.dataset?.src)
//         .filter(src => src && src.includes('zameen.com'))
//         .map(src => src.startsWith('http') ? src : `https:${src}`)
//         .slice(0, 3);

//       const link = card.querySelector("a[href*='/Property/'], a[href*='/new-projects/']");
//       let url = link?.href || null;
//       if (url && url.startsWith('/')) {
//         url = `https://www.zameen.com${url}`;
//       }

//       const location = card.querySelector('[class*="location"], [class*="address"]')?.innerText?.trim() || null;

//       let area = null;
//       let areaNumeric = null;
//       const areaMatch = card.innerText.match(/(\d+)\s*(Marla|Kanal|Square)/i);
//       if (areaMatch) {
//         area = areaMatch[0];
//         areaNumeric = parseFloat(areaMatch[1]);
//       }

//       let bedrooms = null;
//       const bedMatch = card.innerText.match(/(\d+)\s*(Bed|Bedroom)/i);
//       if (bedMatch) bedrooms = parseInt(bedMatch[1]);

//       return {
//         title,
//         description,
//         price,
//         priceNumeric,
//         images,
//         url,
//         location,
//         area,
//         areaNumeric,
//         bedrooms,
//         source: "Zameen.com"
//       };
//     }).filter(p => p.title || p.price);
//   });
// }

// function applyFilters(properties, filters) {
//   return properties.filter(prop => {
//     if (filters.price_min && prop.priceNumeric && prop.priceNumeric < filters.price_min) return false;
//     if (filters.price_max && prop.priceNumeric && prop.priceNumeric > filters.price_max) return false;
//     if (filters.area_min && prop.areaNumeric && prop.areaNumeric < filters.area_min) return false;
//     if (filters.area_max && prop.areaNumeric && prop.areaNumeric > filters.area_max) return false;
//     if (filters.bedrooms && prop.bedrooms && prop.bedrooms !== filters.bedrooms) return false;
//     if (filters.keyword && prop.title && !prop.title.toLowerCase().includes(filters.keyword.toLowerCase())) return false;
//     return true;
//   });
// }

// function removeDuplicates(properties) {
//   const seen = new Set();
//   return properties.filter(prop => {
//     if (!prop.url) return true;
//     if (seen.has(prop.url)) return false;
//     seen.add(prop.url);
//     return true;
//   });
// }

// function formatProperty(prop) {
//   return {
//     id: prop.url ? Buffer.from(prop.url).toString('base64').substring(0, 10) : Date.now().toString(),
//     title: prop.title,
//     description: prop.description || null,
//     price: prop.price,
//     images: prop.images.map(img => ({
//       url: img,
//       attribution: "Source: Zameen.com",
//       watermarkPresent: true
//     })),
//     url: prop.url,
//     location: prop.location,
//     area: prop.area,
//     bedrooms: prop.bedrooms,
//     source: prop.source
//   };
// }


// pages/api/searchscrape.js
import axios from "axios";
import * as cheerio from "cheerio";
import NodeCache from "node-cache";
import puppeteer from "puppeteer";

// async function getBothTotalPages(zameenUrl, graanaUrl) {
//   let browser;

//   try {
//     browser = await puppeteer.launch({
//       headless: true,
//       args: ["--no-sandbox", "--disable-setuid-sandbox"]
//     });

//     const page = await browser.newPage();

//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
//     );

//     // ---------- ZAMEEN ----------
//     await page.goto(zameenUrl, { waitUntil: "domcontentloaded", timeout: 120000 });

//     // Wait for pagination to appear (max 30s)
//     await page.waitForSelector('div._44fc0dbb ul._48341ab4', { timeout: 30000 });

//     const zameenTotalPages = await page.evaluate(() => {
//       let max = 1;
//       document.querySelectorAll('div._44fc0dbb ul._48341ab4 li a, div._44fc0dbb ul._48341ab4 li div').forEach(el => {
//         const num = parseInt(el.textContent.trim());
//         if (!isNaN(num) && num > max) max = num;
//       });
//       return max;
//     });


// // ---------- GRAANA ----------
// await page.goto(graanaUrl, { waitUntil: "domcontentloaded", timeout: 120000 });

// await page.waitForSelector('ul.MuiPagination-ul', { timeout: 30000 });

// const graanaTotalPages = await page.evaluate(() => {
//   let max = 1;
//   document.querySelectorAll('ul.MuiPagination-ul button.MuiPaginationItem-page').forEach(el => {
//     const num = parseInt(el.textContent.trim());
//     if (!isNaN(num) && num > max) max = num;
//   });
//   return max;
// });

//     await browser.close();
//     return { zameenTotalPages, graanaTotalPages };

//   } catch (error) {
//     if (browser) await browser.close();
//     console.error("Puppeteer error:", error.message);
//     return { zameenTotalPages: 1, graanaTotalPages: 1 };
//   }
// }
export async function getBothTotalPages(zameenUrl, graanaUrl) {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    );

    // 🚀 Block heavy resources
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();

      if (["image", "stylesheet", "font", "media"].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // ---------- ZAMEEN ----------
    await page.goto(zameenUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

    await page.waitForSelector("div._44fc0dbb ul._48341ab4", { timeout: 10000 });

    const zameenTotalPages = await page.evaluate(() => {
      let max = 1;

      document
        .querySelectorAll(
          "div._44fc0dbb ul._48341ab4 li a, div._44fc0dbb ul._48341ab4 li div"
        )
        .forEach((el) => {
          const num = parseInt(el.textContent.trim());
          if (!isNaN(num) && num > max) max = num;
        });

      return max;
    });

    // ---------- GRAANA ----------
    await page.goto(graanaUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

    await page.waitForSelector("ul.MuiPagination-ul", { timeout: 10000 });

    const graanaTotalPages = await page.evaluate(() => {
      let max = 1;

      document
        .querySelectorAll("ul.MuiPagination-ul button.MuiPaginationItem-page")
        .forEach((el) => {
          const num = parseInt(el.textContent.trim());
          if (!isNaN(num) && num > max) max = num;
        });

      return max;
    });

    await browser.close();

    return { zameenTotalPages, graanaTotalPages };

  } catch (error) {
    if (browser) await browser.close();

    console.error("Puppeteer error:", error.message);

    return {
      zameenTotalPages: 1,
      graanaTotalPages: 1
    };
  }
}

const myCache = new NodeCache({ stdTTL: 3600 });

function parseZameenPrice(priceStr) {
  if (!priceStr) return 0;
  // Sab kuch lowercase aur commas khatam
  let str = priceStr.toLowerCase().replace(/,/g, "").trim();

  // Number nikalna (e.g. "6.5 Crore" se 6.5 nikalna)
  const numMatch = str.match(/[0-9.]+/);
  if (!numMatch) return 0;
  const num = parseFloat(numMatch[0]);

  // Multiplier logic
  if (str.includes("crore") || str.includes("cr")) return num * 10000000;
  if (str.includes("lakh") || str.includes("lac")) return num * 100000;
  if (str.includes("thousand") || str.includes("k")) return num * 1000;

  return num;
}
function parseZameenArea(areaStr) {
  if (!areaStr) return 0;
  const str = areaStr.toLowerCase().replace(/,/g, "").trim();
  const num = parseFloat(str.replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return 0;

  // Zameen standard conversions for precise filtering
  if (str.includes("kanal")) return num * 418.0635; // 1 kanal = 4500 sqft standard (Zameen style)
  if (str.includes("marla")) return num * 20.903;
  if (str.includes("sq. yd.") || str.includes("sq yd")) return num * 0.836127;
  return num;
}
function parseGraanaPrice(str) {
  if (!str) return 0;

  str = str.toLowerCase().replace(/,/g, "");

  const num = parseFloat(str.match(/[0-9.]+/)?.[0] || 0);

  if (str.includes("crore")) return num * 10000000;
  if (str.includes("lakh")) return num * 100000;

  return num;
}
function parseGraanaArea(areaStr) {
  if (!areaStr) return 0;

  const str = areaStr.toLowerCase();

  const num = parseFloat(str.match(/[0-9.]+/)?.[0] || 0);

  if (str.includes("kanal")) return num * 20;
  if (str.includes("marla")) return num;

  return num;
}

// zameen
export function buildZameenUrl({
  category,
  citySlug,
  areaSlug,
  page = 1,
  price_min,
  price_max,
  beds_in,
  baths_in,
  area_min,
  area_max
}) {
  const baseSlug = (areaSlug || citySlug || "").replace(/^\//, "");

  const categoryMap = {
    plot: "Residential_Plots",
    plots: "Residential_Plots",
    residential_plots: "Residential_Plots",
    house: "Houses",
    houses: "Houses",
    home: "Houses",
    homes: "Houses",
    flat: "Flats_Apartments",
    flats: "Flats_Apartments",
    flats_apartments: "Flats_Apartments",
    commercial_plots: "Commercial_Plots",
    offices: "Offices",
    office: "Offices",
    retail_shops: "Retail_Shops",
    shop: "Retail_Shops",
    shops: "Retail_Shops"
  };

  const cleanCategory = (category || "").toLowerCase().replace(/-/g, "_").trim();
  const cat = categoryMap[cleanCategory] || "Houses";

  let url = `https://www.zameen.com/${cat}/${baseSlug}-${page}.html`;

  const params = new URLSearchParams();
  if (price_min) params.append("price_min", price_min);
  if (price_max) params.append("price_max", price_max);
  if (area_min) params.append("area_min", area_min);
  if (area_max) params.append("area_max", area_max);
  if (beds_in) params.append("beds_in", beds_in);
  if (baths_in) params.append("baths_in", baths_in);

  const queryString = params.toString();
  console.log("Built Zameen URL:", queryString ? `${url}?${queryString}` : url);
  return queryString ? `${url}?${queryString}` : url;
}
// graana
function normalizeGraanaType(input = "") {
  let t = String(input || "").toLowerCase().trim();
  if (!t) return null;

  // normalize underscores/spaces
  t = t.replace(/_/g, "-").replace(/\s+/g, "-");

  // aliases (user/dev inputs)
  if (t === "commercial") return "commercial-properties";
  if (t === "residential") return "residential-properties";
  if (t === "house") return "house";
  if (t === "flat") return "flat";
  if (t === "plot") return "plot";

  // already correct
  if (["commercial-properties", "residential-properties", "house", "flat", "plot"].includes(t))
    return t;

  return null;
}
function graanaTypeFromCategory(g_category = "") {
  const c = String(g_category || "").toLowerCase().replace(/-/g, "_").trim();
  if (!c) return null;

  // Exact Graana-style categories you pass from chat
  if (c === "commercial") return "commercial-properties";
  if (c === "residential") return "residential-properties";
  if (c === "house") return "house";
  if (c === "flat") return "flat";
  if (c === "plot") return "plot";

  // Plot variants (residential_plot, commercial_plot, residential_plots, commercial_plots)
  if (c.includes("plot")) return "plot";

  // Zameen categories / mixed inputs
  if (c.includes("houses") || c.includes("house") || c.includes("home")) return "house";
  if (c.includes("flat") || c.includes("apartment") || c.includes("flats_apartments")) return "flat";

  // If user asks offices/shops -> Graana commercial bucket
  if (c.includes("office") || c.includes("shop") || c.includes("retail")) return "commercial-properties";

  // If commercial word exists but not plot/house/flat
  if (c.includes("commercial")) return "commercial-properties";
  if (c.includes("residential")) return "residential-properties";

  return null;
}
function resolveGraanaType(queryParams = {}) {
  // priority: explicit g_type > g_category > zameen category
  return (
    normalizeGraanaType(queryParams.g_type) ||
    graanaTypeFromCategory(queryParams.g_category) ||
    graanaTypeFromCategory(queryParams.category) ||   // optional fallback if you ever pass it
    "residential-properties"
  );
}
const first = (v) => (Array.isArray(v) ? v[0] : v);

export function buildGraanaUrl(queryParams = {}) {
  const purpose = first(queryParams.g_purpose) || "sale";

  const page = Number(first(queryParams.g_page) || first(queryParams.page) || 1);
  const pageSize = Number(first(queryParams.g_pageSize) || 30);

  const rawType = first(queryParams.g_type);
  const rawCat  = first(queryParams.g_category);

  const gType =
    normalizeGraanaType(rawType) ||
    graanaTypeFromCategory(rawCat) ||
    "residential-properties";

  const locationSlug =
    first(queryParams.g_area) ||
    first(queryParams.g_city) ||
    first(queryParams.graanaSlug) ||
    "islamabad-1";

  console.log("Graana incoming:", {
    g_type: rawType,
    g_category: rawCat,
    g_area: first(queryParams.g_area),
    g_city: first(queryParams.g_city),
  });

  const base = `https://www.graana.com/${purpose}/${gType}-${purpose}-${locationSlug}/`;

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));

  if (queryParams.g_minSize) params.set("minSize", String(first(queryParams.g_minSize)));
  if (queryParams.g_maxSize) params.set("maxSize", String(first(queryParams.g_maxSize)));
  if (queryParams.g_sizeUnit) params.set("sizeUnit", String(first(queryParams.g_sizeUnit)));

  if (queryParams.g_bed) params.set("bed", String(first(queryParams.g_bed)));
  if (queryParams.g_bathroom) params.set("bathroom", String(first(queryParams.g_bathroom)));

  if (queryParams.g_minPrice) params.set("minPrice", String(first(queryParams.g_minPrice)));
  if (queryParams.g_maxPrice) params.set("maxPrice", String(first(queryParams.g_maxPrice)));

  const finalUrl = `${base}?${params.toString()}`;
  console.log("Built Graana URL:", finalUrl);
  return finalUrl;
}

// --------- Pagination se total pages nikalna ---------
// function detectTotalPagesFromDom($, targetUrl) {
//   let maxPage = 1;
//   try {
//     const urlObj = new URL(targetUrl);
//     const path = urlObj.pathname;
//     const basePrefix = path.replace(/-(\d+)\.html$/, "-");

//     $("a[href]").each((i, el) => {
//       const href = $(el).attr("href");
//       if (!href) return;
//       let fullHref = href;
//       if (!href.startsWith("http")) fullHref = urlObj.origin + href;

//       const m = fullHref.match(/-(\d+)\.html$/);
//       if (!m) return;
//       const pageNum = parseInt(m[1], 10);
//       if (Number.isNaN(pageNum)) return;

//       const linkPath = new URL(fullHref).pathname;
//       if (!linkPath.startsWith(basePrefix)) return;
//       if (pageNum > maxPage) maxPage = pageNum;
//     });
//   } catch (e) {
//     console.error("detectTotalPagesFromDom error:", e.message);
//   }
//   return maxPage;
// }
// function detectTotalPagesFromDom($, targetUrl) {
//   let maxPage = 1;
//   try {
//     // 1. Zameen ke specific pagination patterns ko target karna
//     // Yeh selector 'div' aur 'ul' dono ko check karega jo pagination rakhte hain
//     const paginationSelectors = [
//       'div[aria-label="Pagination"]',
//       'ul[class*="pagination"]',
//       'div[class*="pagination"]',
//       'nav[aria-label="Pagination"]'
//     ];

//     paginationSelectors.forEach(selector => {
//       $(selector).find('a').each((i, el) => {
//         const text = $(el).text().trim();
//         const pageNum = parseInt(text, 10);

//         // Agar text number hai (e.g. "1", "2", "10")
//         if (!isNaN(pageNum) && pageNum > maxPage) {
//           maxPage = pageNum;
//         }
//       });
//     });

//     // 2. Fallback: Agar numbers nahi milay, to URL pattern se check karein
//     if (maxPage === 1) {
//       $('a[href*=".html"]').each((i, el) => {
//         const href = $(el).attr('href') || "";
//         // Zameen URL pattern: category-city-id-page.html (e.g., houses-islamabad-3-2.html)
//         const match = href.match(/-(\d+)\.html$/);
//         if (match) {
//           const p = parseInt(match[1], 10);
//           if (p > maxPage && p < 1000) maxPage = p; 
//         }
//       });
//     }
//   } catch (e) {
//     console.error("Pagination detection error:", e.message);
//   }
//   return maxPage;
// }
function detectTotalPagesFromDom($) {
  let maxPage = 1;
  try {
    // Pagination links ko target karen
    const paginationSelectors = [
      'div[aria-label="Pagination"]',
      'ul[class*="pagination"]',
      'div[class*="pagination"]',
      'nav[aria-label="Pagination"]'
    ];

    paginationSelectors.forEach(selector => {
      $(selector).find('a').each((i, el) => {
        const text = $(el).text().trim();
        const pageNum = parseInt(text, 10);
        if (!isNaN(pageNum) && pageNum > maxPage) {
          maxPage = pageNum;
        }
      });
    });

    // Fallback: Agar links nahi mile, to URL pattern se bhi check karen
    if (maxPage === 1) {
      $('a[href*=".html"]').each((i, el) => {
        const href = $(el).attr('href') || "";
        const match = href.match(/-(\d+)\.html$/); // e.g., houses-lahore-1-3.html
        if (match) {
          const p = parseInt(match[1], 10);
          if (!isNaN(p) && p > maxPage && p < 1000) maxPage = p;
        }
      });
    }

  } catch (e) {
    console.error("Pagination detection error:", e.message);
  }

  return maxPage;
}
function detectZameenTotalPages($) {
  let maxPage = 1;

  $(".pagination li a").each((i, el) => {
    const text = $(el).text().trim();
    const pageNum = parseInt(text);

    if (!isNaN(pageNum) && pageNum > maxPage) {
      maxPage = pageNum;
    }
  });

  return maxPage;
}

// export default async function handler(req, res) {
//   const { 
//     url, category, citySlug, areaSlug, page = "1", 
//     price_min, price_max, beds_in, baths_in,
//     area_min, area_max
//   } = req.query;

//   let targetUrl;
//   if (url) {
//     targetUrl = url;
//   } else if (category && (citySlug || areaSlug)) {
//     targetUrl = buildZameenUrl({
//       category,
//       citySlug,
//       areaSlug,
//       page: Number(page) || 1,
//       price_min,
//       price_max,
//       beds_in,
//       baths_in,
//       area_min,
//       area_max
//     });
//   } else {
//     return res.status(400).json({ error: "Missing parameters" });
//   }

//   const cacheKey = JSON.stringify({ targetUrl, price_min, price_max, area_min, area_max, beds_in, baths_in });
//   const cachedData = myCache.get(cacheKey);
//   if (cachedData) return res.status(200).json(cachedData);

// let propertyType = null;
// if (category) {
//   const c = category.toLowerCase();
//   if (c.includes("plot")) propertyType = "plot";
//   else if (c.includes("house") || c.includes("home")) propertyType = "house";
//   else if (c.includes("flat") || c.includes("apartment")) propertyType = "flat";
//   else if (c.includes("office")) propertyType = "office";
//   else if (c.includes("shop")) propertyType = "shop";
// }

//   try {
//     const { data: html } = await axios.get("https://api.zenrows.com/v1/", {
//       params: {
//         url: targetUrl,
//         apikey: process.env.ZENROWS_KEY,
//         js_render: "false",
//       }, headers: {
//     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
//   }
//     });

//     const $ = cheerio.load(html);
//     const cards = $("li[role='article']");
//     const totalPages = detectTotalPagesFromDom($, targetUrl);
//     const properties = [];

//     cards.each((i, el) => {
//       const card = $(el);

//       // --- 1. DATA EXTRACTION ---
//       const priceText = card.find('span[aria-label="Price"]').text().trim();
//       const currentPriceNumeric = parseZameenPrice(priceText);

//       const areaText = card.find('span[aria-label="Area"]').text().trim();
//       const currentAreaNumeric = parseZameenArea(areaText);

//       const bedsText = card.find('[aria-label="Beds"]').text().trim() || "";
//       const bathsText = card.find('[aria-label="Baths"]').text().trim() || "";

//       // Clean numbers for Beds/Baths (e.g., "3 Beds" -> 3)
//       const currentBeds = parseInt(bedsText.replace(/[^0-9]/g, ""), 10) || 0;
//       const currentBaths = parseInt(bathsText.replace(/[^0-9]/g, ""), 10) || 0;

//       // --- 2. FILTERING LOGIC (STRICT) ---

//       // Price Filter
//       if (price_min && currentPriceNumeric < Number(price_min)) return;
//       if (price_max && currentPriceNumeric > Number(price_max)) return;

//       // Beds Filter
//       if (beds_in && currentBeds !== parseInt(beds_in, 10)) return;

//       // Baths Filter
//       if (baths_in && currentBaths !== parseInt(baths_in, 10)) return;

//       // --- 3. PUSH DATA (Only if all filters pass) ---
//       const title = card.find('a[aria-label="Listing link"]').first().attr("title")?.trim() || "";
//       let link = card.find('a[aria-label="Listing link"]').first().attr("href") || "";
//       if (link && !link.startsWith("http")) link = "https://www.zameen.com" + link;

//       let image = null;
//       let imgEl = card.find('img[aria-label="Listing photo"], picture img').first();
//       image = imgEl.attr("src") || imgEl.attr("data-src") || null;
// //       let imgEl = card.find('img[aria-label="Listing photo"], picture img').first();
// // let rawImage = imgEl.attr("src") || imgEl.attr("data-src") || null;

// // let finalImage = null;

// // if (rawImage) {
// //   // Check karein ke kahin ye pehle se hi data:image toh nahi
// //   if (rawImage.startsWith('http')) {
// //     const PYTHON_API = "http://localhost:5001/clean"; // Aapka Flask Server
// //     finalImage = `${PYTHON_API}?url=${encodeURIComponent(rawImage)}`;
// //   } else {
// //     finalImage = rawImage;
// //   }
// // }

//       properties.push({
//         title,
//         price: priceText,
//         debugPrice: currentPriceNumeric,
//         location: card.find('div[aria-label="Location"]').first().text().trim(),
//         area: areaText,
//         link,
//         image,
//         beds: currentBeds || null,
//         baths: currentBaths || null,
//         propertyType
//       });
//     });

//     const responseData = {
//       url: targetUrl,
//       page: Number(page) || 1,
//       totalPages,
//       count: properties.length,
//       properties,
//     };

//     myCache.set(cacheKey, responseData);
//     return res.status(200).json(responseData);

//   } catch (error) {
//     console.error("Scraping Error Log:", error.message);

//     // Agar axios ko 404 milta hai
//     if (error.response && error.response.status === 404) {
//       return res.status(404).json({ 
//         error: "404 - No results matching criteria on Zameen",
//         targetUrl 
//       });
//     }

//     // Agar proxy ya API block ho (503/403)
//     if (error.response && (error.response.status === 503 || error.response.status === 403)) {
//       return res.status(error.response.status).json({ 
//         error: "Zameen is currently blocking requests. Please try again with js_render: true." 
//       });
//     }

//     // Koi aur general error
//     return res.status(500).json({ error: "Failed to fetch data from Zameen" });
//   }
// }



// import puppeteer from "puppeteer";

// export default async function handler(req, res) {
//   const { searchUrl } = req.body;

//   if (!searchUrl) {
//     return res.status(400).json({ error: "searchUrl is required" });
//   }

//   let browser;

//   try {
//     browser = await puppeteer.launch({
//       headless: true,
//       args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     });

//     const page = await browser.newPage();

//     // Set a more realistic user agent
//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
//     );

//     // Set viewport to mimic a real device
//     await page.setViewport({
//       width: 1366,
//       height: 768,
//     });

//     await page.goto(searchUrl, {
//       waitUntil: "networkidle2", // Wait for network to be idle
//       timeout: 60000,
//     });

//     // Wait longer for dynamic content to load
//     await new Promise(resolve => setTimeout(resolve, 8000));

//     // Scroll to load lazy-loaded images
//     await page.evaluate(async () => {
//       await new Promise((resolve) => {
//         let totalHeight = 0;
//         const distance = 100;
//         const timer = setInterval(() => {
//           const scrollHeight = document.body.scrollHeight;
//           window.scrollBy(0, distance);
//           totalHeight += distance;

//           if (totalHeight >= scrollHeight) {
//             clearInterval(timer);
//             resolve();
//           }
//         }, 200);
//       });
//     });

//     // Wait a bit more after scrolling
//     await new Promise(resolve => setTimeout(resolve, 3000));

//     // Enhanced data extraction
//     const properties = await page.evaluate(() => {
//       const cards = document.querySelectorAll("article");

//       return Array.from(cards).map(card => {
//         // Extract title
//         const titleElement = card.querySelector("h2, h3, [aria-label*='title'], ._7c6b3a6e");
//         const title = titleElement?.innerText?.trim() || null;

//         // Extract price - handle multiple price formats
//         const priceText = card.innerText;
//         let price = null;

//         // Look for PKR prices with numbers
//         const priceMatch = priceText.match(/PKR\s*([0-9,]+(?:\.[0-9]+)?)?/);
//         if (priceMatch) {
//           price = priceMatch[0].trim();
//         } else {
//           // Alternative price patterns
//           const altPriceMatch = priceText.match(/(?:Rs\.?|PKR)\s*([0-9,]+(?:\.[0-9]+)?)/i);
//           if (altPriceMatch) {
//             price = altPriceMatch[0].trim();
//           }
//         }

//         // Extract images - multiple selectors for different structures
//         let images = [];

//         // Try different image selectors
//         const imgSelectors = [
//           "img[src*='zameen']",
//           "img._6d4a704c",
//           ".image-gallery img",
//           "picture img",
//           "img[loading='lazy']"
//         ];

//         for (const selector of imgSelectors) {
//           const imgElements = card.querySelectorAll(selector);
//           if (imgElements.length > 0) {
//             images = Array.from(imgElements)
//               .map(img => img.src || img.dataset.src)
//               .filter(src => src && src.includes('zameen.com'))
//               .map(src => src.startsWith('http') ? src : `https:${src}`);
//             if (images.length > 0) break;
//           }
//         }

//         // If no images found with specific selectors, try all images
//         if (images.length === 0) {
//           images = Array.from(card.querySelectorAll("img"))
//             .map(img => img.src || img.dataset.src)
//             .filter(src => src && src.includes('zameen.com'))
//             .map(src => src.startsWith('http') ? src : `https:${src}`);
//         }

//         // Extract URL
//         const linkElement = card.querySelector("a[href*='/Property/'], a[href*='/new-projects/']");
//         let url = linkElement?.href || null;

//         // Ensure URL is absolute
//         if (url && url.startsWith('/')) {
//           url = `https://www.zameen.com${url}`;
//         }

//         // Extract additional details
//         const location = card.querySelector('[class*="location"], [aria-label*="location"]')?.innerText?.trim() || null;

//         const area = card.innerText.match(/(\d+)\s*(Marla|Kanal|Square)/i)?.[0] || null;

//         const propertyType = card.innerText.includes('House') ? 'House' : 
//                            card.innerText.includes('Flat') ? 'Flat' : 
//                            card.innerText.includes('Plot') ? 'Plot' : null;

//         return {
//           title,
//           price,
//           images,
//           url,
//           location,
//           area,
//           propertyType,
//           description: title, // Using title as description for now
//           timestamp: new Date().toISOString()
//         };
//       }).filter(property => property.title || property.price); // Filter out empty entries
//     });

//     await browser.close();

//     // Filter out any null/empty entries and remove duplicates by URL
//     const uniqueProperties = properties.filter((prop, index, self) => 
//       prop.url && index === self.findIndex(p => p.url === prop.url)
//     );

//     return res.status(200).json({
//       success: true,
//       count: uniqueProperties.length,
//       data: uniqueProperties,
//       timestamp: new Date().toISOString()
//     });

//   } catch (error) {
//     if (browser) await browser.close();
//     console.error("Scrape Error:", error);
//     return res.status(500).json({ 
//       error: "Scraping failed", 
//       details: error.message 
//     });
//   }
// }

function detectGraanaTotalPages($) {
  let maxPage = 1;

  $("ul.MuiPagination-ul button").each((i, el) => {
    const text = $(el).text().trim();
    const pageNum = parseInt(text);

    if (!isNaN(pageNum) && pageNum > maxPage) {
      maxPage = pageNum;
    }
  });

  return maxPage;
}


export async function scrapeZameen(targetUrl, filters = {}) {
  const { price_min, price_max, beds_in, baths_in } = filters;

  // const { data: html } = await axios.get("https://api.zenrows.com/v1/", {
  //   params: {
  //     url: targetUrl,
  //     apikey: process.env.ZENROWS_KEY,
  //     js_render: "false",
  //   },
  const { data: html } = await axios.get(targetUrl, {
    // params: {
    //   url: targetUrl,
    //   apikey: process.env.ZENROWS_KEY,
    //   js_render: "false",
    // },
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  const $ = cheerio.load(html);
  const cards = $("li[role='article']");
  const totalPages = detectTotalPagesFromDom($, targetUrl);
  const properties = [];

  cards.each((i, el) => {
    const card = $(el);

    // --- 1. DATA EXTRACTION ---
    const priceText = card.find('span[aria-label="Price"]').text().trim();
    const priceNumeric = parseZameenPrice(priceText);

    const areaText = card.find('span[aria-label="Area"]').text().trim();
    const beds = parseInt(card.find('[aria-label="Beds"]').text().replace(/\D/g, ""), 10) || 0;
    const baths = parseInt(card.find('[aria-label="Baths"]').text().replace(/\D/g, ""), 10) || 0;

    const title = card.find('a[aria-label="Listing link"]').attr("title")?.trim() || "";
    let link = card.find('a[aria-label="Listing link"]').attr("href") || "";
    if (link && !link.startsWith("http")) link = "https://www.zameen.com" + link;

    const imageEl = card.find('img[aria-label="Listing photo"], picture img').first();
    const image = imageEl.attr("src") || imageEl.attr("data-src") || null;

    const location = card.find('div[aria-label="Location"]').first().text().trim() || null;

    // Determine property type from category or text
    let propertyType = null;
    const titleLower = title.toLowerCase();
    if (titleLower.includes("plot")) propertyType = "plot";
    else if (titleLower.includes("house") || titleLower.includes("home")) propertyType = "house";
    else if (titleLower.includes("flat") || titleLower.includes("apartment")) propertyType = "flat";
    else if (titleLower.includes("office")) propertyType = "office";
    else if (titleLower.includes("shop")) propertyType = "shop";

    // --- 2. FILTERING LOGIC ---
    if (price_min && priceNumeric < Number(price_min)) return;
    if (price_max && priceNumeric > Number(price_max)) return;
    if (beds_in && beds !== Number(beds_in)) return;
    if (baths_in && baths !== Number(baths_in)) return;

    // --- 3. PUSH DATA ---
    properties.push({
      title,
      price: priceText,
      debugPrice: priceNumeric, // optional for debugging
      location,
      area: areaText,
      beds: beds || null,
      baths: baths || null,
      image,
      link,
      propertyType,
      source: "zameen",
    });
  });

  return { properties, totalPages };
}

export async function scrapeGraana(targetUrl, filters = {}) {
  const {
    g_minPrice,
    g_maxPrice,
    g_bed,
    g_bathroom,
    g_minSize,
    g_maxSize
  } = filters;

  const { data: html } = await axios.get(targetUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  const $ = cheerio.load(html);

  const cards = $("div.MuiBox-root.mui-style-17zbhp0");
  const properties = [];
  console.log(`Graana Scrape: Found ${cards.length} cards on the page`);

  cards.each((i, el) => {

    const card = $(el);

    // link
    let link = card.find("a[href^='/property/']").attr("href");
    if (!link) return;
    link = "https://www.graana.com" + link;

    // price
    const priceText = card.find(".MuiTypography-h4New").first().text().trim() || null;
    const price = parseGraanaPrice(priceText);

    // title / location
    const title = card.find(".MuiTypography-subtitle2New").first().text().trim() || null;

    // beds
    let beds = null;
    const bedsNode = card.find("img[src*='bed']").parent().next();
    if (bedsNode) beds = parseInt(bedsNode.text().trim()) || null;

    // baths
    let baths = null;
    const bathsNode = card.find("img[src*='bath']").parent().next();
    if (bathsNode) baths = parseInt(bathsNode.text().trim()) || null;

    // area
    let area = null;
    const areaNode = card.find("img[src*='area']").parent().next();
    if (areaNode) area = areaNode.text().trim();
    area = parseGraanaArea(area);

    const typeText = card
  .find(".MuiTypography-body2New")
  .filter((_, el) =>
    /(plot|house|flat|apartment|office|shop|commercial)/i.test($(el).text())
  )
  .first()
  .text()
  .trim() || null;

    // image
let image =
  card.find("img[alt='sliderCard']").attr("src") ||
  card.find("img[alt='sliderCard']").attr("data-src") ||
  null;

if (image) {
  // Make absolute if relative
  if (image.startsWith("/")) image = "https://www.graana.com" + image;

  // Decode Next.js image proxy
  if (image.includes("/_next/image")) {
    const u = new URL(image);
    const raw = u.searchParams.get("url");
    if (raw) image = decodeURIComponent(raw);
  }
}

    // price filter
    if (g_minPrice && price < Number(g_minPrice)) return;
    if (g_maxPrice && price > Number(g_maxPrice)) return;

    if (g_bed && beds !== Number(g_bed)) return;

    if (g_bathroom && baths !== Number(g_bathroom)) return;

    if (g_minSize && area < Number(g_minSize)) return;
    if (g_maxSize && area > Number(g_maxSize)) return;

    properties.push({
      title,
      price,
      location: title,
      area,
      beds,
      baths,
      image,
      link,
      propertyType: typeText,
      source: "graana"
    });

  });

  console.log(`Graana Scrape: Found ${properties.length} properties`);

  const totalPages = detectGraanaTotalPages($);
  return { properties, totalPages };
}

// export default async function handler(req, res) {
//   const {
//     category,
//     citySlug,
//     areaSlug,
//     page = 1,
//     price_min,
//     price_max,
//     beds_in,
//     baths_in,
//     area_min,
//     area_max,
//     g_city,
//     g_area,
//     g_page,
//     g_minPrice,
//     g_maxPrice,
//     g_bed,
//     g_bathroom,
//     g_minSize,
//     g_maxSize,
//     g_sizeUnit,
//     g_purpose,
//     graanaSlug
//   } = req.query;

//   let zameenData = { properties: [], totalPages: 1 };
//   let graanaData = { properties: [], totalPages: 1 };

//   let zameenUrl = "";
//   let graanaUrl = "";

//   // --- Zameen Scrape ---
//   try {
//      zameenUrl = buildZameenUrl({
//       category,
//       citySlug,
//       areaSlug,
//       page,
//       price_min,
//       price_max,
//       beds_in,
//       baths_in,
//       area_min,
//       area_max
//     });
//     zameenData = await scrapeZameen(zameenUrl, {
//       price_min,
//       price_max,
//       beds_in,
//       baths_in,
//       area_min,
//       area_max
//     });
//     console.log(zameenData, "Zameen Scrape: Extracted properties and total pages");

//     // Calculate total pages
//     const $ = cheerio.load(await axios.get(zameenUrl).then(r => r.data));
//     // let totalPages = detectZameenTotalPages($);
//     // const zTotal = await getTotalPagesWithPuppeteer(zameenUrl, 'div[aria-label="Pagination"] a, ul.pagination li a');
//     // zameenData.totalPages = zTotal;

// // if (cards.length === 0) totalPages = 1;

//   } catch (error) {
//     console.error("Zameen Scrape Error:", error.message);
//   }

//   // --- Graana Scrape ---
//   try {
//      graanaUrl = buildGraanaUrl({
//       g_purpose,
//       g_minPrice,
//       g_maxPrice,
//       g_bed,
//       g_bathroom,
//       g_minSize,
//       g_maxSize,
//       g_sizeUnit,
//       g_page,
//       g_city,
//       graanaSlug
//     });
//     graanaData = await scrapeGraana(graanaUrl, {
//       g_minPrice,
//       g_maxPrice,
//       g_bed,
//       g_bathroom,
//       g_minSize,
//       g_maxSize,
//       g_sizeUnit,
//       g_page,
//       g_city,
//       graanaSlug
//     });
//     // const gTotal = await getTotalPagesWithPuppeteer(graanaUrl, 'ul.MuiPagination-ul button');
//     // graanaData.totalPages = gTotal;
//       console.log(graanaData, "Graana Scrape: Extracted properties and total pages");
//   } catch (error) {
//     console.error("Graana Scrape Error:", error.message);
//   }

//   const totals = await getBothTotalPages(zameenUrl, graanaUrl);

// zameenData.totalPages = totals.zameenTotalPages;
// graanaData.totalPages = totals.graanaTotalPages;

//   const properties = [...zameenData.properties, ...graanaData.properties];

//   return res.status(200).json({
//     page: Number(page),
//     totalPages: {
//       zameen: zameenData.totalPages,
//       graana: graanaData.totalPages,
//       combined: Math.max(zameenData.totalPages, graanaData.totalPages)
//     },
//     count: properties.length,
//     properties,
//   });
// }

export default async function handler(req, res) {
  const {
    category,
    citySlug,
    areaSlug,
    page = 1,
    price_min,
    price_max,
    beds_in,
    baths_in,
    area_min,
    area_max,
    g_city,
    g_area,
    g_page,
    g_pageSize,
    g_type,
    g_minPrice,
    g_maxPrice,
    g_bed,
    g_bathroom,
    g_minSize,
    g_maxSize,
    g_sizeUnit,
    g_purpose,
    graanaSlug,
    g_category
  } = req.query;

  // Build URLs
  const zameenUrl = buildZameenUrl({
    category,
    citySlug,
    areaSlug,
    page,
    price_min,
    price_max,
    beds_in,
    baths_in,
    area_min,
    area_max
  });

  const graanaUrl = buildGraanaUrl({
    g_purpose,
    g_minPrice,
    g_maxPrice,
    g_bed,
    g_bathroom,
    g_minSize,
    g_maxSize,
    g_sizeUnit,
    g_type,
    g_category,
    g_area,
    page,
    g_pageSize,
    g_city,
    graanaSlug,
  });

  try {
    // Scrape Zameen & Graana in parallel
    const results = await Promise.allSettled([
      scrapeZameen(zameenUrl, {
        price_min,
        price_max,
        beds_in,
        baths_in,
        area_min,
        area_max
      }),
      scrapeGraana(graanaUrl, {
        g_minPrice,
        g_maxPrice,
        g_bed,
        g_bathroom,
        g_minSize,
        g_maxSize,
        g_sizeUnit,
        page,
        g_city,
        graanaSlug,
        g_category
      })
    ]);

    // Handle Zameen results
    const zameenData =
      results[0].status === "fulfilled"
        ? results[0].value
        : { properties: [] };

    if (results[0].status === "rejected") {
      console.error("Zameen Scrape Error:", results[0].reason);
    }

    // Handle Graana results
    const graanaData =
      results[1].status === "fulfilled"
        ? results[1].value
        : { properties: [] };

    if (results[1].status === "rejected") {
      console.error("Graana Scrape Error:", results[1].reason);
    }

    // Combine properties
    const properties = [...zameenData.properties, ...graanaData.properties];

    return res.status(200).json({
      page: Number(page),
      count: properties.length,
      properties
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Scraping failed" });
  }
}



