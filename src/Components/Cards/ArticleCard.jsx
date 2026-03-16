"use client"
import Link from "next/link";
import React from "react";
import { Card } from "react-bootstrap";
import { AiOutlineArrowLeft, AiOutlineArrowRight, AiOutlineCalendar, AiOutlineUser } from "react-icons/ai";
import { placeholderImage, timeAgo, translate, truncate } from "@/utils/helper";
import Image from "next/image";
import { useSelector } from "react-redux";
import { settingsData } from "@/store/reducer/settingsSlice";

const ArticleCard = ({ ele, language }) => {
    const stripHtmlTags = (htmlString) => {
        if (!htmlString) return "";
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlString;
        return tempDiv.textContent || tempDiv.innerText || "";
    };

    const systemsettingsData = useSelector(settingsData);

    return (
        <article className="group cursor-pointer flex flex-col gap-3 h-full">
            <Link 
                href="/article-details/[slug]" 
                as={`/article-details/${ele.slug_id}`} 
                className="flex flex-col gap-3 h-full outline-none"
            >
                {/* Image Section */}
                <div className="relative w-full aspect-[20/19] overflow-hidden rounded-xl bg-gray-200 shrink-0">
                    <Image 
                        loading="lazy" 
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        src={ele?.image || placeholderImage} 
                        alt={ele?.title || "Article"} 
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                <div className="flex flex-col px-1 flex-grow">
                    <h3 className="text-gray-900 font-semibold text-[15px] leading-snug line-clamp-2">
                        {stripHtmlTags(ele.title)}
                    </h3>
                    
                    <div className="text-gray-500 text-[15px] mt-1 line-clamp-2">
                        {stripHtmlTags(ele.description)}
                    </div>

                    <div className="mt-auto pt-2 text-gray-900 font-medium text-[14px] flex items-center gap-1 underline underline-offset-2">
                        {translate("showMore")} 
                        {language?.rtl === 1 ? <AiOutlineArrowLeft size={14} /> : <AiOutlineArrowRight size={14} />}
                    </div>
                </div>
            </Link>
        </article>
    );
};

export default ArticleCard;