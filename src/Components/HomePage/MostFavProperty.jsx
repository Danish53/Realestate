// "use client";
// import Link from "next/link";
// import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
// import { FreeMode, Pagination } from "swiper/modules";
// import { Swiper, SwiperSlide } from "swiper/react";
// import VerticalCard from "../Cards/VerticleCard";
// import VerticalCardSkeleton from "../Skeleton/VerticalCardSkeleton";
// // Import Swiper styles
// import { translate } from "@/utils/helper";
// import "swiper/css";
// import "swiper/css/free-mode";
// import "swiper/css/pagination";
// import MobileHeadline from "../MobileHeadlines/MobileHeadline";

// const MostFavProperty = ({
//   isLoading,
//   getMostFavProperties,
//   language,
//   breakpointsMostFav,
//   sectionTitle,
// }) => {
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
//                   text: sectionTitle,
//                   link: "/most-favorite-properties",
//                 }}
//               />
//             </div>
            
//             <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
//               <Swiper
//                 key={language.rtl}
//                 dir={language.rtl === 1 ? "rtl" : "ltr"}
//                 slidesPerView={4}
//                 freeMode={true}
//                 spaceBetween={24}
//                 pagination={{ clickable: true }}
//                 modules={[Pagination, FreeMode]}
//                 breakpoints={breakpointsMostFav}
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
//       ) : getMostFavProperties && getMostFavProperties.length > 0 ? (
//         <section className="py-16 lg:py-24 bg-white overflow-hidden">
//           <div className="container mx-auto px-4 max-w-7xl">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 gap-4">
//               <div className="max-w-2xl">
//                   <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
//                       {sectionTitle}
//                   </h2>
//                   <p className="text-gray-500 text-sm sm:text-base">
//                       {translate("discoverMostFav", "Explore properties loved by everyone")}
//                   </p>
//               </div>
              
//               {getMostFavProperties.length > 6 && (
//                 <div className="hidden sm:block shrink-0">
//                   <Link href="/most-favorite-properties">
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
//                   link: getMostFavProperties.length > 6 ? "/most-favorite-properties" : "",
//                 }}
//               />
//             </div>

//             <div className="-mx-4 px-4 sm:mx-0 sm:px-0 relative" dir={language.rtl === 1 ? "rtl" : "ltr"}>
//               <Swiper
//                 key={language.rtl}
//                 slidesPerView={4}
//                 freeMode={true}
//                 spaceBetween={24}
//                 pagination={{ 
//                   clickable: true,
//                   dynamicBullets: true, 
//                 }}
//                 modules={[Pagination, FreeMode]}
//                 breakpoints={breakpointsMostFav}
//                 className="pb-14 swiper-custom-pagination"
//               >
//                 {getMostFavProperties.map((ele, index) => (
//                   <SwiperSlide key={index} className="h-auto">
//                     <VerticalCard ele={ele} />
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

// export default MostFavProperty;



