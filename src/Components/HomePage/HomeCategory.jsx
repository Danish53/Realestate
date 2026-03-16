// "use client";
// import Link from "next/link";
// import React, { useEffect, useRef, useState } from "react";
// import { FiEye } from "react-icons/fi";
// import MobileHeadline from "../MobileHeadlines/MobileHeadline";
// import { translate } from "@/utils/helper";
// import CustomCategorySkeleton from "../Skeleton/CustomCategorySkeleton";
// import CategoryCard from "../Cards/CategoryCard";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { FreeMode, Navigation, Pagination } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/free-mode";
// import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
// import { ArrowRight } from "@mui/icons-material";

// const HomeCategory = ({ isLoading, categoryData, language, breakpoints, sectionTitle }) => {
//   return (
//     <div>
//       {isLoading ? (
//         <section className="py-16 lg:py-24 bg-white overflow-hidden">
//           <div className="container mx-auto px-4 max-w-7xl">
//             <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
//               <div className="w-full lg:w-1/4 flex flex-col justify-center shrink-0">
//                 <div className="mb-6">
//                   <div className="h-8 md:h-10 bg-gray-200 animate-pulse rounded-lg w-3/4 mb-4"></div>
//                   <div className="w-16 h-1.5 bg-gray-200 animate-pulse rounded-full mt-4 mb-6"></div>
//                 </div>
//                 <div className="hidden lg:block h-12 bg-gray-200 animate-pulse rounded-xl w-full"></div>
//               </div>
//               <div className="block lg:hidden mb-6">
//                 <MobileHeadline
//                   data={{
//                     text: sectionTitle,
//                     link: "/all-categories",
//                   }}
//                 />
//               </div>
//               <div className="w-full lg:w-3/4 min-w-0 relative">
//                 <Swiper
//                   key={language.rtl}
//                   dir={language.rtl === 1 ? "rtl" : "ltr"}
//                   spaceBetween={24}
//                   slidesPerView={4}
//                   freeMode={true}
//                   modules={[FreeMode]}
//                   className="pb-12"
//                   breakpoints={breakpoints}
//                 >
//                   {Array.from({ length: 6 }).map((_, index) => (
//                     <SwiperSlide key={index}>
//                       <CustomCategorySkeleton />
//                     </SwiperSlide>
//                   ))}
//                 </Swiper>
//               </div>
//             </div>
//           </div>
//         </section>
//       ) : categoryData &&
//         categoryData.some(
//           (ele) => ele.properties_count !== 0 && ele.properties_count !== ""
//         ) ? (
//         <section className="py-16 lg:py-24 bg-white overflow-hidden">
//           <div className="container mx-auto px-4 max-w-7xl">
//             <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
//               <div className="w-full lg:w-1/4 flex flex-col justify-center shrink-0 relative z-10">
//                 <div className="mb-2 lg:mb-6">
//                   <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
//                     {sectionTitle}
//                   </h2>
//                   <div className="w-16 h-1.5 bg-primary-500 rounded-full mt-4 mb-6 hidden lg:block"></div>
//                 </div>
                
//                 <Link href="/all-categories" className="hidden lg:block mt-auto lg:mt-0">
//                   <button type="button" className="group inline-flex items-center justify-between bg-white border-2 border-primary-500 text-primary-600 px-6 py-3.5 rounded-xl font-bold hover:bg-primary-500 hover:text-white transition-all duration-300 w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm relative overflow-hidden">
//                     <span className="relative z-10">{translate("viewAllCategories")}</span>
//                     <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 group-hover:bg-white flex items-center justify-center transition-colors relative z-10 shrink-0">
//                         {language.rtl === 1 ? <BsArrowLeft size={18} /> : <BsArrowRight size={18} />}
//                     </div>
//                   </button>
//                 </Link>
//               </div>

//               <div className="block lg:hidden mb-2">
//                 <MobileHeadline
//                   data={{
//                     text: sectionTitle,
//                     link: "/all-categories",
//                   }}
//                 />
//               </div>

