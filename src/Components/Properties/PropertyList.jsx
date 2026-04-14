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
              className="relative overflow-hidden rounded-2xl border border-primary-100/80 bg-gradient-to-br from-primary-50/80 via-white to-white shadow-sm shadow-primary-900/[0.06]"
              role="status"
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-200/30 blur-2xl"
                aria-hidden
              />
              <div className="relative p-4 sm:p-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary-600">
                  AI chat
                </p>
                {chatScrapeUrl ? (
                  <>
                    <p className="mb-4 max-w-2xl text-sm leading-relaxed text-gray-600">
                      If you want <span className="font-medium text-gray-800">more listings</span>,
                      click the button.
                    </p>
                    <button
                      type="button"
                      onClick={handleExtendedListingsClick}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      <FiExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                      More listings
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
