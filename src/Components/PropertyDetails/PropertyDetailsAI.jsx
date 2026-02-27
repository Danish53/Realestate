"use client";
import React, { useEffect, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import { useRouter } from "next/router";
import Image from "next/image";

import Layout from "../Layout/Layout";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import Loader from "@/Components/Loader/Loader";
import NoData from "../NoDataFound/NoData";
import withAuth from "../Layout/withAuth";

import { translate, placeholderImage } from "@/utils/helper";

// SAME Google Map component jo tum upar wale file mein use kar rahe thay
import Map from "@/Components/GoogleMap/GoogleMap";

// SAME Mortgage Calculator jo upar wale file mein sidebar mein use ho raha tha
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

const PropertyDetailsAI = () => {
  const router = useRouter();
  const { slug } = router.query;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(null);

  // Lightbox state (simple)
  const [viewerIsOpen, setViewerIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

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

  // ---------------- Helpers ----------------

  const openLightbox = (index) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  };

  const closeLightbox = () => {
    setCurrentImage(0);
    setViewerIsOpen(false);
  };

  const renderKeyFacts = () => {
    if (!detail) return null;
    const { propertyType, area, beds, baths } = detail;

    if (propertyType === "plot") {
      return (
        <div className="key-facts d-flex flex-wrap gap-3 my-2">
          {area && (
            <span className="badge bg-light text-dark">
              {translate ? translate("area") : "Area"}: {area}
            </span>
          )}
        </div>
      );
    }

    return (
      <div className="key-facts d-flex flex-wrap gap-3 my-2">
        {area && (
          <span className="badge bg-light text-dark">
            {translate ? translate("area") : "Area"}: {area}
          </span>
        )}
        {beds && beds !== "-" && (
          <span className="badge bg-light text-dark">
            {translate ? translate("beds") : "Beds"}: {beds}
          </span>
        )}
        {baths && baths !== "-" && (
          <span className="badge bg-light text-dark">
            {translate ? translate("baths") : "Baths"}: {baths}
          </span>
        )}
      </div>
    );
  };

  const renderGallery = () => {
    if (!detail?.gallery || !detail.gallery.length) return null;

    return (
      <div className="card mb-3">
        <div className="card-header">
          {translate ? translate("gallery") : "Gallery"}
        </div>
        <div className="card-body">
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

  // Address + Map (same idea as original component, but simplified)
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
      <div className="card mb-3" id="propertie_address">
        <div className="card-header">
          {translate ? translate("address") : "Address"}
        </div>
        <div className="card-body">
          {hasLocationText && (
            <div className="mb-3">
              <strong>{translate ? translate("address") : "Address"}:</strong>
              <div>{detail.location}</div>
            </div>
          )}

          {(hasCoordinates || hasLocationText) && (
            <div className="card google_map">
              {hasCoordinates ? (
                // Tumhara custom GoogleMap component (lat/lng se)
                <Map latitude={detail.latitude} longitude={detail.longitude} />
              ) : (
                // Fallback: sirf address se Google Maps iframe
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
      <div className="card my-4">
        <div className="card-header">
          {translate ? translate("similarProperties") : "Similar Properties"}
        </div>
        <div className="card-body">
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
                        ` • ${item.beds} ${
                          translate ? translate("beds") : "Beds"
                        }`}
                      {item.baths &&
                        item.baths !== "-" &&
                        ` • ${item.baths} ${
                          translate ? translate("baths") : "Baths"
                        }`}
                    </div>
                    {item.added && (
                      <div className="small text-muted mt-1">
                        {item.added}
                      </div>
                    )}
                  </div>
                </a>
              </div>
            ))}
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
      <Breadcrumb
        data={{
          type: detail.dealType || "",
          title: detail.title,
          loc: detail.location,
          propertyType: detail.propertyType,
          time: detail.added,
          price: detail.price,
          // is_favourite: false,
          propId: detail.slug,
          title_img: detail.gallery?.[0] || "",
          rentduration: "",
          admin_status: "",
          propertyStatus: "",
          // isUser: false,
          // promoted: false,
        }}
      />

      <section className="properties-deatil-page">
        <div id="all-prop-deatil-containt">
          <div className="container">
            <div className="row" id="prop-all-deatils-cards">
              {/* LEFT COLUMN */}
              <div className="col-12 col-md-12 col-lg-9" id="prop-deatls-card">
                {/* Title + basic info */}
                <div className="card mb-3">
                  <div className="card-body">
                    <h1 className="h4 mb-2">{detail.title}</h1>

                    {detail.location && (
                      <div className="text-muted mb-1">
                        {detail.location}
                      </div>
                    )}

                    <div className="d-flex flex-wrap align-items-center gap-3 mt-2">
                      {detail.price && (
                        <span className="h5 text-success mb-0">
                          {detail.price}
                        </span>
                      )}
                      {detail.propertyType && (
                        <span className="badge bg-secondary text-uppercase">
                          {detail.propertyType}
                        </span>
                      )}
                      {detail.added && (
                        <span className="small text-muted">
                          {translate ? translate("added") : "Added"}:{" "}
                          {detail.added}
                        </span>
                      )}
                      {detail.dealType && (
                        <span className="badge bg-info text-uppercase">
                          {detail.dealType}
                        </span>
                      )}
                    </div>

                    {renderKeyFacts()}

                    {/* {detail.url && (
                      <div className="mt-2">
                        <a
                          href={detail.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          View on source
                        </a>
                      </div>
                    )} */}
                  </div>
                </div>

                {/* Gallery */}
                {renderGallery()}

                {/* Address + Map */}
                {renderAddressAndMap()}

                {/* Description */}
                {detail.description && (
                  <div className="card about-propertie mb-3">
                    <div className="card-header">
                      {translate
                        ? translate("aboutProp")
                        : "About this property"}
                    </div>
                    <div className="card-body">
                      <p
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxHeight: expanded ? "none" : "8rem",
                          marginBottom: 0,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {detail.description}
                      </p>

                      {detail.description.length > 400 && (
                        <button
                          type="button"
                          className="btn btn-link p-0 mt-2"
                          onClick={() => setExpanded(!expanded)}
                        >
                          <span>{expanded ? "Show Less" : "Show More"}</span>
                          {expanded ? (
                            <AiOutlineArrowLeft className="mx-2" size={18} />
                          ) : (
                            <AiOutlineArrowRight className="mx-2" size={18} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Similar / related properties */}
                {renderRelated()}
              </div>

              {/* RIGHT COLUMN – Contact + Mortgage Calculator */}
              <div className="col-12 col-md-12 col-lg-3">
                {/* Contact Card */}
                <div className="card mb-3">
                  <div className="card-header">
                    {translate ? translate("contact") : "Contact"}
                  </div>
                  <div className="card-body">
                    {detail.agent?.phone ? (
                      <>
                        <div className="mb-2">
                          {translate ? translate("phone") : "Phone"}:
                        </div>
                        <a
                          href={`tel:${detail.agent.phone}`}
                          className="btn btn-success w-100"
                        >
                          {detail.agent.phone}
                        </a>
                      </>
                    ) : (
                      <div className="text-muted">
                        {translate
                          ? translate("phoneNotAvailable")
                          : "Phone number not available"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mortgage Calculator – same style as original */}
                {canShowMortgageCalculator && (
                  <div className="mortage_cal_details">
                    {/* data prop mein detail bhej diya, plus property_type "sell" set kar diya
                        taake MortgageCalculator waise hi behave kare jaise original mein  */}
                    <MortgageCalculator
                      data={{ ...detail, property_type: detail.dealType }}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* End main row */}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default withAuth(PropertyDetailsAI);