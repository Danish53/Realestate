// "use client";
// import React from "react";
// import VerticalCard from "../Cards/VerticleCard";
// import Link from "next/link";
// import MobileHeadline from "../MobileHeadlines/MobileHeadline";
// import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
// import VerticalCardSkeleton from "../Skeleton/VerticalCardSkeleton";
// import { translate } from "@/utils/helper";

// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import "swiper/css/grid";
// import "swiper/css/navigation";
// // import required modules
// import { FreeMode, Grid, Pagination } from "swiper/modules";

// const FeaturedProperty = ({
//   getFeaturedListing,
//   isLoading,
//   language,
//   sectionTitle,
// }) => {


//   const breakpoints = {
//     0: {
//       slidesPerView: 1.1,
//     },
//     375: {
//       slidesPerView: 1.5,
//     },
//     576: {
//       slidesPerView: 2,
//     },
//     768: {
//       slidesPerView: 2.5,
//     },
//     992: {
//       slidesPerView: 3,
//     },
//     1200: {
//       slidesPerView: 4,
//     },
//     1400: {
//       slidesPerView: 4,
//     },
//   };
//   return (
//     <>
//       {isLoading ? (
//         <section className="py-16 lg:py-24 bg-gray-50/50">
//           <div className="container mx-auto px-4 max-w-7xl">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
//               <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
//                 {sectionTitle}
//               </h2>
//               {getFeaturedListing.length > 8 && (
//                 <div className="hidden sm:block">
//                   <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
//                 </div>
//               )}
//             </div>
            
//             <div className="block sm:hidden mb-6">
//               <MobileHeadline
//                 data={{
//                   text: sectionTitle,
//                   link: getFeaturedListing.length > 8 ? "/featured-properties" : "",
//                 }}
//               />
//             </div>
            
//             <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
//               <Swiper
//                 key={language.rtl}
//                 slidesPerView={2}
//                 freeMode={true}
//                 spaceBetween={24}
//                 pagination={{ clickable: true }}
//                 modules={[Pagination, FreeMode]}
//                 breakpoints={breakpoints}
//                 className="pb-12"
//               >
//                 {Array.from({ length: 6 }).map((_, index) => (
//                   <SwiperSlide key={index}>
//                     <VerticalCardSkeleton />
//                   </SwiperSlide>
//                 ))}
//               </Swiper>
//             </div>
//           </div>
//         </section>
//       ) : (
//         getFeaturedListing?.length > 0 && (
//         <section className="py-16 lg:py-24 bg-white overflow-hidden">
//             <div className="container mx-auto px-4 max-w-7xl">
//               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 gap-4">
//                 <div className="max-w-2xl">
//                     <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
//                         {sectionTitle}
//                     </h2>
//                     <p className="text-gray-500 text-sm sm:text-base">
//                         {translate("discoverBestProperties")}
//                     </p>
//                 </div>
                
//                 {getFeaturedListing.length > 8 && (
//                   <div className="hidden sm:block shrink-0">
//                     <Link href="/featured-properties">
//                       <button 
//                         type="button" 
//                         className="group inline-flex items-center justify-center gap-3 bg-white border-2 border-primary-500 text-primary-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-500 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
//                         aria-label={translate("seeAllProp")}
//                       >
//                         <span>{translate("seeAllProp")}</span>
//                         <div className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 group-hover:bg-white group-hover:text-primary-600 flex items-center justify-center transition-colors">
//                           {language.rtl === 1 ? <BsArrowLeft size={14} /> : <BsArrowRight size={14} />}
//                         </div>
//                       </button>
//                     </Link>
//                   </div>
//                 )}
//               </div>
              
//               <div className="block sm:hidden mb-6">
//                 <MobileHeadline
//                   data={{
//                     text: sectionTitle,
//                     link: getFeaturedListing.length > 8 ? "/featured-properties" : "",
//                   }}
//                 />
//               </div>

