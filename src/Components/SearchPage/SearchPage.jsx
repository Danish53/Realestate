"use client"
import React, { useEffect, useState } from 'react'
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import { useSelector } from "react-redux";
import { getPropertyListApi } from "@/store/actions/campaign.js";
import { RiCloseCircleLine, RiSendPlane2Line } from "react-icons/ri";
import { GrRefresh } from "react-icons/gr";
import { ButtonGroup, Modal, Pagination } from "react-bootstrap";
import LocationSearchBox from "@/Components/Location/LocationSearchBox.jsx";
import { BiFilter } from "react-icons/bi";
import { FiCalendar, FiCheck, FiChevronDown, FiClock, FiDollarSign, FiHome, FiMapPin, FiMinus, FiSearch, FiSun, FiX } from "react-icons/fi";
import { translate } from "@/utils/helper.js";
import { useRouter } from "next/router.js";
import VerticalCardSkeleton from "@/Components/Skeleton/VerticalCardSkeleton.jsx";
import Link from "next/link.js";
import VerticalCard from "@/Components/Cards/VerticleCard.jsx";
import NoData from "@/Components/NoDataFound/NoData.jsx";
import { categoriesCacheData, filterDataaa } from "@/store/reducer/momentSlice";
import Layout from '../Layout/Layout';
import { Autocomplete, TextField } from '@mui/material';
import { debounce } from 'lodash';


