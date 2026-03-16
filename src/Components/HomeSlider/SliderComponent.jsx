// "use client";
// import React, { useState, useEffect } from "react";
// import AwesomeSlider from "react-awesome-slider";
// import "react-awesome-slider/dist/styles.css";
// import withAutoplay from "react-awesome-slider/dist/autoplay";
// import { FaEye } from "react-icons/fa";
// import Link from "next/link";
// import { GoPlay } from "react-icons/go";
// import VideoPlayerModal from "../PlayerModal/VideoPlayerModal";
// import { useSelector } from "react-redux";
// import { settingsData } from "@/store/reducer/settingsSlice";
// import {
//   formatNumberWithCommas,
//   placeholderImage,
//   translate,
// } from "@/utils/helper";
// import { BiLeftArrowCircle, BiRightArrowCircle } from "react-icons/bi";
// import { useRouter } from "next/router";
// import { ChevronLeft, ChevronRight } from "@mui/icons-material";

// const AutoplaySlider = withAutoplay(AwesomeSlider);

// const SliderComponent = ({ sliderData }) => {
//   const router = useRouter();
//   const [showVideoModal, setShowVideoModal] = useState(false);
//   const [autoplay, setAutoplay] = useState(true); // Add state for controlling autoplay
//   const systemSetttings = useSelector(settingsData);
//   const PlaceHolderImg =
//     systemSetttings && systemSetttings?.web_placeholder_logo;

//   const handleCloseModal = () => {
//     setShowVideoModal(false);
//     setAutoplay(true); // Enable autoplay when the video player is closed
//   };

//   const handleOpenModal = () => {
//     setShowVideoModal(true);
//     setAutoplay(false); // Disable autoplay when the video player is open
//   };

//   const ButtonContentLeft = (
//     <ChevronLeft className="custom_icons_slider" />
//   );
//   const ButtonContentRight = (
//     <ChevronRight className="custom_icons_slider" />
//   );

//   const handleImageClick = (data) => {
//     setAutoplay(false);
//     let dynamicLink = "/"; // Default link
//     let openInNewTab = false;

//     if (data?.slider_type === "1") {
//       dynamicLink = "/";
//       setAutoplay(true);
//     } else if (data?.slider_type === "2") {
//       dynamicLink = `/properties/categories/${data?.category?.slug_id}`;
//       openInNewTab = true;
//     } else if (data?.slider_type === "3") {
//       dynamicLink = `/properties-details/${data?.property?.slug_id}`;
//       openInNewTab = true;
//     } else if (data?.slider_type === "4") {
//       dynamicLink = data?.link;
//       openInNewTab = true;
//     } else {
//       dynamicLink = "/";
//       setAutoplay(true);
//     }

//     if (openInNewTab) {
//       window.open(dynamicLink, "_blank");
//     } else {
//       router.push(dynamicLink); // Navigate to the determined link in the same tab
//     }
//   };

//   return (
//     <div className="slider-container">
//       {" "}
//       {/* Ensure container size */}
//       <AutoplaySlider
//         animation="cube"
//         buttonContentRight={ButtonContentRight}
//         buttonContentLeft={ButtonContentLeft}
//         organicArrows={false}
//         bullets={false}
//         play={autoplay} // Use the state to control autoplay
//         interval={3000}
//         disableProgressBar={true}
//       >
//         {sliderData.map((single, index) => {
//           return (
//             <div
//               key={index}
//               data-src={single?.web_image ? single?.web_image : PlaceHolderImg}
//               className="main_slider_div"
//               onClick={() => handleImageClick(single)}
//             >
//               {single?.show_property_details === 1 && (
//                 <div className="container">
//                   <div id="herotexts">
//                     <div>
//                       <span id="priceteg">
//                         <span>
//                           {formatNumberWithCommas(single?.property?.price)}
//                         </span>
//                       </span>
//                       <h1 id="hero_headlines">{single?.property?.title}</h1>
//                       <div className="hero_text_parameters">
//                         {single?.parameters &&
//                           single?.parameters.slice(0, 4).map(
//                             (elem, index) =>
//                               elem.value !== 0 &&
//                               elem.value !== null &&
//                               elem.value !== undefined &&
//                               elem.value !== "" && (
//                                 <span key={index} id="specification">
//                                   {elem.name} : {elem.value}
//                                   {index < 3 ? ", " : ""}
//                                 </span>
//                               )
//                           )}
//                       </div>
//                     </div>
//                     <div id="viewall_hero_prop">
//                       <Link
//                         href="/properties-details/[slug]"
//                         as={`/properties-details/${single?.property?.slug_id}`}
//                         passHref
//                       >
//                         <button className="view_prop">
//                           <FaEye size={20} className="icon" />
//                           {translate("viewProperty")}
//                         </button>
//                       </Link>
//                       {single?.property?.video_link ? (
//                         <>
//                           <div>
//                             <GoPlay
//                               className="playbutton"
//                               size={50}
//                               onClick={handleOpenModal} // Open the video player
//                             />
//                           </div>
//                           <VideoPlayerModal
//                             isOpen={showVideoModal}
//                             onClose={handleCloseModal}
//                             data={single}
//                           />
//                         </>
//                       ) : null}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//             // </Link>
//           );
//         })}
//       </AutoplaySlider>
//     </div>
//   );
// };

