"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import VerticalCard from "@/Components/Cards/VerticleCard";
import FilterForm from "@/Components/AllPropertyUi/FilterForm";
import GridCard from "@/Components/AllPropertyUi/GridCard";
import AllPropertieCard from "@/Components/AllPropertyUi/AllPropertieCard";
import { getPropertyListApi } from "@/store/actions/campaign";
import CustomHorizontalSkeleton from "@/Components/Skeleton/CustomHorizontalSkeleton";
import { useSelector } from "react-redux";
import { isLogin, translate } from "@/utils/helper";
import { languageData } from "@/store/reducer/languageSlice";
import NoData from "@/Components/NoDataFound/NoData";
import Layout from "../Layout/Layout";
import { useRouter } from "next/router";
import { FiExternalLink } from "react-icons/fi";
import VerticalCardSkeleton from "../Skeleton/VerticalCardSkeleton";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

const PropertyList = ({ type }) => {
  const router = useRouter();
  const isLoggedIn = isLogin();

  const [grid, setGrid] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [filterData, setFilterData] = useState({
    propType: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    postedSince: "",
    selectedLocation: null,
    facilitiesIds: [],
    search: "",
  });
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);

  const [categoryName, setCategoryName] = useState("");

  const limit = 9;
  const lang = useSelector(languageData);

  const cityName = router.query;

  const isFirstFilterFetch = useRef(true);
  const chatQueryApplied = useRef(false);
  const [chatScrapeUrl, setChatScrapeUrl] = useState(null);
  /** Avoid first fetch before ?chat=1 filters are merged into state. */
  const [listQueryReady, setListQueryReady] = useState(false);

  /** Opened from AI chat with ?chat=1 — apply same filters as home /search DB API. */
  useEffect(() => {
    if (!router.isReady) return;
    if (type !== "all") {
      setListQueryReady(true);
      return;
    }
    if (router.query.chat !== "1") {
      setListQueryReady(true);
      return;
    }
    if (chatQueryApplied.current) return;
    chatQueryApplied.current = true;
    const q = router.query;
    setFilterData((prev) => ({
      ...prev,
      minPrice: q.min_price != null && q.min_price !== "" ? String(q.min_price) : "",
      maxPrice: q.max_price != null && q.max_price !== "" ? String(q.max_price) : "",
      search: q.search != null && q.search !== "" ? String(q.search) : "",
      propType:
        q.property_type === "1"
          ? 1
          : q.property_type === "0"
            ? 0
            : prev.propType,
      selectedLocation: q.city
        ? { city: String(q.city).replace(/\+/g, " ") }
        : prev.selectedLocation,
    }));
    setListQueryReady(true);
  }, [router.isReady, router.query, type]);

  useEffect(() => {
    if (!router.isReady || router.query.chat !== "1") return;
    const rawQ = router.query.scrape;
    const fromUrl =
      typeof rawQ === "string"
        ? rawQ
        : Array.isArray(rawQ) && rawQ[0]
          ? rawQ[0]
          : "";
    if (fromUrl) {
      try {
        setChatScrapeUrl(decodeURIComponent(fromUrl));
      } catch (_) {
        setChatScrapeUrl(fromUrl);
      }
      return;
    }
    if (typeof window === "undefined") return;
    try {
      const u = sessionStorage.getItem("chat_scrape_listing_url");
      setChatScrapeUrl(u || null);
    } catch (_) {
      setChatScrapeUrl(null);
    }
  }, [router.isReady, router.query.chat, router.query.scrape]);

  const handleExtendedListingsClick = () => {
    if (!chatScrapeUrl || typeof window === "undefined") return;
    window.open(chatScrapeUrl, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {}, [lang]);
  useEffect(() => {}, [grid]);

  const fetchProperties = (newOffset, isAppend = false) => {
    setIsLoading(true);

    getPropertyListApi({
      city:
        type === "city"
          ? router.query.slug
          : filterData?.selectedLocation?.city,
      category_slug_id: type === "categories" ? router.query.slug : "",
      offset: newOffset.toString(),
      limit: limit.toString(),
      category_id: filterData?.category ? filterData?.category : "",
      property_type: filterData?.propType !== "" ? filterData?.propType : "",
      max_price: filterData?.maxPrice ? filterData?.maxPrice : "",
      min_price: filterData?.minPrice ? filterData?.minPrice : "",
      posted_since:
        filterData?.postedSince === "yesterday"
          ? "1"
          : filterData?.postedSince === "lastWeek"
          ? "0"
          : "",
      parameter_id: filterData?.facilitiesIds ? filterData?.facilitiesIds : "",
      search: filterData?.search ? String(filterData.search) : "",

      onSuccess: (response) => {
        const propertyData = response.data;
        setCategoryName(propertyData[0]?.category?.category);
        setProperties(
          isAppend ? [...properties, ...propertyData] : propertyData
        );
        setTotal(response.total);
        setHasMoreData(propertyData.length === limit);
        setIsLoading(false);
      },
      onError: (error) => {
        console.error(error);
        setIsLoading(false);
      },
    });
  };

  /** Refetch when filters change (live). First load is immediate; later changes are debounced (price typing). */
  useEffect(() => {
    if (!router.isReady || !listQueryReady) return;

    const runFetch = () => {
      fetchProperties(0, false);
      setOffset(0);
    };

    if (isFirstFilterFetch.current) {
      isFirstFilterFetch.current = false;
      runFetch();
      return;
    }

    const t = setTimeout(runFetch, 220);
    return () => clearTimeout(t);
  }, [filterData, router.isReady, listQueryReady, isLoggedIn, type, router.query?.slug]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFilterData((prev) => ({
      ...prev,
      [name]: type === "number" ? Math.max(0, parseInt(value)) || "" : value,
    }));
  };

  const handleTabClick = (tab) => {
    setFilterData((prev) => ({
      ...prev,
      propType: tab === "sell" ? 0 : 1,
    }));
  };

  const handlePostedSinceChange = (since) => {
    
    setFilterData((prev) => ({
      ...prev,
      postedSince: since,
    }));
  };

  const handleLocationSelected = (location) => {
    setFilterData((prev) => ({
      ...prev,
      selectedLocation: location,
    }));
  };

  const handleFacilityChange = (event, facilityId) => {
    const isChecked = event.target.checked;
    const currentFacilities = filterData.facilitiesIds
      ? String(filterData.facilitiesIds).split(",").filter(Boolean)
      : [];
    const updatedFacilities = isChecked
      ? [...new Set([...currentFacilities, facilityId.toString()])]
      : currentFacilities.filter((id) => id !== facilityId.toString());
    setFilterData((prev) => ({
      ...prev,
      facilitiesIds: updatedFacilities.join(","),
    }));
  };

  const clearfilterLocation = () => {
    setFilterData({
      ...filterData,
      selectedLocation: null,
    });
  };

  const handleClearFilter = () => {
    setFilterData({
      propType: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      postedSince: "",
      selectedLocation: null,
      facilitiesIds: [],
      search: "",
    });
  };
  const handleLoadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchProperties(newOffset, true);
  };

  const breadCrumbTitle =
    type === "all"
      ? translate("allProperties")
      : type === "categories"
      ? `${categoryName} ${translate("properties")}`
      : type === "city"
      ? cityName.slug
        ? `${translate("propertiesListedIn")} ${cityName.slug}`
        : `${translate("noPropertiesListedIn")} ${cityName}`
      : "";

  useEffect(() => {
  }, [categoryName]);
  return (
    <Layout>
      <Breadcrumb title={breadCrumbTitle} />
      
      <section id="all-prop-containt" className="all-properties-page">
        <div className="container all-properties">
        {router.isReady && type === "all" && router.query.chat === "1" && (
          <div className="mb-5 sm:mb-6">
            <div
              className="relative overflow-hidden rounded-2xl border border-primary-100/80 bg-white animate-ai-promo-border"
              role="status"
            >
              {/* Layer 1: stronger pastel stops — moves + fades in/out (keyframes) */}
              <div
                className="pointer-events-none absolute inset-0 z-0 animate-ai-promo-bg"
                style={{
                  backgroundImage:
                    "linear-gradient(122deg, rgb(255 210 190) 0%, rgb(255 255 255) 9%, rgb(147 197 253) 20%, rgb(110 231 183) 34%, rgb(196 181 253) 48%, rgb(253 224 71) 62%, rgb(251 207 232) 76%, rgb(186 230 253) 88%, rgb(255 210 190) 100%)",
                  backgroundSize: "380% 380%",
                }}
                aria-hidden
              />
              {/* Layer 2: rose / cyan / violet — opposite rhythm so colour shift is obvious */}
              <div
                className="pointer-events-none absolute inset-0 z-[1] animate-ai-promo-bg-alt"
                style={{
                  backgroundImage:
                    "linear-gradient(48deg, rgb(253 186 116) 0%, rgb(165 243 252) 16%, rgb(251 207 232) 32%, rgb(167 243 208) 50%, rgb(196 181 253) 66%, rgb(254 215 170) 82%, rgb(253 186 116) 100%)",
                  backgroundSize: "340% 340%",
                }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -right-12 -top-12 z-[1] h-44 w-44 animate-ai-promo-orb rounded-full bg-gradient-to-br from-sky-300/70 via-primary-300/65 to-amber-300/60 blur-2xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -left-8 -bottom-4 z-[1] h-36 w-36 animate-ai-promo-orb rounded-full bg-gradient-to-tr from-fuchsia-300/65 via-violet-300/60 to-emerald-300/55 blur-2xl [animation-delay:-3.5s]"
                aria-hidden
              />
              <div className="relative z-[2] rounded-xl bg-white/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-[2px] sm:p-5 sm:backdrop-blur-sm">
                <p className="mb-1 text-[16px] font-semibold uppercase tracking-wide text-primary-700 drop-shadow-sm">
                AI Property Assistant</p>
                {chatScrapeUrl ? (
                  <>
                    <p className="mb-3 max-w-2xl text-sm font-semibold leading-relaxed text-gray-800 drop-shadow-sm">
                    Explore more properties beyond our listings with AI-powered search.
                    </p>
                    <button
                      type="button"
                      onClick={handleExtendedListingsClick}
                      className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-3 py-2.5 rounded-2xl text-sm font-semibold hover:from-primary-700 hover:to-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden"
                    >
                      <span className="relative z-10 ">Discover More Listings</span>
                      <div className="relative z-10 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all group-hover:translate-x-1">
                          <BsArrowRight className="text-white" size={16} />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </button>
                  </>
                ) : (
                  <p className="mb-0 text-sm text-gray-500">
                    More partner listings are not available for this search right now.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
          <div className="all-properties-inner">
            {/* Sidebar Filters */}
            <aside className="all-prop-sidebar">
              <FilterForm
                filterData={filterData}
                getCategories={properties}
                handleInputChange={handleInputChange}
                handleTabClick={handleTabClick}
                handlePostedSinceChange={handlePostedSinceChange}
                handleLocationSelected={handleLocationSelected}
                handleClearFilter={handleClearFilter}
                selectedLocation={filterData?.selectedLocation}
                clearfilterLocation={clearfilterLocation}
                setFilterData={setFilterData}
                handleFacilityChange={handleFacilityChange}
                type={type}
              />
            </aside>

            {/* Main Content */}
            <div className="all-prop-main">
              {!isLoading && properties && properties.length > 0 ? (
                <GridCard total={total} setGrid={setGrid} grid={grid} />
              ) : null}

              {isLoading ? (
                !grid ? (
                  <div className="flex flex-col gap-6">
                    {Array.from({ length: limit }).map((_, index) => (
                      <div className="w-full" key={index}>
                        <CustomHorizontalSkeleton />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: limit }).map((_, index) => (
                      <div className="w-full" key={index}>
                        <VerticalCardSkeleton />
                      </div>
                    ))}
                  </div>
                )
              ) : properties && properties.length > 0 ? (
                !grid ? (
                  <div className="flex flex-col gap-6">
                    {properties.map((ele, index) => (
                      <Link
                        href="/properties-details/[slug]"
                        as={`/properties-details/${ele.slug_id}`}
                        passHref
                        key={index}
                        className="block w-full focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-2xl"
                      >
                        <AllPropertieCard ele={ele} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((ele, index) => (
                      <div className="w-full" key={index}>
                        <VerticalCard ele={ele} />
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="all-prop-no-data">
                  <NoData />
                </div>
              )}

              {!isLoading && properties && properties.length > 0 && hasMoreData ? (
                <div className="loadMoreDiv">
                  <button type="button" className="loadMore" onClick={handleLoadMore}>
                    {translate("loadmore")}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PropertyList;
