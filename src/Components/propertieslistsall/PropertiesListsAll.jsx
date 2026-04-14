
// "use client";
// import { useRouter } from "next/router";
// import { useEffect, useState } from "react";
// import ViewPageImg from "@/assets/Images/Breadcrumbs.jpg";
// import Layout from "@/Components/Layout/Layout";
// import GridCard from "../AllPropertyUi/GridCard";
// import CustomHorizontalSkeleton from "../Skeleton/CustomHorizontalSkeleton";
// import VerticalCardSkeleton from "../Skeleton/VerticalCardSkeleton";
// import Link from "next/link";
// import AllPropertieCard from "../AllPropertyUi/AllPropertieCard";
// import VerticalCard from "../Cards/VerticleCard";
// import AllPropertyCardAI from "../AllPropertyUi/AllPropertyCardAI";
// import VerticalCardAI from "../Cards/VerticalCardAI";

// // Size parsing (same logic jo tum backend me use kar rahe ho)
// function parseSizeFromText(text = "") {
//   const sizeRegex =
//     /(\d+(\.\d+)?)\s*(marla|kanal|sq ?ft|square feet|sq ?yd|square yards?|sq ?y?d?s?|square meter|sq ?m|acre|acres)\b/i;
//   const m = text.toLowerCase().match(sizeRegex);
//   if (!m) return { size: null, sizeUnit: null };

//   const num = parseFloat(m[1]);
//   let unitRaw = m[3].toLowerCase();
//   let unit = unitRaw;

//   if (unitRaw.includes("marla")) unit = "marla";
//   else if (unitRaw.includes("kanal")) unit = "kanal";
//   else if (unitRaw.includes("sq m") || unitRaw.includes("square meter"))
//     unit = "sqm";
//   else if (unitRaw.includes("sq ft") || unitRaw.includes("square feet"))
//     unit = "sqft";
//   else if (unitRaw.includes("sq yd") || unitRaw.includes("square yard"))
//     unit = "sqyd";
//   else if (unitRaw.startsWith("acre")) unit = "acre";

//   return { size: num, sizeUnit: unit };
// }

// const PropertiesListsAll = () => {
//   const router = useRouter();
//   const {
//     category,
//     citySlug,
//     areaSlug,
//     page = "1",
//     size,
//     sizeUnit,
//     price_min,
//     price_max,
//     beds_in,
//     baths_in,
//     area_min,
//     area_max,
//   } = router.query;

//   const [properties, setProperties] = useState([]);
//   console.log(properties, "properties in main component")
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [scrapedUrl, setScrapedUrl] = useState(null);
//   const [totalPages, setTotalPages] = useState(1);
//   const [grid, setGrid] = useState(true);

//   // Backend se properties lao
//   useEffect(() => {
//     if (!router.isReady) return;

//     // Category + citySlug/areaSlug required for /api/searchscrape
//     if (!category || (!citySlug && !areaSlug)) {
//       setLoading(false);
//       setError("Missing category or location in URL.");
//       return;
//     }

//     async function load() {
//       try {
//         setLoading(true);
//         setError("");

//         const qs = new URLSearchParams();
//         qs.append("category", category);
//         qs.append("page", String(page || 1));

//         if (areaSlug) qs.append("areaSlug", areaSlug);
//         else if (citySlug) qs.append("citySlug", citySlug);

//         // --- YE FILTERS ADD KAREIN (MISSING THAY) ---
//         if (price_min) qs.append("price_min", price_min);
//         if (price_max) qs.append("price_max", price_max);
//         if (beds_in) qs.append("beds_in", beds_in);
//         if (baths_in) qs.append("baths_in", baths_in);
//         if (area_min) qs.append("area_min", area_min);
//         if (area_max) qs.append("area_max", area_max);

//         // Debugging ke liye log karein
//         console.log("Fetching from API with params:", qs.toString());

//         const res = await fetch(`/api/searchscrape?${qs.toString()}`);
//         const data = await res.json();
//           {/* Error or Empty State Design */ }
//   {
//     ((error && res.status === 404) || (!loading && properties.length === 0)) && (
//       <div className="no-results-container">
//         <div className="no-results-icon">🏠</div>
//         <h3 className="no-results-title">No Properties Found</h3>
//         <p className="no-results-text">
//           Sorry, there are no active properties matching your criteria at the moment.
//         </p>
//         <button
//           className="reset-btn"
//           onClick={() => router.push({ pathname: router.pathname, query: { category, citySlug: citySlug || areaSlug } })}
//         >
//           Clear All Filters
//         </button>
//       </div>
//     )
//   }

//   {/* Technical Error (Agar server down ho ya internet na ho) */ }
//   {
//     error && !res.status === 404 && !loading && (
//       <p className="status-text error">Something went wrong. Please try again later.</p>
//     )
//   }

//         if (!res.ok) {
//           throw new Error(data.error || "Failed to fetch properties");
//         }

//         setScrapedUrl(data.url || null);
//         setTotalPages(data.totalPages || 1);
//         setProperties(data.properties || []);

