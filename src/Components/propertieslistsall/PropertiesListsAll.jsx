
"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ViewPageImg from "@/assets/Images/Breadcrumbs.jpg";
import Layout from "@/Components/Layout/Layout";
import GridCard from "../AllPropertyUi/GridCard";
import CustomHorizontalSkeleton from "../Skeleton/CustomHorizontalSkeleton";
import VerticalCardSkeleton from "../Skeleton/VerticalCardSkeleton";
import Link from "next/link";
import AllPropertieCard from "../AllPropertyUi/AllPropertieCard";
import VerticalCard from "../Cards/VerticleCard";
import AllPropertyCardAI from "../AllPropertyUi/AllPropertyCardAI";
import VerticalCardAI from "../Cards/VerticalCardAI";

// Size parsing (same logic jo tum backend me use kar rahe ho)
function parseSizeFromText(text = "") {
  const sizeRegex =
    /(\d+(\.\d+)?)\s*(marla|kanal|sq ?ft|square feet|sq ?yd|square yards?|sq ?y?d?s?|square meter|sq ?m|acre|acres)\b/i;
  const m = text.toLowerCase().match(sizeRegex);
  if (!m) return { size: null, sizeUnit: null };

  const num = parseFloat(m[1]);
  let unitRaw = m[3].toLowerCase();
  let unit = unitRaw;

  if (unitRaw.includes("marla")) unit = "marla";
  else if (unitRaw.includes("kanal")) unit = "kanal";
  else if (unitRaw.includes("sq m") || unitRaw.includes("square meter"))
    unit = "sqm";
  else if (unitRaw.includes("sq ft") || unitRaw.includes("square feet"))
    unit = "sqft";
  else if (unitRaw.includes("sq yd") || unitRaw.includes("square yard"))
    unit = "sqyd";
  else if (unitRaw.startsWith("acre")) unit = "acre";

  return { size: num, sizeUnit: unit };
}