//               <div className="w-full lg:w-3/4 min-w-0 relative">
//                 <Swiper
//                   key={language.rtl}
//                   dir={language.rtl === 1 ? "rtl" : "ltr"}
//                   spaceBetween={24}
//                   freeMode={true}
//                   pagination={{
//                     clickable: true,
//                     dynamicBullets: true,
//                   }}
//                   modules={[FreeMode, Pagination, Navigation]}
//                   className="pb-14 swiper-custom-pagination"
//                   breakpoints={breakpoints}
//                 >
//                   {categoryData.map((ele, index) =>
//                     ele.properties_count !== 0 &&
//                     ele.properties_count !== "" ? (
//                       <SwiperSlide key={index} className="h-auto">
//                         <Link href={`/properties/categories/${ele.slug_id}`} className="block h-full">
//                           <CategoryCard ele={ele} />
//                         </Link>
//                       </SwiperSlide>
//                     ) : null
//                   )}
//                 </Swiper>
//               </div>
//             </div>
//           </div>
//         </section>
//       ) : null}
//     </div>
//   );
// };

// export default HomeCategory;




"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { FiEye, FiHome, FiTrendingUp, FiStar, FiArrowRight } from "react-icons/fi";
import { BsBuilding, BsHouseDoor, BsShop, BsTree } from "react-icons/bs";
import { HiOutlineOfficeBuilding, HiOutlineHome, HiOutlineLocationMarker } from "react-icons/hi";
import { RiHomeSmileLine, RiBuildingLine } from "react-icons/ri";
import { MdOutlineApartment, MdOutlineVilla } from "react-icons/md";
import MobileHeadline from "../MobileHeadlines/MobileHeadline";
import { translate } from "@/utils/helper";
import CustomCategorySkeleton from "../Skeleton/CustomCategorySkeleton";
import CategoryCard from "../Cards/CategoryCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { ArrowRight } from "@mui/icons-material";