//       } catch (err) {
//         console.error("Properties load error:", err);
//         setError(err.message || "Failed to load properties.");
//       } finally {
//         setLoading(false);
//       }
//     }

//     load();
//   }, [router.isReady, category, citySlug, areaSlug, page, size, sizeUnit, price_min, price_max, beds_in, baths_in]);

//   const pageNum = Number(page || 1);

//   const goToPage = (newPage) => {
//     if (newPage < 1) return;
//     router.push(
//       {
//         pathname: router.pathname,
//         query: {
//           ...router.query,
//           page: String(newPage),
//         },
//       },
//       undefined,
//       { shallow: false }
//     );
//   };



//   return (
//     <Layout>
//       <div
//         id="breadcrumb"
//         style={{
//           backgroundImage: `url(${ViewPageImg.src})`,
//         }}
//       >
//         <div className="container" id="breadcrumb-headline">
//           <h3 className="headline">All Properties </h3>
//         </div>
//       </div>

//       <div className="my-5 container">
//         {/* Filters summary (optional, just for info) */}
//         {/* <div className="filters-bar">
//                     {category && (
//                         <span className="filter-chip">
//                             Category: <strong>{category}</strong>
//                         </span>
//                     )}
//                     {areaSlug && (
//                         <span className="filter-chip">
//                             Area slug: <strong>{areaSlug}</strong>
//                         </span>
//                     )}
//                     {!areaSlug && citySlug && (
//                         <span className="filter-chip">
//                             City slug: <strong>{citySlug}</strong>
//                         </span>
//                     )}
//                     {size && sizeUnit && (
//                         <span className="filter-chip">
//                             Size:{" "}
//                             <strong>
//                                 {size} {sizeUnit}
//                             </strong>
//                         </span>
//                     )}
//                 </div> */}

//         {/* {loading && <p className="status-text">Loading properties...</p>} */}
//         {loading ? (
//           !grid ? (
//             <div className="all-prop-cards" id="rowCards">
//               {Array.from({ length: "9" }).map((_, index) => (
//                 <div className="col-sm-12 loading_data" key={index}>
//                   <CustomHorizontalSkeleton />
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div id="columnCards">
//               <div className="row" id="all-prop-col-cards">
//                 {Array.from({ length: "9" }).map((_, index) => (
//                   <div className="col-12 col-md-6 col-lg-4" key={index}>
//                     <VerticalCardSkeleton />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )
//         ) : null}
//         {error && !loading && <p className="status-text error">{error}</p>}
//         {!loading && !error && properties.length === 0 && (
//           <p className="status-text">No properties found for these filters.</p>
//         )}

//         {/* {!loading && properties && properties.length > 0 ? (
//                           <GridCard total={9} setGrid={setGrid} grid={grid} />
//                         ) : null} */}

//         {/* Cards grid */}
//         {!loading && !error && properties.length > 0 && (
//           // <div className="grid">
//           //   {properties.map((p, idx) => (
//           // <article key={p.link || idx} className="card">
//           //   <div className="card-image-wrapper">
//           //     {p.image ? (
//           //       <img
//           //         src={p.image}
//           //         alt={p.title}
//           //         className="card-image"
//           //         loading="lazy"
//           //       />
//           //     ) : (
//           //       <div className="card-image placeholder">
//           //         <span>No image</span>
//           //       </div>
//           //     )}
//           //     {p.added && (
//           //       <span className="badge badge-added">{p.added}</span>
//           //     )}
//           //   </div>

//           //   <div className="card-body">
//           //     <h2 className="card-title">{p.title}</h2>

//           //     <div className="card-price-row">
//           //       <span className="price">{p.price}</span>
//           //       {p.area && <span className="area-badge">{p.area}</span>}
//           //     </div>

//           //     <p className="location">{p.location}</p>

//           //     <div className="card-footer">
//           //       <a
//           //         href={p.link}
//           //         target="_blank"
//           //         rel="noreferrer"
//           //         className="details-btn"
//           //       >
//           //         View on Zameen
//           //       </a>
//           //     </div>
//           //   </div>
//           // </article>
//           //   ))}
//           // </div>
//           !grid ? (
//             <div className="all-prop-cards" id="rowCards">
//               {/* {properties.map((ele, index) => (
//                 <Link
//                   href="/properties-details/[slug]"
//                   // as={`/properties-details/${ele.slug_id}`}
//                   passHref
//                   key={index}
//                 >
//                   <AllPropertyCardAI key={ele.link || index}
//         property={ele}
//         category={category} />
//                 </Link>
//               ))} */}
//             </div>
//           ) : (
//             <div id="columnCards">
//               <div className="row" id="all-prop-col-cards">
//                 {properties.map((ele, index) => (
//                   <div
//                     className="col-12 col-md-6 col-lg-4 my-4"
//                     key={index}
//                   >
//                     <VerticalCardAI key={ele.link || index} ele={ele} />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )
//         )}

//         {/* Pagination controls */}
//   <div className="pagination">

//     <button
//       className="page-btn"
//       onClick={() => goToPage(pageNum - 1)}
//       disabled={pageNum <= 1 || loading}
//     >
//       ‹ Previous
//     </button>
//     <span className="page-current">Page {pageNum} of {totalPages}</span>
//     <button
//       className="page-btn"
//       onClick={() => goToPage(pageNum + 1)}
//       disabled={loading || pageNum >= totalPages}
//     >
//       Next ›
//     </button>
//   </div>
// </div>

//       {/* Simple CSS (styled-jsx) */}
// <style jsx>{`
//   .page-wrapper {
//     background: #f5f5f7;
//     min-height: 100vh;
//     padding: 24px 12px;
//   }
//   .container {
//     max-width: 1200px;
//     margin: 0 auto;
//   }
//   .header {
//     display: flex;
//     justify-content: space-between;
//     align-items: flex-end;
//     gap: 16px;
//     margin-bottom: 16px;
//   }
//   .title {
//     margin: 0;
//     font-size: 24px;
//     font-weight: 700;
//     color: #111827;
//   }
//   .subtitle {
//     margin: 4px 0 0;
//     font-size: 13px;
//     color: #6b7280;
//     word-break: break-all;
//   }
//   .subtitle a {
//     color: #2563eb;
//     text-decoration: none;
//   }
//   .subtitle a:hover {
//     text-decoration: underline;
//   }
//   .page-info {
//     font-size: 13px;
//     color: #4b5563;
//   }
//   .filters-bar {
//     display: flex;
//     flex-wrap: wrap;
//     gap: 8px;
//     margin-bottom: 16px;
//   }
//   .filter-chip {
//     background: #eef2ff;
//     color: #4338ca;
//     border-radius: 999px;
//     padding: 4px 10px;
//     font-size: 12px;
//   }
//   .status-text {
//     font-size: 14px;
//     color: #4b5563;
//     margin: 16px 0;
//   }
//   .status-text.error {
//     color: #b91c1c;
//   }
//   .grid {
//     display: grid;
//     grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
//     gap: 16px;
//   }
//   .card {
//     background: #ffffff;
//     border-radius: 12px;
//     box-shadow: 0 8px 20px rgba(0, 0, 0, 0.03);
//     overflow: hidden;
//     display: flex;
//     flex-direction: column;
//     transition: transform 0.15s ease, box-shadow 0.15s ease;
//   }
//   .card:hover {
//     transform: translateY(-3px);
//     box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
//   }
//   .card-image-wrapper {
//     position: relative;
//     width: 100%;
//     padding-top: 60%; /* 5:3 ratio */
//     overflow: hidden;
//     background: #e5e7eb;
//   }
//   .card-image {
//     position: absolute;
//     inset: 0;
//     width: 100%;
//     height: 100%;
//     object-fit: cover;
//   }
//   .card-image.placeholder {
//     position: absolute;
//     inset: 0;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     color: #6b7280;
//     font-size: 13px;
//   }
//   .badge {
//     position: absolute;
//     left: 10px;
//     bottom: 10px;
//     background: rgba(17, 24, 39, 0.8);
//     color: white;
//     border-radius: 999px;
//     padding: 3px 9px;
//     font-size: 11px;
//   }
//   .card-body {
//     padding: 10px 12px 12px;
//     display: flex;
//     flex-direction: column;
//     gap: 6px;
//   }
//   .card-title {
//     font-size: 15px;
//     font-weight: 600;
//     color: #111827;
//     margin: 0;
//     line-height: 1.3;
//   }
//   .card-price-row {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     gap: 8px;
//   }
//   .price {
//     font-size: 15px;
//     font-weight: 700;
//     color: #16a34a;
//   }
//   .area-badge {
//     font-size: 12px;
//     background: #ecfdf3;
//     color: #166534;
//     padding: 3px 8px;
//     border-radius: 999px;
//     white-space: nowrap;
//   }
//   .location {
//     font-size: 13px;
//     color: #4b5563;
//     margin: 0;
//   }
//   .card-footer {
//     margin-top: 8px;
//     display: flex;
//     justify-content: flex-end;
//   }
//   .details-btn {
//     font-size: 13px;
//     padding: 6px 12px;
//     border-radius: 999px;
//     border: 1px solid #2563eb;
//     background: #2563eb;
//     color: white;
//     text-decoration: none;
//     transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
//   }
//   .details-btn:hover {
//     background: #1d4ed8;
//     box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4);
//   }
//   .pagination {
//     margin-top: 24px;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     gap: 12px;
//   }
//   .page-btn {
//     padding: 6px 12px;
//     font-size: 13px;
//     border-radius: 999px;
//     border: 1px solid #d1d5db;
//     background: white;
//     color: #111827;
//     cursor: pointer;
//     min-width: 90px;
//   }
//   .page-btn:disabled {
//     opacity: 0.4;
//     cursor: default;
//   }
//   .page-current {
//     font-size: 13px;
//     color: #4b5563;
//   }

//   @media (max-width: 640px) {
//     .page-wrapper {
//       padding: 16px 8px;
//     }
//     .header {
//       flex-direction: column;
//       align-items: flex-start;
//     }
//   }
// `}</style>
//     </Layout>
//   );
// }

// export default PropertiesListsAll;




// "use client";
// import { useRouter } from "next/router";
// import { useEffect, useState } from "react";
// import ViewPageImg from "@/assets/Images/Breadcrumbs.jpg";
// import Layout from "@/Components/Layout/Layout";
// import CustomHorizontalSkeleton from "../Skeleton/CustomHorizontalSkeleton";
// import VerticalCardSkeleton from "../Skeleton/VerticalCardSkeleton";
// import VerticalCardAI from "../Cards/VerticalCardAI";

// const PropertiesListsAll = () => {
//   const router = useRouter();
//   const {
//     category,
//     citySlug,
//     areaSlug,
//     page = "1",
//     price_min,
//     price_max,
//     beds_in,
//     baths_in,
//     area_min,
//     area_max,
//     g_purpose,
//     g_minPrice,
//     g_maxPrice,
//     g_bed,
//     g_bathroom,
//     g_sizeUnit,
//     g_pageSize,
//     g_city,
//     g_minSize,
//     g_maxSize,
//     providers= "graana,zameen"
//   } = router.query;

//   const [properties, setProperties] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [statusCode, setStatusCode] = useState(200); // Status code track karne ke liye
//   const [totalPages, setTotalPages] = useState(1);
//   const [grid, setGrid] = useState(true);

//   useEffect(() => {
//     if (!router.isReady) return;

//     if (!category || (!citySlug && !areaSlug)) {
//       setLoading(false);
//       setError("Missing category or location in URL.");
//       return;
//     }

//     async function load() {
//       try {
//         setLoading(true);
//         setError("");
//         setStatusCode(200);

//         const qs = new URLSearchParams();
//         qs.append("category", category);
//         qs.append("page", String(page || 1));
//         if (areaSlug) qs.append("areaSlug", areaSlug);
//         else if (citySlug) qs.append("citySlug", citySlug);

//         // Filters
//         if (price_min) qs.append("price_min", price_min);
//         if (price_max) qs.append("price_max", price_max);
//         if (beds_in) qs.append("beds_in", beds_in);
//         if (baths_in) qs.append("baths_in", baths_in);
//         if (area_min) qs.append("area_min", area_min);
//         if (area_max) qs.append("area_max", area_max);
//         if (g_purpose) qs.append("g_purpose", g_purpose);
//         if (g_minPrice) qs.append("g_minPrice", g_minPrice);
//         if (g_maxPrice) qs.append("g_maxPrice", g_maxPrice);
//         if (g_bed) qs.append("g_bed", g_bed);
//         if (g_bathroom) qs.append("g_bathroom", g_bathroom);
//         if (g_sizeUnit) qs.append("g_sizeUnit", g_sizeUnit);
//         if (g_pageSize) qs.append("g_pageSize", g_pageSize);
//         if (g_city) qs.append("g_city", g_city);
//         if (g_minSize) qs.append("g_minSize", g_minSize);
//         if (g_maxSize) qs.append("g_maxSize", g_maxSize);
//         if (providers) qs.append("providers", providers);

//         const res = await fetch(`/api/searchscrape?${qs.toString()}`);
//         setStatusCode(res.status); // Yahan status save karein

//         const data = await res.json();

//         if (!res.ok) {
//           throw new Error(data.error || "Failed to fetch properties");
//         }

//         // setTotalPages(data.totalPages.combined || 1);
//         setProperties(data.properties || []);
//       } catch (err) {
//         console.error("Properties load error:", err);
//         setError(err.message || "Failed to load properties.");
//       } finally {
//         setLoading(false);
//       }
//     }

//     load();
//   }, [router.isReady, category, citySlug, areaSlug, page, price_min, price_max, beds_in, baths_in, area_min, area_max, g_purpose, g_minPrice, g_maxPrice, g_bed, g_bathroom, g_sizeUnit, g_pageSize, g_city, g_minSize, g_maxSize, providers]);

//   const pageNum = Number(page || 1);

//   const goToPage = (newPage) => {
//     if (newPage < 1) return;
//     router.push({
//       pathname: router.pathname,
//       query: { ...router.query, page: String(newPage) },
//     });
//   };

//   return (
//     <Layout>
//       {/* Breadcrumb Section */}
//       <div id="breadcrumb" style={{ backgroundImage: `url(${ViewPageImg.src})` }}>
//         <div className="container" id="breadcrumb-headline">
//           <h3 className="headline">All Properties</h3>
//         </div>
//       </div>

//       <div className="my-5 container">
//         {/* 1. Loading State */}
//         {loading && (
//           <div className="row">
//             {Array.from({ length: 9 }).map((_, index) => (
//               <div className="col-12 col-md-6 col-lg-4" key={index}>
//                 <VerticalCardSkeleton />
//               </div>
//             ))}
//           </div>
//         )}

