"use client"
import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, LoadScript, Marker, Autocomplete, InfoWindow } from "@react-google-maps/api";
import { settingsData } from "@/store/reducer/settingsSlice";
import { useSelector } from "react-redux";
import { FiSearch } from "react-icons/fi";
import { ButtonGroup } from "react-bootstrap";
import { translate } from "@/utils/helper";
import MapCard from "../Cards/MapCard";
import { MdClose } from "react-icons/md";

const PropertiesOnLocationMap = ({ apiKey, onSelectLocation, latitude, longitude, data, setActiveTab, activeTab, fetchAllData }) => {


    const systemsettings = useSelector(settingsData)

    const libraries = ["places"];
    const getSafeNumber = (value, fallback) => {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };

    const [initialLocation, setInitialLocation] = useState({
        lat: getSafeNumber(latitude ?? systemsettings?.latitude, 31.5204),
        lng: getSafeNumber(longitude ?? systemsettings?.longitude, 74.3587),
    });

    const [location, setLocation] = useState(initialLocation);
    const [mapError, setMapError] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [clickedMarker, setClickedMarker] = useState(null);

    // Declare autocomplete as a ref
    const autocompleteRef = useRef(null);
    const priceSymbol = useSelector(settingsData);
    const PlaceHolderImg = priceSymbol?.web_placeholder_logo;
    useEffect(() => {
        const lat = getSafeNumber(latitude ?? systemsettings?.latitude, 31.5204);
        const lng = getSafeNumber(longitude ?? systemsettings?.longitude, 74.3587);
        const updatedInitialLocation = { lat, lng };
        setInitialLocation(updatedInitialLocation);
        setLocation(updatedInitialLocation);
    }, [latitude, longitude, systemsettings?.latitude, systemsettings?.longitude]);
    useEffect(() => {
    }, [clickedMarker]);
    const handleTabClick = (tab) => {
        setActiveTab(tab === "sell" ? 0 : 1);
    };
    const handleMapLoadError = () => {
        setMapError("Failed to load the map. Please check your API key and network connection.");
    };

    const handleSearchTextChange = (e) => {
        setSearchText(e.target.value);
    };

    const handlePlaceSelect = () => {
        if (autocompleteRef.current && searchText.trim() !== "") {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry) {
                // Extract the formatted address or provide a fallback value
                const formatted_address = place.formatted_address || "Address not available";

                const { city, country, state } = extractCityFromGeocodeResult(place);
                const updatedLocation = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    formatted_address: formatted_address,
                    city: city,
                    country: country,
                    state: state,
                };
                setSearchText(formatted_address);
                setLocation(updatedLocation);
                onSelectLocation(updatedLocation);



                // Scroll down after selecting a place
                const mapElement = document.getElementById("map");
                if (mapElement) {
                    mapElement.scrollIntoView({ behavior: "smooth" });
                }
            } else {
                console.error("No geometry available for selected place.");
            }
        }
    };

    const extractCityFromGeocodeResult = (geocodeResult) => {
        let city = null;
        let country = null;
        let state = null;

        // Iterate through address components to find relevant information
        for (const component of geocodeResult.address_components) {
            if (component.types.includes("locality")) {
                city = component.long_name;
            } else if (component.types.includes("country")) {
                country = component.long_name;
            } else if (component.types.includes("administrative_area_level_1")) {
                state = component.long_name;
            }
        }

        return { city, country, state };
    };


    const handleClearLocation = (e) => {
        e.preventDefault()
        setSearchText("")
        fetchAllData()

    }

    const CustomInfoWindowContent = ({ data, onClose }) => (
        
        <div className="infoWindowContent">
            <button className="closeButton" onClick={onClose}><MdClose size={18} /></button>
            <MapCard data={data} />
        </div>
    );

    return (
        <>
            <div id="map">
                {!apiKey ? (
                    <div className="container py-4">Google Map API key is missing.</div>
                ) : mapError ? (
                    <div>{mapError}</div>
                ) : (
                    <>
                        <LoadScript googleMapsApiKey={apiKey} libraries={libraries} onError={handleMapLoadError}>
                        <Autocomplete
                            onLoad={(autocomplete) => {
                                autocompleteRef.current = autocomplete;
                            }}
                        // onPlaceChanged={handlePlaceSelect}
                        >

                            <div id="searchbox1" className="container">
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
                                        <input className="searchinput" placeholder={translate("searchYourProperty")} name="propertySearch" value={searchText} onChange={handleSearchTextChange} />
                                    </div>
                                    <div id="leftside-buttons1">
                                        <button className="clear-map" onClick={handleClearLocation}>
                                            {translate("clear")}
                                        </button>
                                        <button className="find-map" onClick={handlePlaceSelect}>
                                            {translate("search")}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Autocomplete>

                        <GoogleMap zoom={11} center={location} id="properties_on_map_googlemap">
                            {data?.map((markerData, index) => (
                                <Marker
                                    key={index}
                                    position={{ lat: parseFloat(markerData?.latitude), lng: parseFloat(markerData?.longitude) }}
                                    onClick={() => setClickedMarker(markerData)}
                                    icon={{
                                        url: "/map-icon.svg",
                                    }}
                                />
                            ))}
                            {clickedMarker && (
                                <InfoWindow
                                    position={{ lat: parseFloat(clickedMarker?.latitude), lng: parseFloat(clickedMarker?.longitude) }}
                                    onCloseClick={() => setClickedMarker(null)}
                                >
                                    <CustomInfoWindowContent data={clickedMarker} onClose={() => setClickedMarker(null)} />
                                </InfoWindow>
                            )}
                        </GoogleMap>
                        </LoadScript>
                    </>
                )}
            </div>

        </>

    );

};

export default PropertiesOnLocationMap;
