// "use client";
// import { settingsData } from "@/store/reducer/settingsSlice";
// import { isThemeEnabled, placeholderImage, translate } from "@/utils/helper";
// import React, { useState } from "react";
// import { useSelector } from "react-redux";
// import Image from "next/image";
// import { ImageToSvg } from "./ImageToSvg";
// import { FiHome, FiArrowRight } from "react-icons/fi";

// const CategoryCard = ({ ele, isSelected, onSelect }) => {
//     const DummyImgData = useSelector(settingsData);
//     const PlaceHolderImg = DummyImgData?.web_placeholder_logo;
//     const themeEnabled = isThemeEnabled();
//     const [isHovered, setIsHovered] = useState(false);

//     return (
//         <div 
//             className={`group relative overflow-hidden rounded-2xl bg-white border transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer flex flex-col h-full
//                 ${isSelected ? 'border-gray-900 shadow-md ring-1 ring-gray-900' : 'border-gray-200'}`}
//             onMouseEnter={() => setIsHovered(true)}
//             onMouseLeave={() => setIsHovered(false)}
//             onClick={() => onSelect && onSelect(ele)}
//             title={ele?.category || translate("category")}
//         >
//             <div className="p-4 sm:p-5 flex flex-col h-full relative z-10">
//                 <div className="flex items-start justify-between mb-8">
//                     <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center transition-colors group-hover:bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
//                         {themeEnabled ? (
//                             <ImageToSvg 
//                                 imageUrl={ele?.image ? ele.image : PlaceHolderImg} 
//                                 className="w-7 h-7 text-gray-700 object-contain transition-colors"
//                             />
//                         ) : (
//                             <Image 
//                                 loading="lazy" 
//                                 src={ele?.image || PlaceHolderImg} 
//                                 alt={ele?.category || "Category"} 
//                                 className="w-7 h-7 object-contain drop-shadow-sm" 
//                                 width={28} 
//                                 height={28} 
//                                 onError={placeholderImage} 
//                             />
//                         )}
//                     </div>
//                     {isSelected && (
//                         <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center text-white shrink-0 shadow-sm">
//                             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                             </svg>
//                         </div>
//                     )}
//                 </div>

//                 <div className="flex-grow flex flex-col justify-end">
//                     <h3 className="text-[17px] font-semibold text-gray-900 mb-1 transition-colors line-clamp-1">
//                         {ele?.category || translate("category")}
//                     </h3>
                    
//                     <div className="flex items-center justify-between mt-auto">
//                         <div className="text-[15px] text-gray-500 font-medium">
//                             {ele?.properties_count || 0} {translate("properties")}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CategoryCard;


"use client";
import { settingsData } from "@/store/reducer/settingsSlice";
import { isThemeEnabled, placeholderImage, translate } from "@/utils/helper";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { ImageToSvg } from "./ImageToSvg";
import { FiHome, FiArrowRight, FiTrendingUp } from "react-icons/fi";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

const CategoryCard = ({ ele, isSelected, onSelect, customIcon }) => {
    const DummyImgData = useSelector(settingsData);
    const PlaceHolderImg = DummyImgData?.web_placeholder_logo;
    const themeEnabled = isThemeEnabled();
    const [isHovered, setIsHovered] = useState(false);

    // Color gradients based on category
    const getGradient = (index) => {
        const gradients = [
            'from-blue-500 to-cyan-500',
            'from-purple-500 to-pink-500',
            'from-green-500 to-emerald-500',
            'from-orange-500 to-red-500',
            'from-indigo-500 to-purple-500',
            'from-yellow-500 to-orange-500',
        ];
        return gradients[Math.floor(Math.random() * gradients.length)];
    };

    return (
        <div 
            className={`group relative overflow-hidden rounded-3xl bg-white border-0 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer flex flex-col h-full
                ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onSelect && onSelect(ele)}
            title={ele?.category || translate("category")}
        >
            {/* Background Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
            
            {/* Decorative Pattern */}
            <div className="absolute -right-12 -top-12 w-24 h-24 bg-primary-100 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-30"></div>
            
            {/* Main Content */}
            <div className="relative p-6 sm:p-7 flex flex-col h-full z-10">
                {/* Icon Section with Modern Design */}
                <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:from-primary-100 group-hover:to-primary-200 overflow-hidden border border-primary-200">
                        {themeEnabled ? (
                            <ImageToSvg 
                                imageUrl={ele?.image ? ele.image : PlaceHolderImg} 
                                className="w-8 h-8 text-primary-600 object-contain transition-all duration-300 group-hover:scale-110"
                            />
                        ) : customIcon ? (
                            <div className="text-primary-600 transition-all duration-300 group-hover:scale-110">
                                {customIcon}
                            </div>
                        ) : (
                            <Image 
                                loading="lazy" 
                                src={ele?.image || PlaceHolderImg} 
                                alt={ele?.category || "Category"} 
                                className="w-8 h-8 object-contain transition-all duration-300 group-hover:scale-110" 
                                width={32} 
                                height={32} 
                                onError={placeholderImage} 
                            />
                        )}
                    </div>
                    
                    {/* Trending Badge */}
                    {ele?.properties_count > 50 && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <FiTrendingUp size={10} />
                            <span>Trending</span>
                        </div>
                    )}
                </div>

                {/* Category Info */}
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 transition-colors group-hover:text-primary-600 line-clamp-1">
                        {ele?.category || translate("category")}
                    </h3>
                    
                    {/* Property Count with Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Properties</span>
                            <span className="font-semibold text-primary-600">{ele?.properties_count || 0}+</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 group-hover:from-primary-600 group-hover:to-primary-700"
                                style={{ 
                                    width: `${Math.min((ele?.properties_count || 0) / 200 * 100, 100)}%` 
                                }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Footer with Explore Link */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 group-hover:text-primary-600 transition-colors">
                            Explore Category
                        </span>
                        <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300 group-hover:bg-primary-500 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-x-1`}>
                            <BsArrowLeft size={14} /> 
                            <BsArrowRight size={14} />
                        </div>
                    </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white shadow-lg">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryCard;