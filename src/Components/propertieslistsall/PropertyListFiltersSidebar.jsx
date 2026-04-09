"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import { debounce } from "lodash";
import { translate } from "@/utils/helper";
import { PROPERTY_LIST_AREA_OPTIONS } from "@/data/propertyListAreaOptions";

/** Zameen `category` + matching Graana `g_type` (same mapping as searchscrape / chat flow). */
export const PROPERTY_CATEGORY_OPTIONS = [
  { label: "Houses", value: "Houses", gType: "house" },
  { label: "Flats / Apartments", value: "Flats_Apartments", gType: "flat" },
  { label: "Residential Plots", value: "Residential_Plots", gType: "plot" },
  { label: "Commercial Plots", value: "Commercial_Plots", gType: "commercial-properties" },
  { label: "Offices", value: "Offices", gType: "commercial-properties" },
  { label: "Retail Shops", value: "Retail_Shops", gType: "commercial-properties" },
  { label: "Homes", value: "Homes", gType: "residential-properties" },
];

const PLOT_CATEGORY_VALUES = new Set(["Residential_Plots", "Commercial_Plots"]);

function isPlotCategory(catValue) {
  return PLOT_CATEGORY_VALUES.has(String(catValue || ""));
}

function formatLocationLabel(citySlug, areaSlug) {
  const raw = areaSlug || citySlug || "";
  if (!raw) return "";
  return String(raw)
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function stripEmpty(query) {
  const out = {};
  Object.keys(query).forEach((k) => {
    const v = query[k];
    if (v === undefined || v === null) return;
    if (typeof v === "string" && v.trim() === "") return;
    out[k] = v;
  });
  return out;
}

function getGTypeForCategory(catValue) {
  const opt = PROPERTY_CATEGORY_OPTIONS.find((o) => o.value === catValue);
  return opt ? opt.gType : "residential-properties";
}

/** Same as pages/api/chat.js convertToSquareMeters for marla — Zameen query uses these sqm values. */
const CHAT_SQFT_PER_MARLA = 225;
const CHAT_SQFT_TO_SQM = 0.092903;

function marlaCountToSqmString(marlaStr) {
  const m = Number(String(marlaStr).trim());
  if (Number.isNaN(m) || m <= 0) return "";
  const sqm = m * CHAT_SQFT_PER_MARLA * CHAT_SQFT_TO_SQM;
  return String(Math.round(sqm * 1e6) / 1e6);
}

function sqmStringToMarlaCount(sqmStr) {
  const s = Number(String(sqmStr).trim());
  if (Number.isNaN(s) || s <= 0) return "";
  const m = s / (CHAT_SQFT_PER_MARLA * CHAT_SQFT_TO_SQM);
  return String(Math.round(m * 1e3) / 1e3);
}

function mergeFilterValues(base, partial) {
  return {
    categorySel: partial.categorySel ?? base.categorySel,
    purpose: partial.purpose ?? base.purpose,
    priceMin: partial.priceMin ?? base.priceMin,
    priceMax: partial.priceMax ?? base.priceMax,
    beds: partial.beds ?? base.beds,
    baths: partial.baths ?? base.baths,
    areaMin: partial.areaMin ?? base.areaMin,
    areaMax: partial.areaMax ?? base.areaMax,
  };
}

/**
 * @param {Record<string, unknown>} routerQuery
 * @param {object} values
 * @param {{ areaSlug: string; g_area: string } | null} locationPick — Zameen `areaSlug` + Graana `g_area`; clears city-level slugs
 */
function buildNextQuery(routerQuery, values, locationPick = null) {
  const {
    categorySel,
    purpose,
    priceMin,
    priceMax,
    beds,
    baths,
    areaMin,
    areaMax,
  } = values;
  const gType = getGTypeForCategory(categorySel);
  const pm = (priceMin || "").trim();
  const px = (priceMax || "").trim();
  const am = (areaMin || "").trim();
  const ax = (areaMax || "").trim();
  const areaMinSqm = am ? marlaCountToSqmString(am) : "";
  const areaMaxSqm = ax ? marlaCountToSqmString(ax) : "";

  const baseQuery = { ...routerQuery };
  if (locationPick) {
    delete baseQuery.citySlug;
    delete baseQuery.g_city;
    baseQuery.areaSlug = locationPick.areaSlug;
    baseQuery.g_area = locationPick.g_area;
  }

  const next = stripEmpty({
    ...baseQuery,
    page: "1",
    category: categorySel,
    g_type: gType,
    g_purpose: purpose,
    price_min: pm || undefined,
    price_max: px || undefined,
    g_minPrice: pm || undefined,
    g_maxPrice: px || undefined,
    beds_in: beds || undefined,
    baths_in: baths || undefined,
    g_bed: beds || undefined,
    g_bathroom: baths || undefined,
    area_min: areaMinSqm || undefined,
    area_max: areaMaxSqm || undefined,
    area_unit: am || ax ? "sqm" : undefined,
    g_minSize: am || undefined,
    g_maxSize: ax || undefined,
    g_sizeUnit: am || ax ? "Marla" : undefined,
    providers: routerQuery.providers || "graana,zameen",
  });
  if (isPlotCategory(categorySel)) {
    delete next.beds_in;
    delete next.baths_in;
    delete next.g_bed;
    delete next.g_bathroom;
  }
  return next;
}

const BED_BATH_OPTIONS = [
  { label: "Any", value: "" },
  ...Array.from({ length: 10 }, (_, i) => ({
    label: String(i + 1),
    value: String(i + 1),
  })),
];

/** Min/max Marla — app query keeps marla counts; API builds Zameen `area_*` as marla × 20.903. */
const MARLA_SIZE_OPTIONS = [
  { label: "Any", value: "" },
  ...Array.from({ length: 80 }, (_, i) => ({
    label: String(i + 1),
    value: String(i + 1),
  })),
];

function marlaSelectOptions(currentVal) {
  const c = (currentVal || "").trim();
  if (!c) return MARLA_SIZE_OPTIONS;
  if (MARLA_SIZE_OPTIONS.some((o) => o.value === c)) return MARLA_SIZE_OPTIONS;
  return [
    MARLA_SIZE_OPTIONS[0],
    { label: c, value: c },
    ...MARLA_SIZE_OPTIONS.slice(1),
  ];
}

const DEBOUNCE_MS = 450;

/**
 * Left sidebar filters for /properties-list-all — updates router query in real time.
 * Zameen: category, price_min/max, beds_in, baths_in, area_min/max
 * Graana: g_purpose, g_type, g_min/max Price, g_bed/bathroom, g_min/max Size, g_sizeUnit
 */
export default function PropertyListFiltersSidebar({ disabled }) {
  const router = useRouter();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [purpose, setPurpose] = useState("sale");
  const [categorySel, setCategorySel] = useState("Houses");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");

  const valuesRef = useRef({
    categorySel: "Houses",
    purpose: "sale",
    priceMin: "",
    priceMax: "",
    beds: "",
    baths: "",
    areaMin: "",
    areaMax: "",
  });

  valuesRef.current = {
    categorySel,
    purpose,
    priceMin,
    priceMax,
    beds,
    baths,
    areaMin,
    areaMax,
  };

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    setPurpose(q.g_purpose === "rent" ? "rent" : "sale");
    const cat = typeof q.category === "string" && q.category ? q.category : "Houses";
    setCategorySel(cat);
    setPriceMin(q.price_min != null ? String(q.price_min) : "");
    setPriceMax(q.price_max != null ? String(q.price_max) : "");
    if (isPlotCategory(cat)) {
      setBeds("");
      setBaths("");
    } else {
      setBeds(q.beds_in != null ? String(q.beds_in) : "");
      setBaths(q.baths_in != null ? String(q.baths_in) : "");
    }
    const au = Array.isArray(q.area_unit) ? q.area_unit[0] : q.area_unit;
    if (au === "sqm" && q.area_min != null && String(q.area_min).trim() !== "") {
      setAreaMin(sqmStringToMarlaCount(String(q.area_min)));
      setAreaMax(
        q.area_max != null && String(q.area_max).trim() !== ""
          ? sqmStringToMarlaCount(String(q.area_max))
          : ""
      );
      return;
    }
    // Chat `pageLink` has area_min in sqm but no area_unit (see pages/api/chat.js).
    if (
      (!au || au === "") &&
      q.area_min != null &&
      String(q.area_min).trim() !== "" &&
      /\d+\.\d/.test(String(q.area_min).trim())
    ) {
      setAreaMin(sqmStringToMarlaCount(String(q.area_min)));
      setAreaMax(
        q.area_max != null && String(q.area_max).trim() !== ""
          ? sqmStringToMarlaCount(String(q.area_max))
          : ""
      );
      return;
    }
    const amin =
      q.area_min != null && String(q.area_min).trim() !== ""
        ? String(q.area_min)
        : q.g_minSize != null && String(q.g_minSize).trim() !== ""
          ? String(q.g_minSize)
          : "";
    const amax =
      q.area_max != null && String(q.area_max).trim() !== ""
        ? String(q.area_max)
        : q.g_maxSize != null && String(q.g_maxSize).trim() !== ""
          ? String(q.g_maxSize)
          : "";
    setAreaMin(amin);
    setAreaMax(amax);
  }, [router.isReady, router.asPath]);

  const pushFromValues = useCallback(
    (values, locationPick = null) => {
      if (disabled) return;
      router.push(
        {
          pathname: router.pathname,
          query: buildNextQuery(router.query, values, locationPick),
        },
        undefined,
        { shallow: false }
      );
    },
    [disabled, router]
  );

  const debouncedPush = useMemo(
    () =>
      debounce(() => {
        pushFromValues(valuesRef.current);
      }, DEBOUNCE_MS),
    [pushFromValues]
  );

  useEffect(() => () => debouncedPush.cancel(), [debouncedPush]);

  /** Plots have no beds/baths — strip stale params from the URL. */
  useEffect(() => {
    if (!router.isReady || disabled) return;
    const cat =
      typeof router.query.category === "string" && router.query.category
        ? router.query.category
        : categorySel;
    if (!isPlotCategory(cat)) return;
    const q = router.query;
    const hasBeds =
      (q.beds_in != null && String(q.beds_in).trim() !== "") ||
      (q.g_bed != null && String(q.g_bed).trim() !== "");
    const hasBaths =
      (q.baths_in != null && String(q.baths_in).trim() !== "") ||
      (q.g_bathroom != null && String(q.g_bathroom).trim() !== "");
    if (!hasBeds && !hasBaths) return;
    debouncedPush.cancel();
    const v = mergeFilterValues(valuesRef.current, { beds: "", baths: "" });
    pushFromValues(v);
  }, [router.isReady, router.asPath, categorySel, disabled, debouncedPush, pushFromValues]);

  useEffect(() => {
    if (!router.isReady) return;
    const close = () => setMobileDrawerOpen(false);
    router.events.on("routeChangeComplete", close);
    return () => router.events.off("routeChangeComplete", close);
  }, [router.isReady, router.events]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMobileDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!mobileDrawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileDrawerOpen]);

  const pushImmediate = useCallback(
    (partial = {}) => {
      if (disabled) return;
      debouncedPush.cancel();
      const v = mergeFilterValues(
        {
          categorySel,
          purpose,
          priceMin,
          priceMax,
          beds,
          baths,
          areaMin,
          areaMax,
        },
        partial
      );
      pushFromValues(v);
    },
    [
      disabled,
      debouncedPush,
      pushFromValues,
      categorySel,
      purpose,
      priceMin,
      priceMax,
      beds,
      baths,
      areaMin,
      areaMax,
    ]
  );

  const handleClear = useCallback(() => {
    if (disabled) return;
    debouncedPush.cancel();
    const q = router.query;
    const base = stripEmpty({
      category: q.category || "Houses",
      citySlug: q.citySlug,
      areaSlug: q.areaSlug,
      g_area: q.g_area,
      page: "1",
      providers: q.providers || "graana,zameen",
      g_purpose: "sale",
      g_type: getGTypeForCategory(String(q.category || "Houses")),
    });
    router.push({ pathname: router.pathname, query: base }, undefined, {
      shallow: false,
    });
  }, [disabled, router, debouncedPush]);

  const locationLabel = formatLocationLabel(router.query.citySlug, router.query.areaSlug);

  const areasByGroup = useMemo(() => {
    const m = {};
    PROPERTY_LIST_AREA_OPTIONS.forEach((opt) => {
      if (!m[opt.group]) m[opt.group] = [];
      m[opt.group].push(opt);
    });
    return m;
  }, []);

  const handleAreaPick = useCallback(
    (opt) => {
      if (disabled) return;
      debouncedPush.cancel();
      pushFromValues(valuesRef.current, { areaSlug: opt.areaSlug, g_area: opt.g_area });
    },
    [disabled, debouncedPush, pushFromValues]
  );

  const firstQ = (v) => (Array.isArray(v) ? v[0] : v);
  const currentAreaSlug =
    typeof firstQ(router.query.areaSlug) === "string" ? firstQ(router.query.areaSlug) : "";
  const currentGArea =
    typeof firstQ(router.query.g_area) === "string" ? firstQ(router.query.g_area) : "";

  const liveHint =
    translate("filtersApplyLive") !== "filtersApplyLive"
      ? translate("filtersApplyLive")
      : "Filters apply as you change them. Budget updates shortly after you stop typing.";

  const filterTitle =
    translate("filterProperties") !== "filterProperties"
      ? translate("filterProperties")
      : "Filter Properties";

  return (
    <div className="prop-filters-sidebar-root">
      <button
        type="button"
        className="prop-filters-mobile-trigger"
        onClick={() => setMobileDrawerOpen(true)}
        disabled={disabled}
        aria-expanded={mobileDrawerOpen}
        aria-controls="prop-filters-drawer"
      >
        <span className="prop-filters-mobile-trigger-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </span>
        {filterTitle}
      </button>

      <div
        className={mobileDrawerOpen ? "prop-filters-mobile-backdrop is-visible" : "prop-filters-mobile-backdrop"}
        onClick={() => setMobileDrawerOpen(false)}
        role="presentation"
        aria-hidden={!mobileDrawerOpen}
      />

      <aside
        id="prop-filters-drawer"
        className={
          mobileDrawerOpen
            ? "prop-filters-sidebar prop-filters-sidebar--drawer-open"
            : "prop-filters-sidebar"
        }
        aria-label="Property filters"
        {...(mobileDrawerOpen ? { role: "dialog", "aria-modal": "true" } : {})}
      >
      <div className="prop-filters-sidebar-inner">
        <div className="prop-filters-header">
          <h3 className="prop-filters-title">{filterTitle}</h3>
          <div className="prop-filters-header-actions">
            <button
              type="button"
              className="prop-filters-drawer-close"
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="Close filters"
            >
              ×
            </button>
            <button
              type="button"
              className="prop-filters-clear-link"
              onClick={handleClear}
              disabled={disabled}
            >
              {translate("clearFilter")}
            </button>
          </div>
        </div>

        <div className="prop-filters-body">
          {/* <p className="prop-filters-live-hint">{liveHint}</p> */}

          <div className="prop-filters-field">
            <span className="prop-filters-label">Purpose</span>
            <div className="prop-filters-segment">
              <button
                type="button"
                className={
                  purpose === "sale"
                    ? "prop-filters-segment-btn active"
                    : "prop-filters-segment-btn"
                }
                onClick={() => {
                  setPurpose("sale");
                  pushImmediate({ purpose: "sale" });
                }}
                disabled={disabled}
              >
                For Sale
              </button>
              <button
                type="button"
                className={
                  purpose === "rent"
                    ? "prop-filters-segment-btn active"
                    : "prop-filters-segment-btn"
                }
                onClick={() => {
                  setPurpose("rent");
                  pushImmediate({ purpose: "rent" });
                }}
                disabled={disabled}
              >
                For Rent
              </button>
            </div>
          </div>

          <div className="prop-filters-field">
            <label className="prop-filters-label" htmlFor="prop-filter-category">
              Property type
            </label>
            <select
              id="prop-filter-category"
              className="prop-filters-input"
              value={categorySel}
              onChange={(e) => {
                const v = e.target.value;
                setCategorySel(v);
                if (isPlotCategory(v)) {
                  setBeds("");
                  setBaths("");
                  pushImmediate({ categorySel: v, beds: "", baths: "" });
                } else {
                  pushImmediate({ categorySel: v });
                }
              }}
              disabled={disabled}
            >
              {PROPERTY_CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {locationLabel ? (
            <div className="prop-filters-field prop-filters-location-readonly">
              <span className="prop-filters-label">Location</span>
              <p className="prop-filters-location-text">{locationLabel}</p>
            </div>
          ) : null}

          <div className="prop-filters-field prop-filters-areas-field">
            <span className="prop-filters-label">
              {translate("selectArea") !== "selectArea"
                ? translate("selectArea")
                : "Areas"}
            </span>
            {/* <p className="prop-filters-areas-hint">
              {translate("areaPickHint") !== "areaPickHint"
                ? translate("areaPickHint")
                : "Click an area to set location for both listing sources."}
            </p> */}
            <div className="prop-filters-areas-scroll" role="listbox" aria-label="Areas">
              {Object.keys(areasByGroup).map((group) => (
                <div key={group} className="prop-filters-area-group">
                  <span className="prop-filters-area-group-title">{group}</span>
                  <div className="prop-filters-area-chips">
                    {areasByGroup[group].map((opt) => {
                      const active =
                        currentAreaSlug === opt.areaSlug && currentGArea === opt.g_area;
                      return (
                        <button
                          key={`${opt.areaSlug}-${opt.g_area}`}
                          type="button"
                          role="option"
                          aria-selected={active}
                          className={
                            active ? "prop-filters-area-chip active" : "prop-filters-area-chip"
                          }
                          onClick={() => handleAreaPick(opt)}
                          disabled={disabled}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="prop-filters-field">
            <span className="prop-filters-label">Budget (PKR)</span>
            <div className="prop-filters-row-2">
              <input
                type="text"
                inputMode="numeric"
                className="prop-filters-input"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => {
                  const v = e.target.value;
                  valuesRef.current = { ...valuesRef.current, priceMin: v };
                  setPriceMin(v);
                  debouncedPush();
                }}
                disabled={disabled}
                aria-label="Minimum price"
              />
              <span className="prop-filters-dash">—</span>
              <input
                type="text"
                inputMode="numeric"
                className="prop-filters-input"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => {
                  const v = e.target.value;
                  valuesRef.current = { ...valuesRef.current, priceMax: v };
                  setPriceMax(v);
                  debouncedPush();
                }}
                disabled={disabled}
                aria-label="Maximum price"
              />
            </div>
          </div>

          {!isPlotCategory(categorySel) ? (
            <div className="prop-filters-field">
              <span className="prop-filters-label">Beds & baths</span>
              <div className="prop-filters-row-2">
                <div className="prop-filters-select-wrap">
                  <label className="prop-filters-sublabel" htmlFor="prop-filter-beds">
                    Beds
                  </label>
                  <select
                    id="prop-filter-beds"
                    className="prop-filters-input"
                    value={beds}
                    onChange={(e) => {
                      const v = e.target.value;
                      setBeds(v);
                      pushImmediate({ beds: v });
                    }}
                    disabled={disabled}
                  >
                    {BED_BATH_OPTIONS.map((o) => (
                      <option key={`b-${o.value}`} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="prop-filters-select-wrap">
                  <label className="prop-filters-sublabel" htmlFor="prop-filter-baths">
                    Baths
                  </label>
                  <select
                    id="prop-filter-baths"
                    className="prop-filters-input"
                    value={baths}
                    onChange={(e) => {
                      const v = e.target.value;
                      setBaths(v);
                      pushImmediate({ baths: v });
                    }}
                    disabled={disabled}
                  >
                    {BED_BATH_OPTIONS.map((o) => (
                      <option key={`ba-${o.value}`} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : null}

          <div className="prop-filters-field">
            <span className="prop-filters-label">Size (Marla)</span>
            {/* <p className="prop-filters-marla-hint">
              {translate("marlaFilterHint") !== "marlaFilterHint"
                ? translate("marlaFilterHint")
                : "Min/max Marla; Zameen link uses internal area (marla × 20.903). Graana uses Marla + same numbers."}
            </p> */}
            <div className="prop-filters-row-2">
              <div className="prop-filters-select-wrap">
                <label className="prop-filters-sublabel" htmlFor="prop-filter-marla-min">
                  Min
                </label>
                <select
                  id="prop-filter-marla-min"
                  className="prop-filters-input"
                  value={areaMin}
                  onChange={(e) => {
                    const v = e.target.value;
                    let nextMax = areaMax;
                    if (v && nextMax && Number(v) > Number(nextMax)) {
                      nextMax = v;
                    }
                    setAreaMin(v);
                    setAreaMax(nextMax);
                    pushImmediate({ areaMin: v, areaMax: nextMax });
                  }}
                  disabled={disabled}
                >
                  {marlaSelectOptions(areaMin).map((o) => (
                    <option key={`mmin-${o.value || "any"}`} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="prop-filters-select-wrap">
                <label className="prop-filters-sublabel" htmlFor="prop-filter-marla-max">
                  Max
                </label>
                <select
                  id="prop-filter-marla-max"
                  className="prop-filters-input"
                  value={areaMax}
                  onChange={(e) => {
                    const v = e.target.value;
                    let nextMin = areaMin;
                    if (v && nextMin && Number(nextMin) > Number(v)) {
                      nextMin = v;
                    }
                    setAreaMin(nextMin);
                    setAreaMax(v);
                    pushImmediate({ areaMin: nextMin, areaMax: v });
                  }}
                  disabled={disabled}
                >
                  {marlaSelectOptions(areaMax).map((o) => (
                    <option key={`mmax-${o.value || "any"}`} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
    </div>
  );
}