const HomeCategory = ({ isLoading, categoryData, language, breakpoints, sectionTitle }) => {
  // Custom category icons mapping based on category names
  const getCategoryIcon = (categoryName) => {
    const icons = {
      'apartment': <MdOutlineApartment className="w-8 h-8" />,
      'villa': <MdOutlineVilla className="w-8 h-8" />,
      'house': <HiOutlineHome className="w-8 h-8" />,
      'commercial': <BsBuilding className="w-8 h-8" />,
      'office': <HiOutlineOfficeBuilding className="w-8 h-8" />,
      'shop': <BsShop className="w-8 h-8" />,
      'land': <BsTree className="w-8 h-8" />,
      'residential': <RiHomeSmileLine className="w-8 h-8" />,
    };
    
    const key = categoryName?.toLowerCase() || '';
    for (const [pattern, icon] of Object.entries(icons)) {
      if (key.includes(pattern)) return icon;
    }
    return <RiBuildingLine className="w-8 h-8" />;
  };

  // Enhanced breakpoints for better sliding
  const enhancedBreakpoints = {
    320: {
      slidesPerView: 1.5,
      spaceBetween: 16,
    },
    480: {
      slidesPerView: 2,
      spaceBetween: 16,
    },
    640: {
      slidesPerView: 2.5,
      spaceBetween: 20,
    },
    768: {
      slidesPerView: 3,
      spaceBetween: 20,
    },
    1024: {
      slidesPerView: 4,
      spaceBetween: 24,
    },
    1280: {
      slidesPerView: 4.5,
      spaceBetween: 24,
    },
    1536: {
      slidesPerView: 5,
      spaceBetween: 24,
    },
  };

  return (
    <div>
      {isLoading ? (
        <section className="py-12 bg-gradient-to-b from-white to-gray-50/50 overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Header with decorative elements */}
            <div className="text-center lg:text-left mb-12">
              <div className="inline-flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-full mb-4">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                <div className="h-4 w-24 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-full"></div>
              </div>
              <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                <div>
                  <div className="h-10 md:h-12 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg w-64 mb-4"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg w-96 max-w-full"></div>
                </div>
                <div className="h-12 w-40 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-xl"></div>
              </div>
            </div>

            {/* Skeleton Slider */}
            <div className="relative">
              <Swiper
                key={language.rtl}
                dir={language.rtl === 1 ? "rtl" : "ltr"}
                spaceBetween={24}
                slidesPerView={4}
                freeMode={true}
                modules={[FreeMode]}
                className="pb-8"
                breakpoints={enhancedBreakpoints}
              >
                {Array.from({ length: 8 }).map((_, index) => (
                  <SwiperSlide key={index}>
                    <CustomCategorySkeleton />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      ) : categoryData &&
        categoryData.some(
          (ele) => ele.properties_count !== 0 && ele.properties_count !== ""
        ) ? (
        <section className="py-16 bg-gradient-to-b from-white to-gray-50/30 overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Header Section with Modern Design */}
            <div className="relative mb-16">
              {/* Background Decoration */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-100/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl"></div>
              </div>

              {/* Main Header Content */}
              <div className="relative z-10">
                {/* Category Pill */}
                {/* <div className="inline-flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-full mb-4 border border-primary-100">
                  <FiHome className="text-primary-500 text-sm" />
                  <span className="text-sm font-medium text-primary-700">
                    {translate("exploreCategories")}
                  </span>
                </div> */}

                {/* Title and Button Row */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                  <div className="max-w-2xl">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">
                      {sectionTitle}
                    </h2>
                    <p className="text-lg text-gray-600">
                      {translate("browsePropertiesByCategory")}
                    </p>
                    
                    {/* Category Stats */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          {categoryData.filter(c => c.properties_count > 0).length} Active Categories
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiTrendingUp className="text-primary-500" />
                        <span className="text-sm text-gray-600">Trending Now</span>
                      </div>
                    </div>
                  </div>

                  {/* View All Button - Desktop */}
                  <Link href="/all-categories" className="hidden lg:block">
                    <button className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-2 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden">
                      <span className="relative z-10">{translate("viewAllCategories")}</span>
                      <div className="relative z-10 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all group-hover:rotate-0 group-hover:translate-x-1">
                        {language.rtl === 1 ? 
                          <BsArrowLeft className="text-white" size={16} /> : 
                          <BsArrowRight className="text-white" size={16} />
                        }
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Headline */}
            <div className="block lg:hidden mb-6">
              <MobileHeadline
                data={{
                  text: sectionTitle,
                  link: "/all-categories",
                }}
              />
            </div>

            {/* Categories Slider Section */}
            <div className="relative">
              {/* Custom Navigation Buttons */}
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
                <button className="swiper-button-prev-custom w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-primary-600 hover:bg-primary-600 hover:text-white transition-all duration-300 border border-gray-100">
                  {language.rtl === 1 ? <BsArrowRight size={20} /> : <BsArrowLeft size={20} />}
                </button>
              </div>
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
                <button className="swiper-button-next-custom w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-primary-600 hover:bg-primary-600 hover:text-white transition-all duration-300 border border-gray-100">
                  {language.rtl === 1 ? <BsArrowLeft size={20} /> : <BsArrowRight size={20} />}
                </button>
              </div>

              {/* Main Swiper */}
              <Swiper
                key={language.rtl}
                dir={language.rtl === 1 ? "rtl" : "ltr"}
                spaceBetween={24}
                slidesPerView={4}
                freeMode={true}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                navigation={{
                  prevEl: '.swiper-button-prev-custom',
                  nextEl: '.swiper-button-next-custom',
                }}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                modules={[FreeMode, Pagination, Navigation, Autoplay]}
                className="pb-14 swiper-custom-pagination"
                breakpoints={enhancedBreakpoints}
              >
                {categoryData.map((ele, index) =>
                  ele.properties_count !== 0 && ele.properties_count !== "" ? (
                    <SwiperSlide key={index} className="h-auto">
                      <Link href={`/properties/categories/${ele.slug_id}`} className="block h-full">
                        <CategoryCard 
                          ele={ele} 
                          customIcon={getCategoryIcon(ele?.category)}
                        />
                      </Link>
                    </SwiperSlide>
                  ) : null
                )}
              </Swiper>
            </div>

            {/* Mobile View All Button */}
            <div className="text-center mt-10 lg:hidden">
              <Link href="/all-categories">
                <button className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors bg-primary-50 px-6 py-3 rounded-xl">
                  <span>{translate("viewAllCategories")}</span>
                  {language.rtl === 1 ? <BsArrowLeft size={18} /> : <BsArrowRight size={18} />}
                </button>
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default HomeCategory;
