// pages/api/detail.js
import axios from "axios";
import * as cheerio from "cheerio";


function extractRelatedProperties($) {
  const related = [];

  // Sirf sabhi listing cards pakro, container ki tension chhor do
  const cards = $('[role="article"][aria-label="Listing"]');
  console.log("extractRelatedProperties: cards found = ", cards.length);

  cards.each((i, el) => {
    const card = $(el);

    // Listing link
    const linkEl = card.find('a[aria-label="Listing link"]').first();
    const relativeHref = linkEl.attr("href") || "";
    let link = relativeHref;
    if (link && !link.startsWith("http")) {
      link = "https://www.zameen.com" + link;
    }

    const title =
      linkEl.attr("title")?.trim() ||
      card.find("h4").first().text().trim() ||
      "";

    const price = card
      .find('span[aria-label="Price"]')
      .first()
      .text()
      .trim();

    const location = card
      .find('div[aria-label="Location"]')
      .first()
      .text()
      .trim();

    const area =
      card
        .find('span[aria-label="Area"] span')
        .first()
        .text()
        .trim() || null;

    // Image
    let image = null;
    let imgEl = card
      .find(
        'img[aria-label="Listing photo"], img[aria-label="Fallback listing photo"]'
      )
      .first();

    if (!imgEl.length) imgEl = card.find("picture img").first();
    if (!imgEl.length) imgEl = card.find("img").first();

    if (imgEl && imgEl.length) {
      image =
        imgEl.attr("src") ||
        imgEl.attr("data-src") ||
        (imgEl.attr("data-srcset")
          ? imgEl.attr("data-srcset").split(" ")[0]
          : null) ||
        null;
    }

    const added =
      card
        .find('span[aria-label="Listing creation date"]')
        .first()
        .text()
        .trim() || null;

    related.push({
      title,
      price,
      location,
      area,
      link,
      image,
      added,
    });
  });

  return related;
}

export default async function handler(req, res) {
  const { slug, url } = req.query;

  if (!slug && !url) {
    return res.status(400).json({
      error: "slug or url query param required",
    });
  }

  // Detail URL build karo
  const detailUrl = url || `https://www.zameen.com/Property/${slug}.html`;

  try {
    const { data: html } = await axios.get("https://api.zenrows.com/v1/", {
      params: {
        url: detailUrl,
        apikey: process.env.ZENROWS_KEY,
        js_render: "false",
        premium_proxy: "false",
        // proxy_country: "pk",
        // agar detail page slow load ho to:
        // wait_for: "h1", // ya koi unique selector
    //     actions: JSON.stringify([
    //   {
    //     action: "click",
    //     selector: 'button[aria-label="Show phone number"]',
    //   },
    // ]),
    // // 2) phone anchor appear hone tak wait karo
    // wait_for: 'a[aria-label="Listing phone number"]',
      },
    });

    const $ = cheerio.load(html);

    // -------- BASIC FIELDS --------

    // Title – detail page pe pehla h1 ya koi specific selector
    const title =
      $("h1").first().text().trim() ||
      $('h1[aria-label="Title"]').first().text().trim() ||
      null;

    // Price
    const price =
      $('span[aria-label="Price"]').first().text().trim() ||
      null;

    // Location / address (detail page pe structure different ho sakta hai)
    const location =
      $('div[aria-label="Location"]').first().text().trim() ||
      $('span[aria-label="Location"]').first().text().trim() ||
      null;

    // Area
    const area =
      $('span[aria-label="Area"]').first().text().trim() ||
      $('span[aria-label="Area"] span').first().text().trim() ||
      null;

    // Beds / Baths
    const bedsText =
      $('span[aria-label="Beds"]').first().text().trim() ||
      $('span[aria-label="Bedrooms"]').first().text().trim() ||
      null;

    const bathsText =
      $('span[aria-label="Baths"]').first().text().trim() ||
      $('span[aria-label="Bathrooms"]').first().text().trim() ||
      null;

    const beds = bedsText || null;
    const baths = bathsText || null;

    // Added date (agar available ho)
    const added =
      $('span[aria-label="Listing creation date"]').first().text().trim() ||
      null;

    // -------- DESCRIPTION --------

    // Zameen detail page me description ke liye different selectors ho sakte hain;
    // tum Inspect karke adjust kar lena:
    let description =
      $('div[aria-label="Property description"]').text().trim() || "";

    if (!description) {
      // fallback: koi section jisme "Description" heading ho
      const descSection = $('h3:contains("Property description")')
        .first()
        .parent();
      description = descSection.find("p").text().trim() || "";
    }

    if (!description) description = null;

    // -------- GALLERY IMAGES --------

const gallery = [];

$("img").each((i, el) => {
  const imgEl = $(el);
  const src =
    imgEl.attr("src") ||
    imgEl.attr("data-src") ||
    (imgEl.attr("data-srcset")
      ? imgEl.attr("data-srcset").split(" ")[0]
      : null);

  if (!src) return;

  // Sirf Zameen ke image CDN ko allow karo
  if (
    src.includes("media.zameen.com") ||
    src.includes("images.zameen.com")
  ) {
    if (!gallery.includes(src)) {
      gallery.push(src);
    }
  }
});

    // Agar detail page me koi aur gallery wrapper ho to usko bhi check kar sakte ho:
    // $(".some-gallery-class img").each(...)

    // -------- PROPERTY TYPE (approx) --------

    let propertyType = null;
    try {
      const lowerTitle = (title || "").toLowerCase();
      if (/plot|plots?|file/.test(lowerTitle)) propertyType = "plot";
      else if (/house|home|villa|portion/.test(lowerTitle)) propertyType = "house";
      else if (/flat|apartment/.test(lowerTitle)) propertyType = "flat";
    } catch {}

    let phone = null;
    // Phone number (agar available ho)
    const phoneEl = $('a[aria-label="Listing phone number"]').first();
    if (phoneEl && phoneEl.length) {
      phone = phoneEl.text().trim() || null;
    }

    const purpose =
  $('span[aria-label="Purpose"]').first().text().trim() || null;

let dealType = null;
if (purpose) {
  if (/sale/i.test(purpose)) dealType = "sale";
  else if (/rent|lease/i.test(purpose)) dealType = "rent";
}

  const related = extractRelatedProperties($);

    // -------- FINAL RESPONSE --------

    return res.status(200).json({
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
      agent: {
        phone,
      },
      dealType,
        related,
    });
  } catch (error) {
    console.error("detail scrape error:", error.message);
    return res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
}