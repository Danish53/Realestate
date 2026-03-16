"use client";
import React from "react";
import Image from "next/image";
import { BadgeSvg, placeholderImage, translate, truncate } from "@/utils/helper";
import { FiHome, FiBriefcase, FiStar } from "react-icons/fi";
import { BsArrowRight } from "react-icons/bs";

const AgentCard = ({ ele, handlecheckPremiumUserAgent }) => {
  return (
    <div 
      onClick={(e) => handlecheckPremiumUserAgent(e, ele)}
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 cursor-pointer flex flex-col h-full transform hover:-translate-y-1"
    >
      {/* Background Soft Pattern/Gradient */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary-50 to-white opacity-60"></div>

      {/* Premium Badge */}
      {ele?.is_premium && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm">
          <FiStar size={12} className="fill-white" />
          <span>Premium</span>
        </div>
      )}

      <div className="relative p-6 px-5 flex flex-col flex-grow items-center text-center mt-2">
        {/* Profile Image with Verification Badge */}
        <div className="relative mb-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-white shadow-md border border-gray-100 z-10 relative">
            <div className="w-full h-full rounded-full overflow-hidden">
              <Image
                loading="lazy"
                src={ele?.profile || placeholderImage}
                className="w-full h-full object-cover"
                width={100}
                height={100}
                alt={ele?.name || "Agent profile"}
                onError={(e) => {
                  e.target.src = placeholderImage;
                }}
              />
            </div>
          </div>
          {ele?.is_verified && (
            <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm z-20" title="Verified Agent">
              <span className="text-blue-500 w-6 h-6 flex items-center justify-center">
                {BadgeSvg}
              </span>
            </div>
          )}
        </div>

        {/* Agent Info */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors tracking-tight">
            {truncate(ele?.name, 18)}
          </h3>
          
          {ele?.designation && (
            <p className="text-sm text-gray-500 font-medium mt-0.5">{ele.designation}</p>
          )}
        </div>

        {/* Stats Divider */}
        <div className="w-full h-px bg-gray-100 my-1 mb-4 hidden"></div>

        {/* Property/Projects Stats */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 w-full mb-5">
          {ele?.property_count > 0 && (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-1.5 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                <FiHome size={14} />
              </div>
              <span className="text-sm font-bold text-gray-900 leading-none">{ele.property_count}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                {ele.property_count > 1 ? translate("properties") : translate("property")}
              </span>
            </div>
          )}

          {ele?.property_count > 0 && ele?.projects_count > 0 && (
            <div className="w-px h-10 bg-gray-200"></div>
          )}

          {ele?.projects_count > 0 && (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center mb-1.5 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                <FiBriefcase size={14} />
              </div>
              <span className="text-sm font-bold text-gray-900 leading-none">{ele.projects_count}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                {ele.projects_count > 1 ? translate("projects") : translate("project")}
              </span>
            </div>
          )}
        </div>

        {/* View Profile CTA */}
        <div className="mt-auto w-full">
            <div className="flex items-center justify-center gap-2 text-primary-600 font-semibold text-sm group-hover:text-primary-700 transition-colors py-2 border-t border-gray-100 pt-4">
              <span>{translate("viewProfile")}</span>
              <BsArrowRight className="transform group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;