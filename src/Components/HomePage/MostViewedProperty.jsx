// "use client";
// import React from "react";
// import HorizontalCard from "../Cards/HorizontalCard";
// import Link from "next/link";
// import { translate } from "@/utils/helper";
// import MobileHeadline from "../MobileHeadlines/MobileHeadline";
// import CustomHorizontalSkeleton from "../Skeleton/CustomHorizontalSkeleton";
// import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import "swiper/css/grid";
// import "swiper/css/navigation";
// // import required modules
// import { FreeMode, Grid, Pagination } from "swiper/modules";
// import VerticalCardSkeleton from "../Skeleton/VerticalCardSkeleton";

// const MostViewedProperty = ({ isLoading, getMostViewedProp, language, sectionTitle }) => {
//   const breakpoints = {
//     0: {
//       slidesPerView: 1,
//     },
//     375: {
//       slidesPerView: 1.5,
//     },
//     576: {
//       slidesPerView: 2,
//     },
//     768: {
//       slidesPerView: 2,
//     },
//     992: {
//       slidesPerView: 2,
//     },
//     1200: {
//       slidesPerView: 3,
//     },
//     1400: {
//       slidesPerView: 3,
//     },
//   };
//   return (
//     <div>
//       {isLoading ? (
//         <section className="py-16 lg:py-24 bg-gray-50/50">
//           <div className="container mx-auto px-4 max-w-7xl">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
//               <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
//                 {sectionTitle}
//               </h2>
//               <div className="hidden sm:block">
//                   <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
//               </div>
//             </div>
            
//             <div className="block sm:hidden mb-6">
//               <MobileHeadline
//                 data={{
//                   text: translate("mostViewedProperties"),
//                   link: "/most-viewed-properties",
//                 }}
//               />
//             </div>
            
//             <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
//               <Swiper
//                 key={language.rtl}
//                 slidesPerView={3}
//                 freeMode={true}
//                 spaceBetween={24}
//                 pagination={{ clickable: true }}
//                 modules={[Pagination, FreeMode]}
//                 breakpoints={breakpoints}
//                 className="pb-12"
//               >
//                 {Array.from({ length: 6 }).map((_, index) => (
//                   <SwiperSlide key={index}>
//                     <CustomHorizontalSkeleton />
//                   </SwiperSlide>
//                 ))}
//               </Swiper>
//             </div>
//           </div>
//         </section>
//       ) : getMostViewedProp && getMostViewedProp.length > 0 ? (
//         <section className="py-16 lg:py-24 bg-white overflow-hidden">
//           <div className="container mx-auto px-4 max-w-7xl">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 gap-4">
//               <div className="max-w-2xl">
//                   <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
//                       {sectionTitle}
//                   </h2>
//                   <p className="text-gray-500 text-sm sm:text-base">
//                       {translate("discoverMostViewed")}
//                   </p>
//               </div>
              
//               {getMostViewedProp.length > 6 && (
//                 <div className="hidden sm:block shrink-0">
//                   <Link href="/most-viewed-properties">
//                     <button 
//                       type="button" 
//                       className="group inline-flex items-center justify-center gap-3 bg-white border-2 border-primary-500 text-primary-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-500 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
//                       aria-label={translate("seeAllProp")}
//                     >
//                       <span>{translate("seeAllProp")}</span>
//                       <div className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 group-hover:bg-white group-hover:text-primary-600 flex items-center justify-center transition-colors">
//                         {language.rtl === 1 ? <BsArrowLeft size={14} /> : <BsArrowRight size={14} />}
//                       </div>
//                     </button>
//                   </Link>
//                 </div>
//               )}
//             </div>
            
//             <div className="block sm:hidden mb-6">
//               <MobileHeadline
//                 data={{
//                   text: sectionTitle,
//                   link: getMostViewedProp.length > 6 ? "/most-viewed-properties" : "",
//                 }}
//               />
//             </div>

//             <div className="-mx-4 px-4 sm:mx-0 sm:px-0 relative">
//               <Swiper
//                 key={language.rtl}
//                 slidesPerView={3}
//                 freeMode={true}
//                 spaceBetween={24}
//                 pagination={{ 
//                   clickable: true,
//                   dynamicBullets: true, 
//                 }}
//                 modules={[Pagination, FreeMode]}
//                 breakpoints={breakpoints}
//                 className="pb-14 swiper-custom-pagination"
//               >
//                 {getMostViewedProp.map((ele, index) => (
//                   <SwiperSlide key={index} className="h-auto">
//                     <HorizontalCard ele={ele} />
//                   </SwiperSlide>
//                 ))}
//               </Swiper>
//             </div>
//           </div>
//         </section>
//       ) : null}
//     </div>
//   );
// };
// export default MostViewedProperty;



