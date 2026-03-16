"use client"
import { AddFavourite } from "@/store/actions/campaign";
import { settingsData } from "@/store/reducer/settingsSlice";
import { formatPriceAbbreviated, isThemeEnabled, placeholderImage, translate, truncate } from "@/utils/helper";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { toast } from "react-hot-toast";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useSelector } from "react-redux";
import { ImageToSvg } from "../Cards/ImageToSvg";
import LoginModal from "../LoginModal/LoginModal";
import Swal from "sweetalert2";
import { Tooltip } from "antd";
import { store } from "@/store/store";

const AllPropertieCard = ({ ele }) => {
    
    const themeEnabled = isThemeEnabled();
    const isLoggedIn = useSelector((state) => state.User_signup);

    // Initialize isLiked based on ele.is_favourite
    const [isLiked, setIsLiked] = useState(ele.is_favourite === 1);

    // Initialize isDisliked as false
    const [isDisliked, setIsDisliked] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const handleCloseModal = () => {
        setShowModal(false);
    };

    const language = store.getState().Language.languages;
    const handleLike = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoggedIn && isLoggedIn.data && isLoggedIn.data.token) {
            AddFavourite(
                ele.id,
                "1",
                (response) => {
                    setIsLiked(true);
                    setIsDisliked(false);
                    toast.success(response.message);
                },
                (error) => {
                    console.log(error);
                }
            );
        } else {
            Swal.fire({
                title: translate("plzLogFirst"),
                icon: "warning",
                allowOutsideClick: false,
                showCancelButton: false,
                customClass: {
                    confirmButton: 'Swal-confirm-buttons',
                    cancelButton: "Swal-cancel-buttons"
                },
                confirmButtonText: translate("ok"),
            }).then((result) => {
                if (result.isConfirmed) {
                    setShowModal(true)
                }
            });
        }
    };

    const handleDislike = (e) => {
        e.preventDefault();
        e.stopPropagation();
        AddFavourite(
            ele.id,
            "0",
            (response) => {
                setIsLiked(false);
                setIsDisliked(true);
                toast.success(response.message);
            },
            (error) => {
                console.log(error);
            }
        );
    };

    useEffect(() => {
        // Update the state based on ele.is_favourite when the component mounts
        setIsLiked(ele.is_favourite === 1);
        setIsDisliked(false);
    }, [ele.is_favourite]);
    const validParameters = ele?.parameters.filter(
        (elem) => elem?.value !== "" && elem?.value !== "0"
    ).slice(0, 3);
    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 group">
                <div className="flex flex-col sm:flex-row h-full">
                    {/* Image Section */}
                    <div className="relative w-full sm:w-2/5 md:w-1/3 lg:w-2/5 aspect-[4/3] sm:aspect-auto sm:min-h-[220px] overflow-hidden">
                        <Image 
                            loading="lazy" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            src={ele?.title_image} 
                            alt={ele?.title || "Property image"} 
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={placeholderImage} 
                        />
                        
                        {/* Promoted Badge */}
                        {ele.promoted ? (
                            <div className="absolute top-4 left-4 bg-primary-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm z-10">
                                {translate("featured")}
                            </div>
                        ) : null}

                        {/* Property Type Badge (Sell/Rent) */}
                        {ele.property_type && (
                            <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm z-10 capitalize">
                                {translate(ele.property_type)}
                            </div>
                        )}

                        {/* Like Button */}
                        <button 
                            className="absolute bottom-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10"
                            onClick={isLiked ? handleDislike : handleLike}
                        >
                            {isLiked ? (
                                <AiFillHeart size={18} className="text-red-500" />
                            ) : (
                                <AiOutlineHeart size={18} className="text-gray-600" />
                            )}
                        </button>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex flex-col justify-between w-full sm:w-3/5 md:w-2/3 lg:w-3/5">
                        <div>
                            {/* Category & Price Row */}
                            <div className="flex justify-between items-start mb-2 gap-4">
                                {ele.category && (
                                    <div className="flex items-center gap-2 px-2.5 py-1 bg-gray-50 rounded-lg shrink-0">
                                        <div className="w-4 h-4 relative opacity-70">
                                            {themeEnabled ? (
                                                <ImageToSvg imageUrl={ele.category && ele.category.image} className="w-full h-full" />
                                            ) : (
                                                <Image loading="lazy" src={ele?.category?.image} alt="category" fill className="object-cover" onError={placeholderImage} />
                                            )}
                                        </div>
                                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">{ele.category.category}</span>
                                    </div>
                                )}
                                {ele?.price && (
                                    <div className="text-lg sm:text-xl font-bold text-primary-600 whitespace-nowrap">
                                        {formatPriceAbbreviated(ele?.price)}
                                    </div>
                                )}
                            </div>

                            {/* Title & Location */}
                            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                                {ele?.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-1 mb-4 flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {truncate(`${ele?.city ? ele?.city + ', ' : ''}${ele?.state ? ele?.state + ', ' : ''}${ele?.country || ''}`, 40)}
                            </p>
                        </div>

                        {/* Parameters */}
                        {validParameters.length > 0 && (
                            <div className="flex items-center gap-4 border-t border-gray-100 pt-4 mt-auto">
                                {validParameters.map((elem, index) => (
                                    <Tooltip key={index} title={Array.isArray(elem?.name) ? elem.name.join(', ') : elem?.name} placement="top">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 relative opacity-60">
                                                {themeEnabled ? (
                                                    <ImageToSvg imageUrl={elem?.image} className="w-full h-full" />
                                                ) : (
                                                    <Image loading="lazy" src={elem?.image} alt="icon" fill className="object-cover" onError={placeholderImage} />
                                                )}
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700">
                                                {Array.isArray(elem?.value) ? truncate(elem.value.slice(0, 1).join(', '), 5) : truncate(elem.value, 5)}
                                            </span>
                                        </div>
                                    </Tooltip>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showModal && <LoginModal isOpen={showModal} onClose={handleCloseModal} />}
        </>
    );
};

export default AllPropertieCard;
