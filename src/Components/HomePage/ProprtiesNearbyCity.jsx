"use client"
import Image from 'next/image'
import React from 'react'
import MobileHeadline from '../MobileHeadlines/MobileHeadline'
import NearByCitysSkeleton from '../Skeleton/NearByCitysSkeleton'
import { placeholderImage, translate } from '@/utils/helper'

import { Swiper, SwiperSlide } from "swiper/react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
// import required modules
import { FreeMode, Pagination } from "swiper/modules";
import Link from 'next/link'
import PropertiesNearCityCard from '../Cards/PropertiesNearCityCard'

const ProprtiesNearbyCity = ({ isLoading, getNearByCitysData, language, sectionTitle }) => {


    const breakpoints = {
        0: { slidesPerView: 1 },
        320: { slidesPerView: 1 },
        375: { slidesPerView: 1 },
        576: { slidesPerView: 1.5 },
        768: { slidesPerView: 2 },
        992: { slidesPerView: 2 },
        1200: { slidesPerView: 3 },
        1400: { slidesPerView: 4 },
    };


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
                                    link: getNearByCitysData?.length > 6 ? "/properties-nearby-city" : "",
                                }}
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="w-full">
                                    <NearByCitysSkeleton />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            ) : (
                getNearByCitysData && getNearByCitysData.length > 0 ? (
                    <section className="py-16 lg:py-24 bg-white overflow-hidden">
                        <div className="container mx-auto px-4 max-w-7xl">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 gap-4">
                                <div className="max-w-2xl">
                                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                                        {sectionTitle}
                                    </h2>
                                </div>
                                
                                {getNearByCitysData.length > 6 && (
                                    <div className="hidden sm:block shrink-0">
                                        <Link href="/properties-nearby-city">
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
                                        text: sectionTitle,
                                        link: getNearByCitysData.length > 6 ? "/properties-nearby-city" : "",
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
                                    breakpoints={breakpoints}
                                    className="pb-14 swiper-custom-pagination"
                                >
                                    {getNearByCitysData.map((ele, index) => (
                                        <SwiperSlide key={index} className="h-auto">
                                            <PropertiesNearCityCard data={ele} language={language}/>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                    </section>
                ) : null
            )}
        </div>
    )
}

export default ProprtiesNearbyCity
