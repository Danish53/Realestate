"use client";
import { AddFavourite } from "@/store/actions/campaign";
import { settingsData } from "@/store/reducer/settingsSlice";
import {
  formatPriceAbbreviated,
  handlePackageCheck,
  isThemeEnabled,
  placeholderImage,
  translate,
  truncate,
} from "@/utils/helper";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FiMapPin, FiHome, FiMaximize, FiBath, FiBed, FiArrowRight } from "react-icons/fi";
import { useSelector } from "react-redux";
import Image from "next/image";
import { ImageToSvg } from "./ImageToSvg";
import Swal from "sweetalert2";
import LoginModal from "../LoginModal/LoginModal";
import { Tooltip } from "antd";
import premiumIcon from "../../assets/premium.svg";
import { useRouter } from "next/router";
import { PackageTypes } from "@/utils/checkPackages/packageTypes";

const HorizontalCard = ({ ele }) => {
  const router = useRouter();
  const isLoggedIn = useSelector((state) => state.User_signup);
  const DummyImgData = useSelector(settingsData);
  const [isLiked, setIsLiked] = useState(ele.is_favourite === 1);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const themeEnabled = isThemeEnabled();

  const handleCloseModal = () => setShowModal(false);

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
        (error) => console.log(error)
      );
    } else {
      Swal.fire({
        title: translate("plzLogFirst"),
        icon: "warning",
        allowOutsideClick: true,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
        },
        confirmButtonText: translate("ok"),
      }).then((result) => {
        if (result.isConfirmed) setShowModal(true);
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
      (error) => console.log(error)
    );
  };

  useEffect(() => {
    setIsLiked(ele.is_favourite === 1);
    setIsDisliked(false);
  }, [ele.is_favourite]);

  const validParameters = ele?.parameters
    ?.filter((elem) => elem?.value !== "" && elem?.value !== "0")
    ?.slice(0, 3);

  // Extract features
  const getFeatures = () => {
    const features = [];
    const paramMap = {
      beds: { icon: FiBed, label: 'beds' },
      baths: { icon: FiBath, label: 'baths' },
      area: { icon: FiMaximize, label: 'sqft' }
    };
    
    ele?.parameters?.forEach(param => {
      if (param.value && param.value !== "0") {
        const key = param.name?.toLowerCase();
        if (paramMap[key]) {
          features.push({
            icon: paramMap[key].icon,
            value: param.value,
            label: paramMap[key].label
          });
        }
      }
    });
    
    return features.slice(0, 3);
  };

  const features = getFeatures();

  return (
    <div
      className="horizontal-property-card"
      onClick={(e) => handlePackageCheck(e, PackageTypes.PREMIUM_PROPERTIES, router, ele?.id, ele)}
    >
      <div className="horizontal-card-inner">
        {/* Image Section */}
        <div className="card-image-section">
          <div className="image-wrapper">
            {!imageLoaded && <div className="image-skeleton"></div>}
            <Image
              loading="lazy"
              className={`property-image ${imageLoaded ? 'loaded' : ''}`}
              src={ele?.title_image || placeholderImage}
              alt={ele?.title || "Property"}
              width={400}
              height={300}
              onLoad={() => setImageLoaded(true)}
              onError={placeholderImage}
            />
            
            <div className="image-overlay"></div>
            
            {/* Badges */}
            <div className="card-badges">
              {ele?.promoted && (
                <span className="badge featured-badge">
                  <span className="badge-dot"></span>
                  {translate("featured")}
                </span>
              )}
              {ele?.is_premium && (
                <Tooltip title={translate("premiumProperty")} placement="top">
                  <div className="badge premium-badge">
                    <Image
                      loading="lazy"
                      src={premiumIcon.src}
                      alt="premium"
                      width={14}
                      height={14}
                    />
                    <span>Premium</span>
                  </div>
                </Tooltip>
              )}
            </div>

            {/* Property Type */}
            {ele.property_type && (
              <span className={`property-badge ${ele?.property_type}`}>
                {translate(ele.property_type)}
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="card-content-section">
          {/* Like Button */}
          <button 
            className={`like-button ${isLiked ? 'liked' : ''}`}
            onClick={isLiked ? handleDislike : handleLike}
            aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
          >
            {isLiked ? (
              <AiFillHeart size={20} className="heart-icon filled" />
            ) : (
              <AiOutlineHeart size={20} className="heart-icon" />
            )}
          </button>

          {/* Category */}
          {ele.category && (
            <div className="category-row">
              <div className="category-icon-wrapper">
                {themeEnabled ? (
                  <ImageToSvg
                    imageUrl={ele.category.image}
                    className="category-svg"
                  />
                ) : (
                  <Image
                    loading="lazy"
                    src={ele.category.image}
                    alt={ele.category.category}
                    width={16}
                    height={16}
                    onError={placeholderImage}
                  />
                )}
              </div>
              <span className="category-name">{ele.category.category}</span>
            </div>
          )}

          {/* Title */}
          <h3 className="property-title">{truncate(ele?.title, 20)}</h3>

          {/* Location */}
          <div className="location-row">
            <FiMapPin className="location-icon" size={14} />
            <span className="location-text">
              {truncate(
                `${ele?.city || ""}${ele?.city && ele?.state ? ", " : ""}${
                  ele?.state || ""
                }${(ele?.city || ele?.state) && ele?.country ? ", " : ""}${
                  ele?.country || ""
                }`,
                30
              )}
            </span>
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div className="features-grid">
              {features.map((feature, index) => (
                <Tooltip
                  key={index}
                  title={translate(feature.label)}
                  placement="top"
                >
                  <div className="feature-item">
                    <feature.icon className="feature-icon" size={14} />
                    <span className="feature-value">{feature.value}</span>
                  </div>
                </Tooltip>
              ))}
            </div>
          )}

          {/* Parameters (if no features) */}
          {!features.length && validParameters?.length > 0 && (
            <div className="parameters-grid">
              {validParameters.map((elem, index) => (
                <Tooltip
                  key={index}
                  title={Array.isArray(elem?.name) ? elem.name[0] : elem?.name}
                  placement="top"
                >
                  <div className="parameter-item">
                    <div className="parameter-icon">
                      {themeEnabled ? (
                        <ImageToSvg
                          imageUrl={elem?.image}
                          className="parameter-svg"
                        />
                      ) : (
                        <Image
                          loading="lazy"
                          src={elem?.image}
                          alt={elem?.name}
                          width={14}
                          height={14}
                          onError={placeholderImage}
                        />
                      )}
                    </div>
                    <span className="parameter-value">
                      {Array.isArray(elem?.value)
                        ? truncate(elem.value.join(", "), 5)
                        : truncate(elem.value, 5)}
                    </span>
                  </div>
                </Tooltip>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="card-footer-section">
            <div className="price-wrapper">
              <span className="price-label">{translate("price")}</span>
              <span className="price-value">
                {formatPriceAbbreviated(ele?.price)}
              </span>
              <div className="view-details mt-3">
              <span className="view-text">{translate("viewDetails")}</span>
              <FiArrowRight className="arrow-icon" size={16} />
            </div>
            </div>
            
            
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showModal && <LoginModal isOpen={showModal} onClose={handleCloseModal} />}
    </div>
  );
};

export default HorizontalCard;