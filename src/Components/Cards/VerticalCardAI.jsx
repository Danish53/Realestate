"use client";

import { useRouter } from "next/router";
import Image from "next/image";
// Tooltip hata diya
import { FiMapPin, FiMaximize } from "react-icons/fi";
import { MdSquareFoot } from "react-icons/md"; // modern area icon
import { FaBed, FaBath } from "react-icons/fa"
import {
  translate,
  truncate,
  // yahan assume kar raha hun placeholderImage ek URL string hai (e.g. "/images/placeholder.jpg")
  placeholderImage,
} from "@/utils/helper";
import { useState } from "react";

/**
 * ele = {
 *   title, price, location, area, link, image, added,
 *   beds, baths, propertyType
 * }
 */
function VerticalCardAI({ ele, category }) { // debug line to check if icons are imported correctly
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);

  // --- slug nikalna link se ---
  let slug = null;
  if (ele?.link) {
    try {
      const u = new URL(ele.link);
      const path = u.pathname; // "/Property/...-53557154-1448-1.html"
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

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // --- Features logic: plot vs house/flat ---
  const type = ele?.propertyType
    ? ele.propertyType.toLowerCase()
    : category ? category.toLowerCase() : null;

  const houseTypes = [
  "house",
  "houses",
  "home",
  "homes",
  "flat",
  "apartment",
  "villa",
  "bungalow",
  "penthouse"
];

function formatArea(area, unit = null) {
  if (area == null || area === "") return "";

  // If backend ever sends { value, unit }
  if (typeof area === "object" && area.value != null) {
    unit = area.unit || unit;
    area = area.value;
  }

  // If string contains a unit, return nicely
  if (typeof area === "string") {
    const s = area.replace(/\s+/g, " ").trim();

    // If already has units, just return it
    if (/(marla|kanal|sq\s?ft|square\s?feet|sq\s?yd|square\s?yards?|sq\s?m|sqm|square\s?meter)/i.test(s)) {
      return s;
    }

    // else try parse number
    const n = parseFloat(s.replace(/,/g, ""));
    if (!Number.isFinite(n)) return s;
    area = n;
  }

  const v = Number(area);
  if (!Number.isFinite(v)) return "";

  const u = (unit || "").toLowerCase();

  // Explicit unit handling
  if (u === "sqft" || u === "sq ft") return `${Math.round(v)} sqft`;
  if (u === "sqyd") return `${v} sq yd`;
  if (u === "sqm") return `${v.toFixed(2)} sqm`;
  if (u === "kanal") return `${v} Kanal`;
  if (u === "marla") return v === 20 ? "1 Kanal" : `${v} Marla`;

  // Heuristic fallback (when unit is missing)
  if (v >= 1000) return `${Math.round(v)} sqft`;     // likely sqft
  if (v === 20) return "1 Kanal";                    // your special case
  if (v > 0 && v <= 200) return `${v} Marla`;        // likely marla

  return String(v);
}

const isHouseOrFlat = houseTypes.includes(type);
  const plotTypes = ["plot", "plots", "residential_plot", "commercial_plot"];

const isPlot = plotTypes.includes(type);

const officeTypes = ["office", "offices"];
const retailTypes = ["shop", "shops", "retail_shop", "retail_shops"];
const isOffice = officeTypes.includes(type?.toLowerCase());
const isRetail = retailTypes.includes(type?.toLowerCase());

  const features = [];
  // console.log("features Type:", features);

  if (isHouseOrFlat) {
    if (ele?.beds) {
      features.push({ icon: FaBed, value: ele.beds, label: "beds" });
    }
    if (ele?.baths) {
      features.push({ icon: FaBath, value: ele.baths, label: "baths" });
    }
    if (ele?.area) {
      features.push({ icon: MdSquareFoot, value: formatArea(ele.area), label: "area" });
    }
  } else if (isPlot) {
    if (ele?.area) {
      features.push({ icon: MdSquareFoot, value: formatArea(ele.area), label: "area" });
    } else if (isOffice || isRetail) {
      if (ele?.area) {
        features.push({ icon: FiMaximize, value: formatArea(ele.area), label: "area" });
      }
    }
  } else {
    if (ele?.area) {
      features.push({ icon: MdSquareFoot, value: formatArea(ele.area), label: "area" });
    }
  }

  const propertyTypeLabel = ele?.propertyType 
    ? translate(ele.propertyType)
    : category ? translate(category)
    : null;

  // Fallback image src (agar ele.image null ho)
  const imgSrc = ele?.image || placeholderImage || "/images/property-placeholder.jpg";

function formatPrice(price) {
  if (price == null || price === "") return "";

  // If already a meaningful string, keep it
  if (typeof price === "string") {
    const s = price.replace(/\s+/g, " ").trim();

    // special cases
    if (/price on call|call|contact/i.test(s)) return s;

    // if already in crore/lakh/lac/cr => return as-is
    if (/(crore|cr\b|lakh|lac)/i.test(s)) return s;

    // extract numeric from "PKR 12,500,000" / "Rs. 12,500,000"
    const numeric = s.replace(/[^0-9.]/g, ""); // keep digits + dot only
    const n = parseFloat(numeric);
    if (!Number.isFinite(n)) return s;

    price = n;
  }

  // number formatting
  if (typeof price === "number" && Number.isFinite(price)) {
    if (price >= 10000000) {
      return (price / 10000000).toFixed(2).replace(/\.00$/, "") + " Crore";
    }
    if (price >= 100000) {
      return (price / 100000).toFixed(2).replace(/\.00$/, "") + " Lakh";
    }
    // below lakh: show with commas
    return Math.round(price).toLocaleString("en-PK");
  }

  return String(price);
}

  return (
    <div className="property-card" onClick={handleCardClick}>
      <div className="property-card-inner">
        {/* Image Section */}
        <div className="property-image-section">
          <div className="property-image-wrapper">
            {!imageLoaded && <div className="image-skeleton"></div>}
            <Image
              loading="lazy"
              className={`property-image ${imageLoaded ? "loaded" : ""}`}
              src={imgSrc}
              alt={ele?.title || "Property"}
              width={400}
              height={300}
              onLoad={handleImageLoad}
              onError={(e) => {
                // agar error aaye to fallback set karo
                e.currentTarget.src = "/images/property-placeholder.jpg";
              }}
            />

            {/* Overlay Gradient */}
            <div className="image-overlay"></div>

            {/* Property Type Tag */}
            {ele?.propertyType && (
              <span className={`property-type-tag ${type}`}>
                {propertyTypeLabel}
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="property-content-section">
          {/* Category & Title */}
          <div className="property-category">
            <span className="category-name">
              {propertyTypeLabel || translate("property")}
            </span>
          </div>

{/* dummy title */}
          <h3 className="property-title">{truncate(ele?.title || `${translate(ele?.propertyType || "property")} ${translate("for")} ${formatPrice(ele?.price) || ""}`, 80)}</h3>

          {/* Location */}
          <div className="property-location">
            <FiMapPin className="" size={14} />
            <span className="location-text">
              {ele?.location || ""}
            </span>
          </div>

          {/* Features Grid (beds/baths/area ya sirf area) */}
          {features.length > 0 && (
            <div className="property-features">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                if (!Icon) return null; // safety guard
                return (
                  <div className="" key={index}>
                    <Icon className="feature-icon" size={16} />
                    <span className="feature-value">{feature.value}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Added time */}
          {ele?.added && (
            <div className="property-added">
              <span>{truncate(ele.added, 30)}</span>
            </div>
          )}

          {/* Footer with Price + View details */}
          <div className="property-footer">
            {ele?.price && (
              <div className="price-section">
                <span className="price-label">{translate("price")}</span>
                <span className="price-value">
                  {formatPrice(ele.price)}
                </span>
              </div>
            )}

            <div className="view-details">
              <span className="view-text">{translate("viewDetails")}</span>
              <svg
                className="arrow-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

<style jsx>{`
        .location-icon {
          color: #F36E61 !important;
          margin-right: 4px;
        }
  `}</style>

export default VerticalCardAI;