// export default SliderComponent;  


"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaEye, FaPlay, FaPause } from "react-icons/fa";
import { GoPlay } from "react-icons/go";
import { BiLeftArrowCircle, BiRightArrowCircle } from "react-icons/bi";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { settingsData } from "@/store/reducer/settingsSlice";
import {
  formatNumberWithCommas,
  translate,
} from "@/utils/helper";
import VideoPlayerModal from "../PlayerModal/VideoPlayerModal";

// Modern Slider Component
const SliderComponent = ({ sliderData }) => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const systemSetttings = useSelector(settingsData);
  const intervalRef = useRef(null);
  const progressRef = useRef(null);

  const PlaceHolderImg = systemSetttings?.web_placeholder_logo || "/placeholder-image.jpg";

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && sliderData?.length > 0) {
      startAutoplay();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, [isPlaying, currentSlide, sliderData]);

  const startAutoplay = () => {
    // Clear existing intervals
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);

    // Progress bar animation
    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 1;
      });
    }, 50); // 50ms * 100 = 5000ms (5 seconds)

    // Slide change interval
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === sliderData.length - 1 ? 0 : prev + 1
      );
    }, 5000);
  };

  const handleNext = () => {
    setCurrentSlide((prev) =>
      prev === sliderData.length - 1 ? 0 : prev + 1
    );
    resetAutoplay();
  };

  const handlePrev = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? sliderData.length - 1 : prev - 1
    );
    resetAutoplay();
  };

  const resetAutoplay = () => {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      startAutoplay();
    }
  };

  const handleSlideClick = (index) => {
    setCurrentSlide(index);
    resetAutoplay();
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    } else {
      startAutoplay();
    }
  };

  const handleImageClick = (data) => {
    if (!data) return;

    let dynamicLink = "/";
    let openInNewTab = false;

    if (data?.slider_type === "2" && data?.category?.slug_id) {
      dynamicLink = `/properties/categories/${data.category.slug_id}`;
      openInNewTab = true;
    } else if (data?.slider_type === "3" && data?.property?.slug_id) {
      dynamicLink = `/properties-details/${data.property.slug_id}`;
      openInNewTab = true;
    } else if (data?.slider_type === "4" && data?.link) {
      dynamicLink = data.link;
      openInNewTab = true;
    }

    if (openInNewTab) {
      window.open(dynamicLink, "_blank");
    } else {
      router.push(dynamicLink);
    }
  };

  const handleOpenModal = (e) => {
    e.stopPropagation();
    setShowVideoModal(true);
    setIsPlaying(false);
  };

  const handleCloseModal = () => {
    setShowVideoModal(false);
    setIsPlaying(true);
  };

  if (!sliderData || sliderData.length === 0) return null;

  return (
    <div className="modern-slider-wrapper">
      {/* Main Slider Container */}
      <div className="modern-slider-container">
        {/* Slides */}
        <div className="slides-container">
          {sliderData.map((slide, index) => (
            <div
              key={index}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              onClick={() => handleImageClick(slide)}
            >
              {/* Background Image with Overlay */}
              <div
                className="slide-bg"
                style={{
                  backgroundImage: `url(${slide?.web_image || PlaceHolderImg})`,
                }}
              >
                <div className="overlay"></div>
              </div>

              {/* Content */}
              {slide?.show_property_details === 1 && slide?.property && (
                <div className="slide-content">
                  <div className="content-wrapper">
                    <div className="price-tag">
                      {formatNumberWithCommas(slide.property.price)}
                    </div>

                    <h2 className="title">{slide.property.title}</h2>

                    <div className="parameters">
                      {slide?.parameters?.slice(0, 4).map(
                        (param, idx) =>
                          param.value && (
                            <span key={idx} className="parameter">
                              {param.name}: {param.value}
                              {idx < 3 && <span className="separator">•</span>}
                            </span>
                          )
                      )}
                    </div>

                    <div className="actions">
                      <Link
                        href={`/properties-details/${slide.property.slug_id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button className="view-btn">
                          <FaEye className="icon" />
                          {translate("viewProperty")}
                        </button>
                      </Link>

                      {slide?.property?.video_link && (
                        <>
                          <button
                            className="play-btn"
                            onClick={handleOpenModal}
                          >
                            <GoPlay className="icon" />
                          </button>
                          <VideoPlayerModal
                            isOpen={showVideoModal}
                            onClose={handleCloseModal}
                            data={slide}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button type="button" className="nav-arrow prev" onClick={handlePrev} aria-label="Previous slide">
          <ChevronLeft />
        </button>
        <button type="button" className="nav-arrow next" onClick={handleNext} aria-label="Next slide">
          <ChevronRight />
        </button>

        {/* Play/Pause Button */}
        <button type="button" className="play-pause-btn" onClick={togglePlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>

        {/* Progress Bar */}
        <div className="hero-progress-track">
          <div
            className="hero-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Pagination dots (mobile) */}
        <div className="hero-dots" role="tablist" aria-label="Slider pagination">
          {sliderData.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`Go to slide ${index + 1}`}
              className={`hero-dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => handleSlideClick(index)}
            />
          ))}
        </div>

        {/* Thumbnails (desktop) */}
        <div className="thumbnails-container">
          {sliderData.map((slide, index) => (
            <div
              key={index}
              className={`thumbnail ${index === currentSlide ? 'active' : ''}`}
              onClick={() => handleSlideClick(index)}
            >
              <div
                className="thumbnail-img"
                style={{
                  backgroundImage: `url(${slide?.web_image || PlaceHolderImg})`,
                }}
              ></div>
              <div className="thumbnail-overlay"></div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .modern-slider-wrapper {
          width: 100%;
          margin: 0;
          padding: 0;
        }

        .modern-slider-container {
          position: relative;
          width: 100%;
          height: 75vh;
          min-height: 550px;
          max-height: 850px;
          overflow: hidden;
        }

        .slides-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 0.8s ease-in-out;
          cursor: pointer;
        }

        .slide.active {
          opacity: 1;
          z-index: 1;
        }

        .slide-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          transition: transform 6s ease-out;
        }

        .slide.active .slide-bg {
          transform: scale(1.08);
        }

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(ellipse 80% 50% at 50% 100%, rgba(0, 0, 0, 0.85) 0%, transparent 55%),
            linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.2) 45%, transparent 100%),
            linear-gradient(to right, rgba(0, 0, 0, 0.5) 0%, transparent 50%),
            linear-gradient(to left, rgba(0, 0, 0, 0.25) 0%, transparent 40%);
          pointer-events: none;
        }

        .slide-content {
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0 5% 4rem;
          color: white;
          z-index: 2;
          max-width: 1400px;
          margin: 0 auto;
        }

        .content-wrapper {
          max-width: 560px;
          animation: heroSlideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          position: relative;
        }

        .content-wrapper::after {
          content: '';
          position: absolute;
          bottom: -20px;
          left: 0;
          width: 64px;
          height: 4px;
          background: var(--primary-color);
          border-radius: 2px;
          box-shadow: 0 0 20px rgba(241, 93, 45, 0.5);
        }

        @keyframes heroSlideUp {
          from {
            opacity: 0;
            transform: translateY(32px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .price-tag {
          display: inline-block;
          background: linear-gradient(135deg, var(--primary-color) 0%, #e04a1a 100%);
          color: #fff;
          padding: 12px 26px;
          border-radius: 10px;
          font-size: 1.6rem;
          font-weight: 800;
          margin-bottom: 22px;
          letter-spacing: 0.02em;
          box-shadow: 0 8px 24px rgba(241, 93, 45, 0.4), 0 2px 8px rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.15);
        }

        .title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          margin-bottom: 24px;
          line-height: 1.08;
          letter-spacing: -0.03em;
          text-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 4px 24px rgba(0,0,0,0.35);
          max-width: 800px;
          font-family: var(--ds-font, "Outfit", "Inter", sans-serif);
        }

        .parameters {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 24px;
          margin-bottom: 36px;
          font-size: 1.1rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.95);
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .parameter {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .separator {
          margin-left: 12px;
          opacity: 0.5;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .view-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          color: #0f172a;
          border: none;
          padding: 16px 34px;
          border-radius: 10px;
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1);
        }

        .view-btn:hover {
          background: var(--primary-color);
          color: #fff;
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(241, 93, 45, 0.4), 0 4px 12px rgba(0,0,0,0.2);
        }

        .view-btn:focus-visible {
          outline: 2px solid white;
          outline-offset: 2px;
        }

        .view-btn .icon {
          width: 18px;
          height: 18px;
        }

        .play-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-radius: 50%;
          color: white;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }

        .play-btn:hover {
          background: var(--primary-color);
          border-color: var(--primary-color);
          transform: scale(1.1);
          box-shadow: 0 8px 24px rgba(241, 93, 45, 0.45);
        }

        .play-btn:focus-visible {
          outline: 2px solid white;
          outline-offset: 2px;
        }

        .play-btn .icon {
          width: 26px;
          height: 26px;
        }

        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 56px;
          height: 56px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.25s ease;
          z-index: 10;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }

        .nav-arrow:hover {
          background: var(--primary-color);
          border-color: var(--primary-color);
          color: white;
          transform: translateY(-50%) scale(1.05);
          box-shadow: 0 8px 24px rgba(241, 93, 45, 0.4);
        }

        .nav-arrow:focus-visible {
          outline: 2px solid white;
          outline-offset: 2px;
        }

        .nav-arrow.prev {
          left: 28px;
        }

        .nav-arrow.next {
          right: 28px;
        }

        .play-pause-btn {
          position: absolute;
          bottom: 88px;
          right: 28px;
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.25s ease;
          z-index: 10;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }

        .play-pause-btn:hover {
          background: var(--primary-color);
          border-color: var(--primary-color);
          box-shadow: 0 6px 20px rgba(241, 93, 45, 0.4);
        }

        .play-pause-btn:focus-visible {
          outline: 2px solid white;
          outline-offset: 2px;
        }

        .hero-progress-track {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 5px;
          background: rgba(255, 255, 255, 0.15);
          z-index: 10;
        }

        .hero-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-color), #ff7a4d);
          transition: width 0.05s linear;
          box-shadow: 0 0 12px rgba(241, 93, 45, 0.6);
        }

        .hero-dots {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 10;
        }

        .hero-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.25);
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }

        .hero-dot:hover {
          background: rgba(255, 255, 255, 0.6);
          border-color: rgba(255, 255, 255, 0.8);
        }

        .hero-dot.active {
          background: var(--primary-color);
          border-color: var(--primary-color);
          transform: scale(1.15);
          box-shadow: 0 0 0 2px rgba(255,255,255,0.4), 0 0 16px rgba(241, 93, 45, 0.5);
        }

        .hero-dot:focus-visible {
          outline: 2px solid white;
          outline-offset: 2px;
        }

        .thumbnails-container {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
          z-index: 10;
          padding: 10px 18px;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        }

        .thumbnail {
          position: relative;
          width: 92px;
          height: 52px;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .thumbnail.active {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(255,255,255,0.2), 0 0 20px rgba(241, 93, 45, 0.35);
        }

        .thumbnail:hover {
          border-color: rgba(255, 255, 255, 0.5);
          transform: scale(1.03);
        }

        .thumbnail-img {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
        }

        .thumbnail-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.2);
          transition: background 0.25s ease;
        }

        .thumbnail:hover .thumbnail-overlay {
          background: rgba(0, 0, 0, 0.02);
        }

        @media (max-width: 992px) {
          .thumbnails-container {
            display: none;
          }

          .hero-dots {
            display: flex;
          }
        }

        @media (min-width: 993px) {
          .hero-dots {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .modern-slider-container {
            height: 60vh;
            min-height: 450px;
          }

          .slide-content {
            padding: 0 5% 100px;
          }

          .price-tag {
            font-size: 1.3rem;
            padding: 8px 18px;
          }

          .title {
            font-size: 1.5rem;
          }

          .parameters {
            font-size: 0.875rem;
            margin-bottom: 20px;
          }

          .view-btn {
            padding: 12px 22px;
            font-size: 0.9rem;
          }

          .play-pause-btn {
            bottom: 72px;
            right: 16px;
          }

          .nav-arrow {
            width: 44px;
            height: 44px;
            left: 12px;
          }

          .nav-arrow.next {
            right: 12px;
          }
        }

        @media (max-width: 480px) {
          .modern-slider-wrapper {
            padding: 0;
          }

          .modern-slider-container {
            height: 60vh;
            min-height: 450px;
          }

          .slide-content {
            padding: 0 16px 64px;
          }

          .actions {
            flex-wrap: wrap;
            gap: 12px;
          }

          .nav-arrow {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </div>
  );
};

export default SliderComponent;
