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
  });
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);

  const [categoryName, setCategoryName] = useState("");

  const limit = 9;
  const lang = useSelector(languageData);

  const cityName = router.query;

  const isFirstFilterFetch = useRef(true);

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
    if (!router.isReady) return;

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
  }, [filterData, router.isReady, isLoggedIn, type, router.query?.slug]);

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