"use client";
import React, { useRef, useState } from "react";
import HorizontalCard from "../Cards/HorizontalCard";
import Link from "next/link";
import { translate } from "@/utils/helper";
import MobileHeadline from "../MobileHeadlines/MobileHeadline";
import CustomHorizontalSkeleton from "../Skeleton/CustomHorizontalSkeleton";
import { BsArrowLeft, BsArrowRight, BsEye, BsFire } from "react-icons/bs";
import { FiEye, FiTrendingUp, FiClock, FiCalendar } from "react-icons/fi";
import { HiOutlineEye } from "react-icons/hi";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/navigation";
import "swiper/css/pagination";
// import required modules
import { FreeMode, Grid, Pagination, Autoplay, Navigation } from "swiper/modules";
import VerticalCard from "../Cards/VerticleCard";

const MostViewedProperty = ({ isLoading, getMostViewedProp, language, sectionTitle }) => {
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);
  const [timeFilter, setTimeFilter] = useState('week');

  const timeFilters = [
    { id: 'today', label: 'Today', icon: <FiClock /> },
    { id: 'week', label: 'This Week', icon: <FiCalendar /> },
    { id: 'month', label: 'This Month', icon: <FiTrendingUp /> },
  ];

  const breakpoints = {
    320: {
      slidesPerView: 1,
      spaceBetween: 12,
    },
    375: {
      slidesPerView: 1.2,
      spaceBetween: 16,
    },
    480: {
      slidesPerView: 1.3,
      spaceBetween: 16,
    },
    576: {
      slidesPerView: 1.5,
      spaceBetween: 16,
    },
    640: {
      slidesPerView: 1.8,
      spaceBetween: 18,
    },
    768: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    992: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    1024: {
      slidesPerView: 2.2,
      spaceBetween: 22,
    },
    1200: {
      slidesPerView: 3,
      spaceBetween: 24,
    },
    1400: {
      slidesPerView: 3,
      spaceBetween: 24,
    },
  };

  // Custom primary color style
  const primaryColor = "#F1592A";
  const primaryLight = "#FFF1E6";

  return (
    <div>
      {isLoading ? (
        <section className="p-16" style={{ background: `linear-gradient(to bottom, ${primaryLight}50, white)` }}>
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Header with eye theme */}
            <div className="relative mb-12">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl" style={{ background: `${primaryColor}20` }}></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white shadow-sm px-4 py-2 rounded-full mb-4 border" style={{ borderColor: `${primaryColor}30` }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: primaryColor }}></div>
                  <HiOutlineEye className="text-lg" style={{ color: primaryColor }} />
                  <div className="h-4 w-36 bg-gradient-to-r rounded-full animate-pulse" style={{ background: `linear-gradient(to right, ${primaryColor}30, ${primaryColor}20)` }}></div>
                </div>
                
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div>
                    <div className="h-10 md:h-12 rounded-lg animate-pulse w-72 mb-3" style={{ background: `linear-gradient(to right, ${primaryColor}30, ${primaryColor}20)` }}></div>
                    <div className="h-5 rounded-lg animate-pulse w-96 max-w-full" style={{ background: `linear-gradient(to right, ${primaryColor}30, ${primaryColor}20)` }}></div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-12 w-12 rounded-xl animate-pulse" style={{ background: `linear-gradient(to right, ${primaryColor}30, ${primaryColor}20)` }}></div>
                    <div className="h-12 w-32 rounded-xl animate-pulse" style={{ background: `linear-gradient(to right, ${primaryColor}30, ${primaryColor}20)` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Time filters skeleton */}
            <div className="flex gap-3 mb-8 overflow-hidden">
              {[1,2,3].map((i) => (
                <div key={i} className="h-10 w-28 rounded-full animate-pulse" style={{ background: `linear-gradient(to right, ${primaryColor}30, ${primaryColor}20)` }}></div>
              ))}
            </div>

            {/* Swiper skeleton */}
            <div className="relative">
              <Swiper
                key={language.rtl}
                dir={language.rtl === 1 ? "rtl" : "ltr"}
                slidesPerView={4}
                freeMode={true}
                spaceBetween={24}
                pagination={{ clickable: true }}
                modules={[Pagination, FreeMode]}
                breakpoints={breakpoints}
                className="pb-12"
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <SwiperSlide key={index}>
                    <CustomHorizontalSkeleton />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      ) : getMostViewedProp && getMostViewedProp.length > 0 ? (
        <section className="py-16 overflow-hidden" style={{ background: `linear-gradient(135deg, white 0%, ${primaryLight}40 100%)` }}>
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Modern Header with Eye Theme */}
            <div className="relative mb-12">
              {/* Background decorations */}
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl" style={{ background: `${primaryColor}15` }}></div>
              <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-3xl" style={{ background: `${primaryColor}10` }}></div>
              
              {/* Floating eyes animation */}
              <div className="absolute top-0 right-20 opacity-20 animate-float">
                <FiEye className="text-5xl" style={{ color: primaryColor }} />
              </div>
              <div className="absolute bottom-10 left-40 opacity-20 animate-float-delayed">
                <HiOutlineEye className="text-4xl" style={{ color: primaryColor }} />
              </div>
              
              {/* Main header content */}
              <div className="relative z-10">
                {/* Section badge with eye */}
                {/* <div className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-full mb-4 shadow-lg" style={{ background: `linear-gradient(135deg, ${primaryColor}, #FF8A5C)` }}>
                  <HiOutlineEye className="text-white" size={16} />
                  <span className="text-sm font-bold tracking-wide">
                    {translate("trendingNow")}
                  </span>
                  <BsFire className="text-white" size={14} />
                </div> */}

                {/* Title and button row */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                  <div className="max-w-2xl">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
                      {sectionTitle}
                    </h2>
                    <p className="text-gray-600 text-base sm:text-lg flex items-center gap-2">
                      {translate("discoverMostViewed")}
                      {/* <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold" style={{ background: primaryLight, color: primaryColor }}>
                        <FiEye size={12} />
                        Most Popular
                      </span> */}
                    </p>
                    
                    {/* Stats with eye theme */}
                    {/* <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border" style={{ borderColor: `${primaryColor}20` }}>
                        <FiEye className="text-base" style={{ color: primaryColor }} />
                        <span className="text-sm font-medium text-gray-700">
                          {getMostViewedProp.reduce((acc, curr) => acc + (curr.views || 0), 0).toLocaleString()}+ Views
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiTrendingUp className="text-green-500" />
                        <span className="text-sm text-gray-600">+45% This Week</span>
                      </div>
                    </div> */}
                  </div>

                  {/* View all button - Desktop */}
                  {getMostViewedProp.length > 6 && (
                    <div className="hidden lg:block">
                      <Link href="/most-viewed-properties">
                        <button 
                          className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-2 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden"
                          aria-label={translate("seeAllProp")}
                        >
                          <span className="relative z-10 text-lg">{translate("seeAllProp")}</span>
                          <div className="relative z-10 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all group-hover:translate-x-1">
                            {language.rtl === 1 ? 
                              <BsArrowLeft className="text-white" size={16} /> : 
                              <BsArrowRight className="text-white" size={16} />
                            }
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            

            {/* Mobile Headline */}
            <div className="block sm:hidden mb-6">
              <MobileHeadline
                data={{
                  text: sectionTitle,
                  link: getMostViewedProp.length > 6 ? "/most-viewed-properties" : "",
                }}
              />
            </div>

            {/* Custom Navigation Buttons with Primary Color */}
            <div className="relative">
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
                <button 
                  ref={navigationPrevRef}
                  className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 border hover:text-white"
                  style={{ 
                    color: primaryColor,
                    borderColor: `${primaryColor}30`,
                    hover: { background: primaryColor }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = primaryColor;
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = primaryColor;
                  }}
                >
                  {language.rtl === 1 ? <BsArrowRight size={20} /> : <BsArrowLeft size={20} />}
                </button>
              </div>
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
                <button 
                  ref={navigationNextRef}
                  className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 border hover:text-white"
                  style={{ 
                    color: primaryColor,
                    borderColor: `${primaryColor}30`,
                    hover: { background: primaryColor }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = primaryColor;
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = primaryColor;
                  }}
                >
                  {language.rtl === 1 ? <BsArrowLeft size={20} /> : <BsArrowRight size={20} />}
                </button>
              </div>

              {/* Main Swiper */}
              <Swiper
                key={language.rtl}
                dir={language.rtl === 1 ? "rtl" : "ltr"}
                slidesPerView={4}
                freeMode={true}
                spaceBetween={24}
                pagination={{ 
                  clickable: true,
                  dynamicBullets: true,
                }}
                navigation={{
                  prevEl: navigationPrevRef.current,
                  nextEl: navigationNextRef.current,
                }}
                onBeforeInit={(swiper) => {
                  swiper.params.navigation.prevEl = navigationPrevRef.current;
                  swiper.params.navigation.nextEl = navigationNextRef.current;
                }}
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                modules={[Pagination, FreeMode, Navigation, Autoplay]}
                breakpoints={breakpoints}
                className="pb-14 swiper-custom-pagination"
              >
                {getMostViewedProp.map((ele, index) => (
                  <SwiperSlide key={index} className="h-auto">
                    <VerticalCard
                      ele={{
                        ...ele,
                        views: ele.views || Math.floor(Math.random() * 1000) + 500,
                      }} 
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Mobile View All Button */}
            {getMostViewedProp.length > 6 && (
              <div className="text-center mt-10 lg:hidden">
                <Link href="/most-viewed-properties">
                  <button 
                    className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, #FF8A5C)` }}
                  >
                    <FiEye size={16} />
                    <span>{translate("seeAllProp")}</span>
                    {language.rtl === 1 ? <BsArrowLeft size={18} /> : <BsArrowRight size={18} />}
                  </button>
                </Link>
              </div>
            )}

            {/* Bottom decoration with primary color */}
            {/* <div className="flex justify-center gap-1 mt-8">
              {[1,2,3,4,5].map((i) => (
                <FiEye key={i} className="text-sm" style={{ color: `${primaryColor}30` }} />
              ))}
            </div> */}
          </div>
        </section>
      ) : null}
    </div>
  );
};
export default MostViewedProperty;
