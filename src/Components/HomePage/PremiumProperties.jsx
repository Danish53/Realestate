"use client";
import React from "react";
import VerticalCard from "../Cards/VerticleCard";
import Link from "next/link";
import MobileHeadline from "../MobileHeadlines/MobileHeadline";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import VerticalCardSkeleton from "../Skeleton/VerticalCardSkeleton";
import { translate } from "@/utils/helper";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/navigation";
// import required modules
import { FreeMode, Grid, Pagination } from "swiper/modules";

const PremiumProperties = ({
  getFeaturedListing,
  isLoading,
  language,
  sectionTitle,
}) => {
  const breakpoints = {
    0: {
      slidesPerView: 1.1,
    },
    375: {
      slidesPerView: 1.5,
    },
    576: {
      slidesPerView: 2,
    },
    768: {
      slidesPerView: 2.5,
    },
    992: {
      slidesPerView: 3,
    },
    1200: {
      slidesPerView: 4,
    },
    1400: {
      slidesPerView: 4,
    },
  };
  return (
    <>
      {isLoading ? (
        <section className="py-16 lg:py-24 bg-gray-50/50">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                {sectionTitle}
              </h2>
              <div className="hidden sm:block">
                  <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
              </div>
            </div>
            
            <div className="block sm:hidden mb-6">
              <MobileHeadline
                data={{
                  text: sectionTitle,
                  link: "/premium-properties",
                }}
              />
            </div>
            
            <div className="-mx-4 sm:mx-0 sm:px-0">
              <Swiper
                key={language.rtl}
                slidesPerView={2}
                freeMode={true}
                spaceBetween={24}
                pagination={{ clickable: true }}
                modules={[Pagination, FreeMode]}
                breakpoints={breakpoints}
                className="pb-12"
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <SwiperSlide key={index}>
                    <VerticalCardSkeleton />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      ) : (
        getFeaturedListing?.length > 0 && (
          <section className="py-16 bg-white overflow-hidden">
            <div className="container mx-auto px-4 max-w-7xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 gap-4">
                <div className="max-w-2xl">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
                        {sectionTitle}
                    </h2>
                    <p className="text-gray-600 text-base sm:text-lg flex items-center gap-2">
                        {translate("discoverPremium", "Discover our most premium properties")}
                    </p>
                </div>
                
                {getFeaturedListing.length > 8 && (
                  <div className="hidden sm:block shrink-0">
                    <Link href="/premium-properties">
                      <button 
                        type="button" 
                        className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-2 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden"
                        aria-label={translate("seeAllProp")}
                      >
                        <span>{translate("seeAllProp")}</span>
                        <div className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 group-hover:bg-white group-hover:text-primary-600 flex items-center justify-center transition-colors">
                          {language.rtl === 1 ? <BsArrowLeft size={14} /> : <BsArrowRight size={14} />}
                        </div>
                      </button>
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="block sm:hidden mb-6">
                <MobileHeadline
                  data={{
                    text: sectionTitle,
                    link: getFeaturedListing.length > 8 ? "/premium-properties" : "",
                  }}
                />
              </div>

              <div className="-mx-4 sm:mx-0 sm:px-0 relative">
                <Swiper
                  key={language.rtl}
                  slidesPerView={2}
                  freeMode={true}
                  spaceBetween={24}
                  pagination={{ 
                    clickable: true,
                    dynamicBullets: true, 
                  }}
                  modules={[Pagination, FreeMode]}
                  breakpoints={breakpoints}
                  className="pb-14 swiper-custom-pagination"
                >
                  {getFeaturedListing.map((ele, index) => (
                    <SwiperSlide key={index} className="h-auto">
                      <VerticalCard ele={ele} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </section>
        )
      )}
    </>
  );
};

export default PremiumProperties;