//         {/* 2. No Results Found (404 or Empty Array) */}
//         {!loading && (statusCode === 404 || properties.length === 0) && (
//           <div className="no-results-container">
//             <div className="no-results-icon">🏠</div>
//             <h3 className="no-results-title">No Properties Found</h3>
//             <p className="no-results-text">
//               Sorry, there are no active properties matching your criteria at the moment.
//             </p>
//             <button
//               className="reset-btn"
//               onClick={() => router.push({ pathname: router.pathname, query: { category, citySlug: citySlug || areaSlug } })}
//             >
//               Clear All Filters
//             </button>
//           </div>
//         )}

//         {/* 3. Real Error (Technical Issues) */}
//         {!loading && error && statusCode !== 404 && (
//           <p className="status-text error text-center">{error}</p>
//         )}

//         {/* 4. Properties Grid */}
//         {!loading && properties && (
//           <div className="row" id="all-prop-col-cards">
//             {properties.map((ele, index) => (
//               <div className="col-12 col-md-6 col-lg-4 my-4" key={index}>
//                 <VerticalCardAI ele={ele} category={category} />
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Pagination */}
//         {!loading && properties && (
//           <div className="pagination">
//             <button className="page-btn" onClick={() => goToPage(pageNum - 1)} disabled={pageNum <= 1}>
//               ‹ Previous
//             </button>
//             <span className="page-current">Page {pageNum} of {totalPages}</span>
//             <button className="page-btn" onClick={() => goToPage(pageNum + 1)} disabled={pageNum >= totalPages}>
//               Next ›
//             </button>
//           </div>
//         )}
//       </div>

// <style jsx>{`
//   .no-results-container { text-align: center; padding: 60px 20px; background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin: 40px auto; max-width: 600px; }
//   .no-results-icon { font-size: 64px; margin-bottom: 20px; }
//   .no-results-title { font-size: 24px; font-weight: 700; color: #1f2937; }
//   .no-results-text { color: #6b7280; margin-bottom: 24px; }
//   .reset-btn { background: #F1592A; color: #fff; border: none; padding: 12px 28px; border-radius: 999px; cursor: pointer; font-weight: 600; }
//   .pagination { display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 30px; }
//   .page-btn { padding: 8px 16px; border: 1px solid #ddd; background: #fff; border-radius: 5px; cursor: pointer; }
//   .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
//   .pagination {
//     margin-top: 24px;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     gap: 12px;
//   }
//   .page-btn {
//     padding: 6px 12px;
//     font-size: 13px;
//     border-radius: 999px;
//     border: 1px solid #d1d5db;
//     background: white;
//     color: #111827;
//     cursor: pointer;
//     min-width: 90px;
//   }
//   .page-btn:disabled {
//     opacity: 0.4;
//     cursor: default;
//   }
//   .page-current {
//     font-size: 13px;
//     color: #4b5563;
//   }
// `}</style>
//     </Layout>
//   );
// };

// export default PropertiesListsAll;


// "use client";
// import { useRouter } from "next/router";
// import { useEffect, useState } from "react";
// import ViewPageImg from "@/assets/Images/Breadcrumbs.jpg";
// import Layout from "@/Components/Layout/Layout";
// import CustomHorizontalSkeleton from "../Skeleton/CustomHorizontalSkeleton";
// import VerticalCardSkeleton from "../Skeleton/VerticalCardSkeleton";
// import VerticalCardAI from "../Cards/VerticalCardAI";

// // NEW Pagination Skeleton
// const PaginationSkeleton = () => (
//   <div className="pagination-skeleton" style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "20px" }}>
//     <div style={{ width: 90, height: 30, background: "#e5e7eb", borderRadius: 6 }}></div>
//     <div style={{ width: 50, height: 30, background: "#e5e7eb", borderRadius: 6 }}></div>
//     <div style={{ width: 90, height: 30, background: "#e5e7eb", borderRadius: 6 }}></div>
//   </div>
// );

// const PropertiesListsAll = () => {
//   const router = useRouter();
//   const {
//     category,
//     citySlug,
//     areaSlug,
//     page = "1",
//     price_min,
//     price_max,
//     beds_in,
//     baths_in,
//     area_min,
//     area_max,
//     g_purpose,
//     g_minPrice,
//     g_maxPrice,
//     g_bed,
//     g_bathroom,
//     g_sizeUnit,
//     g_pageSize,
//     g_city,
//     g_minSize,
//     g_maxSize,
//     g_category,
//     providers = "graana,zameen"
//   } = router.query;

//   const [properties, setProperties] = useState([]);
//   const [loadingProps, setLoadingProps] = useState(true);
//   const [loadingPagination, setLoadingPagination] = useState(true);
//   const [error, setError] = useState("");
//   const [statusCode, setStatusCode] = useState(200);
//   const [totalPages, setTotalPages] = useState(1);

//   const pageNum = Number(page || 1);

//   useEffect(() => {
//     if (!router.isReady) return;
//     if (!category || (!citySlug && !areaSlug)) {
//       setLoadingProps(false);
//       setError("Missing category or location in URL.");
//       return;
//     }

//     async function loadProperties() {
//       try {
//         setLoadingProps(true);
//         setError("");

//         const qs = new URLSearchParams();
//         qs.append("category", category);
//         qs.append("page", String(page || 1));
//         if (areaSlug) qs.append("areaSlug", areaSlug);
//         else if (citySlug) qs.append("citySlug", citySlug);

