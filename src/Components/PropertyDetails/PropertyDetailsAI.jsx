"use client";
import React, { useEffect, useMemo, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import { FiHome, FiMapPin, FiCalendar, FiSquare, FiPhoneCall } from "react-icons/fi";
import { FaBed, FaBath, FaWhatsapp } from "react-icons/fa";
import { useRouter } from "next/router";
import Image from "next/image";

import Layout from "../Layout/Layout";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import Loader from "@/Components/Loader/Loader";
import NoData from "../NoDataFound/NoData";
import withAuth from "../Layout/withAuth";

import { translate, placeholderImage } from "@/utils/helper";
import { sanitizeScrapedPropertyDetail } from "@/utils/sanitizeListingBrandText";

import Map from "@/Components/GoogleMap/GoogleMap";
import MortgageCalculator from "../MortgageCalculator/MortgageCalculator";

/**
 * EXPECTED API RESPONSE SHAPE (/api/scrapePropertyDetail?slug=...)
 *
 * {
 *   slug: string,
 *   url: string,
 *   title: string,
 *   price: string,
 *   location: string,
 *   area: string,
 *   beds: string | null,
 *   baths: string | null,
 *   propertyType: "plot" | "house" | "flat" | null,
 *   added: string | null,
 *   description: string | null,
 *   gallery: string[],
 *   agent: { phone: string | null },
 *
 *   // OPTIONAL: map ke liye
 *   latitude?: number | null,
 *   longitude?: number | null,
 *
 *   // OPTIONAL: calculator show karne ke liye
 *   // "sale" ho to calculator, "rent" ho to nahi
 *   dealType?: "sale" | "rent" | null,
 *
 *   related: Array<{
 *      title: string,
 *      price: string,
 *      location: string,
 *      area: string,
 *      beds: string | null,
 *      baths: string | null,
 *      link: string,
 *      image: string,
 *      added: string | null
 *   }>
 * }
 */

const DEFAULT_WHATSAPP_DISPLAY = "03238450741";

/** Local PK / +92 → wa.me digits (no +), e.g. 0323… → 92323… */
function toWhatsAppIntlDigits(input) {
  const d = String(input || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("92")) return d;
  if (d.startsWith("0") && d.length >= 10) return `92${d.slice(1)}`;
  if (d.length === 10) return `92${d}`;
  return d;
}

function buildWhatsAppPropertyHref(intlDigits, pageUrl, detail) {
  if (!intlDigits) return "#";
  const title = detail?.title?.trim();
  const price = detail?.price?.trim();
  const loc = detail?.location?.trim();
  const lines = [
    "Hello!",
    "",
    "I am interested in this property on AI Land MKT:",
    "",
  ];
  if (title) lines.push(title);
  if (price) lines.push(`Price: ${price}`);
  if (loc) lines.push(`Location: ${loc}`);
  lines.push("");
  lines.push("Listing link:");
  lines.push(pageUrl || "—");
  const qs = new URLSearchParams({ text: lines.join("\n") });
  return `https://wa.me/${intlDigits}?${qs.toString()}`;
}

const PropertyDetailsAI = () => {
  const router = useRouter();
  const { slug } = router.query;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(null);

  // Lightbox state
  const [viewerIsOpen, setViewerIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [showMap, setShowMap] = useState(false);

  // ---------------- Fetch scraped detail ----------------
  useEffect(() => {
    if (!router.isReady || !slug) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/scrapePropertyDetail?slug=${encodeURIComponent(slug)}`
        );
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        const data = await res.json();

        setDetail(sanitizeScrapedPropertyDetail(data));
      } catch (err) {
        console.error("Error fetching detail:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [router.isReady, slug]);

  const [propertyPageUrl, setPropertyPageUrl] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || !router.isReady) return;
    const path = router.asPath.split("?")[0].split("#")[0];
    setPropertyPageUrl(`${window.location.origin}${path}`);
  }, [router.isReady, router.asPath]);

  const displayWhatsapp =
    (detail?.agent?.phone && String(detail.agent.phone).trim()) ||
    DEFAULT_WHATSAPP_DISPLAY;

  const whatsappIntlDigits = useMemo(
    () => toWhatsAppIntlDigits(displayWhatsapp),
    [displayWhatsapp]
  );

  const whatsappHref = useMemo(() => {
    if (!detail || !whatsappIntlDigits) return "#";
    return buildWhatsAppPropertyHref(
      whatsappIntlDigits,
      propertyPageUrl,
      detail
    );
  }, [detail, propertyPageUrl, whatsappIntlDigits]);

  // ---------------- Helpers ----------------

  
  const openLightbox = (index) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  };

  const closeLightbox = () => {
    setCurrentImage(0);
    setViewerIsOpen(false);
  };

  const handleShowMap = () => setShowMap(true);

  // Gallery – original working implementation (card + grid + simple lightbox)
  const renderGallery = () => {
    if (!detail?.gallery || !detail.gallery.length) return null;

    

    return (
      <div className="prop-detail-card">
        <div className="prop-detail-card-header">
          <span className="prop-detail-card-accent" />
          <h3 className="prop-detail-card-title">
            {translate ? translate("Gallery") : "Gallery"}
          </h3>
        </div>
        <div className="prop-detail-card-body">
          <div className="row g-2">
            {detail.gallery.map((src, idx) => (
              <div
                className="col-6 col-md-3"
                key={`${src}-${idx}`}
                onClick={() => openLightbox(idx)}
                style={{ cursor: "pointer" }}
              >
                <div className="ratio ratio-4x3 position-relative">
                  <Image
                    src={src}
                    alt={detail.title || "Property image"}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    style={{ objectFit: "cover" }}
                    onError={placeholderImage}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Simple lightbox */}
          {viewerIsOpen && (
            <div
              className="lightbox-backdrop"
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={closeLightbox}
            >
              <div
                style={{
                  maxWidth: "90vw",
                  maxHeight: "90vh",
                  position: "relative",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={detail.gallery[currentImage]}
                  alt="Large"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
                <button
                  type="button"
                  onClick={closeLightbox}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    background: "#000",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Address + Map (prop-detail-card design)
  const renderAddressAndMap = () => {
    if (!detail) return null;

    const hasLocationText = Boolean(detail.location);
    const hasCoordinates =
      detail.latitude != null &&
      detail.latitude !== "" &&
      detail.longitude != null &&
      detail.longitude !== "";

    if (!hasLocationText && !hasCoordinates) return null;

    return (
      <div className="prop-detail-card" id="propertie_address">
        <div className="prop-detail-card-header">
          <span className="prop-detail-card-accent" />
          <h3 className="prop-detail-card-title">
            {translate ? translate("location") : "Location"}
          </h3>
        </div>
        <div className="prop-detail-card-body">
          {hasLocationText && (
            <div className="prop-detail-address-grid">
              <div className="prop-detail-address-item">
                <span className="prop-detail-address-label">
                  {translate ? translate("address") : "Address"}
                </span>
                <p className="prop-detail-address-value">{detail.location}</p>
              </div>
            </div>
          )}
          {(hasCoordinates || hasLocationText) && (
            <div className="prop-detail-map-wrap">
              {hasCoordinates ? (
                showMap ? (
                  <Map latitude={detail.latitude} longitude={detail.longitude} />
                ) : (
                  <div className="prop-detail-map-placeholder">
                    <div className="prop-detail-map-blur" />
                    <button
                      type="button"
                      onClick={handleShowMap}
                      className="prop-detail-map-btn"
                    >
                      <FiMapPin size={20} />
                      {translate ? translate("ViewMap") : "View Map"}
                    </button>
                  </div>
                )
              ) : (
                <div className="ratio ratio-16x9">
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      detail.location
                    )}&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRelated = () => {
    if (!detail?.related || !detail.related.length) return null;
    return (
      <div className="prop-detail-similar">
        <div className="prop-detail-card">
          <div className="prop-detail-card-header">
            <span className="prop-detail-card-accent" />
            <h3 className="prop-detail-card-title">
              {translate ? translate("similarProperties") : "Similar Properties"}
            </h3>
          </div>
          <div className="prop-detail-card-body">
            <div className="row g-3">
              {detail.related.map((item, idx) => (
                <div className="col-12 col-md-6 col-lg-4" key={idx}>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none text-dark"
                  >
                    <div className="border rounded h-100 p-2">
                      {item.image && (
                        <div className="ratio ratio-4x3 mb-2">
                          <img
                            src={item.image}
                            alt={item.title}
                            style={{ objectFit: "cover", width: "100%" }}
                            onError={placeholderImage}
                          />
                        </div>
                      )}
                      <h6 className="mb-1">{item.title}</h6>
                      {item.price && (
                        <div className="text-success fw-bold">{item.price}</div>
                      )}
                      {item.location && (
                        <div className="small text-muted">{item.location}</div>
                      )}
                      <div className="small mt-1">
                        {item.area && <span>{item.area}</span>}
                        {item.beds &&
                          item.beds !== "-" &&
                          ` • ${item.beds} ${translate ? translate("beds") : "Beds"}`}
                        {item.baths &&
                          item.baths !== "-" &&
                          ` • ${item.baths} ${translate ? translate("baths") : "Baths"}`}
                      </div>
                      {item.added && (
                        <div className="small text-muted mt-1">{item.added}</div>
                      )}
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Calculator kab show karein?
  // - Price ho
  // - Aur dealType "rent" na ho (ya dealType defined hi na ho)
  const canShowMortgageCalculator =
    !!detail?.price && detail?.dealType !== "rent";

  // ---------------- Render ----------------

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Breadcrumb />
        <div className="container py-5">
          <p className="text-danger">{error}</p>
        </div>
      </Layout>
    );
  }

  if (!detail) {
    return (
      <Layout>
        <Breadcrumb />
        <div className="row">
          <div className="col-12 pb-5">
            <NoData />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Breadcrumb title={detail.title} />

      <section className="prop-detail-page">
        <div className="prop-detail-container">
          {/* Hero overview card – same design as PropertyDetails */}
          <div className="prop-detail-hero-card">
            <div className="prop-detail-hero-accent" />
            <div className="prop-detail-hero-body">
              <div className="prop-detail-hero-top">
                <div className="prop-detail-hero-left">
                  {/* <div className="prop-detail-hero-icon">
                    <FiHome className="text-white text-2xl" />
                  </div> */}
                  <div>
                    <div className="prop-detail-badges">
                      {detail.propertyType && (
                        <span className="prop-detail-badge prop-detail-badge-primary">
                          {detail.propertyType}
                        </span>
                      )}
                      {detail.dealType && (
                        <span
                          className={`prop-detail-badge ${
                            detail.dealType === "sale" || detail.dealType === "sell"
                              ? "prop-detail-badge-sell"
                              : "prop-detail-badge-rent"
                          }`}
                        >
                          {detail.dealType === "sale" || detail.dealType === "sell"
                            ? (translate ? translate("sell") : "Sale")
                            : (translate ? translate("rent") : "Rent")}
                        </span>
                      )}
                    </div>
                    <h1 className="prop-detail-title">{detail.title}</h1>
                  </div>
                </div>
                <div className="prop-detail-price-wrap">
                  <span className="prop-detail-price-label">
                    {translate ? translate("price") : "Price"}
                  </span>
                  <span className="prop-detail-price">{detail.price || "—"}</span>
                </div>
              </div>

              {/* Quick stats */}
              <div className="prop-detail-quick-stats">
                {detail.location && (
                  <div className="prop-detail-stat">
                    <FiMapPin className="prop-detail-stat-icon" />
                    <div>
                      <span className="prop-detail-stat-label">Location</span>
                      <p className="prop-detail-stat-value truncate">{detail.location}</p>
                    </div>
                  </div>
                )}
                {detail.added && (
                  <div className="prop-detail-stat">
                    <FiCalendar className="prop-detail-stat-icon" />
                    <div>
                      <span className="prop-detail-stat-label">Posted</span>
                      <p className="prop-detail-stat-value">{detail.added}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Specs: beds, baths, area */}
              <div className="prop-detail-specs">
                {detail.beds && detail.beds !== "-" && (
                  <div className="prop-detail-spec">
                    <div className="prop-detail-spec-icon prop-detail-spec-bed">
                      <FaBed />
                    </div>
                    <div>
                      <span className="prop-detail-spec-label">Bedrooms</span>
                      <p className="prop-detail-spec-value">{detail.beds}</p>
                    </div>
                  </div>
                )}
                {detail.baths && detail.baths !== "-" && (
                  <div className="prop-detail-spec">
                    <div className="prop-detail-spec-icon prop-detail-spec-bath">
                      <FaBath />
                    </div>
                    <div>
                      <span className="prop-detail-spec-label">Bathrooms</span>
                      <p className="prop-detail-spec-value">{detail.baths}</p>
                    </div>
                  </div>
                )}
                {detail.area && (
                  <div className="prop-detail-spec">
                    <div className="prop-detail-spec-icon prop-detail-spec-area">
                      <FiSquare />
                    </div>
                    <div>
                      <span className="prop-detail-spec-label">Area</span>
                      <p className="prop-detail-spec-value">{detail.area}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="prop-detail-layout">
            {/* Main content */}
            <div className="prop-detail-main">
              {/* Gallery – original working implementation */}
              {renderGallery()}

              {/* About / Description */}
              {detail.description && (
                <div className="prop-detail-card">
                  <div className="prop-detail-card-header">
                    <span className="prop-detail-card-accent" />
                    <h3 className="prop-detail-card-title">
                      {translate ? translate("aboutProp") : "About this property"}
                    </h3>
                  </div>
                  <div className="prop-detail-card-body">
                    <p
                      className={`prop-detail-desc-text ${!expanded ? "line-clamp-4" : ""}`}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {detail.description}
                    </p>
                    {detail.description.length > 400 && (
                      <button
                        type="button"
                        onClick={() => setExpanded(!expanded)}
                        className="prop-detail-read-more"
                      >
                        <span>{expanded ? "Show Less" : "Read More"}</span>
                        {expanded ? (
                          <AiOutlineArrowLeft size={18} />
                        ) : (
                          <AiOutlineArrowRight size={18} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Address + Map */}
              {renderAddressAndMap()}
            </div>

            {/* Sidebar */}
            <aside className="prop-detail-sidebar">
              <div className="prop-detail-sidebar-card">
                <div className="prop-detail-card-header">
                  <span className="prop-detail-card-accent" />
                  <h3 className="prop-detail-card-title">
                    {translate ? translate("Contact") : "Contact"}
                  </h3>
                </div>
                {/* {detail?.agent?.phone && ( */}
                  <div className="flex flex-col">
                    {whatsappIntlDigits && (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-3 rounded-xl  hover:bg-gray-50 hover:shadow-sm transition-all group"
                        aria-label={`${translate("whatsapp")} ${displayWhatsapp}`}
                      >
                        <div className="w-12 h-12 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center group-hover:scale-105 transition-all shrink-0">
                          <FaWhatsapp size={26} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-gray-500">{translate("whatsapp")}</span>
                          <span className="text-gray-900 font-semibold truncate text-[15px]">{displayWhatsapp}</span>
                        </div>
                      </a>
                    )}
                    {/* <a
                      href={`tel:03238450741`}
                      className="flex items-center gap-4 p-3 rounded-xl  hover:bg-gray-50 hover:shadow-sm transition-all group"
                      aria-label={`${translate("call")} ${"03238450741"}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-green-100 transition-all shrink-0">
                        <FiPhoneCall size={22} className="group-hover:animate-pulse" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-gray-500">{translate("call")}</span>
                        <span className="text-gray-900 font-semibold truncate text-[15px]">{"03238450741"}</span>
                      </div>
                    </a> */}
                  </div>
                {/* )} */}
              </div>

              {/* {canShowMortgageCalculator && (
                <div className="prop-detail-sidebar-card">
                  <MortgageCalculator
                    data={{ ...detail, property_type: detail.dealType }}
                  />
                </div>
              )} */}
            </aside>
          </div>

          {/* Similar properties – same as PropertyDetails */}
          {detail.related && detail.related.length > 0 && renderRelated()}
        </div>
      </section>
    </Layout>
  );
};

export default withAuth(PropertyDetailsAI);