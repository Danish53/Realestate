// // pages/api/detail.js
// import axios from "axios";
// import * as cheerio from "cheerio";


// function extractRelatedProperties($) {
//   const related = [];

//   // Sirf sabhi listing cards pakro, container ki tension chhor do
//   const cards = $('[role="article"][aria-label="Listing"]');
//   console.log("extractRelatedProperties: cards found = ", cards.length);

//   cards.each((i, el) => {
//     const card = $(el);

//     // Listing link
//     const linkEl = card.find('a[aria-label="Listing link"]').first();
//     const relativeHref = linkEl.attr("href") || "";
//     let link = relativeHref;
//     if (link && !link.startsWith("http")) {
//       link = "https://www.zameen.com" + link;
//     }

//     const title =
//       linkEl.attr("title")?.trim() ||
//       card.find("h4").first().text().trim() ||
//       "";

//     const price = card
//       .find('span[aria-label="Price"]')
//       .first()
//       .text()
//       .trim();

//     const location = card
//       .find('div[aria-label="Location"]')
//       .first()
//       .text()
//       .trim();

//     const area =
//       card
//         .find('span[aria-label="Area"] span')
//         .first()
//         .text()
//         .trim() || null;

//     // Image
//     let image = null;
//     let imgEl = card
//       .find(
//         'img[aria-label="Listing photo"], img[aria-label="Fallback listing photo"]'
//       )
//       .first();

//     if (!imgEl.length) imgEl = card.find("picture img").first();
//     if (!imgEl.length) imgEl = card.find("img").first();

//     if (imgEl && imgEl.length) {
//       image =
//         imgEl.attr("src") ||
//         imgEl.attr("data-src") ||
//         (imgEl.attr("data-srcset")
//           ? imgEl.attr("data-srcset").split(" ")[0]
//           : null) ||
//         null;
//     }

//     const added =
//       card
//         .find('span[aria-label="Listing creation date"]')
//         .first()
//         .text()
//         .trim() || null;

//     related.push({
//       title,
//       price,
//       location,
//       area,
//       link,
//       image,
//       added,
//     });
//   });

//   return related;
// }

// export default async function handler(req, res) {
//   const { slug, url } = req.query;

//   if (!slug && !url) {
//     return res.status(400).json({
//       error: "slug or url query param required",
//     });
//   }

//   // Detail URL build karo
//   const detailUrl = url || `https://www.zameen.com/Property/${slug}.html`;

//   try {
//     const { data: html } = await axios.get(detailUrl, {
//       // params: {
//       //   url: detailUrl,
//       //   apikey: process.env.ZENROWS_KEY,
//       //   js_render: "false",
//       //   premium_proxy: "false",
//       // },
//     });

//     const $ = cheerio.load(html);

//     // -------- BASIC FIELDS --------

//     // Title – detail page pe pehla h1 ya koi specific selector
//     const title =
//       $("h1").first().text().trim() ||
//       $('h1[aria-label="Title"]').first().text().trim() ||
//       null;

//     // Price
//     const price =
//       $('span[aria-label="Price"]').first().text().trim() ||
//       null;

//     // Location / address (detail page pe structure different ho sakta hai)
//     const location =
//       $('div[aria-label="Location"]').first().text().trim() ||
//       $('span[aria-label="Location"]').first().text().trim() ||
//       null;

//     // Area
//     const area =
//       $('span[aria-label="Area"]').first().text().trim() ||
//       $('span[aria-label="Area"] span').first().text().trim() ||
//       null;

//     // Beds / Baths
//     const bedsText =
//       $('span[aria-label="Beds"]').first().text().trim() ||
//       $('span[aria-label="Bedrooms"]').first().text().trim() ||
//       null;

//     const bathsText =
//       $('span[aria-label="Baths"]').first().text().trim() ||
//       $('span[aria-label="Bathrooms"]').first().text().trim() ||
//       null;

//     const beds = bedsText || null;
//     const baths = bathsText || null;

//     // Added date (agar available ho)
//     const added =
//       $('span[aria-label="Listing creation date"]').first().text().trim() ||
//       null;

