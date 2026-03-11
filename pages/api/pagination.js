// pages/api/totalpages.js
import NodeCache from "node-cache";
import puppeteer from "puppeteer";
import { buildZameenUrl, buildGraanaUrl } from "./searchscrape"; // ensure correct path

const cache = new NodeCache({ stdTTL: 600 }); // 10 min cache

export default async function handler(req, res) {
  const {
    category,
    citySlug,
    areaSlug,
    price_min,
    price_max,
    beds_in,
    baths_in,
    area_min,
    area_max,
    g_city,
    g_area,
    g_minPrice,
    g_maxPrice,
    g_bed,
    g_bathroom,
    g_minSize,
    g_maxSize,
    g_sizeUnit,
    g_purpose,
    graanaSlug,
    g_category,
    g_type,
    page = 1
  } = req.query;

  try {
    // Build URLs with page number included
    const zameenUrl = buildZameenUrl({
      category,
      citySlug,
      areaSlug,
      price_min,
      price_max,
      beds_in,
      baths_in,
      area_min,
      area_max,
      page
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
      g_city,
      graanaSlug,
      page,
      g_category,
      g_type,
      g_area
    });

    const cacheKey = `${zameenUrl}|${graanaUrl}|page:${page}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.status(200).json(cached);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const pageInstance = await browser.newPage();

    await pageInstance.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    );

    // 🚀 Block heavy resources
    await pageInstance.setRequestInterception(true);
    pageInstance.on("request", (req) => {
      const type = req.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(type)) req.abort();
      else req.continue();
    });

    // --- ZAMEEN ---
    let zameenTotalPages = 1;
    try {
      await pageInstance.goto(zameenUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
      await pageInstance.waitForSelector("div._44fc0dbb ul._48341ab4", { timeout: 10000 });

      zameenTotalPages = await pageInstance.evaluate(() => {
        let max = 1;
        document.querySelectorAll("div._44fc0dbb ul._48341ab4 li a, div._44fc0dbb ul._48341ab4 li div")
          .forEach((el) => {
            const n = parseInt(el.textContent.trim());
            if (!isNaN(n) && n > max) max = n;
          });
        return max;
      });
    } catch (err) {
      console.log("Zameen pagination error:", err.message);
    }

// --- GRAANA ---
let graanaTotalPages = 1;
try {
  await pageInstance.goto(graanaUrl, { waitUntil: "networkidle0", timeout: 60000 });

  // Old Puppeteer friendly delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  await pageInstance.waitForSelector("ul.MuiPagination-ul", { timeout: 15000 });

  graanaTotalPages = await pageInstance.evaluate(() => {
    let max = 1;
    document.querySelectorAll("ul.MuiPagination-ul button.MuiPaginationItem-page")
      .forEach((el) => {
        const n = parseInt(el.textContent.trim());
        if (!isNaN(n) && n > max) max = n;
      });
    return max;
  });
} catch (err) {
  console.log("Graana pagination error:", err.message);
}

    await browser.close();

    const response = {
      zameenTotalPages,
      graanaTotalPages,
      combined: Math.max(zameenTotalPages, graanaTotalPages)
    };

    cache.set(cacheKey, response); // store cache
    return res.status(200).json(response);

  } catch (error) {
    console.error("Total Pages API Error:", error);
    return res.status(500).json({ zameenTotalPages: 1, graanaTotalPages: 1, combined: 1 });
  }
}