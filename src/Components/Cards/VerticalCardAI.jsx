"use client";

import { useRouter } from "next/router";
import Image from "next/image";
import { FiMapPin } from "react-icons/fi";
import { FaBed, FaBath } from "react-icons/fa";
import { MdSquareFoot } from "react-icons/md";
import { translate, truncate } from "@/utils/helper";
import { useState } from "react";

/**
 * Vertical card matching reference: image on top (top corners rounded), pill tag, title, description, bed/bath/plot, Show More.
 * ele = { title, price, location, area, link, image, beds, baths, propertyType, added }
 */
function VerticalCardAI({ ele, category }) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);

  let slug = null;
  if (ele?.link) {
    try {
      const u = new URL(ele.link);
      const path = u.pathname;
      slug = path
        .replace(/^\/Property\//, "")
        .replace(/^\/property\//, "")
        .replace(/\.html$/, "")
        .split("?")[0];
    } catch {
      slug = null;
    }
  }

  const handleCardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (slug) {
      router.push(`/property-details/${slug}`);
    } else if (ele?.link) {
      window.open(ele.link, "_blank");
    }
  };

  const type = ele?.propertyType
    ? ele.propertyType.toLowerCase()
    : category ? category.toLowerCase() : null;
  const houseTypes = ["house", "houses", "home", "homes", "flat", "apartment", "villa", "bungalow", "penthouse"];
  const plotTypes = ["plot", "plots", "residential_plot", "commercial_plot"];
  const officeTypes = ["office", "offices"];
  const retailTypes = ["shop", "shops", "retail_shop", "retail_shops"];

  function formatArea(area, unit = null) {
    if (area == null || area === "") return "";
    if (typeof area === "object" && area.value != null) {
      unit = area.unit || unit;
      area = area.value;
    }
    if (typeof area === "string") {
      const s = area.replace(/\s+/g, " ").trim();
      if (/(marla|kanal|sq\s?ft|square\s?feet|sq\s?yd|sq\s?m|sqm|square\s?meter)/i.test(s)) return s;
      const n = parseFloat(s.replace(/,/g, ""));
      if (!Number.isFinite(n)) return s;
      area = n;
    }
    const v = Number(area);
    if (!Number.isFinite(v)) return "";
    const u = (unit || "").toLowerCase();
    if (u === "sqft" || u === "sq ft") return `${Math.round(v)} sqft`;
    if (u === "sqyd") return `${v} sq yd`;
    if (u === "sqm") return `${v.toFixed(2)} sqm`;
    if (u === "kanal") return `${v} Kanal`;
    if (u === "marla") return v === 20 ? "1 Kanal" : `${v} Marla`;
    if (v >= 1000) return `${Math.round(v)} sqft`;
    if (v === 20) return "1 Kanal";
    if (v > 0 && v <= 200) return `${v} Marla`;
    return String(v);
  }

  const isHouseOrFlat = houseTypes.includes(type);
  const isPlot = plotTypes.includes(type);
  const isOffice = officeTypes.includes(type?.toLowerCase());
  const isRetail = retailTypes.includes(type?.toLowerCase());

  const features = [];
  if (isHouseOrFlat) {
    if (ele?.beds) features.push({ icon: FaBed, value: ele.beds, label: "Beds" });
    if (ele?.baths) features.push({ icon: FaBath, value: ele.baths, label: "Baths" });
    if (ele?.area) features.push({ icon: MdSquareFoot, value: formatArea(ele.area), label: "Area" });
  } else if (isPlot || isOffice || isRetail) {
    if (ele?.area) features.push({ icon: MdSquareFoot, value: formatArea(ele.area), label: "Area" });
  } else {
    if (ele?.area) features.push({ icon: MdSquareFoot, value: formatArea(ele.area), label: "Area" });
  }

  const propertyTypeLabel = ele?.propertyType ? translate(ele.propertyType) : category ? translate(category) : null;

  function formatPrice(price) {
    if (price == null || price === "") return "";
    if (typeof price === "string") {
      const s = price.replace(/\s+/g, " ").trim();
      if (/price on call|call|contact/i.test(s)) return s;
      if (/(crore|cr\b|lakh|lac)/i.test(s)) return s;
      const n = parseFloat(s.replace(/[^0-9.]/g, ""));
      if (!Number.isFinite(n)) return s;
      price = n;
    }
    if (typeof price === "number" && Number.isFinite(price)) {
      if (price >= 10000000) return (price / 10000000).toFixed(2).replace(/\.00$/, "") + " Crore";
      if (price >= 100000) return (price / 100000).toFixed(2).replace(/\.00$/, "") + " Lakh";
      return Math.round(price).toLocaleString("en-PK");
    }
    return String(price);
  }

  const imgSrc = ele?.image || "/images/property-placeholder.jpg";
  const title = truncate(ele?.title || `${propertyTypeLabel || translate("property")} ${formatPrice(ele?.price) || ""}`, 60);
  const description = truncate(ele?.location || "", 80);

  return (
    <div
      className="rounded-[1.25rem] overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col h-full mb-2"
      onClick={handleCardClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCardClick(e); } }}
      role="button"
      tabIndex={0}
      aria-label={ele?.title || "View property"}
    >
      {/* Image – full width top, only top corners rounded (like reference) */}
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        )}
        <Image
          loading="lazy"
          className={`object-cover w-full h-full transition-transform duration-500 hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          src={imgSrc}
          alt={ele?.title || "Property"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => { e.currentTarget.src = "/images/property-placeholder.jpg"; }}
        />
        {/* Pill tag top-left – light grey like reference (Villa, Condo, House, General) */}
        {propertyTypeLabel && (
          <span className="absolute top-4 left-4 bg-gray-100 text-gray-800 text-sm font-medium px-4 py-2 rounded-full shadow-sm">
            {propertyTypeLabel}
          </span>
        )}
      </div>

      {/* Content – title, description, bed/bath/plot, price, Show More */}
      <div className="px-2 py-3 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2 line-clamp-2">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2 flex items-start gap-1.5">
            <FiMapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <span>{description}</span>
          </p>
        )}

        {features.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 mb-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              if (!Icon) return null;
              return (
                <div key={index} className="flex items-center gap-2 text-gray-700">
                  <Icon className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="text-sm font-medium">
                    {feature.value} {feature.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {ele?.added && (
          <p className="text-xs text-gray-400 mb-2">{truncate(ele.added, 30)}</p>
        )}

        {ele?.price && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-base font-semibold text-gray-900 mb-3">
              Price:
            </p>
            <p className="text-base font-semibold text-gray-900 mb-3">
              {formatPrice(ele.price)}
            </p>
          </div>
        )}

        <div className="mt-auto flex items-center gap-1.5 text-gray-900 font-semibold text-sm group/link">
          <span className="underline decoration-gray-700/50 group-hover/link:decoration-primary-500 group-hover/link:text-primary-600 transition-colors">
            {translate("showMore")}
          </span>
          <svg
            className="w-4 h-4 shrink-0 group-hover/link:translate-x-0.5 transition-transform"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default VerticalCardAI;
