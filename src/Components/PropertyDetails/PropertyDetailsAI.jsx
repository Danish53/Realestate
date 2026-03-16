"use client";
import React, { useEffect, useState } from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import { useRouter } from "next/router";
import Image from "next/image";
import { FiHome, FiMapPin, FiCalendar, FiBed, FiBath, FiSquare } from "react-icons/fi";

import { translate, placeholderImage } from "@/utils/helper";

import Layout from "../Layout/Layout";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import Loader from "../Loader/Loader";
import NoData from "../NoDataFound/NoData";
import withAuth from "../Layout/withAuth";
import GoogleMap from "../GoogleMap/GoogleMap";
import MortgageCalculator from "../MortgageCalculator/MortgageCalculator";

const PropertyDetailsAI = () => {
  const router = useRouter();
  const { slug } = router.query;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(null);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  // Fetch scraped detail
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
        setDetail(data);
      } catch (err) {
        console.error("Error fetching detail:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [router.isReady, slug]);

  const openLightbox = (index) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  };

  const closeLightbox = () => {
    setCurrentImage(0);
    setViewerIsOpen(false);
  };

  const renderGallery = () => {
    if (!detail?.gallery || !detail.gallery.length) return null;

    return (
      <div className="prop-detail-card">
        <div className="prop-detail-card-header">
          <span className="prop-detail-card-accent" />
          <h3 className="prop-detail-card-title">{translate("gallery")}</h3>
        </div>
        <div className="prop-detail-card-body">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {detail.gallery.map((src, idx) => (
              <button
                type="button"
                key={`${src}-${idx}`}
                onClick={() => openLightbox(idx)}
                className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <Image
                  src={src}
                  alt={detail.title || "Property image"}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                  onError={(e) => placeholderImage(e)}
                />
              </button>
            ))}
          </div>

          {viewerIsOpen && (
            <div
              className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center"
              onClick={closeLightbox}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Escape" && closeLightbox()}
              aria-label="Close"
            >
              <div
                className="relative max-w-[90vw] max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={detail.gallery[currentImage]}
                  alt=""
                  className="max-w-full max-h-[90vh] object-contain"
                />
                <button
                  type="button"
                  onClick={closeLightbox}
                  className="absolute top-2 right-2 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800"
                  aria-label="Close"
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
          <h3 className="prop-detail-card-title">{translate("address")}</h3>
        </div>
        <div className="prop-detail-card-body">
          {hasLocationText && (
            <div className="mb-4">
              <span className="prop-detail-feature-label">{translate("address")}</span>
              <p className="prop-detail-feature-value mt-1">{detail.location}</p>
            </div>
          )}
          {(hasCoordinates || hasLocationText) && (
            <div className="prop-detail-map-wrap rounded-lg overflow-hidden">
              {hasCoordinates ? (
                <GoogleMap latitude={detail.latitude} longitude={detail.longitude} />
              ) : (
                <div className="relative w-full aspect-video">
                  <iframe
                    title="Location"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(detail.location)}&output=embed`}
                    className="absolute inset-0 w-full h-full border-0"
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
      <div className="prop-detail-card">
        <div className="prop-detail-card-header">
          <span className="prop-detail-card-accent" />
          <h3 className="prop-detail-card-title">{translate("similarProperties")}</h3>
        </div>
        <div className="prop-detail-card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {detail.related.map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                {item.image && (
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-2 bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => placeholderImage(e)}
                    />
                  </div>
                )}
                <h6 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.title}</h6>
                {item.price && (
                  <p className="text-primary-600 font-semibold text-sm">{item.price}</p>
                )}
                {item.location && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{item.location}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
                  {item.area && <span>{item.area}</span>}
                  {item.beds && item.beds !== "-" && <span>{item.beds} {translate("beds")}</span>}
                  {item.baths && item.baths !== "-" && <span>{item.baths} {translate("baths")}</span>}
                </div>
                {item.added && (
                  <p className="text-xs text-gray-400 mt-1">{item.added}</p>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const canShowMortgageCalculator = !!detail?.price && detail?.dealType !== "rent";

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
        <Breadcrumb title={translate("propertyDetails") || "Property Details"} />
        <section className="prop-detail-page">
          <div className="prop-detail-container">
            <p className="text-red-600">{error}</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (!detail) {
    return (
      <Layout>
        <Breadcrumb title={translate("propertyDetails") || "Property Details"} />
        <section className="prop-detail-page">
          <div className="prop-detail-container">
            <NoData />
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Breadcrumb title={detail.title} />

      <section className="prop-detail-page">
        <div className="prop-detail-container">
          {/* Hero card */}
          <div className="prop-detail-hero-card">
            <div className="prop-detail-hero-accent" />
            <div className="prop-detail-hero-body">
              <div className="prop-detail-hero-top">
                <div className="prop-detail-hero-left">
                  <div className="prop-detail-hero-icon">
                    <FiHome className="text-white text-2xl" />
                  </div>
                  <div>
                    <div className="prop-detail-badges">
                      {detail.propertyType && (
                        <span className="prop-detail-badge prop-detail-badge-primary">
                          {translate(detail.propertyType)}
                        </span>
                      )}
                      {detail.dealType && (
                        <span
                          className={`prop-detail-badge ${
                            detail.dealType === "sell"
                              ? "prop-detail-badge-sell"
                              : "prop-detail-badge-rent"
                          }`}
                        >
                          {translate(detail.dealType)}
                        </span>
                      )}
                    </div>
                    <h1 className="prop-detail-title">{detail.title}</h1>
                  </div>
                </div>
                <div className="prop-detail-price-wrap">
                  {detail.price && (
                    <>
                      <span className="prop-detail-price-label">{translate("price")}</span>
                      <span className="prop-detail-price">{detail.price}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Quick stats */}
              <div className="prop-detail-quick-stats">
                {detail.location && (
                  <div className="prop-detail-stat">
                    <FiMapPin className="prop-detail-stat-icon" />
                    <div>
                      <span className="prop-detail-stat-label">{translate("location")}</span>
                      <p className="prop-detail-stat-value truncate">{detail.location}</p>
                    </div>
                  </div>
                )}
                {detail.added && (
                  <div className="prop-detail-stat">
                    <FiCalendar className="prop-detail-stat-icon" />
                    <div>
                      <span className="prop-detail-stat-label">{translate("added")}</span>
                      <p className="prop-detail-stat-value">{detail.added}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Specs */}
              <div className="prop-detail-specs">
                {detail.beds && detail.beds !== "-" && (
                  <div className="prop-detail-spec">
                    <div className="prop-detail-spec-icon prop-detail-spec-bed">
                      <FiBed />
                    </div>
                    <div>
                      <span className="prop-detail-spec-label">{translate("bedrooms")}</span>
                      <p className="prop-detail-spec-value">{detail.beds}</p>
                    </div>
                  </div>
                )}
                {detail.baths && detail.baths !== "-" && (
                  <div className="prop-detail-spec">
                    <div className="prop-detail-spec-icon prop-detail-spec-bath">
                      <FiBath />
                    </div>
                    <div>
                      <span className="prop-detail-spec-label">{translate("bathrooms")}</span>
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
                      <span className="prop-detail-spec-label">{translate("area")}</span>
                      <p className="prop-detail-spec-value">{detail.area}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="prop-detail-layout">
            <div className="prop-detail-main">
              {renderGallery()}

              {detail.description && (
                <div className="prop-detail-card">
                  <div className="prop-detail-card-header">
                    <span className="prop-detail-card-accent" />
                    <h3 className="prop-detail-card-title">{translate("aboutProp")}</h3>
                  </div>
                  <div className="prop-detail-card-body">
                    <p className={`prop-detail-desc-text ${!expanded ? "line-clamp-4" : ""}`}>
                      {detail.description}
                    </p>
                    {(detail.description.length > 250 || detail.description.split("\n").length > 3) && (
                      <button
                        type="button"
                        onClick={() => setExpanded(!expanded)}
                        className="prop-detail-read-more"
                      >
                        <span>{expanded ? "Show Less" : "Read More"}</span>
                        <AiOutlineArrowRight className="ml-2" size={18} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {renderAddressAndMap()}
              {renderRelated()}
            </div>

            <div className="prop-detail-sidebar">
              <div className="prop-detail-sidebar-card p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {translate("contactUs") || translate("contact") || "Contact"}
                </h3>
                <a
                  href="tel:03238450741"
                  className="block w-full py-3 px-4 text-center font-semibold text-white rounded-lg transition-colors ds-btn ds-btn-primary"
                  aria-label="Call now"
                >
                  {translate("call") || "Call Now"}
                </a>
              </div>

              {canShowMortgageCalculator && (
                <div className="mortage_cal_details mt-6">
                  <MortgageCalculator
                    data={{ ...detail, property_type: detail.dealType }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default withAuth(PropertyDetailsAI);