"use client";
import React from "react";
import MobileHeadline from "../MobileHeadlines/MobileHeadline";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";
// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import { translate } from "@/utils/helper";
import VerticalCardSkeleton from "../Skeleton/VerticalCardSkeleton";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import UserRecommendationCard from "../Cards/UserRecommendationCard";

const UserRecommendationProperty = ({
  isLoading,
  language,
  userRecommendationData,
  breakpointsMostFav,
  sectionTitle,
}) => {
  
  return (
    <div>
      {isLoading ? (
        <section className="py-16 lg:py-24 bg-gray-50/50">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                {sectionTitle || translate("personalizeFeed")}
              </h2>
              <div className="hidden sm:block">
                  <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
              </div>
            </div>
            
            <div className="block sm:hidden mb-6">
              <MobileHeadline
                data={{
                  text: sectionTitle || translate("personalizeFeed"),
                  link: "",
                }}
              />
            </div>
            
            <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
              <Swiper
                key={language.rtl}
                dir={language.rtl === 1 ? "rtl" : "ltr"}
                slidesPerView={4}
                freeMode={true}
                spaceBetween={24}
                pagination={{ clickable: true }}
                modules={[Pagination, FreeMode]}
                breakpoints={breakpointsMostFav}
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
      ) : userRecommendationData && userRecommendationData.length > 0 ? (
        <section className="py-16 lg:py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 gap-4">
              <div className="max-w-2xl">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                      {sectionTitle || translate("personalizeFeed")}
                  </h2>
              </div>
              
              {userRecommendationData.length > 4 && (
                <div className="hidden sm:block shrink-0">
                  <Link href="/all-personalized-feeds">
                    <button 
                      type="button" 
                      className="group inline-flex items-center justify-center gap-3 bg-white border-2 border-primary-500 text-primary-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-500 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      aria-label={translate("seeAllProp")}
                    >
                      <span>{translate("seeAllProp")}</span>
                      <div className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 group-hover:bg-white flex items-center justify-center transition-colors">
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
                  text: sectionTitle || translate("personalizeFeed"),
                  link: userRecommendationData.length > 4 ? "/all-personalized-feeds" : "",
                }}
              />
            </div>

            <div className="-mx-4 px-4 sm:mx-0 sm:px-0 relative" dir={language.rtl === 1 ? "rtl" : "ltr"}>
              <Swiper
                key={language.rtl}
                slidesPerView={4}
                freeMode={true}
                spaceBetween={24}
                pagination={{ 
                  clickable: true,
                  dynamicBullets: true, 
                }}
                modules={[Pagination, FreeMode]}
                breakpoints={breakpointsMostFav}
                className="pb-14 swiper-custom-pagination"
              >
                {userRecommendationData.map((ele, index) => (
                  <SwiperSlide key={index} className="h-auto">
                    <UserRecommendationCard ele={ele} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default UserRecommendationProperty;