//         // Filters
//         if (price_min) qs.append("price_min", price_min);
//         if (price_max) qs.append("price_max", price_max);
//         if (beds_in) qs.append("beds_in", beds_in);
//         if (baths_in) qs.append("baths_in", baths_in);
//         if (area_min) qs.append("area_min", area_min);
//         if (area_max) qs.append("area_max", area_max);
//         if (g_purpose) qs.append("g_purpose", g_purpose);
//         if (g_minPrice) qs.append("g_minPrice", g_minPrice);
//         if (g_maxPrice) qs.append("g_maxPrice", g_maxPrice);
//         if (g_bed) qs.append("g_bed", g_bed);
//         if (g_bathroom) qs.append("g_bathroom", g_bathroom);
//         if (g_sizeUnit) qs.append("g_sizeUnit", g_sizeUnit);
//         if (g_pageSize) qs.append("g_pageSize", g_pageSize);
//         if (g_city) qs.append("g_city", g_city);
//         if (g_minSize) qs.append("g_minSize", g_minSize);
//         if (g_maxSize) qs.append("g_maxSize", g_maxSize);
//         if (providers) qs.append("providers", providers);
//         if (g_category) qs.append("g_category", g_category);

//         // 1️⃣ Fetch properties
//         const res = await fetch(`/api/searchscrape?${qs.toString()}`);
//         setStatusCode(res.status);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.error || "Failed to fetch properties");

//         setProperties(data.properties || []);
//         setLoadingProps(false);

//         // 2️⃣ Fetch total pages separately (for pagination)
//         setLoadingPagination(true);
//         const totalRes = await fetch(`/api/pagination?${qs.toString()}`);
//         const totalData = await totalRes.json();
//         console.log("Total Pages Data:", totalData);
//         setTotalPages(totalData.combined || 1);
//         setLoadingPagination(false);

//       } catch (err) {
//         console.error(err);
//         setError(err.message || "Failed to load properties.");
//         setLoadingProps(false);
//         setLoadingPagination(false);
//       }
//     }

//     loadProperties();
//   }, [
//     router.isReady,
//     category,
//     citySlug,
//     areaSlug,
//     page,
//     price_min,
//     price_max,
//     beds_in,
//     baths_in,
//     area_min,
//     area_max,
//     g_purpose,
//     g_minPrice,
//     g_maxPrice,
//     g_bed,
//     g_bathroom,
//     g_sizeUnit,
//     g_pageSize,
//     g_city,
//     g_minSize,
//     g_maxSize,
//     providers,
//     g_category
//   ]);

//   const goToPage = (newPage) => {
//     if (newPage < 1) return;
//     router.push({
//       pathname: router.pathname,
//       query: { ...router.query, page: String(newPage) },
//     });
//   };

//   return (
//     <Layout>
//       <div id="breadcrumb" style={{ backgroundImage: `url(${ViewPageImg.src})` }}>
//         <div className="container" id="breadcrumb-headline">
//           <h3 className="headline">All Properties</h3>
//         </div>
//       </div>

//       <div className="my-5 container">
//         {/* Properties Skeleton */}
//         {loadingProps && (
//           <div className="row">
//             {Array.from({ length: 9 }).map((_, index) => (
//               <div className="col-12 col-md-6 col-lg-4" key={index}>
//                 <VerticalCardSkeleton />
//               </div>
//             ))}
//           </div>
//         )}

//         {/* No Results */}
//         {!loadingProps && (statusCode === 404 || properties.length === 0) && (
//           <div className="no-results-container">
//             <div className="no-results-icon">🏠</div>
//             <h3 className="no-results-title">No Properties Found</h3>
//             <p className="no-results-text">
//               Sorry, there are no active properties matching your criteria at the moment.
//             </p>
//           </div>
//         )}

//         {/* Real Error */}
//         {!loadingProps && error && statusCode !== 404 && (
//           <p className="status-text error text-center">{error}</p>
//         )}

//         {/* Properties Grid */}
//         {!loadingProps && properties && (
//           <div className="row" id="all-prop-col-cards">
//             {properties.map((ele, index) => (
//               <div className="col-12 col-md-6 col-lg-4 my-4" key={index}>
//                 <VerticalCardAI ele={ele} category={category} />
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Pagination */}
//         {!loadingProps && (
//           <>
//             {loadingPagination ? (
//               <PaginationSkeleton />
//             ) : (
//               <div className="pagination">
//                 <button
//                   className="page-btn"
//                   onClick={() => goToPage(pageNum - 1)}
//                   disabled={pageNum <= 1 || loadingPagination}
//                 >
//                   ‹ Previous
//                 </button>
//                 <span className="page-current">Page {pageNum} of {totalPages}</span>
//                 <button
//                   className="page-btn"
//                   onClick={() => goToPage(pageNum + 1)}
//                   disabled={loadingPagination || pageNum >= totalPages}
//                 >
//                   Next ›
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//       <style jsx>{`
//         .no-results-container { text-align: center; padding: 60px 20px; background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin: 40px auto; max-width: 600px; }
//         .no-results-icon { font-size: 64px; margin-bottom: 20px; }
//         .no-results-title { font-size: 24px; font-weight: 700; color: #1f2937; }
//         .no-results-text { color: #6b7280; margin-bottom: 24px; }
//         .reset-btn { background: #F1592A; color: #fff; border: none; padding: 12px 28px; border-radius: 999px; cursor: pointer; font-weight: 600; }
//         .pagination {
//           margin-top: 24px;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           gap: 12px;
//         }
//         .page-btn {
//           padding: 6px 12px;
//           font-size: 13px;
//           border-radius: 999px;
//           border: 1px solid #d1d5db;
//           background: white;
//           color: #111827;
//           cursor: pointer;
//           min-width: 90px;
//         }
//         .page-btn:disabled {
//           opacity: 0.4;
//           cursor: default;
//         }
//         .page-current {
//           font-size: 13px;
//           color: #4b5563;
//         }
//       `}</style>
//     </Layout>
//   );
// };


