import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";
// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import ProjectCardSkeleton from "../Skeleton/ProjectCardSkeleton";
import { handlePackageCheck, translate } from "@/utils/helper";
import { IoIosArrowForward } from "react-icons/io";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import ProjectCard from "../Cards/ProjectCard";
import { PackageTypes } from "@/utils/checkPackages/packageTypes";
import { useRouter } from "next/router";
import MobileHeadline from "../MobileHeadlines/MobileHeadline";

const FeaturedProjects = ({
  isLoading,
  featuredProjects,
  language,
  breakpointsProjects,
  sectionTitle,
}) => {
  const router = useRouter();
  return (
    <div>
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
                  link: "/featured-projects",
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
                breakpoints={breakpointsProjects}
                className="pb-12"
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <SwiperSlide key={index}>
                    <ProjectCardSkeleton />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      ) : featuredProjects && featuredProjects.length > 0 ? (
        <section className="py-16 lg:py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 gap-4">
              <div className="max-w-2xl">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                      {sectionTitle}
                  </h2>
                  <p className="text-gray-500 text-sm sm:text-base">
                      {translate("discoverFeaturedProjects", "Discover our featured projects")}
                  </p>
              </div>
              
              {featuredProjects.length > 4 && (
                <div className="hidden sm:block shrink-0">
                  <Link href="/featured-projects">
                    <button 
                      type="button" 
                      className="group inline-flex items-center justify-center gap-3 bg-white border-2 border-primary-500 text-primary-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-500 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      aria-label={translate("seeAllProjects")}
                    >
                      <span>{translate("seeAllProjects")}</span>
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
                  link: featuredProjects.length > 4 ? "/featured-projects" : "",
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
                breakpoints={breakpointsProjects}
                className="pb-14 swiper-custom-pagination"
              >
                {featuredProjects.map((ele, index) => (
                  <SwiperSlide 
                    key={index} 
                    className="h-auto"
                    onClick={(e) => handlePackageCheck(e, PackageTypes.PROJECT_ACCESS, router, ele.slug_id)}
                  >
                    <ProjectCard ele={ele} />
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

export default FeaturedProjects;
