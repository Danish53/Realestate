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
        <button className="nav-arrow prev" onClick={handlePrev}>
          <ChevronLeft />
        </button>
        <button className="nav-arrow next" onClick={handleNext}>
          <ChevronRight />
        </button>

        {/* Play/Pause Button */}
        <button className="play-pause-btn" onClick={togglePlayPause}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>

        {/* Progress Bar */}
        {/* <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progress}%` }}
          ></div>
        </div> */}

        {/* Thumbnails/Dots */}
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
          margin: 0 auto;
          padding: 0 10px;
        }

        .modern-slider-container {
          position: relative;
          width: 100%;
          height: 480px;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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
          transition: opacity 0.5s ease-in-out;
          cursor: pointer;
        }

        .slide.active {
          opacity: 1;
        }

        .slide-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          transition: transform 0.5s ease;
        }

        .slide.active .slide-bg {
          transform: scale(1.05);
        }

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.7) 0%,
            rgba(0, 0, 0, 0.4) 50%,
            rgba(0, 0, 0, 0.2) 100%
          );
        }

        .slide-content {
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0 80px;
          color: white;
          z-index: 2;
        }

        .content-wrapper {
          max-width: 600px;
          animation: slideUp 0.5s ease forwards;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .price-tag {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 12px 24px;
          border-radius: 50px;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 20px;
          box-shadow: 0 10px 30px -10px rgba(102, 126, 234, 0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .title {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 20px;
          line-height: 1.2;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .parameters {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 30px;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
        }

        .parameter {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .separator {
          margin-left: 10px;
          opacity: 0.5;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .view-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          color: #333;
          border: none;
          padding: 15px 30px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
        }

        .view-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px -10px rgba(0, 0, 0, 0.4);
        }

        .play-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 2px solid white;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .play-btn:hover {
          background: white;
          color: #333;
          transform: scale(1.1);
        }

        .play-btn .icon {
          width: 24px;
          height: 24px;
        }

        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .nav-arrow:hover {
          background: white;
          color: #333;
          border-color: white;
        }

        .nav-arrow.prev {
          left: 20px;
        }

        .nav-arrow.next {
          right: 20px;
        }

        .play-pause-btn {
          position: absolute;
          bottom: 80px;
          right: 20px;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .play-pause-btn:hover {
          background: white;
          color: #333;
        }

        .progress-container {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          z-index: 10;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transition: width 0.05s linear;
        }

        .thumbnails-container {
          position: absolute;
          bottom: 20px;
          left: 88%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 10;
          padding: 10px;
          border-radius: 50px;
        }

        .thumbnail {
          position: relative;
          width: 100px;
          height: 55px;
          border-radius: 6px;
          overflow: hidden;
          cursor: pointer;
          border-color: gray;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .thumbnail.active {
          border-color: #F1592A;
          // transform: scale(1.1);
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
          background: rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }

        .thumbnail:hover .thumbnail-overlay {
          background: rgba(0, 0, 0, 0.1);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .modern-slider-container {
            height: 400px;
            border-radius: 16px;
          }

          .slide-content {
            padding: 0 40px;
          }

          .price-tag {
            font-size: 20px;
            padding: 8px 16px;
          }

          .title {
            font-size: 28px;
          }

          .parameters {
            font-size: 14px;
          }

          .view-btn {
            padding: 12px 24px;
            font-size: 14px;
          }

          .thumbnails-container {
            display: none;
          }

          .play-pause-btn {
            bottom: 60px;
          }
        }

        @media (max-width: 480px) {
          .modern-slider-container {
            height: 350px;
          }

          .slide-content {
            padding: 0 20px;
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