// export default PropertiesListsAll;




"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "@/Components/Layout/Layout";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import VerticalCardSkeleton from "../Skeleton/VerticalCardSkeleton";
import VerticalCardAI from "../Cards/VerticalCardAI";
import NoData from "@/Components/NoDataFound/NoData";
import { translate } from "@/utils/helper";
import PropertyListFiltersSidebar from "@/Components/propertieslistsall/PropertyListFiltersSidebar";

const PaginationSkeleton = () => (
  <div
    className="pagination-skeleton"
    style={{
      display: "flex",
      justifyContent: "center",
      gap: "12px",
      marginTop: "20px",
    }}
  >
    <div style={{ width: 90, height: 30, background: "#e5e7eb", borderRadius: 6 }} />
    <div style={{ width: 50, height: 30, background: "#e5e7eb", borderRadius: 6 }} />
    <div style={{ width: 90, height: 30, background: "#e5e7eb", borderRadius: 6 }} />
  </div>
);

const PropertiesListsAll = () => {
  const router = useRouter();

  const {
    // Zameen
    category,
    citySlug,
    areaSlug,
    page = "1",
    price_min,
    price_max,
    beds_in,
    baths_in,
    area_min,
    area_max,
    area_unit,

    // Graana
    g_purpose,
    g_type,        // ✅ NEW (commercial-properties / residential-properties / houses / flats / plots)
    g_category,    // optional fallback
    g_minPrice,
    g_maxPrice,
    g_bed,
    g_bathroom,
    g_sizeUnit,
    g_pageSize,
    g_city,
    g_area,        // ✅ NEW (Graana area slug)
    g_minSize,
    g_maxSize,
    // g_page,        // ✅ NEW (Graana page)

    providers = "graana,zameen",

    fallback_city,
  } = router.query;

  const [properties, setProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [loadingPagination, setLoadingPagination] = useState(true);
  const [error, setError] = useState("");
  const [statusCode, setStatusCode] = useState(200);
  const [totalPages, setTotalPages] = useState(1);

  const pageNum = Number(page || 1);

  useEffect(() => {
    if (!router.isReady) return;

    // Zameen ke liye minimum requirement (category + city/area slug)
    if (!category || (!citySlug && !areaSlug)) {
      setLoadingProps(false);
      setError("Missing category or location in URL.");
      return;
    }

    async function loadProperties() {
      try {
        setLoadingProps(true);
        setError("");

        const qs = new URLSearchParams();

        // ---------- Zameen ----------
        qs.append("category", category);
        qs.append("page", String(page || 1));
        if (areaSlug) qs.append("areaSlug", areaSlug);
        else if (citySlug) qs.append("citySlug", citySlug);

        if (price_min) qs.append("price_min", price_min);
        if (price_max) qs.append("price_max", price_max);
        if (beds_in) qs.append("beds_in", beds_in);
        if (baths_in) qs.append("baths_in", baths_in);
        if (area_min) qs.append("area_min", area_min);
        if (area_max) qs.append("area_max", area_max);
        if (area_unit) qs.append("area_unit", area_unit);

        // ---------- Graana (NEW FLOW) ----------
        if (g_purpose) qs.append("g_purpose", g_purpose);

        // ✅ Most important for Graana route building
        if (g_type) qs.append("g_type", g_type);
        if (g_category) qs.append("g_category", g_category); // fallback if g_type missing

        if (g_minPrice) qs.append("g_minPrice", g_minPrice);
        if (g_maxPrice) qs.append("g_maxPrice", g_maxPrice);
        if (g_bed) qs.append("g_bed", g_bed);
        if (g_bathroom) qs.append("g_bathroom", g_bathroom);

        if (g_sizeUnit) qs.append("g_sizeUnit", g_sizeUnit);
        if (g_pageSize) qs.append("g_pageSize", g_pageSize);

        // ✅ location preference: area > city
        if (g_area) qs.append("g_area", g_area);
        if (g_city) qs.append("g_city", g_city);

        if (g_minSize) qs.append("g_minSize", g_minSize);
        if (g_maxSize) qs.append("g_maxSize", g_maxSize);

        // ✅ keep Graana page synced with main page if not provided
        // qs.append("g_page", String(g_page || page || 1));

        if (providers) qs.append("providers", providers);

        // 1) Fetch properties
        const res = await fetch(`/api/searchscrape?${qs.toString()}`);
        setStatusCode(res.status);

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch properties");

        setProperties(data.properties || []);
        setLoadingProps(false);
        if (!data.properties || data.properties.length === 0) {
          setTotalPages(1);
          setLoadingPagination(false);
          return;
        }

        // 2) Fetch total pages separately
        setLoadingPagination(true);
        const totalRes = await fetch(`/api/pagination?${qs.toString()}`);
        const totalData = await totalRes.json();

        setTotalPages(totalData.combined || 1);
        setLoadingPagination(false);
      } catch (err) {
        setError(err.message || "Failed to load properties.");
        setLoadingProps(false);
        setLoadingPagination(false);
      }
    }

    loadProperties();
  }, [
    router.isReady,

    // Zameen
    category,
    citySlug,
    areaSlug,
    page,
    price_min,
    price_max,
    beds_in,
    baths_in,
    area_min,
    area_max,
    area_unit,

    // Graana
    g_purpose,
    g_type,
    g_category,
    g_minPrice,
    g_maxPrice,
    g_bed,
    g_bathroom,
    g_sizeUnit,
    g_pageSize,
    g_city,
    g_area,
    g_minSize,
    g_maxSize,
    // g_page,

    providers,
  ]);

  const goToPage = (newPage) => {
    if (newPage < 1) return;

    // ✅ page + g_page dono update (Graana sync)
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        page: String(newPage),
        // g_page: String(newPage),
      },
    });
  };

  const breadCrumbTitle = translate("allProperties");

  const filtersDisabled =
    !router.isReady || !category || (!citySlug && !areaSlug);

  const fallbackCityLabel =
    typeof fallback_city === "string"
      ? fallback_city.charAt(0).toUpperCase() + fallback_city.slice(1)
      : Array.isArray(fallback_city) && fallback_city[0]
        ? String(fallback_city[0]).charAt(0).toUpperCase() +
          String(fallback_city[0]).slice(1)
        : "";

  return (
    <Layout>
      <Breadcrumb title={breadCrumbTitle} />

      {/* {router.isReady && fallbackCityLabel && (
        <div className="container pt-3">
          <div
            className="alert alert-secondary mb-0 rounded-xl border small"
            role="status"
          >
            No city was detected in your chat search. Partner listings (Zameen / Graana) are
            shown for <strong>{fallbackCityLabel}</strong> as a broad default. Adjust filters
            above or use the site search on that portal for other cities.
          </div>
        </div>
      )} */}

      <section id="all-prop-containt" className="prop-lists-all-page">
        <div className="container all-properties prop-lists-all-container">
          <div className="prop-lists-all-layout">
            <PropertyListFiltersSidebar disabled={filtersDisabled} />
            <div className="prop-lists-all-main">
            {loadingProps && (
              <div className="prop-lists-all-grid">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div className="prop-lists-all-card-wrap" key={index}>
                    <VerticalCardSkeleton />
                  </div>
                ))}
              </div>
            )}

            {!loadingProps && (statusCode === 404 || properties.length === 0) && (
              <div className="prop-lists-all-empty">
                <NoData />
                <button
                  type="button"
                  className="loadMore prop-lists-all-clear-btn"
                  onClick={() => router.push({ pathname: router.pathname, query: { category, citySlug: citySlug || areaSlug } })}
                >
                  {translate("clearFilter")}
                </button>
              </div>
            )}

            {!loadingProps && error && statusCode !== 404 && (
              <p className="prop-lists-all-error">{error}</p>
            )}

            {!loadingProps && properties && properties.length > 0 && (
              <>
                <div className="all-prop-toolbar prop-lists-all-toolbar">
                  <div className="all-prop-toolbar-count">
                    <span>{properties.length} {translate("propFound")}</span>
                  </div>
                </div>
                <div className="prop-lists-all-grid">
                  {properties.map((ele, index) => (
                    <div className="prop-lists-all-card-wrap" key={ele?.link || index}>
                      <VerticalCardAI ele={ele} category={category} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {!loadingProps && !error && properties.length > 0 && (
              <div className="prop-lists-all-pagination-wrap">
                {loadingPagination ? (
                  <PaginationSkeleton />
                ) : (
                  <div className="prop-lists-all-pagination">
                    <button
                      type="button"
                      className="prop-lists-all-page-btn"
                      onClick={() => goToPage(pageNum - 1)}
                      disabled={pageNum <= 1 || loadingPagination}
                    >
                      ‹ Previous
                    </button>
                    <span className="prop-lists-all-page-current">
                      Page {pageNum} of {totalPages}
                    </span>
                    <button
                      type="button"
                      className="prop-lists-all-page-btn"
                      onClick={() => goToPage(pageNum + 1)}
                      disabled={loadingPagination || pageNum >= totalPages}
                    >
                      {translate("next")} ›
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PropertiesListsAll;