"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";

const AgentCardSkeleton = () => {
  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[320px]">
      {/* Background Soft Pattern/Gradient Skeleton */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gray-50/80"></div>

      <div className="relative p-6 px-5 flex flex-col flex-grow items-center text-center mt-2">
        {/* Profile Image Skeleton */}
        <div className="relative mb-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-white shadow-sm border border-gray-100 z-10 relative">
            <Skeleton circle={true} width="100%" height="100%" />
          </div>
        </div>

        {/* Agent Info Skeleton */}
        <div className="mb-4 w-full flex flex-col items-center">
          <Skeleton width="60%" height={24} className="mb-2" />
          <Skeleton width="40%" height={16} />
        </div>

        {/* Property/Projects Stats Skeleton */}
        <div className="flex items-center justify-center gap-6 w-full mb-5">
           <Skeleton width={40} height={40} circle={true} />
           <Skeleton width={40} height={40} circle={true} />
        </div>

        {/* View Profile CTA Skeleton */}
        <div className="mt-auto w-full border-t border-gray-100 pt-4 flex justify-center">
            <Skeleton width="40%" height={20} />
        </div>
      </div>
    </div>
  );
};

export default AgentCardSkeleton;