"use client";
import Link from "next/link";
import { BsArrowLeft, BsArrowRight, BsHeart, BsHeartFill, BsFire } from "react-icons/bs";
import { FiHeart, FiTrendingUp, FiStar, FiUsers, FiAward } from "react-icons/fi";
import { FreeMode, Pagination, Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import VerticalCard from "../Cards/VerticleCard";
import VerticalCardSkeleton from "../Skeleton/VerticalCardSkeleton";
// Import Swiper styles
import { translate } from "@/utils/helper";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "swiper/css/navigation";
import MobileHeadline from "../MobileHeadlines/MobileHeadline";
import { useRef, useState } from "react";

const MostFavProperty = ({
  isLoading,
  getMostFavProperties,
  language,
  breakpointsMostFav,
  sectionTitle,
}) => {
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);
  const [activeSort, setActiveSort] = useState('most-fav');

  const sortOptions = [
    { id: 'most-fav', label: 'Most Favorites', icon: <FiHeart /> },
    { id: 'trending', label: 'Trending', icon: <FiTrendingUp /> },
    { id: 'top-rated', label: 'Top Rated', icon: <FiStar /> },
  ];

  // Enhanced breakpoints for better sliding
  const enhancedBreakpoints = {
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
    <div>
      {isLoading ? (
        <section className="py-10 bg-gradient-to-b from-rose-50/50 to-white overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Header with heart theme */}
            <div className="relative mb-12">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-100/30 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                {/* <div className="inline-flex items-center gap-2 bg-white shadow-sm px-4 py-2 rounded-full mb-4 border border-rose-100">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                  <BsHeart className="text-rose-500" size={14} />
                  <div className="h-4 w-36 bg-gradient-to-r from-rose-200 to-rose-300 animate-pulse rounded-full"></div>
                </div> */}
                
                {/* <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div>
                    <div className="h-10 md:h-12 bg-gradient-to-r from-rose-200 to-rose-300 animate-pulse rounded-lg w-72 mb-3"></div>
                    <div className="h-5 bg-gradient-to-r from-rose-200 to-rose-300 animate-pulse rounded-lg w-96 max-w-full"></div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-12 w-12 bg-gradient-to-r from-rose-200 to-rose-300 animate-pulse rounded-xl"></div>
                    <div className="h-12 w-32 bg-gradient-to-r from-rose-200 to-rose-300 animate-pulse rounded-xl"></div>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Sort options skeleton */}
            {/* <div className="flex gap-3 mb-8 overflow-hidden">
              {[1,2,3].map((i) => (
                <div key={i} className="h-10 w-28 bg-gradient-to-r from-rose-200 to-rose-300 animate-pulse rounded-full"></div>
              ))}
            </div> */}

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
                breakpoints={enhancedBreakpoints}
                className="pb-12"
              >
                {Array.from({ length: 8 }).map((_, index) => (
                  <SwiperSlide key={index}>
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                      <div className="relative h-48 bg-gradient-to-r from-rose-200 to-rose-300 animate-pulse">
                        <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                          <BsHeart className="text-rose-300" size={18} />
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="h-6 bg-gradient-to-r from-rose-200 to-rose-300 animate-pulse rounded-lg w-3/4"></div>
                        <div className="h-4 bg-gradient-to-r from-rose-200 to-rose-300 animate-pulse rounded-lg w-1/2"></div>
                        <div className="flex justify-between">
                          <div className="h-8 w-20 bg-gradient-to-r from-rose-200 to-rose-300 animate-pulse rounded-lg"></div>
                          <div className="h-8 w-8 bg-gradient-to-r from-rose-200 to-rose-300 animate-pulse rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      ) : getMostFavProperties && getMostFavProperties.length > 0 ? (
        <section className="p-0 overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Modern Header with Heart Theme */}
            <div className="relative mb-12">
              {/* Background decorations */}
              {/* <div className="absolute -top-20 -right-20 w-60 h-60 bg-rose-100/30 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-100/30 rounded-full blur-3xl"></div> */}
              
              {/* Floating hearts animation */}
              <div className="absolute top-0 right-20 opacity-20 animate-float">
                <BsHeart className="text-rose-300 text-4xl" />
              </div>
              <div className="absolute bottom-10 left-40 opacity-20 animate-float-delayed">
                <BsHeartFill className="text-rose-300 text-3xl" />
              </div>
              
              {/* Main header content */}
              <div className="relative z-10">
                {/* Section badge with heart */}
                {/* <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-5 py-2.5 rounded-full mb-4 shadow-lg shadow-rose-200">
                  <BsHeartFill className="text-white" size={14} />
                  <span className="text-sm font-bold tracking-wide">
                    {translate("mostLoved")}
                  </span>
                  <FiAward className="text-white" size={14} />
                </div> */}

                {/* Title and button row */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                  <div className="max-w-2xl">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
                      {sectionTitle}
                    </h2>
                    <p className="text-gray-600 text-base sm:text-lg flex items-center gap-2">
                      {translate("discoverMostFav", "Explore properties loved by everyone")}
                      {/* <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-600 px-2 py-1 rounded-full text-xs font-semibold">
                        <BsFire className="text-rose-600" size={12} />
                        Hot Collection
                      </span> */}
                    </p>
                    
                    {/* Stats with heart theme */}
                    {/* <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-rose-100">
                        <BsHeartFill className="text-rose-500" size={12} />
                        <span className="text-sm font-medium text-gray-700">
                          {getMostFavProperties.reduce((acc, curr) => acc + (curr.favorites || 0), 0)}+ Favorites
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiUsers className="text-blue-500" />
                        <span className="text-sm text-gray-600">2.5k+ Views Today</span>
                      </div>
                    </div> */}
                  </div>

                  {/* View all button - Desktop */}
                  {getMostFavProperties.length > 6 && (
                    <div className="hidden lg:block">
                      <Link href="/most-favorite-properties">
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
                  link: getMostFavProperties.length > 6 ? "/most-favorite-properties" : "",
                }}
              />
            </div>

            {/* Custom Navigation Buttons with Heart Design */}
            <div className="relative">
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
                <button 
                  ref={navigationPrevRef}
                  className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-rose-500 hover:bg-gradient-to-r hover:from-primary-500 hover:to-primary-700 hover:text-white transition-all duration-300 border border-rose-100"
                >
                  {language.rtl === 1 ? <BsArrowRight size={20} /> : <BsArrowLeft size={20} />}
                </button>
              </div>
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
                <button 
                  ref={navigationNextRef}
                  className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-rose-500 hover:bg-gradient-to-r hover:from-primary-500 hover:to-primary-700 hover:text-white transition-all duration-300 border border-rose-100"
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
                breakpoints={enhancedBreakpoints}
                className="pb-14 swiper-custom-pagination"
              >
                {getMostFavProperties.map((ele, index) => (
                  <SwiperSlide key={index} className="h-auto">
                    <VerticalCard 
                      ele={{
                        ...ele,
                        isFavorite: true,
                        favoriteCount: ele.favorites || Math.floor(Math.random() * 500) + 100,
                      }} 
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Mobile View All Button */}
            {getMostFavProperties.length > 6 && (
              <div className="text-center mt-10 lg:hidden">
                <Link href="/most-favorite-properties">
                  <button className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-2 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden">
                    <BsHeartFill size={16} />
                    <span>{translate("seeAllProp")}</span>
                    {language.rtl === 1 ? <BsArrowLeft size={18} /> : <BsArrowRight size={18} />}
                  </button>
                </Link>
              </div>
            )}

            {/* Bottom decoration */}
            {/* <div className="flex justify-center gap-1 mt-8">
              {[1,2,3,4,5].map((i) => (
                <BsHeartFill key={i} className="text-rose-200 text-xs" />
              ))}
            </div> */}
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default MostFavProperty;