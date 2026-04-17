/**
 * Category-based placeholder images (Unsplash CDN — replace with your own URLs anytime).
 *
 * RESTORE Zameen / Graana photos later:
 * - Listings (`/api/searchscrape`): use each item’s `partnerListingImage` as `image` again
 *   (stop calling `applyListingImagePlaceholders` in `pages/api/searchscrape.js`).
 * - Detail (`/api/scrapePropertyDetail`): use `partnerGallery` as `gallery` again
 *   (stop calling `applyDetailImagePlaceholders` in `pages/api/scrapePropertyDetail.js`).
 */

const IMG = "auto=format&w=720&q=75&fit=max";

/** ~5 images per category; listings cycle with `index % length`. */
const CATEGORY_PLACEHOLDER_IMAGES = {
  house: [
    `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?${IMG}`,
    `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?${IMG}`,
    `https://images.unsplash.com/photo-1512917774080-9991f1c4c750?${IMG}`,
    `https://images.unsplash.com/photo-1570129477492-45c003edd2be?${IMG}`,
    `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?${IMG}`,
    `https://images.unsplash.com/photo-1484154218962-a197022b5858?${IMG}`,
    `https://images.unsplash.com/photo-1580587771525-78b9dba3b914?${IMG}`,
    `https://images.unsplash.com/photo-1523217582562-09d0def993a6?${IMG}`,
    `https://images.unsplash.com/photo-1618220179428-22790b461013?${IMG}`,
  ],
  flat: [
    `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?${IMG}`,
    `https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?${IMG}`,
    `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?${IMG}`,
    `https://images.unsplash.com/photo-1493809842364-78817add7ffb?${IMG}`,
    `https://images.unsplash.com/photo-1484154218962-a197022b5858?${IMG}`,
  ],
  plot: [
    `https://images.unsplash.com/photo-1586859821397-c81e4971ca82?${IMG}`,
    `https://images.unsplash.com/photo-1586859821520-523558cbebe8?${IMG}`,
    `https://images.unsplash.com/photo-1655664191079-6c19bb3662f3?${IMG}`,
    `https://images.unsplash.com/photo-1627841758557-0e9f3d7b531d?${IMG}`,
    `https://images.unsplash.com/photo-1621767466463-7290946b3d3c?${IMG}`,
    `https://images.unsplash.com/photo-1758742395962-f36a9004de9d?${IMG}`,
    `https://images.unsplash.com/photo-1581529563074-70f5657e99bd?${IMG}`,
    `https://images.unsplash.com/photo-1621767466463-7290946b3d3c?${IMG}`,
    `https://images.unsplash.com/photo-1663079402880-97a2e68aafc7?${IMG}`,
    `https://images.unsplash.com/photo-1621767466463-7290946b3d3c?${IMG}`,
  ],
  office: [
    `https://images.unsplash.com/photo-1497366216548-37526070297c?${IMG}`,
    `https://images.unsplash.com/photo-1497366811353-6870744d04b2?${IMG}`,
    `https://images.unsplash.com/photo-1524758631624-e2822e304c36?${IMG}`,
    `https://images.unsplash.com/photo-1504384308090-c894fdcc538d?${IMG}`,
    `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?${IMG}`,
  ],
  shop: [
    `https://images.unsplash.com/photo-1441986300917-64674bd600d8?${IMG}`,
    `https://images.unsplash.com/photo-1555529909-5bac613e4e2d?${IMG}`,
    `https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?${IMG}`,
    `https://images.unsplash.com/photo-1604719312566-8912e9227c6a?${IMG}`,
    `https://images.unsplash.com/photo-1600880292203-757bb62b4baf?${IMG}`,
  ],
  commercial: [
    `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?${IMG}`,
    `https://images.unsplash.com/photo-1497366216548-37526070297c?${IMG}`,
    `https://images.unsplash.com/photo-1441986300917-64674bd600d8?${IMG}`,
    `https://images.unsplash.com/photo-1504384308090-c894fdcc538d?${IMG}`,
    `https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?${IMG}`,
  ],
  default: [
    `https://images.unsplash.com/photo-1560518883-ce09059eeffa?${IMG}`,
    `https://images.unsplash.com/photo-1580587771525-78b9dba3b914?${IMG}`,
    `https://images.unsplash.com/photo-1600585154526-990dced4db0d?${IMG}`,
    `https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?${IMG}`,
    `https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?${IMG}`,
  ],
};

function normalizeCategoryKey(property = {}) {
  const raw = String(property.propertyType || property.type || "").toLowerCase();
  const title = String(property.title || "").toLowerCase();
  const hay = `${raw} ${title}`;

  if (/\b(plot|plots|residential_plot|commercial_plot|land|file)\b/.test(hay)) return "plot";
  if (/\b(flat|apartment|apartments|penthouse)\b/.test(hay)) return "flat";
  if (/\b(office|offices)\b/.test(hay)) return "office";
  if (/\b(shop|shops|retail)\b/.test(hay)) return "shop";
  if (/\b(commercial)\b/.test(hay)) return "commercial";
  if (/\b(house|home|homes|houses|villa|bungalow|portion)\b/.test(hay)) return "house";
  return "default";
}

export function getListingPlaceholderImage(property, listingIndex = 0) {
  const key = normalizeCategoryKey(property);
  const urls = CATEGORY_PLACEHOLDER_IMAGES[key] || CATEGORY_PLACEHOLDER_IMAGES.default;
  const pool = urls.length ? urls : CATEGORY_PLACEHOLDER_IMAGES.default;
  const i = Math.abs(Number(listingIndex)) || 0;
  return pool[i % pool.length];
}

/**
 * Search listing cards: keeps Zameen/Graana URL on `partnerListingImage`, sets `image` to placeholder.
 */
export function applyListingImagePlaceholders(properties) {
  if (!Array.isArray(properties)) return properties;
  return properties.map((p, idx) => {
    if (!p || typeof p !== "object") return p;
    const partnerListingImage = p.image;
    return {
      ...p,
      partnerListingImage,
      image: getListingPlaceholderImage(p, idx),
    };
  });
}

/**
 * Detail page: keeps scraped gallery in `partnerGallery`, replaces `gallery` with category placeholders.
 * Related cards: `partnerListingImage` + placeholder `image`.
 */
export function applyDetailImagePlaceholders(detail) {
  if (!detail || typeof detail !== "object") return detail;

  const partnerGallery = Array.isArray(detail.gallery) ? [...detail.gallery] : [];
  const key = normalizeCategoryKey(detail);
  const pool =
    CATEGORY_PLACEHOLDER_IMAGES[key] || CATEGORY_PLACEHOLDER_IMAGES.default;
  const gallery = (pool.length ? pool : CATEGORY_PLACEHOLDER_IMAGES.default).slice();

  const related = Array.isArray(detail.related)
    ? detail.related.map((r, i) => {
        if (!r || typeof r !== "object") return r;
        return {
          ...r,
          partnerListingImage: r.image,
          image: getListingPlaceholderImage({ title: r.title, propertyType: r.propertyType }, i),
        };
      })
    : detail.related;

  return {
    ...detail,
    partnerGallery,
    gallery,
    related,
  };
}
