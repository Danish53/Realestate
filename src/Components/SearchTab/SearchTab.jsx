"use client";
import React, { useEffect, useState } from "react";
import { ButtonGroup, Modal } from "react-bootstrap";
import { 
  FiCalendar, 
  FiCheck, 
  FiChevronDown,  // Added this import
  FiClock, 
  FiDollarSign, 
  FiHome, 
  FiMapPin, 
  FiMinus, 
  FiSearch, 
  FiSun, 
  FiX 
} from "react-icons/fi";
import { BiFilter } from "react-icons/bi";
import { translate } from "@/utils/helper";
import LocationSearchBox from "../Location/LocationSearchBox";
import { GrRefresh } from "react-icons/gr";
import { useRouter } from "next/router";
import { getfilterData } from "@/store/reducer/momentSlice";
import { BsPinMap } from "react-icons/bs";
import { GetAllCategorieApi } from "@/store/actions/campaign";
import { Autocomplete, TextField } from '@mui/material';
import debounce from 'lodash.debounce';
import { RiCloseCircleLine } from "react-icons/ri";

const SearchTab = () => {
    const router = useRouter();
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterD, setFilterD] = useState();
    const [formData, setFormData] = useState({
        propType: "",
        minPrice: "",
        maxPrice: "",
        postedSince: "anytime",  // Fixed: default value
        selectedLocation: null,
    });
    const [activeTab, setActiveTab] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const [categoryData, setCategoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [clearfilterLocation, setClearFilerLocation] = useState(false);

    const handleHideFilterModal = () => {
        setShowFilterModal(false);
    };

    const handleCategorySearch = (event, newInputValue) => {
        debouncedFetchCategories(newInputValue);
    };

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'minPrice' || name === 'maxPrice') {
            const sanitizedValue = value === '' ? '' : Math.max(parseFloat(value) || 0, 0);
            setFormData(prev => ({
                ...prev,
                [name]: sanitizedValue,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Fixed: Accept value directly instead of event
    const handlePostedSinceChange = (value) => {
        setFormData({
            ...formData,
            postedSince: value,
        });
    };

    const handleLocationSelected = (locationData) => {
        setFormData({
            ...formData,
            selectedLocation: locationData,
        });
        setClearFilerLocation(false);
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab === "sell" ? 0 : 1);
    };

    const handleApplyFilter = () => {
        let postedSinceValue = "";
        if (formData.postedSince === "yesterday") {
            postedSinceValue = "1";
        } else if (formData.postedSince === "lastWeek") {
            postedSinceValue = "7";
        }

        const filterData = {
            propType: formData.propType || "",
            minPrice: formData.minPrice || "",
            maxPrice: formData.maxPrice || "",
            postedSince: postedSinceValue,
            selectedLocation: formData.selectedLocation || null,
        };
        setFilterD(filterData);
        setShowFilterModal(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();

        const searchData = {
            filterData: filterD,
            activeTab: activeTab,
            searchInput: searchInput,
        };
        getfilterData(searchData);
        router.push(`/search`);
    };

    const handleClearFilter = () => {
        setClearFilerLocation(true);
        setFormData({
            propType: "",
            minPrice: "",
            maxPrice: "",
            postedSince: "anytime",  // Reset to default
            selectedLocation: null,
        });
    };

    return (
        <div>
            <div id="searchbox" className="container">
                <ButtonGroup className="group_radio">
                    <ul className="nav nav-tabs" id="tabs">
                        <li className="">
                            <a 
                              className={`nav-link ${activeTab === 0 ? "tab-0" : ""}`} 
                              aria-current="page" 
                              id="sellbutton" 
                              onClick={() => handleTabClick("sell")}
                            >
                                {translate("sell")}
                            </a>
                        </li>
                        <li className="">
                            <a 
                              className={`nav-link ${activeTab === 1 ? "tab-1" : ""}`} 
                              onClick={() => handleTabClick("rent")} 
                              aria-current="page" 
                              id="rentbutton"
                            >
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
                        />
                    </div>
                    <div id="leftside-buttons">
                        <button className="map_add" onClick={() => router.push('/properties-on-map')}>
                            <BsPinMap size={20} className="ms-2" />
                            <span>{translate("map")}</span>
                        </button>
                        <button className="map_add" onClick={() => setShowFilterModal(true)}>
                            <BiFilter size={25} className="ms-2" />
                            <span>{translate("filter")}</span>
                        </button>
                        <button className="find" onClick={handleSearch}>
                            <span>{translate("search")}</span>
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
    );
};

export default SearchTab;