//               <div className="-mx-4 px-4 sm:mx-0 sm:px-0 relative">
//                 <Swiper
//                   key={language.rtl}
//                   slidesPerView={2}
//                   freeMode={true}
//                   spaceBetween={24}
//                   pagination={{ 
//                     clickable: true,
//                     dynamicBullets: true,
//                   }}
//                   modules={[Pagination, FreeMode]}
//                   breakpoints={breakpoints}
//                   className="pb-14 swiper-custom-pagination"
//                 >
//                   {getFeaturedListing.map((ele, index) => (
//                     <SwiperSlide key={index} className="h-auto">
//                       <VerticalCard ele={ele} />
//                     </SwiperSlide>
//                   ))}
//                 </Swiper>
//               </div>
//             </div>
//           </section>
//         )
//       )}
//     </>
//   );
// };

// export default FeaturedProperty;


"use client";
import React, { useRef, useState } from "react";
import VerticalCard from "../Cards/VerticleCard";
import Link from "next/link";
import MobileHeadline from "../MobileHeadlines/MobileHeadline";
import { BsArrowLeft, BsArrowRight, BsGrid, BsHeart } from "react-icons/bs";
import { FiHome, FiTrendingUp, FiStar, FiMapPin } from "react-icons/fi";
import { HiOutlinePhotograph } from "react-icons/hi";
import VerticalCardSkeleton from "../Skeleton/VerticalCardSkeleton";
import { translate } from "@/utils/helper";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/navigation";
import "swiper/css/pagination";
// import required modules
import { FreeMode, Grid, Pagination, Autoplay, Navigation } from "swiper/modules";

