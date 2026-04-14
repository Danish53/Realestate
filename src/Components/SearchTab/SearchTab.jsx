"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
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
import { getfilterData, filterDataaa } from "@/store/reducer/momentSlice";
import { BsPinMap } from "react-icons/bs";
import { GetAllCategorieApi } from "@/store/actions/campaign";
import { Autocomplete, TextField } from '@mui/material';
import debounce from 'lodash.debounce';
import { RiCloseCircleLine } from "react-icons/ri";

const SearchTab = () => {
    const router = useRouter();
    const searchBundle = useSelector(filterDataaa);
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

    /** Hero search box mirrors AI chat prompt when chat dispatches `getfilterData`. */
    useEffect(() => {
        if (!searchBundle || Array.isArray(searchBundle)) return;
        const si = searchBundle.searchInput;
        if (typeof si === "string" && si.trim() !== "") {
            setSearchInput(si);
        }
        if (typeof searchBundle.activeTab === "number") {
            setActiveTab(searchBundle.activeTab);
        }
    }, [searchBundle]);

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
        <div className="w-full max-w-5xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-4 sm:p-5">
                <ButtonGroup className="flex border-b border-gray-100 mb-4 w-fit">
                    <button
                        type="button"
                        className={`px-6 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${activeTab === 0 ? "text-primary-600 border-primary-600 bg-primary-50/50" : "text-gray-500 border-transparent hover:text-gray-700"}`}
                        onClick={() => handleTabClick("sell")}
                    >
                        {translate("sell")}
                    </button>
                    <button
                        type="button"
                        className={`px-6 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${activeTab === 1 ? "text-primary-600 border-primary-600 bg-primary-50/50" : "text-gray-500 border-transparent hover:text-gray-700"}`}
                        onClick={() => handleTabClick("rent")}
                    >
                        {translate("rent")}
                    </button>
                </ButtonGroup>
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all">
                        <FiSearch size={22} className="text-gray-400 shrink-0" />
                        <input 
                            className="w-full bg-transparent border-none outline-none px-3 text-gray-700 placeholder:text-gray-400 text-base"
                            placeholder={translate("searchYourProperty")} 
                            name="propertySearch" 
                            value={searchInput} 
                            onChange={(e) => setSearchInput(e.target.value)} 
                        />
                    </div>
                    <div className="flex flex-wrap md:flex-nowrap gap-3 shrink-0">
                        <button type="button" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors" onClick={() => router.push('/properties-on-map')} aria-label={translate("map")}>
                            <BsPinMap size={18} className="text-primary-500" />
                            <span className="md:hidden lg:inline">{translate("map")}</span>
                        </button>
                        <button type="button" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors" onClick={() => setShowFilterModal(true)} aria-label={translate("filter")}>
                            <BiFilter size={22} className="text-primary-500" />
                            <span className="md:hidden lg:inline">{translate("filter")}</span>
                        </button>
                        <button type="button" className="w-full text-white md:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary-600 font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30" onClick={handleSearch}>
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
              contentClassName="bg-transparent border-none"
            >
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 items-center justify-center hidden sm:flex">
                                <BiFilter size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 m-0">{translate("filterProp")}</h3>
                        </div>
                        <button type="button" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-500 hover:bg-red-50 transition-colors outline-none" onClick={handleHideFilterModal} aria-label="Close filter">
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        <form className="space-y-6">
                            {/* Property Type */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <FiHome className="text-primary-500" size={16} />
                                    {translate("propTypes")}
                                </label>
                                <div className="bg-gray-50 rounded-xl">
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
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        border: 'none',
                                                        '& fieldset': { border: 'none' },
                                                        '&:hover fieldset': { border: 'none' },
                                                        '&.Mui-focused fieldset': { border: 'none' },
                                                    }
                                                }}
                                            />
                                        )}
                                        loading={isLoading}
                                        value={categoryData.find(cat => cat.id === formData.propType) || null}
                                        popupIcon={<FiChevronDown size={18} className="text-gray-400" />}
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <FiMapPin className="text-primary-500" size={16} />
                                    {translate("selectYourLocation")}
                                </label>
                                <div className="bg-gray-50">
                                    <LocationSearchBox className=""
                                        onLocationSelected={handleLocationSelected} 
                                        clearfilterLocation={clearfilterLocation} 
                                    />
                                </div>
                            </div>

                            {/* Budget Range */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <FiDollarSign className="text-primary-500" size={16} />
                                    {translate("budget")}
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 flex items-center bg-gray-50   transition-all overflow-hidden">
                                        <span className="text-gray-500 font-medium">$</span>
                                        <input
                                            type="number"
                                            className="w-full bg-transparent border-none outline-none px-3 py-3 text-gray-700 placeholder:text-gray-400"
                                            placeholder={translate("minPrice")}
                                            name="minPrice"
                                            value={formData.minPrice}
                                            onChange={handleInputChange}
                                            min="0"
                                        />
                                    </div>
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400 shrink-0">
                                        <FiMinus size={14} />
                                    </span>
                                    <div className="flex-1 flex items-center bg-gray-50 transition-all overflow-hidden">
                                        <span className="text-gray-500 font-medium">$</span>
                                        <input
                                            type="number"
                                            className="w-full bg-transparent border-none outline-none px-3 py-3 text-gray-700 placeholder:text-gray-400"
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
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                    <FiClock className="text-primary-500" size={16} />
                                    {translate("postedSince")}
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { value: "anytime", label: "anytime", icon: FiCalendar },
                                        { value: "lastWeek", label: "lastWeek", icon: FiClock },
                                        { value: "yesterday", label: "yesterday", icon: FiSun }
                                    ].map((option) => (
                                        <label key={option.value} className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border cursor-pointer transition-all ${formData.postedSince === option.value ? 'bg-primary-50 border-primary-500 text-primary-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                            <input
                                                type="radio"
                                                name="postedSince"
                                                value={option.value}
                                                className="hidden"
                                                checked={formData.postedSince === option.value}
                                                onChange={() => handlePostedSinceChange(option.value)}
                                            />
                                            <option.icon size={16} className={formData.postedSince === option.value ? 'text-primary-500' : 'text-gray-400'} />
                                            <span className="text-sm font-semibold">{translate(option.label)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        <button type="button" className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-colors" onClick={handleClearFilter} aria-label={translate("clearFilter")}>
                            <GrRefresh size={16} />
                            <span>{translate("clearFilter")}</span>
                        </button>
                        <button type="button" className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30" onClick={handleApplyFilter} aria-label={translate("applyFilter")}>
                            <FiCheck size={18} />
                            <span>{translate("applyFilter")}</span>
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SearchTab;