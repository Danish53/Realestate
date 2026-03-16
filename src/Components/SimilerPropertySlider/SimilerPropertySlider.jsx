"use client"
import React, { useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
// import required modules
import { FreeMode, Pagination } from "swiper/modules";
import VerticalCard from "../Cards/VerticleCard";
import VerticalCardSkeleton from "../Skeleton/VerticalCardSkeleton";


import { store } from "@/store/store";
import { translate } from "@/utils/helper";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import ComparePropertyModal from "../CompareProperties/ComparePropertyModal";


const SimilerPropertySlider = ({ data, isLoading, isUserProperty, currentPropertyId }) => {

    const [showCompareModal, setShowCompareModal] = useState(false);


    // Calculate the number of subscription plans, default to 0 if undefined/null
    const planCount = data?.length || 0;

    // Determine the base slidesPerView dynamically
    // If the number of plans is less than 3.5, use the plan count.
    // Otherwise, use the default 3.5. This prevents layout issues when few plans exist.
    const baseSlidesPerView = planCount < 3 ? planCount : 3;

    // Disable loop if there are not enough slides to loop meaningfully (less than slidesPerView)
    // Note: We compare against the *base* slidesPerView here for simplicity.
    // A more complex logic could check against breakpoint values too.
    const enableLoop = planCount >= baseSlidesPerView;

    const breakpoints = {
        320: { slidesPerView: 1 },
        576: { slidesPerView: 2 },
        768: { slidesPerView: 2 },
        992: { slidesPerView: 3 },
        1200: { slidesPerView: 3 },
        1400: { slidesPerView: 3 },
    };

    const language = store.getState().Language.languages;

    const handleOpenCompareModal = () => {
        setShowCompareModal(true);
    };

    const handleCloseCompareModal = () => {
        setShowCompareModal(false);
    };

    return (
        <div id="similer-properties" className="mt-12">
            {data?.length > 0 ? (
                <>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {translate("compareWithSimilar")} {" "}
                            <span className="text-primary-500">{translate("properties")}</span>
                        </h2>
                    </div>
                    
                    <div className="flex flex-col xl:flex-row gap-6 items-stretch">
                        <div className="flex-1 min-w-0">
                            {data?.length > 4 ? (
                                <Swiper
                                    dir={language.rtl === 1 ? "rtl" : "ltr"}
                                    slidesPerView={baseSlidesPerView}
                                    spaceBetween={20}
                                    freeMode={true}
                                    pagination={{
                                        clickable: true,
                                    }}
                                    loop={enableLoop}
                                    modules={[FreeMode, Pagination]}
                                    className="pb-12" // Padding bottom for pagination dots
                                    breakpoints={breakpoints}
                                >
                                    {isLoading ? (
                                        Array.from({ length: 6 }).map((_, index) => (
                                            <SwiperSlide key={index}>
                                                <div className="h-full">
                                                    <VerticalCardSkeleton />
                                                </div>
                                            </SwiperSlide>
                                        ))
                                    ) : (
                                        data &&
                                        data.map((ele, index) => (
                                            <SwiperSlide key={index} className="h-auto">
                                                <VerticalCard ele={ele} isUserProperty={isUserProperty} />
                                            </SwiperSlide>
                                        ))
                                    )}
                                </Swiper>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {data.map((ele, index) => (
                                        <div key={index} className="h-full">
                                            <VerticalCard ele={ele} isUserProperty={isUserProperty} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Comparison Card inside the row */}
                        {/* <div className="w-full xl:w-[320px] shrink-0 xl:h-auto">
                            <div className="bg-primary-50/50 border border-primary-100/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px] shadow-sm transform transition-all hover:-translate-y-1 hover:shadow-md">
                                <div className="w-16 h-16 bg-white shrink-0 rounded-full flex items-center justify-center text-primary-500 shadow-sm mb-6">
                                    <FaArrowRightArrowLeft size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{translate("compareTitle")}</h3>
                                <p className="text-gray-500 mb-8">{translate("compareDesc")}</p>
                                <button 
                                    className="mt-auto bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl shadow-sm hover:shadow transition-all w-full md:w-auto" 
                                    onClick={handleOpenCompareModal}
                                >
                                    {translate("compareNow")}
                                </button>
                            </div>
                        </div> */}
                    </div>

                    {/* Property Compare Modal */}
                    <ComparePropertyModal
                        show={showCompareModal}
                        handleClose={handleCloseCompareModal}
                        similarProperties={data}
                        currentPropertyId={currentPropertyId}
                    />
                </>
            ) : null}
        </div>
    );
};

export default SimilerPropertySlider;