const PropertiesListsAll = () => {
  const router = useRouter();
  const {
    category,
    citySlug,
    areaSlug,
    page = "1",
    size,
    sizeUnit,
    minPrice,
    maxPrice,
    beds,
    baths,
  } = router.query;

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scrapedUrl, setScrapedUrl] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [grid, setGrid] = useState(true);

  // Backend se properties lao
    useEffect(() => {
      if (!router.isReady) return;

      // Category + citySlug/areaSlug required for /api/searchscrape
      if (!category || (!citySlug && !areaSlug)) {
        setLoading(false);
        setError("Missing category or location in URL.");
        return;
      }

      async function load() {
        try {
          setLoading(true);
          setError("");

          const qs = new URLSearchParams();
          qs.append("category", category);
          qs.append("page", String(page || 1));
          if (areaSlug) qs.append("areaSlug", areaSlug);
          else if (citySlug) qs.append("citySlug", citySlug);

          const res = await fetch(`/api/searchscrape?${qs.toString()}`);
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Failed to fetch properties");
          }

          setScrapedUrl(data.url || null);
           // API se total pages (backend me data.totalPages aa raha hai)
          setTotalPages(data.totalPages || 1);

          let list = data.properties || [];

          // Optional client-side size filter (e.g. 5 marla / 1 kanal)
          if (size && sizeUnit) {
            const targetSize = Number(size);
            const targetUnit = sizeUnit.toLowerCase();
            list = list.filter((p) => {
              const parsed = parseSizeFromText(p.area || "");
              return (
                parsed.size === targetSize &&
                parsed.sizeUnit &&
                parsed.sizeUnit.toLowerCase() === targetUnit
              );
            });
          }

          // Beds / baths / price filters ko bhi yahan apply kar sakte ho
          // (p.price string hai "3.1 Crore" isko parse karna alag logic hoga)

          setProperties(list);
        } catch (err) {
          console.error("Properties load error:", err);
          setError(err.message || "Failed to load properties.");
        } finally {
          setLoading(false);
        }
      }

      load();
    }, [router.isReady, category, citySlug, areaSlug, page, size, sizeUnit, minPrice, maxPrice, beds, baths]);

  const pageNum = Number(page || 1);

  const goToPage = (newPage) => {
    if (newPage < 1) return;
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          page: String(newPage),
        },
      },
      undefined,
      { shallow: false }
    );
  };

  return (
    <Layout>
      <div
        id="breadcrumb"
        style={{
          backgroundImage: `url(${ViewPageImg.src})`,
        }}
      >
        <div className="container" id="breadcrumb-headline">
          <h3 className="headline">All Properties </h3>
        </div>
      </div>

      <div className="my-5 container">
        {/* Filters summary (optional, just for info) */}
        {/* <div className="filters-bar">
                    {category && (
                        <span className="filter-chip">
                            Category: <strong>{category}</strong>
                        </span>
                    )}
                    {areaSlug && (
                        <span className="filter-chip">
                            Area slug: <strong>{areaSlug}</strong>
                        </span>
                    )}
                    {!areaSlug && citySlug && (
                        <span className="filter-chip">
                            City slug: <strong>{citySlug}</strong>
                        </span>
                    )}
                    {size && sizeUnit && (
                        <span className="filter-chip">
                            Size:{" "}
                            <strong>
                                {size} {sizeUnit}
                            </strong>
                        </span>
                    )}
                </div> */}

        {/* {loading && <p className="status-text">Loading properties...</p>} */}
        {loading ? (
          !grid ? (
            <div className="all-prop-cards" id="rowCards">
              {Array.from({ length: "9" }).map((_, index) => (
                <div className="col-sm-12 loading_data" key={index}>
                  <CustomHorizontalSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <div id="columnCards">
              <div className="row" id="all-prop-col-cards">
                {Array.from({ length: "9" }).map((_, index) => (
                  <div className="col-12 col-md-6 col-lg-4" key={index}>
                    <VerticalCardSkeleton />
                  </div>
                ))}
              </div>
            </div>
          )
        ) : null}
        {error && !loading && <p className="status-text error">{error}</p>}
        {!loading && !error && properties.length === 0 && (
          <p className="status-text">No properties found for these filters.</p>
        )}

        {/* {!loading && properties && properties.length > 0 ? (
                          <GridCard total={9} setGrid={setGrid} grid={grid} />
                        ) : null} */}

        {/* Cards grid */}
        {!loading && !error && properties.length > 0 && (
          // <div className="grid">
          //   {properties.map((p, idx) => (
              // <article key={p.link || idx} className="card">
              //   <div className="card-image-wrapper">
              //     {p.image ? (
              //       <img
              //         src={p.image}
              //         alt={p.title}
              //         className="card-image"
              //         loading="lazy"
              //       />
              //     ) : (
              //       <div className="card-image placeholder">
              //         <span>No image</span>
              //       </div>
              //     )}
              //     {p.added && (
              //       <span className="badge badge-added">{p.added}</span>
              //     )}
              //   </div>

              //   <div className="card-body">
              //     <h2 className="card-title">{p.title}</h2>

              //     <div className="card-price-row">
              //       <span className="price">{p.price}</span>
              //       {p.area && <span className="area-badge">{p.area}</span>}
              //     </div>

              //     <p className="location">{p.location}</p>

              //     <div className="card-footer">
              //       <a
              //         href={p.link}
              //         target="_blank"
              //         rel="noreferrer"
              //         className="details-btn"
              //       >
              //         View on Zameen
              //       </a>
              //     </div>
              //   </div>
              // </article>
          //   ))}
          // </div>
          !grid ? (
            <div className="all-prop-cards" id="rowCards">
              {/* {properties.map((ele, index) => (
                <Link
                  href="/properties-details/[slug]"
                  // as={`/properties-details/${ele.slug_id}`}
                  passHref
                  key={index}
                >
                  <AllPropertyCardAI key={ele.link || index}
        property={ele}
        category={category} />
                </Link>
              ))} */}
            </div>
          ) : (
            <div id="columnCards">
              <div className="row" id="all-prop-col-cards">
                {properties.map((ele, index) => (
                  <div
                    className="col-12 col-md-6 col-lg-4 my-4"
                    key={index}
                  >
                    <VerticalCardAI key={ele.link || index} ele={ele} />
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* Pagination controls */}
        <div className="pagination">

          <button
            className="page-btn"
            onClick={() => goToPage(pageNum - 1)}
            disabled={pageNum <= 1 || loading}
          >
            ‹ Previous
          </button>
          <span className="page-current">Page {pageNum} of {totalPages}</span>
          <button
            className="page-btn"
            onClick={() => goToPage(pageNum + 1)}
            disabled={loading || pageNum >= totalPages}
          >
            Next ›
          </button>
        </div>
      </div>

      {/* Simple CSS (styled-jsx) */}
      <style jsx>{`
        .page-wrapper {
          background: #f5f5f7;
          min-height: 100vh;
          padding: 24px 12px;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 16px;
          margin-bottom: 16px;
        }
        .title {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }
        .subtitle {
          margin: 4px 0 0;
          font-size: 13px;
          color: #6b7280;
          word-break: break-all;
        }
        .subtitle a {
          color: #2563eb;
          text-decoration: none;
        }
        .subtitle a:hover {
          text-decoration: underline;
        }
        .page-info {
          font-size: 13px;
          color: #4b5563;
        }
        .filters-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }
        .filter-chip {
          background: #eef2ff;
          color: #4338ca;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 12px;
        }
        .status-text {
          font-size: 14px;
          color: #4b5563;
          margin: 16px 0;
        }
        .status-text.error {
          color: #b91c1c;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
        }
        .card {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.03);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
        }
        .card-image-wrapper {
          position: relative;
          width: 100%;
          padding-top: 60%; /* 5:3 ratio */
          overflow: hidden;
          background: #e5e7eb;
        }
        .card-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .card-image.placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          font-size: 13px;
        }
        .badge {
          position: absolute;
          left: 10px;
          bottom: 10px;
          background: rgba(17, 24, 39, 0.8);
          color: white;
          border-radius: 999px;
          padding: 3px 9px;
          font-size: 11px;
        }
        .card-body {
          padding: 10px 12px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .card-title {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          margin: 0;
          line-height: 1.3;
        }
        .card-price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .price {
          font-size: 15px;
          font-weight: 700;
          color: #16a34a;
        }
        .area-badge {
          font-size: 12px;
          background: #ecfdf3;
          color: #166534;
          padding: 3px 8px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .location {
          font-size: 13px;
          color: #4b5563;
          margin: 0;
        }
        .card-footer {
          margin-top: 8px;
          display: flex;
          justify-content: flex-end;
        }
        .details-btn {
          font-size: 13px;
          padding: 6px 12px;
          border-radius: 999px;
          border: 1px solid #2563eb;
          background: #2563eb;
          color: white;
          text-decoration: none;
          transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
        }
        .details-btn:hover {
          background: #1d4ed8;
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4);
        }
        .pagination {
          margin-top: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
        }
        .page-btn {
          padding: 6px 12px;
          font-size: 13px;
          border-radius: 999px;
          border: 1px solid #d1d5db;
          background: white;
          color: #111827;
          cursor: pointer;
          min-width: 90px;
        }
        .page-btn:disabled {
          opacity: 0.4;
          cursor: default;
        }
        .page-current {
          font-size: 13px;
          color: #4b5563;
        }

        @media (max-width: 640px) {
          .page-wrapper {
            padding: 16px 8px;
          }
          .header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </Layout>
  );
}

export default PropertiesListsAll;