//     // -------- DESCRIPTION --------

//     // Zameen detail page me description ke liye different selectors ho sakte hain;
//     // tum Inspect karke adjust kar lena:
//     let description =
//       $('div[aria-label="Property description"]').text().trim() || "";

//     if (!description) {
//       // fallback: koi section jisme "Description" heading ho
//       const descSection = $('h3:contains("Property description")')
//         .first()
//         .parent();
//       description = descSection.find("p").text().trim() || "";
//     }

//     if (!description) description = null;

//     // -------- GALLERY IMAGES --------

// const gallery = [];

// $("img").each((i, el) => {
//   const imgEl = $(el);
//   const src =
//     imgEl.attr("src") ||
//     imgEl.attr("data-src") ||
//     (imgEl.attr("data-srcset")
//       ? imgEl.attr("data-srcset").split(" ")[0]
//       : null);

//   if (!src) return;

//   // Sirf Zameen ke image CDN ko allow karo
//   if (
//     src.includes("media.zameen.com") ||
//     src.includes("images.zameen.com")
//   ) {
//     if (!gallery.includes(src)) {
//       gallery.push(src);
//     }
//   }
// });

//     // Agar detail page me koi aur gallery wrapper ho to usko bhi check kar sakte ho:
//     // $(".some-gallery-class img").each(...)

//     // -------- PROPERTY TYPE (approx) --------

//     let propertyType = null;
//     try {
//       const lowerTitle = (title || "").toLowerCase();
//       if (/plot|plots?|file/.test(lowerTitle)) propertyType = "plot";
//       else if (/house|home|villa|portion/.test(lowerTitle)) propertyType = "house";
//       else if (/flat|apartment/.test(lowerTitle)) propertyType = "flat";
//     } catch {}

//     let phone = null;
//     // Phone number (agar available ho)
//     const phoneEl = $('a[aria-label="Listing phone number"]').first();
//     if (phoneEl && phoneEl.length) {
//       phone = phoneEl.text().trim() || null;
//     }

//     const purpose =
//   $('span[aria-label="Purpose"]').first().text().trim() || null;

// let dealType = null;
// if (purpose) {
//   if (/sale/i.test(purpose)) dealType = "sale";
//   else if (/rent|lease/i.test(purpose)) dealType = "rent";
// }

//   const related = extractRelatedProperties($);

//     // -------- FINAL RESPONSE --------

//     return res.status(200).json({
//       slug: slug || null,
//       url: detailUrl,
//       title,
//       price,
//       location,
//       area,
//       beds,
//       baths,
//       propertyType,
//       added,
//       description,
//       gallery,
//       agent: {
//         phone,
//       },
//       dealType,
//         related,
//     });
//   } catch (error) {
//     console.error("detail scrape error:", error.message);
//     return res.status(500).json({
//       error: error.response?.data || error.message,
//     });
//   }
// }



// pages/api/detail.js
import axios from "axios";
import * as cheerio from "cheerio";
import { sanitizeScrapedPropertyDetail } from "@/utils/sanitizeListingBrandText";
import { applyDetailImagePlaceholders } from "@/utils/categoryPlaceholderImages";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

const first = (v) => (Array.isArray(v) ? v[0] : v);

function normalizeUrl(input) {
  if (!input) return null;
  let u = String(input).trim();
  if (!u) return null;
  if (u.startsWith("//")) u = "https:" + u;
  return u;
}

async function fetchHtml(url) {
  const resp = await axios.get(url, {
    headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
    timeout: 60000,
    maxRedirects: 5,
    validateStatus: () => true,
  });

  return {
    status: resp.status,
    urlFinal: resp.request?.res?.responseUrl || url,
    html: String(resp.data || ""),
  };
}

function detectProviderFromUrl(url = "") {
  const u = String(url).toLowerCase();
  if (u.includes("graana.com")) return "graana";
  if (u.includes("zameen.com")) return "zameen";
  return null;
}

/* -------------------- ZAMEEN HELPERS -------------------- */

