"use client";
import { translate } from "@/utils/helper";
import React from "react";
import { FiEye } from "react-icons/fi";
import MobileHeadline from "../MobileHeadlines/MobileHeadline";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";
// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import AgentCardSkeleton from "../Skeleton/AgentCardSkeleton";
import AgentCard from "../Cards/AgentCard";
import { ArrowRight } from "@mui/icons-material";
import { BsArrowRight } from "react-icons/bs";
const Agent = ({
  isLoading,
  agentsData,
  language,
  breakpointsAgents,
  handlecheckPremiumUserAgent,
  sectionTitle,
}) => {
  return (
    <div>
      {isLoading ? (
        <section className="py-16 lg:py-24 bg-gray-50/50">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              <div className="lg:w-1/4 flex flex-col justify-center">
                <div className="w-48 h-10 bg-gray-200 animate-pulse rounded-lg mb-6"></div>
                <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
              </div>
              <div className="lg:w-3/4">
                <div className="block lg:hidden mb-6">
                  <MobileHeadline
                    data={{
                      text: sectionTitle,
                      link: "/all-agents",
                    }}
                  />
                </div>
                <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
                  <Swiper
                    key={language.rtl}
                    dir={language.rtl === 1 ? "rtl" : "ltr"}
                    slidesPerView={2}
                    spaceBetween={24}
                    freeMode={true}
                    pagination={{ clickable: true }}
                    modules={[FreeMode, Pagination]}
                    breakpoints={breakpointsAgents}
                    className="pb-12"
                  >
                    {Array.from({ length: 6 }).map((_, index) => (
                      <SwiperSlide key={index}>
                        <AgentCardSkeleton />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : agentsData && agentsData.length > 0 ? (
        <section className="py-12 lg:py-16 bg-gray-50/50 overflow-hidden relative border-t border-gray-100 mt-2">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
              <div className="w-full lg:w-1/4 flex flex-col justify-center items-start">
                <span className="text-primary-600 font-bold tracking-wider uppercase text-sm mb-2">{translate("expertTeam")}</span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 lg:mb-6 leading-tight">
                  {sectionTitle}
                </h2>
                <p className="text-gray-500 mb-8 hidden lg:block text-[15px] leading-relaxed">
                  {translate("meetOurAgentsDesc") || "Work with our most experienced and trusted real estate professionals to find your dream property."}
                </p>

                <Link href="/all-agents" className="hidden lg:inline-flex">
                  <button className="group inline-flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-800 px-6 py-3 rounded-full font-bold hover:border-primary-500 hover:text-primary-600 shadow-sm hover:shadow-md transition-all duration-300">
                    <span>{translate("viewAllAgents")}</span>
                    <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors">
                      {language.rtl === 1 ? <BsArrowLeft size={16} /> : <BsArrowRight size={16} />}
                    </div>
                  </button>
                </Link>
              </div>

              <div className="w-full lg:w-3/4">
                <div className="block lg:hidden mb-6">
                  <MobileHeadline
                    data={{
                      text: sectionTitle,
                      link: "/all-agents",
                    }}
                  />
                </div>

                <div className="-mx-4 px-4 sm:mx-0 sm:px-0 relative" dir={language.rtl === 1 ? "rtl" : "ltr"}>
                  <Swiper
                    key={language.rtl}
                    slidesPerView={3}
                    spaceBetween={24}
                    freeMode={true}
                    pagination={{
                      clickable: true,
                      dynamicBullets: true,
                    }}
                    modules={[FreeMode, Pagination]}
                    breakpoints={breakpointsAgents}
                    className="pb-14 swiper-custom-pagination"
                  >
                    {agentsData.map((ele, index) => (
                      <SwiperSlide key={index} className="h-auto">
                        <AgentCard
                          ele={ele}
                          handlecheckPremiumUserAgent={handlecheckPremiumUserAgent}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default Agent;
