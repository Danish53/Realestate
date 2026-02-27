"use client";
import { settingsData } from "@/store/reducer/settingsSlice";
import { isThemeEnabled, placeholderImage, translate } from "@/utils/helper";
import React, { useState } from "react";
import { Card } from "react-bootstrap";
import { useSelector } from "react-redux";
import Image from "next/image";
import { ImageToSvg } from "./ImageToSvg";
import { FiHome, FiArrowRight } from "react-icons/fi";

const CategoryCard = ({ ele, isSelected, onSelect }) => {
    const DummyImgData = useSelector(settingsData);
    const PlaceHolderImg = DummyImgData?.web_placeholder_logo;
    const themeEnabled = isThemeEnabled();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className={`category-card-wrapper ${isSelected ? 'selected' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onSelect && onSelect(ele)}
        >
            <Card className="category-card">
                <Card.Body className="p-4">
                    <div className="category-card-content">
                        {/* Icon Section with Gradient Background */}
                        <div className="category-icon-wrapper">
                            <div className="category-icon-container">
                                {themeEnabled ? (
                                    <ImageToSvg 
                                        imageUrl={ele?.image ? ele.image : PlaceHolderImg} 
                                        className="category-svg-icon"
                                    />
                                ) : (
                                    <Image 
                                        loading="lazy" 
                                        src={ele?.image || PlaceHolderImg} 
                                        alt={ele?.category || "Category"} 
                                        className="category-image-icon" 
                                        width={40} 
                                        height={40} 
                                        onError={placeholderImage} 
                                    />
                                )}
                            </div>
                            
                            {/* Radio Button Indicator */}
                            <div className="category-select-indicator">
                                <div className={`radio-dot ${isSelected ? 'selected' : ''}`}>
                                    {isSelected && (
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                            <circle cx="5" cy="5" r="4" fill="white"/>
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Category Details */}
                        
                        
                    </div>
                    <div className="category-details mt-3">
                            <h3 className="category-name">{ele?.category || translate("category")}</h3>
                            

                            {/* Hover Arrow Animation */}
                            <div className={`category-hover-arrow ${isHovered || isSelected ? 'visible' : ''}`}>
                                <FiArrowRight size={18} />
                            </div>
                        </div>
                    <div className="category-stats mt-3">
                                <FiHome className="stats-icon" size={14} />
                                <span className="property-count">
                                    {ele?.properties_count || 0} {translate("properties")}
                                </span>
                            </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default CategoryCard;