const FeaturedProperty = ({
  getFeaturedListing,
  isLoading,
  language,
  sectionTitle,
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  const filters = [
    { id: 'all', label: 'All Properties', icon: <FiHome /> },
    { id: 'trending', label: 'Trending', icon: <FiTrendingUp /> },
    { id: 'top-rated', label: 'Top Rated', icon: <FiStar /> },
  ];

  const breakpoints = {
    320: {
      slidesPerView: 1.2,
      spaceBetween: 12,
    },
    375: {
      slidesPerView: 1.3,
      spaceBetween: 16,
    },
    480: {
      slidesPerView: 1.5,
      spaceBetween: 16,
    },
    576: {
      slidesPerView: 2,
      spaceBetween: 16,
    },
    640: {
      slidesPerView: 2.2,
      spaceBetween: 18,
    },
    768: {
      slidesPerView: 2.5,
      spaceBetween: 20,
    },
    992: {
      slidesPerView: 3,
      spaceBetween: 24,
    },
    1200: {
      slidesPerView: 4,
      spaceBetween: 24,
    },
    1400: {
      slidesPerView: 4.2,
      spaceBetween: 24,
    },
  };

  return (
    <>
      {isLoading ? (
        <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Header with decorative elements */}
            <div className="relative mb-12">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-100/30 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white shadow-sm px-4 py-2 rounded-full mb-4 border border-gray-100">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  <div className="h-4 w-32 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-full"></div>
                </div>
                
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div>
                    <div className="h-10 md:h-12 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg w-72 mb-3"></div>
                    <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg w-96 max-w-full"></div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-12 w-12 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-xl"></div>
                    <div className="h-12 w-32 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter pills skeleton */}
            <div className="flex gap-3 mb-8 overflow-hidden">
              {[1,2,3].map((i) => (
                <div key={i} className="h-10 w-28 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-full"></div>
              ))}
            </div>

            {/* Swiper skeleton */}
            <div className="relative">
              <Swiper
                key={language.rtl}
                dir={language.rtl === 1 ? "rtl" : "ltr"}
                slidesPerView={2}
                freeMode={true}
                spaceBetween={24}
                pagination={{ clickable: true }}
                modules={[Pagination, FreeMode]}
                breakpoints={breakpoints}
                className="pb-12"
              >
                {Array.from({ length: 8 }).map((_, index) => (
                  <SwiperSlide key={index}>
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                      <div className="relative h-48 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg w-3/4"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg w-1/2"></div>
                        <div className="flex gap-2">
                          <div className="h-8 w-8 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg"></div>
                          <div className="h-8 w-8 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg"></div>
                          <div className="h-8 w-8 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg"></div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      ) : (
        getFeaturedListing?.length > 0 && (
          <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50/30 overflow-hidden">
            <div className="container mx-auto px-4 max-w-7xl">
              {/* Modern Header Section */}
              <div className="relative mb-12">
                {/* Background decoration */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary-100/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-100/20 rounded-full blur-3xl"></div>
                
                {/* Main header content */}
                <div className="relative z-10">
                  {/* Section badge */}
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-50 to-primary-100 px-4 py-2 rounded-full mb-4 border border-primary-200">
                    <FiHome className="text-primary-500" />
                    <span className="text-sm font-semibold text-primary-700">
                      {translate("featuredProperties")}
                    </span>
                  </div>

                  {/* Title and button row */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                    <div className="max-w-2xl">
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
                        {sectionTitle}
                      </h2>
                      <p className="text-gray-600 text-base sm:text-lg">
                        {translate("discoverBestProperties")}
                      </p>
                      
                      {/* Property stats */}
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">
                            {getFeaturedListing.length} {translate("propertiesAvailable")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiStar className="text-yellow-500" />
                          <span className="text-sm text-gray-600">4.8+ Avg Rating</span>
                        </div>
                      </div>
                    </div>

                    {/* View all button - Desktop */}
                    {getFeaturedListing.length > 8 && (
                      <div className="hidden lg:block">
                        <Link href="/featured-properties">
                          <button 
                            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-4 rounded-2xl font-semibold hover:from-primary-700 hover:to-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden"
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

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeFilter === filter.id
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span className="text-base">{filter.icon}</span>
                    {filter.label}
                  </button>
                ))}
                
                {/* View toggle buttons */}
                <div className="ml-auto hidden sm:flex items-center gap-2 bg-white p-1 rounded-full border border-gray-200">
                  <button className="p-2 rounded-full bg-primary-50 text-primary-600">
                    <BsGrid size={16} />
                  </button>
                  <button className="p-2 rounded-full text-gray-400 hover:text-gray-600">
                    <FiMapPin size={16} />
                  </button>
                </div>
              </div>

              {/* Mobile Headline */}
              <div className="block sm:hidden mb-6">
                <MobileHeadline
                  data={{
                    text: sectionTitle,
                    link: getFeaturedListing.length > 8 ? "/featured-properties" : "",
                  }}
                />
              </div>

              {/* Custom Navigation Buttons */}
              <div className="relative">
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
                  <button 
                    ref={navigationPrevRef}
                    className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-primary-600 hover:bg-primary-600 hover:text-white transition-all duration-300 border border-gray-100"
                  >
                    {language.rtl === 1 ? <BsArrowRight size={20} /> : <BsArrowLeft size={20} />}
                  </button>
                </div>
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
                  <button 
                    ref={navigationNextRef}
                    className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-primary-600 hover:bg-primary-600 hover:text-white transition-all duration-300 border border-gray-100"
                  >
                    {language.rtl === 1 ? <BsArrowLeft size={20} /> : <BsArrowRight size={20} />}
                  </button>
                </div>

                {/* Main Swiper */}
                <Swiper
                  key={language.rtl}
                  dir={language.rtl === 1 ? "rtl" : "ltr"}
                  slidesPerView={2}
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
                  {getFeaturedListing.map((ele, index) => (
                    <SwiperSlide key={index} className="h-auto">
                      <VerticalCard ele={ele} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Mobile View All Button */}
              {getFeaturedListing.length > 8 && (
                <div className="text-center mt-10 lg:hidden">
                  <Link href="/featured-properties">
                    <button className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all">
                      <span>{translate("seeAllProp")}</span>
                      {language.rtl === 1 ? <BsArrowLeft size={18} /> : <BsArrowRight size={18} />}
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </section>
        )
      )}
    </>
  );
};

export default FeaturedProperty;
