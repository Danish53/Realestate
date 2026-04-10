/** Replaces third-party portal names in listing copy with this site’s brand. */
const SITE_BRAND = "AI Land MKT";

function stripInvisible(s) {
  return String(s).replace(/[\u200B-\u200D\uFEFF]/g, "");
}

export function sanitizeListingBrandText(text) {
  if (text == null || text === "") return text;
  let s = stripInvisible(text);

  // Full URLs
  s = s.replace(/https?:\/\/(?:www\.)?graana\.com[^\s<)"']*/gi, SITE_BRAND);
  s = s.replace(/https?:\/\/(?:www\.)?zameen\.com[^\s<)"']*/gi, SITE_BRAND);

  // Domain mentions (with or without www.)
  s = s.replace(/(?:www\.)?graana\.com/gi, SITE_BRAND);
  s = s.replace(/(?:www\.)?zameen\.com/gi, SITE_BRAND);

  // Word-boundary variants (handles "Graana.com", "graana . com", etc.)
  s = s.replace(/\bgraana\s*\.?\s*com\b/gi, SITE_BRAND);
  s = s.replace(/\bzameen\s*\.?\s*com\b/gi, SITE_BRAND);

  s = s.replace(/\bgraana\b/gi, SITE_BRAND);
  s = s.replace(/\bzameen\b/gi, SITE_BRAND);

  s = s.replace(/\s{2,}/g, " ").trim();
  return s;
}

export function sanitizePropertyListingBrands(property) {
  if (!property || typeof property !== "object") return property;
  const next = { ...property };
  if (next.title != null) next.title = sanitizeListingBrandText(next.title);
  if (next.description != null) next.description = sanitizeListingBrandText(next.description);
  return next;
}

/** Shape from /api/scrapePropertyDetail (Graana / Zameen scrape). */
export function sanitizeScrapedPropertyDetail(detail) {
  if (!detail || typeof detail !== "object") return detail;
  const out = { ...detail };
  if (out.title != null) out.title = sanitizeListingBrandText(out.title);
  if (out.description != null) out.description = sanitizeListingBrandText(out.description);
  if (Array.isArray(out.related)) {
    out.related = out.related.map((r) => {
      if (!r || typeof r !== "object") return r;
      return {
        ...r,
        ...(r.title != null && { title: sanitizeListingBrandText(r.title) }),
      };
    });
  }
  return out;
}
