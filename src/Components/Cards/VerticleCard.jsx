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
import { Tooltip } from "antd";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FiMapPin, FiHome, FiMaximize, FiBath, FiBed } from "react-icons/fi";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import LoginModal from "../LoginModal/LoginModal";
import { ImageToSvg } from "./ImageToSvg";
import premiumIcon from "../../assets/premium.svg";
import { PackageTypes } from "@/utils/checkPackages/packageTypes";

function VerticalCard({ ele, removeCard, onImageLoad, isUserProperty }) {
  const router = useRouter();
  const isLoggedIn = useSelector((state) => state.User_signup);
  const [isLiked, setIsLiked] = useState(ele?.is_favourite === 1);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    if (onImageLoad) onImageLoad();
  };

  const handleCloseModal = () => setShowModal(false);

  const handleLike = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (isLoggedIn && isLoggedIn.data && isLoggedIn.data.token) {
      AddFavourite(
        ele?.id,
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
      ele?.id,
      "0",
      (response) => {
        setIsLiked(false);
        setIsDisliked(true);
        toast.success(response.message);
        if (removeCard) removeCard(ele?.id);
      },
      (error) => console.log(error)
    );
  };

  useEffect(() => {
    setIsLiked(ele?.is_favourite === 1);
    setIsDisliked(false);
  }, [ele?.is_favourite]);

  const DummyImgData = useSelector(settingsData);
  const themeEnabled = isThemeEnabled();
  const validParameters = ele?.parameters
    .filter((elem) => elem?.value !== "" && elem?.value !== "0")
    .slice(0, 3);

  // Extract common property features
  const getPropertyFeatures = () => {
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

  const propertyFeatures = getPropertyFeatures();

  return (
    <div
      className="property-card"
      onClick={(e) =>
        handlePackageCheck(
          e,
          PackageTypes.PREMIUM_PROPERTIES,
          router,
          ele?.id,
          ele,
          isUserProperty
        )
      }
    >
      <div className="property-card-inner">
        {/* Image Section */}
        <div className="property-image-section">
          <div className="property-image-wrapper">
            {!imageLoaded && <div className="image-skeleton"></div>}
            <Image
              loading="lazy"
              className={`property-image ${imageLoaded ? 'loaded' : ''}`}
              src={ele?.title_image || placeholderImage}
              alt={ele?.title || "Property"}
              width={400}
              height={300}
              onLoad={handleImageLoad}
              onError={placeholderImage}
            />
            
            {/* Overlay Gradient */}
            <div className="image-overlay"></div>
            
            {/* Badges */}
            <div className="property-badges">
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
                      width={16}
                      height={16}
                    />
                    <span>Premium</span>
                  </div>
                </Tooltip>
              )}
            </div>

            {/* Property Type Tag */}
            {ele.property_type && (
              <span className={`property-type-tag ${ele?.property_type}`}>
                {translate(ele.property_type)}
              </span>
            )}

            {/* Like Button */}
            <button 
              className={`like-button ${isLiked ? 'liked' : ''}`}
              onClick={isLiked ? handleDislike : handleLike}
              aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
            >
              {isLiked ? (
                <AiFillHeart size={22} className="heart-icon filled" />
              ) : (
                <AiOutlineHeart size={22} className="heart-icon" />
              )}
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="property-content-section">
          {/* Category & Title */}
          <div className="property-category">
            {ele?.category && (
              <div className="category-icon">
                {themeEnabled ? (
                  <ImageToSvg
                    imageUrl={ele?.category?.image}
                    className="category-svg"
                  />
                ) : (
                  <Image
                    loading="lazy"
                    src={ele?.category?.image}
                    alt={ele?.category?.category}
                    width={18}
                    height={18}
                    onError={placeholderImage}
                  />
                )}
              </div>
            )}
            <span className="category-name">
              {ele?.category?.category || translate("property")}
            </span>
          </div>

          <h3 className="property-title">{ele?.title}</h3>
          
          {/* Location */}
          <div className="property-location">
            <FiMapPin className="location-icon" size={14} />
            <span className="location-text">
              {`${ele?.city || ""}${ele?.city && ele?.state ? ", " : ""}${
                ele?.state || ""
              }${(ele?.city || ele?.state) && ele?.country ? ", " : ""}${
                ele?.country || ""
              }`}
            </span>
          </div>

          {/* Features Grid */}
          {propertyFeatures.length > 0 && (
            <div className="property-features">
              {propertyFeatures.map((feature, index) => (
                <Tooltip
                  key={index}
                  title={translate(feature.label)}
                  placement="top"
                >
                  <div className="feature-item">
                    <feature.icon className="feature-icon" size={16} />
                    <span className="feature-value">{feature.value}</span>
                  </div>
                </Tooltip>
              ))}
            </div>
          )}

          {/* Parameters (if any) */}
          {validParameters.length > 0 && !propertyFeatures.length && (
            <div className="property-parameters">
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
                          width={16}
                          height={16}
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

          {/* Footer with Price */}
          <div className="property-footer">
            {ele?.price && (
              <div className="price-section">
                <span className="price-label">{translate("price")}</span>
                <span className="price-value">
                  {formatPriceAbbreviated(ele?.price)}
                </span>
              </div>
            )}
            
            {/* View Details Arrow */}
            <div className="view-details">
              <span className="view-text">{translate("viewDetails")}</span>
              <svg className="arrow-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showModal && <LoginModal isOpen={showModal} onClose={handleCloseModal} />}
    </div>
  );
}

export default VerticalCard;