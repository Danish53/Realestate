"use client";
import React, { useEffect, useState } from "react";
import { translate } from "@/utils/helper";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import LocationSearchBox from "../Location/LocationSearchBox";
import {
  GetAllCategorieApi,
  getFacilitiesForFilterApi,
} from "@/store/actions/campaign";
import debounce from "lodash.debounce";
import { Autocomplete, TextField } from "@mui/material";

const FilterForm = (props) => {
  
  const [categoryData, setCategoryData] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFacilities, setShowFacilities] = useState(false);

  const handleCategorySearch = (event, newInputValue) => {
    debouncedFetchCategories(newInputValue);
  };

  const fetchAllCategories = (searchTerm = "") => {
    setIsLoading(true);
    try {
      GetAllCategorieApi({
        search: searchTerm,
        onSuccess: (response) => {
          const categories = response?.data;
          setCategoryData(categories);
          setIsLoading(false);
        },
        onError: (error) => {
          console.log(error);
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.log("error", error);
    }
  };
  const fetchFacilitiesForFilter = () => {
    try {
      getFacilitiesForFilterApi({
        onSuccess: (res) => {
          setFacilities(res?.data);
        },
        onError: (err) => {
          console.log(err);
        },
      });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchAllCategories();
    fetchFacilitiesForFilter();
  }, []);

  useEffect(() => {}, [categoryData]);

  // Debounced function to handle search
  const debouncedFetchCategories = debounce((searchTerm) => {
    fetchAllCategories(searchTerm);
  }, 1000); // Adjust delay as needed

  const handleCategoryChange = (event, newValue) => {
    props?.setFilterData((prev) => ({
      ...prev,
      category: newValue ? newValue.id : "", // Handles default option
    }));
  };
  return (
    <div id="filter-card" className="all-prop-filter-card">
      <div id="filter-title" className="all-prop-filter-header">
        <span>{translate("filterProp")}</span>
        <button
          type="button"
          className="all-prop-filter-clear"
          onClick={props.handleClearFilter}
        >
          {translate("clearFilter")}
        </button>
      </div>

      <div className="card-body all-prop-filter-body">
        {/* Purpose Toggles */}
        <div className="all-prop-filter-group">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
              props.filterData.propType === 0 ? "bg-white text-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => props?.handleTabClick("sell")}
          >
            {translate("forSell")}
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
              props.filterData.propType === 1 ? "bg-white text-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => props.handleTabClick("rent")}
          >
            {translate("forRent")}
          </button>
        </div>
        </div>

        {/* Property Type */}
        {props.type !== "categories" && (
          <div className="all-prop-filter-group">
            <label className="block text-sm font-semibold text-gray-900 mb-2">{translate("propTypes")}</label>
            <Autocomplete
              disableCloseOnSelect
              options={categoryData}
              getOptionLabel={(option) => option.category || ""}
              onChange={handleCategoryChange}
              onInputChange={handleCategorySearch}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select Property Type"
                  variant="outlined"
                  size="small"
                  className="w-full bg-gray-50/50"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': { borderColor: '#E5E7EB' },
                      '&:hover fieldset': { borderColor: '#D1D5DB' },
                      '&.Mui-focused fieldset': { borderColor: 'var(--primary-color)' },
                    }
                  }}
                />
              )}
              loading={isLoading}
              value={categoryData.find((cat) => cat.id === props.filterData.category) || null}
            />
          </div>
        )}

        {/* Location */}
        {props.type !== "city" && (
          <div className="all-prop-filter-group">
            <label className="block text-sm font-semibold text-gray-900 mb-2">{translate("selectYourLocation")}</label>
            <div className="w-full border border-gray-200 rounded-xl bg-gray-50/50 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 overflow-hidden">
                <LocationSearchBox
                  onLocationSelected={props.handleLocationSelected}
                  selectedLocation={props?.selectedLocation}
                  clearfilterLocation={props?.clearfilterLocation}
                />
            </div>
          </div>
        )}

        {/* Budget */}
        <div className="all-prop-filter-group">
          <label className="block text-sm font-semibold text-gray-900 mb-2">{translate("budget")}</label>
          <div className="flex items-center gap-3">
            <div className="w-1/2">
                <input
                  className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-2.5"
                  type="number"
                  placeholder="Min"
                  name="minPrice"
                  value={props.filterData.minPrice}
                  onChange={props.handleInputChange}
                />
            </div>
            <span className="text-gray-400">-</span>
            <div className="w-1/2">
                <input
                  className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-2.5"
                  type="number"
                  placeholder="Max"
                  name="maxPrice"
                  value={props.filterData.maxPrice}
                  onChange={props.handleInputChange}
                />
            </div>
          </div>
        </div>

        {/* Posted Since */}
        <div className="all-prop-filter-group">
          <label className="block text-sm font-semibold text-gray-900 mb-3">{translate("postedSince")}</label>
          <div className="space-y-3 pl-1">
            {[
              { id: "anytime", label: translate("anytime") },
              { id: "lastWeek", label: translate("lastWeek") },
              { id: "yesterday", label: translate("yesterday") }
            ].map((option) => (
              <label key={option.id} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="postedSince"
                    value={option.id}
                    className="peer appearance-none w-5 h-5 border border-gray-300 rounded-full checked:border-primary-500 cursor-pointer transition-colors"
                    checked={props.filterData.postedSince === option.id}
                    onChange={(e) => props.handlePostedSinceChange(e.target.value)}
                  />
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-primary-500 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                </div>
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Facilities */}
        <div className="all-prop-filter-group all-prop-facilities">
          <button
            type="button"
            onClick={() => setShowFacilities(!showFacilities)}
            className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 group focus:outline-none"
          >
            <span>{translate("facilities")}</span>
            <div className={`p-1 rounded-full group-hover:bg-gray-100 transition-colors ${showFacilities ? 'bg-gray-100' : ''}`}>
               {showFacilities ? <RiArrowUpSLine size={20} className="text-gray-500" /> : <RiArrowDownSLine size={20} className="text-gray-500" />}
            </div>
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${showFacilities ? "max-h-[500px] mt-4 opacity-100" : "max-h-0 opacity-0"}`}
          >
            <div className="space-y-3 pl-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {facilities?.map((facility) => (
                <label key={facility.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="peer appearance-none w-5 h-5 border border-gray-300 rounded-md checked:bg-primary-500 checked:border-primary-500 cursor-pointer transition-colors"
                      onChange={(event) => props?.handleFacilityChange(event, facility.id)}
                      checked={
                        Array.isArray(props?.filterData.facilitiesIds)
                          ? props?.filterData.facilitiesIds.includes(facility.id)
                          : (props?.filterData.facilitiesIds?.split(",") || []).includes(facility.id.toString())
                      }
                    />
                    <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    {facility.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterForm;
