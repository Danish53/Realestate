"use client"
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import { placeholderImage, translate } from "@/utils/helper";

import Image from "next/image";
import { useSelector } from "react-redux";
import { settingsData } from "@/store/reducer/settingsSlice";

const ArticleHorizonatalCard = ({ ele, expandedStates, index }) => {
    const stripHtmlTags = (htmlString) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlString;
        return tempDiv.textContent || tempDiv.innerText || "";
    };
    const systemsettingsData = useSelector(settingsData)
  

    return (
        <article className="group cursor-pointer flex flex-col sm:flex-row gap-4 h-full bg-white rounded-2xl overflow-hidden hover:shadow-card-hover border border-gray-100 transition-all duration-300">
            <Link 
                href="/article-details/[slug]" 
                as={`/article-details/${ele.slug_id}`} 
                className="flex flex-col sm:flex-row gap-4 h-full w-full outline-none"
            >
                {/* Image Section */}
                <div className="relative w-full sm:w-[280px] shrink-0 aspect-[4/3] sm:aspect-[20/19] overflow-hidden bg-gray-200">
                    <Image 
                        loading="lazy" 
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        src={ele?.image || placeholderImage} 
                        alt={ele?.title || "Article"} 
                        fill
                        sizes="(max-width: 768px) 100vw, 280px"
                        onError={placeholderImage} 
                    />
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="bg-white/95 backdrop-blur-sm text-gray-900 text-[13px] font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 border border-black/5">
                            {ele.category?.category || translate("General")}
                        </span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col py-3 pr-4 flex-grow px-4 sm:px-0">
                    <h3 className="text-gray-900 font-semibold text-[17px] leading-snug line-clamp-2 mb-2">
                        {stripHtmlTags(ele.title)}
                    </h3>
                    
                    <div className="text-gray-500 text-[15px] line-clamp-2 md:line-clamp-3 mb-4">
                        {stripHtmlTags(ele.description)}
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
                                <Image loading="lazy" src={systemsettingsData?.admin_image || placeholderImage} alt="admin" width={40} height={40} className="w-full h-full object-cover" onError={placeholderImage}/>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-900 text-[14px] font-semibold leading-tight">{translate("by")} {systemsettingsData?.admin_name || "Admin"}</span>
                                <span className="text-gray-500 text-[13px]">{ele.created_at}</span>
                            </div>
                        </div>

                        <div className="text-gray-900 font-medium text-[14px] hidden sm:flex items-center gap-1 group-hover:text-primary-600 transition-colors">
                            {translate("showMore")} 
                            <AiOutlineArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
};

export default ArticleHorizonatalCard;
