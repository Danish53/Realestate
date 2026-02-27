"use client";

import { useRouter } from "next/router";
import Image from "next/image";
// Tooltip hata diya
import { FiMapPin, FiMaximize } from "react-icons/fi";
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
function VerticalCardAI({ ele }) { // debug line to check if icons are imported correctly
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
    : null;

  const isHouseOrFlat = type === "house" || type === "flat";
  const isPlot = type === "plot";

  const features = [];
  console.log("features Type:", features);

  if (isHouseOrFlat) {
    if (ele?.beds) {
      features.push({ icon: FaBed, value: ele.beds, label: "beds" });
    }
    if (ele?.baths) {
      features.push({ icon: FaBath, value: ele.baths, label: "baths" });
    }
    if (ele?.area) {
      features.push({ icon: FiMaximize, value: ele.area, label: "area" });
    }
  } else if (isPlot) {
    if (ele?.area) {
      features.push({ icon: FiMaximize, value: ele.area, label: "area" });
    }
  } else {
    if (ele?.area) {
      features.push({ icon: FiMaximize, value: ele.area, label: "area" });
    }
  }

  const propertyTypeLabel = ele?.propertyType
    ? translate(ele.propertyType)
    : translate("property");

  // Fallback image src (agar ele.image null ho)
  const imgSrc = ele?.image || placeholderImage || "/images/property-placeholder.jpg";

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

          <h3 className="property-title">{truncate(ele?.title || "", 80)}</h3>

          {/* Location */}
          <div className="property-location">
            <FiMapPin className="location-icon" size={14} />
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
                  <div className="feature-item" key={index}>
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
                  {ele.price}
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

export default VerticalCardAI;