function extractRelatedPropertiesZameen($) {
  const related = [];
  const cards = $('[role="article"][aria-label="Listing"]');

  cards.each((i, el) => {
    const card = $(el);

    const linkEl = card.find('a[aria-label="Listing link"]').first();
    const relativeHref = linkEl.attr("href") || "";
    let link = relativeHref;
    if (link && !link.startsWith("http")) link = "https://www.zameen.com" + link;

    const title =
      linkEl.attr("title")?.trim() ||
      card.find("h4").first().text().trim() ||
      "";

    const price = card.find('span[aria-label="Price"]').first().text().trim() || null;

    const location =
      card.find('div[aria-label="Location"]').first().text().trim() || null;

    const area =
      card.find('span[aria-label="Area"] span').first().text().trim() ||
      card.find('span[aria-label="Area"]').first().text().trim() ||
      null;

    let image = null;
    let imgEl = card
      .find('img[aria-label="Listing photo"], img[aria-label="Fallback listing photo"]')
      .first();

    if (!imgEl.length) imgEl = card.find("picture img").first();
    if (!imgEl.length) imgEl = card.find("img").first();

    if (imgEl && imgEl.length) {
      image =
        imgEl.attr("src") ||
        imgEl.attr("data-src") ||
        (imgEl.attr("data-srcset") ? imgEl.attr("data-srcset").split(" ")[0] : null) ||
        null;
    }

    const added =
      card.find('span[aria-label="Listing creation date"]').first().text().trim() ||
      null;

    if (link) related.push({ title, price, location, area, link, image, added });
  });

  return related.slice(0, 12);
}

function inferPropertyTypeFromTitle(title = "") {
  const t = (title || "").toLowerCase();
  if (/\b(plot|plots?|file)\b/.test(t)) return "plot";
  if (/\b(flat|apartment)\b/.test(t)) return "flat";
  if (/\b(house|home|villa|portion)\b/.test(t)) return "house";
  if (/\b(shop|office|commercial)\b/.test(t)) return "commercial";
  return null;
}

function detectDealTypeFromText(text = "") {
  const t = (text || "").toLowerCase();
  if (/\brent|rental|lease\b/.test(t)) return "rent";
  if (/\bsale|for sale\b/.test(t)) return "sale";
  return null;
}

function scrapeZameenDetailFromHtml(html, detailUrl, slug = null) {
  const $ = cheerio.load(html);

  const title =
    $("h1").first().text().trim() ||
    $('h1[aria-label="Title"]').first().text().trim() ||
    null;

  const price = $('span[aria-label="Price"]').first().text().trim() || null;

  const location =
    $('div[aria-label="Location"]').first().text().trim() ||
    $('span[aria-label="Location"]').first().text().trim() ||
    null;

  const area =
    $('span[aria-label="Area"]').first().text().trim() ||
    $('span[aria-label="Area"] span').first().text().trim() ||
    null;

  const beds =
    $('span[aria-label="Beds"]').first().text().trim() ||
    $('span[aria-label="Bedrooms"]').first().text().trim() ||
    null;

  const baths =
    $('span[aria-label="Baths"]').first().text().trim() ||
    $('span[aria-label="Bathrooms"]').first().text().trim() ||
    null;

  const added =
    $('span[aria-label="Listing creation date"]').first().text().trim() ||
    null;

  let description = $('div[aria-label="Property description"]').text().trim() || "";
  if (!description) {
    const descSection = $('h3:contains("Property description")').first().parent();
    description = descSection.find("p").text().trim() || "";
  }
  if (!description) description = null;

  const gallery = [];
  $("img").each((i, el) => {
    const imgEl = $(el);
    const src =
      imgEl.attr("src") ||
      imgEl.attr("data-src") ||
      (imgEl.attr("data-srcset") ? imgEl.attr("data-srcset").split(" ")[0] : null);

    if (!src) return;

    if (src.includes("media.zameen.com") || src.includes("images.zameen.com")) {
      if (!gallery.includes(src)) gallery.push(src);
    }
  });

  let phone = null;
  const phoneEl = $('a[aria-label="Listing phone number"]').first();
  if (phoneEl && phoneEl.length) phone = phoneEl.text().trim() || null;

  const purpose = $('span[aria-label="Purpose"]').first().text().trim() || null;
  const dealType = detectDealTypeFromText(purpose || "");

  const related = extractRelatedPropertiesZameen($);
  const propertyType = inferPropertyTypeFromTitle(title || "");

  if (!title) return { ok: false };

  return {
    ok: true,
    data: {
      slug: slug || null,
      url: detailUrl,
      title,
      price,
      location,
      area,
      beds,
      baths,
      propertyType,
      added,
      description,
      gallery,
      agent: { phone },
      dealType,
      related,
      source: "zameen",
    },
  };
}

