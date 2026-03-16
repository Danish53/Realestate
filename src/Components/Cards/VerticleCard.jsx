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
import { FiMapPin, FiHome, FiMaximize } from "react-icons/fi";
import { BiBed, BiBath } from "react-icons/bi";
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
      beds: { icon: BiBed, label: 'beds' },
      baths: { icon: BiBath, label: 'baths' },
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
      className="group cursor-pointer flex flex-col gap-3 h-full"
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
      {/* Image Section */}
      <div className="relative w-full aspect-[20/19] overflow-hidden rounded-xl bg-gray-200 shrink-0">
        {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-gray-300"></div>}
        <Image
          loading="lazy"
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          src={ele?.title_image || placeholderImage}
          alt={ele?.title || "Property"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onLoad={handleImageLoad}
          onError={placeholderImage}
        />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {(ele?.promoted || ele?.is_premium) && (
            <span className="bg-white/95 backdrop-blur-sm text-gray-900 text-[13px] font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 border border-black/5">
              {ele?.promoted ? translate("featured") : "Premium"}
            </span>
          )}
        </div>

        {/* Like Button */}
        <button
          type="button"
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center hover:scale-110 active:scale-95 transition-all drop-shadow-sm"
          onClick={isLiked ? handleDislike : handleLike}
          aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
        >
          {isLiked ? (
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{display: 'block', fill: 'rgb(255, 56, 92)', height: '24px', width: '24px', stroke: 'white', strokeWidth: 2, overflow: 'visible'}}><path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-6.94c-3.2 0-6 1.83-7 4.93-1-3.1-3.8-4.93-7-4.93A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"></path></svg>
          ) : (
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{display: 'block', fill: 'rgba(0, 0, 0, 0.5)', height: '24px', width: '24px', stroke: 'white', strokeWidth: 2, overflow: 'visible'}}><path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-6.94c-3.2 0-6 1.83-7 4.93-1-3.1-3.8-4.93-7-4.93A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"></path></svg>
          )}
        </button>
      </div>

      {/* Content Section */}
      <div className="flex flex-col px-1 flex-grow">
        <div className="flex justify-between items-start gap-2">
            <h3 className="text-gray-900 font-semibold text-[15px] leading-snug line-clamp-1">
                {ele?.title}
            </h3>
            {ele?.property_type && (
                <span className="flex items-center gap-1 text-[14px] text-gray-900 shrink-0">
                    ★ {translate(ele.property_type)}
                </span>
            )}
        </div>
        
        <div className="text-gray-500 text-[15px] line-clamp-1 mt-1">
            {ele?.city ? `${ele.city}, ${ele.state || ''}` : ele?.category?.category}
        </div>

        {propertyFeatures.length > 0 && (
            <div className="text-gray-500 text-[15px] mt-0.5 line-clamp-1">
                {propertyFeatures.map((f, i) => (
                    <span key={i}>{f.value} {f.label}{i < propertyFeatures.length - 1 ? ' · ' : ''}</span>
                ))}
            </div>
        )}

        <div className="mt-1 flex items-baseline gap-1">
            <span className="text-gray-900 font-semibold text-[15px]">
                {formatPriceAbbreviated(ele?.price)}
            </span>
        </div>
      </div>

      {/* Login Modal */}
      {showModal && <LoginModal isOpen={showModal} onClose={handleCloseModal} />}
    </div>
  );
}

export default VerticalCard;