const SearchPage = () => {

    const limit = 8;
    const searchedData = useSelector(filterDataaa)
    const [searchData, setSearchData] = useState();
    const [filterData, setFilterData] = useState("");
    const isLoggedIn = useSelector((state) => state.User_signup);
    const [total, setTotal] = useState(0);
    const [offsetdata, setOffsetdata] = useState(0);
    const [hasMoreData, setHasMoreData] = useState(true); // Track if there's more data to load

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [formData, setFormData] = useState({
        propType: searchedData?.filterData?.propType ? searchedData?.filterData?.propType : "",
        minPrice: searchedData?.filterData?.minPrice ? searchedData?.filterData?.minPrice : "",
        maxPrice: searchedData?.filterData?.maxPrice ? searchedData?.filterData?.maxPrice : "",
        postedSince: searchedData?.filterData?.postedSince ? searchedData?.filterData?.postedSince : "",
        selectedLocation: searchedData?.filterData?.selectedLocation ? searchedData?.filterData?.selectedLocation : null,
    });
    const [activeTab, setActiveTab] = useState(searchedData.activeTab);
    const [searchInput, setSearchInput] = useState(searchedData.searchInput);

    const [isLoading, setIsLoading] = useState(true);
    const categoryData = useSelector(categoriesCacheData);


    const fetchAllCategories = (searchTerm = "") => {
            setIsLoading(true);
            try {
                GetAllCategorieApi({
                    search: searchTerm,
                    onSuccess: (response) => {
                        const categories = response?.data || [];
                        setCategoryData(categories);
                        setIsLoading(false);
                    },
                    onError: (error) => {
                        console.log(error);
                        setIsLoading(false);
                    }
                });
            } catch (error) {
                console.log("error", error);
                setIsLoading(false);
            }
        };
    
        useEffect(() => {
            if (showFilterModal) {
                fetchAllCategories();
            }
        }, [showFilterModal]);
    
        const debouncedFetchCategories = debounce((searchTerm) => {
            fetchAllCategories(searchTerm);
        }, 1000);

        const handleCategoryChange = (event, newValue) => {
        setFormData(prev => ({
            ...prev,
            propType: newValue ? newValue.id : ""
        }));
    };

    const handleCategorySearch = (event, newInputValue) => {
        debouncedFetchCategories(newInputValue);
    };

    useEffect(() => {
        getPropertyListApi({
            category_id: formData.propType || "",
            city: formData.selectedLocation?.city || "",
            property_type: activeTab,
            max_price: formData.maxPrice !== undefined ? formData.maxPrice : "",
            min_price: formData.minPrice || "0",
            posted_since: formData.postedSince || "",
            state: formData.selectedLocation?.state || "",
            country: formData.selectedLocation?.country || "",
            search: searchInput,
            limit: limit.toString(),
            offset: offsetdata.toString(),
            onSuccess: (response) => {
                setTotal(response.total);
                const SearchD = response.data;
                setIsLoading(false);
                if(offsetdata > 0){
                    setSearchData(prevData => [...prevData, ...SearchD]); // Append new data to the existing data
                }else{
                    setSearchData(SearchD);
                }
                setHasMoreData(SearchD.length === limit);
            },
            onError: (error) => {
                console.log(error);
            }
        }
        );
    }, [isLoggedIn, offsetdata]);

    const handleHideFilterModal = () => {
        setShowFilterModal(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Ensure the value is at least 0
        const sanitizedValue = Math.max(parseFloat(value), 0);

        // Update the form data
        setFormData({
            ...formData,
            [name]: sanitizedValue,
        });
    };

    const handlePostedSinceChange = (e) => {
        setFormData({
            ...formData,
            postedSince: e.target.value,
        });
    };

    const handleLocationSelected = (locationData) => {
        setFormData({
            ...formData,
            selectedLocation: locationData,
        });
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab === "sell" ? 0 : 1);
    };

    const handleApplyFilter = () => {
        let postedSinceValue = "";
        if (formData.postedSince === "yesterday") {
            postedSinceValue = "1";
        } else if (formData.postedSince === "lastWeek") {
            postedSinceValue = "0";
        }

        // Include the postedSince value in the filterData object
        const newFilterData = {
            propType: formData.propType,
            minPrice: formData.minPrice,
            maxPrice: formData.maxPrice,
            postedSince: postedSinceValue,
            selectedLocation: formData.selectedLocation,
        };

        // Set the filter data in state
        setFilterData(newFilterData);
        // Close the modal
        setShowFilterModal(false);
    };

    useEffect(() => {
        // You can access the updated filterData value here

    }, [filterData]);

    const handleSearch = () => {
        setIsLoading(true);
        const searchData = {
            filterData: formData,
            activeTab: activeTab,
            searchInput: searchInput,
        };
        localStorage.setItem("searchData", JSON.stringify(searchData));
        getPropertyListApi({
            category_id: searchData.filterData.propType || "",
            city: searchData.filterData.selectedLocation?.city || "",
            limit: limit.toString(),
            offset: 0,
            property_type: searchData.activeTab,
            max_price: searchData.filterData.maxPrice !== undefined ? searchData.filterData.maxPrice : "",
            min_price: searchData.filterData.minPrice || "0",
            posted_since: searchData.filterData.postedSince || "",
            state: searchData.filterData.selectedLocation?.state || "",
            country: searchData.filterData.selectedLocation?.country || "",
            search: searchData.searchInput,
            onSuccess: (response) => {
                setTotal(response.total);
                const SearchD = response.data;

                setIsLoading(false);
                setSearchData(SearchD);
            },
            onError: (error) => {
                console.log(error);
            }
        }
        );
        setShowFilterModal(false); // Close the modal
    };

    const [clearfilterLocation, setClearFilerLocation] = useState(false);

    const handleClearFilter = () => {
        setClearFilerLocation(true)
        setFormData({
            propType: "",
            minPrice: "",
            maxPrice: "",
            postedSince: "",
            selectedLocation: null,
        });
    };
    useEffect(() => {

    }, [clearfilterLocation])
    const handleLoadMore = () => {
        const newOffset = offsetdata + limit;
        setOffsetdata(newOffset);
    };
    return (
        <Layout>
            <Breadcrumb title="" />
            <div className="serach_page_tab">
                <div id="searchbox" className="container">
                    <ButtonGroup>
                        <ul className="nav nav-tabs" id="tabs">
                            <li className="">
                                <a className={`nav-link ${activeTab === 0 ? "tab-0" : ""}`} aria-current="page" id="sellbutton" onClick={() => handleTabClick("sell")}>
                                    {translate("sell")}
                                </a>
                            </li>
                            <li className="">
                                <a className={`nav-link ${activeTab === 1 ? "tab-1" : ""}`} onClick={() => handleTabClick("rent")} aria-current="page" id="rentbutton">
                                    {translate("rent")}
                                </a>
                            </li>
                        </ul>
                    </ButtonGroup>
                    <div id="searchcard">
                        <div id="searchbuttoon">
                            <FiSearch size={20} />
                            <input
                                className="searchinput"
                                placeholder={translate("searchYourProperty")}
                                name="propertySearch"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        // Prevent the default form submission behavior
                                        e.preventDefault();
                                        // Trigger the click event on the submit button
                                        handleSearch();
                                    }
                                }}
                            />
                        </div>
                        <div id="leftside-buttons">
                            <button className="filter" onClick={() => setShowFilterModal(true)}>
                                <BiFilter size={25} />
                                {translate("filter")}
                            </button>
                            <button className="find" onClick={handleSearch}>
                                {translate("search")}
                            </button>
                        </div>
                    </div>
                </div>

                <Modal 
                              show={showFilterModal} 
                              onHide={handleHideFilterModal} 
                              size="lg" 
                              centered 
                              backdrop="static" 
                              className="filter-modal"
                            >
                                <div className="filter-modal-content">
                                    {/* Modal Header */}
                                    <div className="filter-modal-header">
                                        <div className="header-icon-wrapper">
                                            <BiFilter size={24} />
                                        </div>
                                        <h3 className="filter-modal-title">{translate("filterProp")}</h3>
                                        <button className="close-modal-btn" onClick={handleHideFilterModal}>
                                            <FiX size={24} />
                                        </button>
                                        {/* <RiCloseCircleLine className="close-icon" size={40} onClick={handleHideFilterModal} /> */}
                                    </div>
                
                                    {/* Modal Body */}
                                    <div className="filter-modal-body">
                                        <form>
                                            {/* Property Type */}
                                            <div className="filter-section">
                                                <label className="filter-label">
                                                    <FiHome className="label-icon" size={16} />
                                                    {translate("propTypes")}
                                                </label>
                                                <div className="filter-input-wrapper form-input py-1">
                                                    <Autocomplete
                                                        disablePortal
                                                        options={categoryData}
                                                        getOptionLabel={(option) => option.category || ""}
                                                        onChange={handleCategoryChange}
                                                        onInputChange={handleCategorySearch}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                variant="outlined"
                                                                fullWidth
                                                                placeholder={translate("selectPropType")}
                                                                // className="form-input"
                                                            />
                                                        )}
                                                        loading={isLoading}
                                                        value={categoryData.find(cat => cat.id === formData.propType) || null}
                                                        popupIcon={<FiChevronDown size={18} />}
                                                    />
                                                </div>
                                            </div>
                
                                            {/* Location */}
                                            <div className="filter-section">
                                                <label className="filter-label">
                                                    <FiMapPin className="label-icon" size={16} />
                                                    {translate("selectYourLocation")}
                                                </label>
                                                <div className="filter-input-wrapper mt-0 form-input py-2">
                                                    <LocationSearchBox
                                                        onLocationSelected={handleLocationSelected} 
                                                        clearfilterLocation={clearfilterLocation} 
                                                    />
                                                </div>
                                            </div>
                
                                            {/* Budget Range */}
                                            <div className="filter-section">
                                                <label className="filter-label">
                                                    <FiDollarSign className="label-icon" size={16} />
                                                    {translate("budget")}
                                                </label>
                                                <div className="budget-range">
                                                    <div className="budget-input-group">
                                                        <span className="currency-symbol">$</span>
                                                        <input
                                                            type="number"
                                                            className="budget-input form-input py-2"
                                                            placeholder={translate("minPrice")}
                                                            name="minPrice"
                                                            value={formData.minPrice}
                                                            onChange={handleInputChange}
                                                            min="0"
                                                        />
                                                    </div>
                                                    <span className="range-separator">
                                                        <FiMinus size={14} />
                                                    </span>
                                                    <div className="budget-input-group">
                                                        <span className="currency-symbol">$</span>
                                                        <input
                                                            type="number"
                                                            className="budget-input form-input py-2"
                                                            placeholder={translate("maxPrice")}
                                                            name="maxPrice"
                                                            value={formData.maxPrice}
                                                            onChange={handleInputChange}
                                                            min="0"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                
                                            {/* Posted Since */}
                                            <div className="filter-section">
                                                <label className="filter-label">
                                                    <FiClock className="label-icon" size={16} />
                                                    {translate("postedSince")}
                                                </label>
                                                <div className="radio-group">
                                                    {[
                                                        { value: "anytime", label: "anytime", icon: FiCalendar },
                                                        { value: "lastWeek", label: "lastWeek", icon: FiClock },
                                                        { value: "yesterday", label: "yesterday", icon: FiSun }
                                                    ].map((option) => (
                                                        <label key={option.value} className="radio-option">
                                                            <input
                                                                type="radio"
                                                                name="postedSince"
                                                                value={option.value}
                                                                checked={formData.postedSince === option.value}
                                                                onChange={() => handlePostedSinceChange(option.value)}
                                                            />
                                                            <span className="radio-custom">
                                                                <option.icon size={14} />
                                                            </span>
                                                            <span className="radio-label">{translate(option.label)}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                
                                    {/* Modal Footer */}
                                    <div className="filter-modal-footer">
                                        <button className="clear-filter-btn" onClick={handleClearFilter}>
                                            <GrRefresh size={16} />
                                            <span>{translate("clearFilter")}</span>
                                        </button>
                                        <button className="apply-filter-btn" onClick={handleApplyFilter}>
                                            <FiCheck size={16} />
                                            <span>{translate("applyFilter")}</span>
                                            <div className="btn-shine"></div>
                                        </button>
                                    </div>
                                </div>
                            </Modal>
            </div>

            <div className="search_content container">
                <div id="feature_cards" className="row">
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, index) => (
                            <div className="col-sm-12 col-md-6 col-lg-3 loading_data" key={index}>
                                <VerticalCardSkeleton />
                            </div>
                        ))
                    ) : searchData && searchData.length > 0 ? (
                        searchData.map((ele, index) => (
                            <div className="col-sm-12 col-md-6 col-lg-6 col-xl-4 col-xxl-3" key={index}>
                              <VerticalCard ele={ele} />
                            </div>
                        ))
                    ) : (
                        <NoData />
                    )}
                    {searchData && searchData.length > 0 && hasMoreData ? (
                        <div className="col-12 loadMoreDiv" id="loadMoreDiv">
                            <button className='loadMore' onClick={handleLoadMore}>{translate("loadmore")}</button>
                        </div>
                    ) : null}
                </div>
            </div>
        </Layout>
    )
}

export default SearchPage