/* -------------------- GRAANA HELPERS -------------------- */

function pickBestFromSrcset(srcset = "") {
  const parts = String(srcset)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!parts.length) return null;

  const last = parts[parts.length - 1]; // usually largest
  return (last.split(" ")[0] || "").trim() || null;
}

function graanaNextImageToOriginal(raw) {
  if (!raw) return null;

  // fix html encoding (&amp;)
  let s = String(raw).trim().replace(/&amp;/g, "&");

  // if someone accidentally passed full srcset string
  if (s.includes(",")) s = pickBestFromSrcset(s) || s;

  // url-only (remove "3840w" etc)
  s = (s.split(" ")[0] || "").trim();
  if (!s) return null;

  // make absolute (relative => https://www.graana.com/...)
  let abs;
  try {
    abs = new URL(s, "https://www.graana.com");
  } catch {
    return null;
  }

  // decode /_next/image?url=...
  if (abs.pathname.startsWith("/_next/image")) {
    const inner = abs.searchParams.get("url");
    if (inner) return decodeURIComponent(inner);
  }

  return abs.toString();
}

function detectDealTypeFromGraanaTitleOrUrl(pageTitle = "", url = "") {
  const t = (pageTitle || "").toLowerCase();
  const u = (url || "").toLowerCase();
  if (t.includes("for rent") || u.includes("-rent-") || u.includes("/rent/")) return "rent";
  if (t.includes("for sale") || u.includes("-sale-") || u.includes("/sale/")) return "sale";
  return null;
}

