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
        <article className="article-card-wrapper">
            <Card className="article-card">
                {/* Image Container */}
                <div className="article-image-container">
                    <Image 
                        loading="lazy" 
                        className="article-image"
                        src={ele?.image || placeholderImage} 
                        alt={ele?.title || "Article"} 
                        width={400} 
                        height={250} 
                        onError={placeholderImage} 
                    />
                    
                    {/* Category Tag */}
                    <span className="article-category-tag">
                        {ele.category?.category || translate("General")}
                    </span>
                    
                    {/* Overlay Gradient */}
                    <div className="image-overlay"></div>
                </div>

                {/* Content Section */}
                <Card.Body className="article-content">
                    {/* Title */}
                    <h3 className="article-title">
                        {stripHtmlTags(truncate(ele.title, 50))}
                    </h3>
                    
                    {/* Description */}
                    {ele?.description && (
                        <p className="article-description">
                            {stripHtmlTags(truncate(ele.description, 60))}
                        </p>
                    )}

                    {/* Read More Button */}
                    <div className="read-more-container">
                        <Link 
                            href="/article-details/[slug]" 
                            as={`/article-details/${ele.slug_id}`} 
                            passHref
                        >
                            <button className="read-more-btn">
                                <span>{translate("showMore")}</span>
                                <span className="btn-icon">
                                    {language?.rtl === 1 ? (
                                        <AiOutlineArrowLeft size={16} />
                                    ) : (
                                        <AiOutlineArrowRight size={16} />
                                    )}
                                </span>
                            </button>
                        </Link>
                    </div>
                </Card.Body>

                {/* Footer */}
                <Card.Footer className="article-footer">
                    <div className="author-info">
                        <div className="author-avatar-wrapper">
                            <Image 
                                loading="lazy" 
                                src={systemsettingsData?.admin_image || placeholderImage} 
                                alt="Admin" 
                                className="author-avatar" 
                                width={48} 
                                height={48} 
                                onError={placeholderImage} 
                            />
                        </div>
                        <div className="author-details">
                            <span className="author-name">
                                <AiOutlineUser className="author-icon" size={14} />
                                {translate("by")} {systemsettingsData?.admin_name || "Admin"}
                            </span>
                            <span className="article-date">
                                <AiOutlineCalendar className="date-icon" size={14} />
                                {timeAgo(ele.created_at)}
                            </span>
                        </div>
                    </div>
                    
                    {/* Decorative Element */}
                    <div className="footer-decoration"></div>
                </Card.Footer>
            </Card>
        </article>
    );
};

export default ArticleCard;