function scrapeGraanaDetailFromHtml(html, detailUrl) {
  const $ = cheerio.load(html);

  const docTitle = $("title").first().text().trim() || null;
  const ogTitle = $("meta[property='og:title']").attr("content")?.trim() || null;
  const h1Title = $("h1").first().text().trim() || null;

  const fullTitle = ogTitle || docTitle || null;
  const cleanedTitle = h1Title || (fullTitle ? fullTitle.split("|")[0].trim() : null) || null;

  const title = cleanedTitle;

  // Price (your class)
  let price =
    $(".MuiTypography-h2New").first().text().replace(/\s+/g, " ").trim() ||
    $(".MuiTypography-h4New").first().text().replace(/\s+/g, " ").trim() ||
    null;

  if (!price) {
    const ogDesc = $("meta[property='og:description']").attr("content")?.trim() || "";
    const metaDesc = $("meta[name='description']").attr("content")?.trim() || "";
    const m = (ogDesc || metaDesc).match(/(PKR|Rs\.?)\s*[\d,]+(\.\d+)?/i);
    if (m) price = m[0];
  }

  // Beds/Baths/Area (best-effort)
  const getIconValue = (iconKey) => {
    const node = $(`img[src*='${iconKey}']`).first();
    if (!node.length) return null;
    const v1 = node.parent().next().text().trim();
    const v2 = node.parent().next().next().text().trim();
    return v1 || v2 || null;
  };

  let beds = getIconValue("bed");
  let baths = getIconValue("bath");
  let area = getIconValue("area");

  if (beds) beds = beds.replace(/[^\d]/g, "") || beds;
  if (baths) baths = baths.replace(/[^\d]/g, "") || baths;

  // Description (short bhi ho sakti hai)
  const heading = $("h2,h3,h4")
  .filter((_, el) => /description/i.test($(el).text().trim()))
  .first();

let description = null;

if (heading.length) {
  description = heading
    .parent()
    .find(".MuiTypography-subtitle2New")
    .first()
    .text()
    .replace(/\s+/g, " ")
    .trim();
}

if (!description) {
  description = $("meta[name='description']").attr("content")?.trim() || null;
}

  // Gallery: specifically from MuiImageList
  const gallery = [];
  const seen = new Set();

  const nodes = $("ul.MuiImageList-root img");
  // console.log("Graana gallery imgs in HTML:", nodes.length);

  nodes.each((_, el) => {
    const $img = $(el);

    const raw =
      pickBestFromSrcset($img.attr("srcset")) ||
      $img.attr("src") ||
      $img.attr("data-src") ||
      null;

    const finalUrl = graanaNextImageToOriginal(raw);
    if (!finalUrl) return;

    // skip placeholders/icons
    if (
      finalUrl.endsWith(".svg") ||
      finalUrl.includes("notFound.svg") ||
      finalUrl.includes("heartWhite.svg") ||
      finalUrl.includes("imageIcon.svg")
    ) return;

    // keep real photos
    if (!finalUrl.includes("images.graana.com")) return;

    if (!seen.has(finalUrl)) {
      seen.add(finalUrl);
      gallery.push(finalUrl);
    }
  });

  const dealType = detectDealTypeFromGraanaTitleOrUrl(fullTitle || "", detailUrl);
  const propertyType = inferPropertyTypeFromTitle(title || "");

  // related (optional / lightweight)
  const related = [];

  if (!title) return { ok: false };

  return {
    ok: true,
    data: {
      slug: null,
      url: detailUrl,
      title,
      price: price || null,
      location: cleanedTitle || null,
      area: area || null,
      beds: beds || null,
      baths: baths || null,
      propertyType,
      added: null,
      description: description || null,
      gallery,
      agent: { phone: null },
      dealType,
      related,
      source: "graana",
    },
  };
}

/* -------------------- MAIN HANDLER -------------------- */

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const slug = first(req.query.slug);
  const url = normalizeUrl(first(req.query.url));
  const providerHint = first(req.query.provider); // "zameen" | "graana" optional

  if (!slug && !url) {
    return res.status(400).json({ error: "slug or url query param required" });
  }

  const candidates = [];

  if (url) {
    candidates.push(url);
  } else if (slug) {
    const cleanSlug = String(slug).replace(/^\//, "").replace(/\/$/, "");
    const zameenUrl = `https://www.zameen.com/Property/${cleanSlug}.html`;
    const graanaUrl = `https://www.graana.com/property/${cleanSlug}/`;

    if (providerHint === "graana") candidates.push(graanaUrl, zameenUrl);
    else if (providerHint === "zameen") candidates.push(zameenUrl, graanaUrl);
    else candidates.push(zameenUrl, graanaUrl);
  }

  for (const detailUrl of candidates) {
    const { status, urlFinal, html } = await fetchHtml(detailUrl);

    if (status === 404) continue;

    const provider = detectProviderFromUrl(urlFinal) || detectProviderFromUrl(detailUrl);

    if (provider === "graana") {
      const out = scrapeGraanaDetailFromHtml(html, urlFinal);
      if (out.ok) {
        // Partner gallery on `partnerGallery`; placeholders on `gallery` — remove applyDetailImagePlaceholders to restore Graana photos.
        return res
          .status(200)
          .json(sanitizeScrapedPropertyDetail(applyDetailImagePlaceholders(out.data)));
      }
      continue;
    }

    // default zameen
    const out = scrapeZameenDetailFromHtml(html, urlFinal, slug || null);
    if (out.ok) {
      // Partner gallery on `partnerGallery`; placeholders on `gallery` — remove applyDetailImagePlaceholders to restore Zameen photos.
      return res
        .status(200)
        .json(sanitizeScrapedPropertyDetail(applyDetailImagePlaceholders(out.data)));
    }
  }

  return res.status(404).json({
    error: "Listing not found or blocked",
    tried: candidates,
  });
}



