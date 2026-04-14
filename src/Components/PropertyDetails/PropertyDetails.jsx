// "use client";
// import React, { useEffect, useState } from "react";
// import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
// import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
// import Image from "next/image";
// import { PiPlayCircleThin } from "react-icons/pi";
// import ReactPlayer from "react-player";
// import SimilerPropertySlider from "@/Components/SimilerPropertySlider/SimilerPropertySlider";
// import { settingsData } from "@/store/reducer/settingsSlice";
// import { useSelector } from "react-redux";
// import Map from "@/Components/GoogleMap/GoogleMap";
// import { languageData } from "@/store/reducer/languageSlice";
// import {
//   isLogin,
//   isThemeEnabled,
//   placeholderImage,
//   translate,
//   truncate,
//   isMobileDevice,
// } from "@/utils/helper";
// import { useRouter } from "next/router";
// import {
//   getPropertyDetailsApi,
//   intrestedPropertyApi,
// } from "@/store/actions/campaign";
// import LightBox from "@/Components/LightBox/LightBox";
// import Loader from "@/Components/Loader/Loader";
// import toast from "react-hot-toast";
// import { isSupported } from "firebase/messaging";
// import { ImageToSvg } from "@/Components/Cards/ImageToSvg";
// import Swal from "sweetalert2";
// import ReportPropertyModal from "@/Components/ReportPropertyModal/ReportPropertyModal";
// import { getChatData } from "@/store/reducer/momentSlice";
// import OwnerDeatilsCard from "../OwnerDeatilsCard/OwnerDeatilsCard";
// import PremiumOwnerDetailsCard from "../OwnerDeatilsCard/PremiumOwnerDetailsCard";
// import Layout from "../Layout/Layout";
// import LoginModal from "../LoginModal/LoginModal";
// import NoData from "../NoDataFound/NoData";
// import { IoDocumentAttachOutline } from "react-icons/io5";
// import { BiDownload } from "react-icons/bi";
// import MortgageCalculator from "../MortgageCalculator/MortgageCalculator";
// import PropertyGallery from "./PropertyGallery";
// import MobileBottomSheet from "../MobileBottomSheet/MobileBottomSheet";
// import withAuth from "../Layout/withAuth";

// const PropertyDetails = () => {
//   const router = useRouter();
//   const propId = router.query;

//   const [getSimilerData, setSimilerData] = useState([]);
//   const [isMessagingSupported, setIsMessagingSupported] = useState(false);
//   const [notificationPermissionGranted, setNotificationPermissionGranted] = useState(false);
//   const [isReporteModal, setIsReporteModal] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [expanded, setExpanded] = useState(false);
//   const [getPropData, setPropData] = useState(null);
//   const [interested, setInterested] = useState(false);
//   const [isReported, setIsReported] = useState(false);
//   const [showMap, setShowMap] = useState(false);
//   const [showChat, setShowChat] = useState(true);

//   const [chatData, setChatData] = useState({
//     property_id: "",
//     title: "",
//     title_image: "",
//     user_id: "",
//     name: "",
//     profile: "",
//   });
//   const [viewerIsOpen, setViewerIsOpen] = useState(false);
//   const [currentImage, setCurrentImage] = useState(0);

//   const [playing, setPlaying] = useState(false);
//   const [manualPause, setManualPause] = useState(false); // State to track manual pause
//   const [seekPosition, setSeekPosition] = useState(0);
//   const [showThumbnail, setShowThumbnail] = useState(true);

//   const [imageURL, setImageURL] = useState("");
//   const isLoggedIn = isLogin();
//   const lang = useSelector(languageData);
//   const isUserData = useSelector((state) => state.User_signup);
//   const SettingsData = useSelector(settingsData);

//   const isPremiumUser = SettingsData && SettingsData?.features_available?.premium_properties;

//   const themeEnabled = isThemeEnabled();
//   const isPremiumProperty = getPropData && getPropData.is_premium;
//   const DistanceSymbol = SettingsData && SettingsData?.distance_option;

//   const [showModal, setShowModal] = useState(false);

//   const handleCloseModal = () => {
//     setShowModal(false);
//   };

//   const [isMobile, setIsMobile] = useState(false);

//   const isShare = router.query.share === "true";

//   // Check if the user is on a mobile device
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(isMobileDevice() && window.innerWidth < 768);
//     };

//     checkMobile();
//     window.addEventListener('resize', checkMobile);

//     return () => {
//       window.removeEventListener('resize', checkMobile);
//     };
//   }, []);

//   useEffect(() => { }, [lang]);

//   useEffect(() => {
//     const checkMessagingSupport = async () => {
//       try {
//         const supported = await isSupported();
//         setIsMessagingSupported(supported);

//         if (supported) {
//           const permission = await Notification.requestPermission();
//           if (permission === "granted") {
//             setNotificationPermissionGranted(true);
//           }
//         }
//       } catch (error) {
//         console.error("Error checking messaging support:", error);
//       }
//     };

//     checkMessagingSupport();
//   }, [notificationPermissionGranted, isMessagingSupported]);

//   useEffect(() => {
//     setIsLoading(true);
//     if (propId.slug && propId.slug != "") {
//       getPropertyDetailsApi({
//         slug_id: propId.slug,
//         onSuccess: (response) => {
//           const propertyData = response && response.data;
//           setIsLoading(false);
//           setPropData(propertyData[0]);
//           setSimilerData(response?.similar_properties);
//           if (propertyData[0]?.is_reported) {
//             setIsReported(true);
//           }
//         },
//         onError: (error) => {
//           setIsLoading(true);
//           console.log(error);
//           if(error.message === "Cannot Access Premium Property, Feature Not Available"){
//             Swal.fire({
//               title: translate("opps"),
//               text: translate("premiumPropertiesLimitOrPackageNotAvailable"),
//               icon: "warning",
//               allowOutsideClick: false,
//               showCancelButton: false,
//               confirmButtonText: translate("ok"),
//               customClass: {
//                 confirmButton: "Swal-confirm-buttons",
//                 cancelButton: "Swal-cancel-buttons",
//               },
//             }).then((result) => {
//               if (result.isConfirmed) {
//                 router.push("/subscription-plan");
//               }
//             });
//           }
//         },
//       });
//     }
//   }, [propId, isLoggedIn, interested, isReported]);

//   useEffect(() => {
//     if (getPropData && getPropData?.three_d_image) {
//       setImageURL(getPropData?.three_d_image);
//     }
//   }, [getPropData]);

//   useEffect(() => {
//     if (imageURL) {
//       const initializePanorama = () => {
//         const panoramaElement = document.getElementById("panorama");
//         if (panoramaElement) {
//           pannellum.viewer("panorama", {
//             type: "equirectangular",
//             panorama: imageURL,
//             autoLoad: true,
//           });
//         } else {
//           console.error("Panorama element not found");
//         }
//       };

//       setTimeout(initializePanorama, 3000); // Slight delay to ensure the element is rendered
//     }
//   }, [imageURL]);

//   const userCurrentId =
//     isLoggedIn && isUserData?.data ? isUserData?.data?.data.id : null;

//   const userCompleteData = [
//     "name",
//     "email",
//     "mobile",
//     "profile",
//     "address",
//   ].every((key) => isUserData?.data?.data?.[key]);

//   const PlaceHolderImg = SettingsData?.web_placeholder_logo;

//   const getVideoType = (videoLink) => {
//     if (
//       videoLink &&
//       (videoLink.includes("youtube.com") || videoLink.includes("youtu.be"))
//     ) {
//       return "youtube";
//     } else if (videoLink && videoLink.includes("drive.google.com")) {
//       return "google_drive";
//     } else {
//       return "unknown";
//     }
//   };
//   const videoLink = getPropData && getPropData.video_link;

//   const videoId = videoLink
//     ? videoLink.includes("youtu.be")
//       ? videoLink.split("/").pop().split("?")[0]
//       : videoLink.split("v=")[1]?.split("&")[0] ?? null
//     : null;

//   const backgroundImageUrl = videoId
//     ? `https://img.youtube.com/vi/${videoId}/sddefault.jpg`
//     : PlaceHolderImg;

//   const handleVideoReady = (state) => {
//     setPlaying(state);
//     setShowThumbnail(!state);
//   };

//   const handleSeek = (e) => {
//     try {
//       if (e && typeof e.playedSeconds === "number") {
//         setSeekPosition(parseFloat(e.playedSeconds));
//         // Avoid pausing the video when seeking
//         if (!manualPause) {
//           setPlaying(true);
//         }
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const handleSeekEnd = () => {
//     setShowThumbnail(false);
//   };

//   const handlePause = () => {
//     setManualPause(true); // Manually pause the video
//     setShowThumbnail(true); // Reset showThumbnail to true
//   };

//   const galleryPhotos = getPropData && getPropData.gallery;

//   const openLightbox = (index) => {
//     setCurrentImage(index);
//     setViewerIsOpen(true);
//   };

//   const closeLightbox = () => {
//     // if (viewerIsOpen) {
//     setCurrentImage(0);
//     setViewerIsOpen(false);
//     // }
//   };
//   const handleShowMap = () => {
//     // Check if the property is premium
//     if (isPremiumProperty) {
//       // If the user is not logged in, show a login prompt
//       if (!isLoggedIn) {
//         Swal.fire({
//           title: translate("opps"),
//           text: translate("pleaseLoginFirstToViewMap"),
//           icon: "warning",
//           allowOutsideClick: true,
//           showCancelButton: false,
//           customClass: {
//             confirmButton: "Swal-confirm-buttons",
//             cancelButton: "Swal-cancel-buttons",
//           },
//           confirmButtonText: translate("ok"),
//         }).then((result) => {
//           if (result.isConfirmed) {
//             setShowModal(true); // Open the login modal
//           }
//         });
//       } else {
//         // If the user is logged in but not a premium user, show a premium property prompt
//         if (!isPremiumUser) {
//           Swal.fire({
//             title: translate("opps"),
//             text: translate("itsPrivatePrperty"),
//             icon: "warning",
//             allowOutsideClick: true,
//             showCancelButton: false,
//             customClass: {
//               confirmButton: "Swal-confirm-buttons",
//               cancelButton: "Swal-cancel-buttons",
//             },
//           }).then((result) => {
//             if (result.isConfirmed) {
//               router.push("/subscription-plan"); // Redirect to the subscription plan page
//             }
//           });
//         } else {
//           // If the user is a premium user, directly show the map
//           setShowMap(true);
//         }
//       }
//     } else {
//       // If the property is not premium, directly show the map
//       setShowMap(true);
//     }
//   };
//   useEffect(() => {
//     return () => {
//       setShowMap(false);
//       setIsReported(false);
//     };
//   }, [userCurrentId, propId]);
//   useEffect(() => {
//     if (getPropData) {
//       if (getPropData.is_interested === 1) {
//         setInterested(true);
//       } else {
//         setInterested(false);
//       }
//     }
//   }, [getPropData]);
//   useEffect(() => {
//     if (userCurrentId === getPropData?.added_by) {
//       setShowChat(false);
//     } else {
//       setShowChat(true);
//     }
//   }, [propId, showChat, userCurrentId, getPropData?.added_by]);

//   const handleInterested = (e) => {
//     e.preventDefault();
//     if (userCurrentId) {
//       intrestedPropertyApi(
//         getPropData.id,
//         "1",
//         (response) => {
//           setInterested(true);
//           toast.success(response.message);
//         },
//         (error) => {
//           console.log(error);
//         }
//       );
//     } else {
//       Swal.fire({
//         title: translate("plzLogFirstIntrest"),
//         icon: "warning",
//         allowOutsideClick: false,
//         showCancelButton: false,
//         allowOutsideClick: true,
//         customClass: {
//           confirmButton: "Swal-confirm-buttons",
//           cancelButton: "Swal-cancel-buttons",
//         },
//         confirmButtonText: translate("ok"),
//       }).then((result) => {
//         if (result.isConfirmed) {
//           setShowModal(true);
//         }
//       });
//     }
//   };

//   const handleNotInterested = (e) => {
//     e.preventDefault();

//     intrestedPropertyApi(
//       getPropData.id,
//       "0",
//       (response) => {
//         setInterested(false);
//         toast.success(response.message);
//       },
//       (error) => {
//         console.log(error);
//       }
//     );
//   };

//   const handleChat = (e) => {
//     e.preventDefault();
//     if (SettingsData?.demo_mode === true) {
//       Swal.fire({
//         title: translate("opps"),
//         text: translate("notAllowdDemo"),
//         icon: "warning",
//         showCancelButton: false,
//         customClass: {
//           confirmButton: "Swal-confirm-buttons",
//           cancelButton: "Swal-cancel-buttons",
//         },
//         confirmButtonText: translate("ok"),
//       });
//       return false;
//     } else {
//       if (userCurrentId) {
//         if (userCompleteData) {
//           setChatData((prevChatData) => {
//             const newChatData = {
//               property_id: getPropData.id,
//               slug_id: getPropData.slug_id,
//               title: getPropData.title,
//               title_image: getPropData.title_image,
//               user_id: getPropData.added_by,
//               name: getPropData.customer_name,
//               profile: getPropData.profile,
//               is_blocked_by_me: getPropData?.is_blocked_by_me,
//               is_blocked_by_user: getPropData?.is_blocked_by_user,
//             };

//             // Use the updater function to ensure you're working with the latest state
//             // localStorage.setItem('newUserChat', JSON.stringify(newChatData));
//             getChatData(newChatData);
//             return newChatData;
//           });

//           router.push("/user/chat");
//         } else {
//           return Swal.fire({
//             icon: "error",
//             title: translate("opps"),
//             text: translate("youHaveNotCompleteProfile"),
//             allowOutsideClick: true,
//             customClass: { confirmButton: "Swal-confirm-buttons" },
//           }).then((result) => {
//             if (result.isConfirmed) {
//               router.push("/user/profile");
//             }
//           });
//         }
//       } else {
//         Swal.fire({
//           title: translate("plzLogFirsttoAccess"),
//           icon: "warning",
//           allowOutsideClick: false,
//           showCancelButton: false,
//           allowOutsideClick: true,
//           customClass: {
//             confirmButton: "Swal-confirm-buttons",
//             cancelButton: "Swal-cancel-buttons",
//           },
//           confirmButtonText: translate("ok"),
//         }).then((result) => {
//           if (result.isConfirmed) {
//             setShowModal(true);
//           }
//         });
//         setShowChat(true);
//       }
//     }
//   };
//   const handleReportProperty = (e) => {
//     e.preventDefault();
//     if (userCurrentId) {
//       setIsReporteModal(true);
//     } else {
//       Swal.fire({
//         title: translate("plzLogFirsttoAccess"),
//         icon: "warning",
//         allowOutsideClick: false,
//         showCancelButton: false,
//         allowOutsideClick: true,
//         customClass: {
//           confirmButton: "Swal-confirm-buttons",
//           cancelButton: "Swal-cancel-buttons",
//         },
//         confirmButtonText: translate("ok"),
//       }).then((result) => {
//         if (result.isConfirmed) {
//           setShowModal(true);
//         }
//       });
//     }
//   };

//   useEffect(() => { }, [chatData, isReported, interested]);

//   const handleDownload = async (fileName) => {
//     try {
//       // Construct the file URL based on your backend or API
//       const fileUrl = `${fileName}`;
//       // Fetch the file data
//       const response = await fetch(fileUrl);

//       // Get the file data as a Blob
//       const blob = await response.blob();

//       // Create a URL for the Blob object
//       const blobUrl = URL.createObjectURL(blob);

//       // Create an anchor element
//       const link = document.createElement("a");

//       // Set the anchor's href attribute to the Blob URL
//       link.href = blobUrl;

//       // Specify the file name for the download
//       link.setAttribute("download", fileName);

//       // Append the anchor element to the body
//       document.body.appendChild(link);

//       // Trigger the download
//       link.click();

//       // Remove the anchor element from the body
//       document.body.removeChild(link);

//       // Revoke the Blob URL to release memory
//       URL.revokeObjectURL(blobUrl);
//     } catch (error) {
//       console.error("Error downloading file:", error);
//     }
//   };

//   const handlecheckPremiumUserAgent = (e) => {
//     e.preventDefault();
//     router.push(`/agent-details/${getPropData?.customer_slug_id}`);
//   };


//   const checkPremiumProperty = () => {
//     if (isPremiumProperty && !isPremiumUser) {
//       Swal.fire({
//         title: translate("opps"),
//         text: translate("premiumPropertiesLimitOrPackageNotAvailable") || "You don't have access to premium properties",
//         icon: "warning",
//         allowOutsideClick: false,
//         showCancelButton: false,
//         customClass: {
//           confirmButton: "Swal-confirm-buttons",
//           cancelButton: "Swal-cancel-buttons",
//         },
//       }).then((result) => {
//         if (result.isConfirmed) {
//           router.push("/subscription-plan");
//         }
//       });
//     }
//   };

//   useEffect(() => {
//     checkPremiumProperty();
//   }, [isPremiumProperty, isPremiumUser]);

//   return (
//     <>
//       {isLoading ? (
//         <Loader />
//       ) : (
//         <>
//           {getPropData ? (
//             <div className={`${isPremiumProperty && !isPremiumUser ? 'blur-background-property-details' : ''}`}>
//               <Layout>
//                 <Breadcrumb
//                   data={{
//                   type: getPropData && getPropData.category.category,
//                   title: getPropData && getPropData.title,
//                   loc: getPropData && getPropData.address,
//                   propertyType: getPropData && getPropData.property_type,
//                   time: getPropData && getPropData.post_created,
//                   price: getPropData && getPropData.price,
//                   is_favourite: getPropData && getPropData.is_favourite,
//                   propId: getPropData && getPropData.id,
//                   title_img: getPropData && getPropData.title_image,
//                   rentduration: getPropData && getPropData.rentduration,
//                   admin_status: getPropData && getPropData.request_status,
//                   propertyStatus: getPropData && getPropData.status,
//                   isUser: false,
//                   promoted: getPropData?.promoted,
//                 }}
//               />
//               <section className="bg-gray-50/50 py-8 lg:py-12">
//                 <div>
//                   <div className="container mx-auto px-4 max-w-7xl">
//                     <div className="flex flex-col lg:flex-row gap-8">
//                       <div className="w-full lg:w-2/3 xl:w-[70%] flex flex-col gap-8">
//                         <PropertyGallery
//                           galleryPhotos={galleryPhotos}
//                           titleImage={getPropData?.title_image}
//                           onImageClick={openLightbox}
//                           translate={translate}
//                           placeholderImage={placeholderImage}
//                           PlaceHolderImg={PlaceHolderImg}
//                         />

//                         <LightBox
//                           photos={galleryPhotos}
//                           viewerIsOpen={viewerIsOpen}
//                           currentImage={currentImage}
//                           onClose={setViewerIsOpen}
//                           title_image={getPropData?.title_image}
//                           setViewerIsOpen={setViewerIsOpen}
//                           setCurrentImage={setCurrentImage}
//                         />

//                         {getPropData && getPropData.description ? (
//                           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                             <div className="px-6 py-4 border-b border-gray-100">
//                               <h3 className="text-xl font-bold text-gray-900 m-0">{translate("1Prop")}</h3>
//                             </div>
//                             <div className="p-6">
//                               {getPropData && getPropData.description && (
//                                 <>
//                                   <p
//                                     className="text-gray-600 leading-relaxed text-[15px]"
//                                     style={{
//                                       overflow: "hidden",
//                                       textOverflow: "ellipsis",
//                                       maxHeight: expanded ? "none" : "4.5em",
//                                       marginBottom: "0",
//                                       whiteSpace: "pre-wrap",
//                                     }}
//                                   >
//                                     {getPropData.description}
//                                   </p>

//                                   <button
//                                     onClick={() => setExpanded(!expanded)}
//                                     className="mt-4 flex items-center gap-2 text-primary-500 font-semibold hover:text-primary-600 transition-colors focus:outline-none"
//                                     style={{
//                                       display: getPropData.description.split("\n").length > 3 || getPropData.description.length > 250 ? "flex" : "none",
//                                     }}
//                                   >
//                                     <span>{expanded ? "Show Less" : "Show More"}</span>
//                                     {lang?.rtl === 1 ? (
//                                       <AiOutlineArrowLeft size={18} />
//                                     ) : (
//                                       <AiOutlineArrowRight size={18} />
//                                     )}
//                                   </button>
//                                 </>
//                               )}
//                             </div>
//                           </div>
//                         ) : null}

//                         {getPropData &&
//                           getPropData.parameters.length > 0 &&
//                           getPropData.parameters.some(
//                             (elem) => elem.value !== null && elem.value !== ""
//                           ) ? (
//                           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                             <div className="px-6 py-4 border-b border-gray-100">
//                               <h3 className="text-xl font-bold text-gray-900 m-0">{translate("feature&Amenties")}</h3>
//                             </div>
//                             <div className="p-6">
//                               <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
//                                 {getPropData &&
//                                   getPropData.parameters.map((elem, index) =>
//                                     elem.value !== "" && elem.value !== "0" ? (
//                                       <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors" key={index}>
//                                         <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
//                                           {themeEnabled ? (
//                                             <ImageToSvg imageUrl={elem.image || PlaceHolderImg} className="w-5 h-5 text-primary-500" />
//                                           ) : (
//                                             <Image loading="lazy" src={elem?.image} width={20} height={20} alt="icon" onError={placeholderImage} />
//                                           )}
//                                         </div>
//                                         <div className="flex flex-col min-w-0">
//                                           <span className="text-sm text-gray-500 truncate">{elem.name}</span>
//                                           <div className="font-semibold text-gray-900 truncate text-[15px]">
//                                               {typeof elem?.value === "string" && elem.value.startsWith("https://") ? (
//                                                 <a href={elem.value} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline truncate">
//                                                   Link
//                                                 </a>
//                                               ) : (
//                                                 <span>{Array.isArray(elem?.value) ? elem.value.join(", ") : elem.value}</span>
//                                               )}
//                                           </div>
//                                         </div>
//                                       </div>
//                                     ) : null
//                                   )}
//                               </div>
//                             </div>
//                           </div>
//                         ) : null}

//                         {getPropData &&
//                           getPropData.assign_facilities.length > 0 &&
//                           getPropData.assign_facilities.some(
//                             (elem) => elem.distance !== null && elem.distance !== "" && elem.distance !== 0
//                           ) ? (
//                           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                             <div className="px-6 py-4 border-b border-gray-100">
//                               <h3 className="text-xl font-bold text-gray-900 m-0">{translate("OTF")}</h3>
//                             </div>
//                             <div className="p-6">
//                               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//                                 {getPropData &&
//                                   getPropData.assign_facilities.map(
//                                     (elem, index) =>
//                                       elem.distance !== "" && elem.distance !== 0 ? (
//                                         <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors border border-gray-100/50" key={index}>
//                                           <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
//                                               {themeEnabled ? (
//                                                 <ImageToSvg imageUrl={elem?.image || PlaceHolderImg} className="w-5 h-5 text-primary-500" />
//                                               ) : (
//                                                 <Image loading="lazy" src={elem?.image || PlaceHolderImg} width={20} height={20} alt="icon" onError={placeholderImage} />
//                                               )}
//                                           </div>
//                                           <div className="flex flex-col min-w-0">
//                                             <span className="text-sm text-gray-500 truncate">{elem.name}</span>
//                                             <div className="font-semibold text-gray-900 truncate text-[15px]">
//                                                 <span>
//                                                   {elem.distance} {" "}
//                                                   {elem.distance > 1 ? translate(DistanceSymbol + "s") : translate(DistanceSymbol)}
//                                                 </span>
//                                             </div>
//                                           </div>
//                                         </div>
//                                       ) : null
//                                   )}
//                               </div>
//                             </div>
//                           </div>
//                         ) : null}

//                         {getPropData && getPropData.latitude && getPropData.longitude ? (
//                           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                             <div className="px-6 py-4 border-b border-gray-100">
//                               <h3 className="text-xl font-bold text-gray-900 m-0">{translate("address")}</h3>
//                             </div>
//                             <div className="p-6">
//                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 relative z-10">
//                                 {!isPremiumProperty || isPremiumUser ? (
//                                   <>
//                                     <div className="flex flex-col gap-1">
//                                       <span className="text-sm text-gray-500">{translate("address")}</span>
//                                       <span className="font-semibold text-gray-900">{getPropData?.address}</span>
//                                     </div>
//                                     <div className="flex flex-col gap-1">
//                                       <span className="text-sm text-gray-500">{translate("city")}</span>
//                                       <span className="font-semibold text-gray-900">{getPropData?.city}</span>
//                                     </div>
//                                     <div className="flex flex-col gap-1">
//                                       <span className="text-sm text-gray-500">{translate("state")}</span>
//                                       <span className="font-semibold text-gray-900">{getPropData?.state}</span>
//                                     </div>
//                                     <div className="flex flex-col gap-1">
//                                       <span className="text-sm text-gray-500">{translate("country")}</span>
//                                       <span className="font-semibold text-gray-900">{getPropData?.country}</span>
//                                     </div>
//                                   </>
//                                 ) : null}
//                               </div>
//                               {getPropData ? (
//                                 <div className="relative rounded-xl overflow-hidden h-72 shadow-sm border border-gray-200">
//                                   {showMap ? (
//                                     <Map latitude={getPropData.latitude} longitude={getPropData.longitude} />
//                                   ) : (
//                                     <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
//                                       <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
//                                       <button
//                                         onClick={handleShowMap}
//                                         className="relative z-10 bg-primary-500 text-white font-semibold px-6 py-3 rounded-full hover:bg-primary-600 transition-colors shadow-lg hover:shadow-primary-500/30 transform hover:-translate-y-0.5"
//                                       >
//                                         {translate("ViewMap")}
//                                       </button>
//                                     </div>
//                                   )}
//                                 </div>
//                               ) : null}
//                             </div>
//                           </div>
//                         ) : null}

//                         {imageURL ? (
//                           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                             <div className="px-6 py-4 border-b border-gray-100">
//                               <h3 className="text-xl font-bold text-gray-900 m-0">{translate("vertualView")}</h3>
//                             </div>
//                             <div className="p-6">
//                               <div className="rounded-xl overflow-hidden h-80 sm:h-96 w-full shadow-inner border border-gray-200">
//                                 <div id="panorama" className="w-full h-full"></div>
//                               </div>
//                             </div>
//                           </div>
//                         ) : null}

//                         {getPropData && getPropData.video_link ? (
//                           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                             <div className="px-6 py-4 border-b border-gray-100">
//                               <h3 className="text-xl font-bold text-gray-900 m-0">{translate("video")}</h3>
//                             </div>
//                             <div className="p-6">
//                               {!playing ? (
//                                 <div
//                                   className="relative w-full aspect-video rounded-xl overflow-hidden shadow-inner group cursor-pointer"
//                                   style={{
//                                     backgroundImage: `url(${backgroundImageUrl})`,
//                                     backgroundSize: "cover",
//                                     backgroundPosition: "center center",
//                                   }}
//                                   onClick={() => setPlaying(true)}
//                                 >
//                                   <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
//                                       <PiPlayCircleThin className="text-white/80 group-hover:text-white transition-colors group-hover:scale-110 duration-300" size={80} />
//                                   </div>
//                                 </div>
//                               ) : (
//                                 <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-inner">
//                                   <ReactPlayer
//                                     className="absolute top-0 left-0 w-full h-full"
//                                     width="100%"
//                                     height="100%"
//                                     url={getPropData && getPropData.video_link}
//                                     playing={playing}
//                                     controls={true}
//                                     onPlay={() => handleVideoReady(true)}
//                                     onPause={() => {
//                                       setManualPause(true);
//                                       handlePause();
//                                     }}
//                                     onEnded={() => setPlaying(false)}
//                                     onProgress={handleSeek}
//                                     onSeek={handleSeek}
//                                     onSeekEnd={handleSeekEnd}
//                                   />
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         ) : null}

//                         {getPropData && getPropData.documents.length > 0 && (
//                           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                             <div className="px-6 py-4 border-b border-gray-100">
//                               <h3 className="text-xl font-bold text-gray-900 m-0">{translate("docs")}</h3>
//                             </div>
//                             <div className="p-6">
//                               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//                                 {getPropData &&
//                                   getPropData?.documents.map((ele, index) => {
//                                     const fileName = ele.file_name.split("/").pop();
//                                     return (
//                                         <div className="flex flex-col items-center p-5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-primary-100 hover:shadow-md transition-all duration-300 group" key={index}>
//                                           <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
//                                             <IoDocumentAttachOutline size={24} />
//                                           </div>
//                                           <span className="text-sm font-semibold text-gray-700 text-center mb-4 line-clamp-2" title={fileName}>
//                                             {fileName}
//                                           </span>
//                                           <button
//                                             onClick={() => handleDownload(ele.file)}
//                                             className="mt-auto flex items-center gap-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded-lg transition-colors w-full justify-center shadow-sm"
//                                           >
//                                             <BiDownload size={18} />
//                                             <span>{translate("download")}</span>
//                                           </button>
//                                         </div>
//                                     );
//                                   })}
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                       </div>

//                       {/* Right Sidebar */}
//                       <div className="w-full lg:w-1/3 xl:w-[30%] flex flex-col gap-6 lg:sticky lg:top-24">
//                         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                           <OwnerDeatilsCard
//                             getPropData={getPropData}
//                             showChat={showChat}
//                             userCurrentId={userCurrentId}
//                             interested={interested}
//                             isReported={isReported}
//                             handleInterested={handleInterested}
//                             isMessagingSupported={isMessagingSupported}
//                             handleNotInterested={handleNotInterested}
//                             notificationPermissionGranted={notificationPermissionGranted}
//                             handleChat={handleChat}
//                             handleReportProperty={handleReportProperty}
//                             PlaceHolderImg={PlaceHolderImg}
//                             handlecheckPremiumUserAgent={handlecheckPremiumUserAgent}
//                           />
//                         </div>
//                         {getPropData.property_type === "sell" && (
//                           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                             <MortgageCalculator data={getPropData} />
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                     {getSimilerData && (
//                       <SimilerPropertySlider
//                         data={getSimilerData}
//                         isLoading={isLoading}
//                         currentPropertyId={getPropData?.id}
//                       />
//                     )}

//                     {isReporteModal && (
//                       <ReportPropertyModal
//                         show={handleReportProperty}
//                         onHide={() => setIsReporteModal(false)}
//                         propertyId={getPropData?.id}
//                         setIsReported={setIsReported}
//                       />
//                     )}
//                   </div>
//                 </div>
//               </section>

//               {/* Add the MobileBottomSheet component for mobile devices with share=true in URL */}
//               {isMobile && isShare && (
//                 <MobileBottomSheet isOpen={true} />
//               )}

//             </Layout>
//             </div>
//           ) : (
//             <Layout>
//               <Breadcrumb />
//               <div className="row">
//                 <div className="col-12 pb-5">
//                   <NoData />
//                 </div>
//               </div>
//             </Layout>
//           )}
//         </>
//       )}

//       {showModal && (
//         <LoginModal isOpen={showModal} onClose={handleCloseModal} />
//       )}
//     </>
//   );
// };

// export default withAuth(PropertyDetails);





"use client";
import React, { useEffect, useMemo, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import Image from "next/image";
import { PiPlayCircleThin } from "react-icons/pi";
import ReactPlayer from "react-player";
import SimilerPropertySlider from "@/Components/SimilerPropertySlider/SimilerPropertySlider";
import { settingsData } from "@/store/reducer/settingsSlice";
import { useSelector } from "react-redux";
import Map from "@/Components/GoogleMap/GoogleMap";
import { languageData } from "@/store/reducer/languageSlice";
import {
  isLogin,
  isThemeEnabled,
  placeholderImage,
  translate,
  truncate,
  isMobileDevice,
  formatNumberWithCommas,
} from "@/utils/helper";
import { sanitizePropertyListingBrands } from "@/utils/sanitizeListingBrandText";
import { useRouter } from "next/router";
import {
  getPropertyDetailsApi,
  intrestedPropertyApi,
} from "@/store/actions/campaign";
import LightBox from "@/Components/LightBox/LightBox";
import Loader from "@/Components/Loader/Loader";
import toast from "react-hot-toast";
import { isSupported } from "firebase/messaging";
import { ImageToSvg } from "@/Components/Cards/ImageToSvg";
import Swal from "sweetalert2";
import ReportPropertyModal from "@/Components/ReportPropertyModal/ReportPropertyModal";
import { getChatData } from "@/store/reducer/momentSlice";
import OwnerDeatilsCard from "../OwnerDeatilsCard/OwnerDeatilsCard";
import PremiumOwnerDetailsCard from "../OwnerDeatilsCard/PremiumOwnerDetailsCard";
import Layout from "../Layout/Layout";
import LoginModal from "../LoginModal/LoginModal";
import NoData from "../NoDataFound/NoData";
import { IoDocumentAttachOutline } from "react-icons/io5";
import { BiDownload } from "react-icons/bi";
import MortgageCalculator from "../MortgageCalculator/MortgageCalculator";
import PropertyGallery from "./PropertyGallery";
import MobileBottomSheet from "../MobileBottomSheet/MobileBottomSheet";
import withAuth from "../Layout/withAuth";
import { FiHome, FiMapPin, FiCalendar, FiEye, FiHeart, FiShare2, FiDollarSign, FiSquare, FiBed, FiBath, FiGrid, FiMaximize, FiAward } from "react-icons/fi";
import { BsHeart, BsHeartFill, BsShieldCheck, BsCheckCircleFill } from "react-icons/bs";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

const PropertyDetails = () => {
  const router = useRouter();
  const propId = router.query;

  const [getSimilerData, setSimilerData] = useState([]);
  const [isMessagingSupported, setIsMessagingSupported] = useState(false);
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState(false);
  const [isReporteModal, setIsReporteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [getPropData, setPropData] = useState(null);
  const [interested, setInterested] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showChat, setShowChat] = useState(true);

  const [chatData, setChatData] = useState({
    property_id: "",
    title: "",
    title_image: "",
    user_id: "",
    name: "",
    profile: "",
  });
  const [viewerIsOpen, setViewerIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const [playing, setPlaying] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const [showThumbnail, setShowThumbnail] = useState(true);

  const [imageURL, setImageURL] = useState("");
  const isLoggedIn = isLogin();
  const lang = useSelector(languageData);
  const isUserData = useSelector((state) => state.User_signup);
  const SettingsData = useSelector(settingsData);

  const isPremiumUser = SettingsData && SettingsData?.features_available?.premium_properties;
  const themeEnabled = isThemeEnabled();
  const isPremiumProperty = getPropData && getPropData.is_premium;
  const DistanceSymbol = SettingsData && SettingsData?.distance_option;
  const primaryColor = "#F1592A";

  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false);

  const [isMobile, setIsMobile] = useState(false);
  const isShare = router.query.share === "true";

  const [propertyPageUrl, setPropertyPageUrl] = useState("");
  useEffect(() => {
    if (typeof window === "undefined" || !router.isReady) return;
    const path = router.asPath.split("?")[0].split("#")[0];
    setPropertyPageUrl(`${window.location.origin}${path}`);
  }, [router.isReady, router.asPath]);

  const platformLabel = useMemo(
    () => SettingsData?.company_name?.trim() || "eBroker",
    [SettingsData?.company_name]
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice() && window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const checkMessagingSupport = async () => {
      try {
        const supported = await isSupported();
        setIsMessagingSupported(supported);
        if (supported) {
          const permission = await Notification.requestPermission();
          if (permission === "granted") setNotificationPermissionGranted(true);
        }
      } catch (error) {
        console.error("Error checking messaging support:", error);
      }
    };
    checkMessagingSupport();
  }, [notificationPermissionGranted, isMessagingSupported]);

  useEffect(() => {
    setIsLoading(true);
    if (propId.slug && propId.slug != "") {
      getPropertyDetailsApi({
        slug_id: propId.slug,
        onSuccess: (response) => {
          const propertyData = response && response.data;
          setIsLoading(false);
          setPropData(propertyData[0] ? sanitizePropertyListingBrands(propertyData[0]) : null);
          setSimilerData(response?.similar_properties);
          if (propertyData[0]?.is_reported) setIsReported(true);
        },
        onError: (error) => {
          setIsLoading(true);
          console.log(error);
          if (error.message === "Cannot Access Premium Property, Feature Not Available") {
            Swal.fire({
              title: translate("opps"),
              text: translate("premiumPropertiesLimitOrPackageNotAvailable"),
              icon: "warning",
              allowOutsideClick: false,
              showCancelButton: false,
              confirmButtonText: translate("ok"),
              customClass: { confirmButton: "Swal-confirm-buttons" },
            }).then((result) => {
              if (result.isConfirmed) router.push("/subscription-plan");
            });
          }
        },
      });
    }
  }, [propId, isLoggedIn, interested, isReported]);

  useEffect(() => {
    if (getPropData && getPropData?.three_d_image) setImageURL(getPropData?.three_d_image);
  }, [getPropData]);

  useEffect(() => {
    if (imageURL) {
      const initializePanorama = () => {
        const panoramaElement = document.getElementById("panorama");
        if (panoramaElement) {
          pannellum.viewer("panorama", {
            type: "equirectangular",
            panorama: imageURL,
            autoLoad: true,
          });
        }
      };
      setTimeout(initializePanorama, 3000);
    }
  }, [imageURL]);

  const userCurrentId = isLoggedIn && isUserData?.data ? isUserData?.data?.data.id : null;
  const userCompleteData = ["name", "email", "mobile", "profile", "address"].every((key) => isUserData?.data?.data?.[key]);
  const PlaceHolderImg = SettingsData?.web_placeholder_logo;

  const getVideoType = (videoLink) => {
    if (videoLink && (videoLink.includes("youtube.com") || videoLink.includes("youtu.be"))) return "youtube";
    else if (videoLink && videoLink.includes("drive.google.com")) return "google_drive";
    else return "unknown";
  };

  const videoLink = getPropData && getPropData.video_link;
  const videoId = videoLink ? (videoLink.includes("youtu.be") ? videoLink.split("/").pop().split("?")[0] : videoLink.split("v=")[1]?.split("&")[0] ?? null) : null;
  const backgroundImageUrl = videoId ? `https://img.youtube.com/vi/${videoId}/sddefault.jpg` : PlaceHolderImg;

  const handleVideoReady = (state) => { setPlaying(state); setShowThumbnail(!state); };
  const handleSeek = (e) => { try { if (e && typeof e.playedSeconds === "number") { setSeekPosition(parseFloat(e.playedSeconds)); if (!manualPause) setPlaying(true); } } catch (error) { console.log(error); } };
  const handleSeekEnd = () => setShowThumbnail(false);
  const handlePause = () => { setManualPause(true); setShowThumbnail(true); };

  const galleryPhotos = getPropData && getPropData.gallery;
  const openLightbox = (index) => { setCurrentImage(index); setViewerIsOpen(true); };
  const closeLightbox = () => { setCurrentImage(0); setViewerIsOpen(false); };

  const handleShowMap = () => {
    if (isPremiumProperty) {
      if (!isLoggedIn) {
        Swal.fire({
          title: translate("opps"),
          text: translate("pleaseLoginFirstToViewMap"),
          icon: "warning",
          allowOutsideClick: true,
          showCancelButton: false,
          customClass: { confirmButton: "Swal-confirm-buttons" },
          confirmButtonText: translate("ok"),
        }).then((result) => { if (result.isConfirmed) setShowModal(true); });
      } else {
        if (!isPremiumUser) {
          Swal.fire({
            title: translate("opps"),
            text: translate("itsPrivatePrperty"),
            icon: "warning",
            allowOutsideClick: true,
            showCancelButton: false,
            customClass: { confirmButton: "Swal-confirm-buttons" },
          }).then((result) => { if (result.isConfirmed) router.push("/subscription-plan"); });
        } else setShowMap(true);
      }
    } else setShowMap(true);
  };

  useEffect(() => { return () => { setShowMap(false); setIsReported(false); }; }, [userCurrentId, propId]);
  useEffect(() => { if (getPropData) setInterested(getPropData.is_interested === 1); }, [getPropData]);
  useEffect(() => { setShowChat(userCurrentId !== getPropData?.added_by); }, [propId, showChat, userCurrentId, getPropData?.added_by]);

  const handleInterested = (e) => {
    e.preventDefault();
    if (userCurrentId) {
      intrestedPropertyApi(getPropData.id, "1", (response) => { setInterested(true); toast.success(response.message); }, (error) => console.log(error));
    } else {
      Swal.fire({
        title: translate("plzLogFirstIntrest"),
        icon: "warning",
        allowOutsideClick: false,
        showCancelButton: false,
        allowOutsideClick: true,
        customClass: { confirmButton: "Swal-confirm-buttons" },
        confirmButtonText: translate("ok"),
      }).then((result) => { if (result.isConfirmed) setShowModal(true); });
    }
  };

  const handleNotInterested = (e) => {
    e.preventDefault();
    intrestedPropertyApi(getPropData.id, "0", (response) => { setInterested(false); toast.success(response.message); }, (error) => console.log(error));
  };

  const handleChat = (e) => {
    e.preventDefault();
    if (SettingsData?.demo_mode === true) {
      Swal.fire({
        title: translate("opps"),
        text: translate("notAllowdDemo"),
        icon: "warning",
        showCancelButton: false,
        customClass: { confirmButton: "Swal-confirm-buttons" },
        confirmButtonText: translate("ok"),
      });
      return false;
    } else {
      if (userCurrentId) {
        if (userCompleteData) {
          setChatData((prevChatData) => {
            const newChatData = {
              property_id: getPropData.id,
              slug_id: getPropData.slug_id,
              title: getPropData.title,
              title_image: getPropData.title_image,
              user_id: getPropData.added_by,
              name: getPropData.customer_name,
              profile: getPropData.profile,
              is_blocked_by_me: getPropData?.is_blocked_by_me,
              is_blocked_by_user: getPropData?.is_blocked_by_user,
            };
            getChatData(newChatData);
            return newChatData;
          });
          router.push("/user/chat");
        } else {
          return Swal.fire({
            icon: "error",
            title: translate("opps"),
            text: translate("youHaveNotCompleteProfile"),
            allowOutsideClick: true,
            customClass: { confirmButton: "Swal-confirm-buttons" },
          }).then((result) => { if (result.isConfirmed) router.push("/user/profile"); });
        }
      } else {
        Swal.fire({
          title: translate("plzLogFirsttoAccess"),
          icon: "warning",
          allowOutsideClick: false,
          showCancelButton: false,
          allowOutsideClick: true,
          customClass: { confirmButton: "Swal-confirm-buttons" },
          confirmButtonText: translate("ok"),
        }).then((result) => { if (result.isConfirmed) setShowModal(true); });
        setShowChat(true);
      }
    }
  };

  const handleReportProperty = (e) => {
    e.preventDefault();
    if (userCurrentId) setIsReporteModal(true);
    else {
      Swal.fire({
        title: translate("plzLogFirsttoAccess"),
        icon: "warning",
        allowOutsideClick: false,
        showCancelButton: false,
        allowOutsideClick: true,
        customClass: { confirmButton: "Swal-confirm-buttons" },
        confirmButtonText: translate("ok"),
      }).then((result) => { if (result.isConfirmed) setShowModal(true); });
    }
  };

  const handleDownload = async (fileName) => {
    try {
      const fileUrl = `${fileName}`;
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handlecheckPremiumUserAgent = (e) => {
    e.preventDefault();
    router.push(`/agent-details/${getPropData?.customer_slug_id}`);
  };

  const checkPremiumProperty = () => {
    if (isPremiumProperty && !isPremiumUser) {
      Swal.fire({
        title: translate("opps"),
        text: translate("premiumPropertiesLimitOrPackageNotAvailable") || "You don't have access to premium properties",
        icon: "warning",
        allowOutsideClick: false,
        showCancelButton: false,
        customClass: { confirmButton: "Swal-confirm-buttons" },
      }).then((result) => { if (result.isConfirmed) router.push("/subscription-plan"); });
    }
  };

  useEffect(() => { checkPremiumProperty(); }, [isPremiumProperty, isPremiumUser]);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {getPropData ? (
            <div className={`${isPremiumProperty && !isPremiumUser ? 'blur-background-property-details' : ''}`}>
              <Layout>
                {/* Simple Breadcrumb with only title */}
                <Breadcrumb title={getPropData?.title} />

                {/* Main Content Section – design tokens, same font as home */}
                <section className="prop-detail-page">
                  <div className="prop-detail-container">
                    {/* Property Overview Card */}
                    <div className="prop-detail-hero-card">
                      <div className="prop-detail-hero-accent" />
                      <div className="prop-detail-hero-body">
                        <div className="prop-detail-hero-top">
                          <div className="prop-detail-hero-left">
                            {/* <div className="prop-detail-hero-icon">
                              <FiHome className="text-white text-2xl" />
                            </div> */}
                            <div>
                              <div className="prop-detail-badges">
                                <span className="prop-detail-badge prop-detail-badge-primary">
                                  {getPropData?.category?.category}
                                </span>
                                <span className={`prop-detail-badge ${
                                  getPropData?.property_type === "sell"
                                    ? "prop-detail-badge-sell"
                                    : "prop-detail-badge-rent"
                                }`}>
                                  {translate(getPropData?.property_type)}
                                </span>
                                {getPropData?.promoted && (
                                  <span className="prop-detail-badge prop-detail-badge-featured">
                                    <FiAward className="opacity-90" /> Featured
                                  </span>
                                )}
                              </div>
                              <h1 className="prop-detail-title">
                                {getPropData?.title}
                              </h1>
                            </div>
                          </div>
                          <div className="prop-detail-price-wrap">
                            <span className="prop-detail-price-label">Price</span>
                            <span className="prop-detail-price">
                              {formatNumberWithCommas(getPropData?.price)}
                            </span>
                            {getPropData?.property_type === "rent" && getPropData?.rentduration && (
                              <span className="prop-detail-price-suffix">/ {getPropData?.rentduration}</span>
                            )}
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="prop-detail-quick-stats">
                          <div className="prop-detail-stat">
                            <FiMapPin className="prop-detail-stat-icon" />
                            <div>
                              <span className="prop-detail-stat-label">Location</span>
                              <p className="prop-detail-stat-value truncate">{getPropData?.address}</p>
                            </div>
                          </div>
                          <div className="prop-detail-stat">
                            <FiCalendar className="prop-detail-stat-icon" />
                            <div>
                              <span className="prop-detail-stat-label">Posted</span>
                              <p className="prop-detail-stat-value">{getPropData?.post_created}</p>
                            </div>
                          </div>
                          <div className="prop-detail-stat">
                            <FiEye className="prop-detail-stat-icon" />
                            <div>
                              <span className="prop-detail-stat-label">Views</span>
                              <p className="prop-detail-stat-value">{getPropData?.views || 0}</p>
                            </div>
                          </div>
                          <div className="prop-detail-stat">
                            <FiHeart className="prop-detail-stat-icon" />
                            <div>
                              <span className="prop-detail-stat-label">Favorites</span>
                              <p className="prop-detail-stat-value">{getPropData?.favourite_count || 0}</p>
                            </div>
                          </div>
                        </div>

                        {/* Property Specs */}
                        <div className="prop-detail-specs">
                          {getPropData?.bedrooms && (
                            <div className="prop-detail-spec">
                              <div className="prop-detail-spec-icon prop-detail-spec-bed">
                                <FiBed />
                              </div>
                              <div>
                                <span className="prop-detail-spec-label">Bedrooms</span>
                                <p className="prop-detail-spec-value">{getPropData?.bedrooms}</p>
                              </div>
                            </div>
                          )}
                          {getPropData?.bathrooms && (
                            <div className="prop-detail-spec">
                              <div className="prop-detail-spec-icon prop-detail-spec-bath">
                                <FiBath />
                              </div>
                              <div>
                                <span className="prop-detail-spec-label">Bathrooms</span>
                                <p className="prop-detail-spec-value">{getPropData?.bathrooms}</p>
                              </div>
                            </div>
                          )}
                          {getPropData?.area && (
                            <div className="prop-detail-spec">
                              <div className="prop-detail-spec-icon prop-detail-spec-area">
                                <FiSquare />
                              </div>
                              <div>
                                <span className="prop-detail-spec-label">Area</span>
                                <p className="prop-detail-spec-value">{getPropData?.area}</p>
                              </div>
                            </div>
                          )}
                          {getPropData?.floor && (
                            <div className="prop-detail-spec">
                              <div className="prop-detail-spec-icon prop-detail-spec-floor">
                                <FiGrid />
                              </div>
                              <div>
                                <span className="prop-detail-spec-label">Floor</span>
                                <p className="prop-detail-spec-value">{getPropData?.floor}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="prop-detail-layout">
                      {/* Main Content */}
                      <div className="prop-detail-main">

                        {/* Gallery */}
                        <PropertyGallery
                          galleryPhotos={galleryPhotos}
                          titleImage={getPropData?.title_image}
                          onImageClick={openLightbox}
                          translate={translate}
                          placeholderImage={placeholderImage}
                          PlaceHolderImg={PlaceHolderImg}
                        />

                        <LightBox
                          photos={galleryPhotos}
                          viewerIsOpen={viewerIsOpen}
                          currentImage={currentImage}
                          onClose={setViewerIsOpen}
                          title_image={getPropData?.title_image}
                          setViewerIsOpen={setViewerIsOpen}
                          setCurrentImage={setCurrentImage}
                        />

                        {/* Description */}
                        {getPropData && getPropData.description && (
                          <div className="prop-detail-card">
                            <div className="prop-detail-card-header">
                              <span className="prop-detail-card-accent" />
                              <h3 className="prop-detail-card-title">{translate("aboutProp")}</h3>
                            </div>
                            <div className="prop-detail-card-body">
                              <p className={`prop-detail-desc-text ${!expanded ? "line-clamp-4" : ""}`}>
                                {getPropData.description}
                              </p>
                              {getPropData.description.split("\n").length > 3 || getPropData.description.length > 250 ? (
                                <button type="button" onClick={() => setExpanded(!expanded)} className="prop-detail-read-more">
                                  <span>{expanded ? "Show Less" : "Read More"}</span>
                                  {lang?.rtl === 1 ? <AiOutlineArrowLeft size={18} /> : <AiOutlineArrowRight size={18} />}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        )}

                        {/* Features & Amenities */}
                        {getPropData?.parameters?.length > 0 && getPropData.parameters.some(e => e.value && e.value !== "0") && (
                          <div className="prop-detail-card">
                            <div className="prop-detail-card-header">
                              <span className="prop-detail-card-accent" />
                              <h3 className="prop-detail-card-title">{translate("feature&Amenties")}</h3>
                            </div>
                            <div className="prop-detail-card-body">
                              <div className="prop-detail-features-grid">
                                {getPropData.parameters.map((elem, index) => elem.value && elem.value !== "0" && (
                                  <div key={index} className="prop-detail-feature-item">
                                    <div className="prop-detail-feature-icon">
                                      {themeEnabled ? (
                                        <ImageToSvg imageUrl={elem.image || PlaceHolderImg} className="w-5 h-5 prop-detail-accent-fill" />
                                      ) : (
                                        <Image loading="lazy" src={elem?.image} width={20} height={20} alt={elem.name} onError={placeholderImage} />
                                      )}
                                    </div>
                                    <div>
                                      <span className="prop-detail-feature-label">{elem.name}</span>
                                      <p className="prop-detail-feature-value">
                                        {typeof elem?.value === "string" && elem.value.startsWith("https://") ? (
                                          <a href={elem.value} target="_blank" rel="noopener noreferrer" className="prop-detail-link">Link</a>
                                        ) : (
                                          Array.isArray(elem?.value) ? elem.value.join(", ") : elem.value
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Nearby Facilities */}
                        {getPropData?.assign_facilities?.length > 0 && getPropData.assign_facilities.some(e => e.distance && e.distance !== 0) && (
                          <div className="prop-detail-card">
                            <div className="prop-detail-card-header">
                              <span className="prop-detail-card-accent" />
                              <h3 className="prop-detail-card-title">{translate("OTF")}</h3>
                            </div>
                            <div className="prop-detail-card-body">
                              <div className="prop-detail-nearby-grid">
                                {getPropData.assign_facilities.map((elem, index) => elem.distance && elem.distance !== 0 && (
                                  <div key={index} className="prop-detail-feature-item">
                                    <div className="prop-detail-feature-icon">
                                      {themeEnabled ? (
                                        <ImageToSvg imageUrl={elem?.image || PlaceHolderImg} className="w-5 h-5 prop-detail-accent-fill" />
                                      ) : (
                                        <Image loading="lazy" src={elem?.image || PlaceHolderImg} width={20} height={20} alt={elem.name} onError={placeholderImage} />
                                      )}
                                    </div>
                                    <div>
                                      <span className="prop-detail-feature-label">{elem.name}</span>
                                      <p className="prop-detail-feature-value">
                                        {elem.distance} {elem.distance > 1 ? translate(DistanceSymbol + "s") : translate(DistanceSymbol)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Location & Map */}
                        {getPropData && getPropData.latitude && getPropData.longitude && (
                          <div className="prop-detail-card">
                            <div className="prop-detail-card-header">
                              <span className="prop-detail-card-accent" />
                              <h3 className="prop-detail-card-title">{translate("location")}</h3>
                            </div>
                            <div className="prop-detail-card-body">
                              <div className="prop-detail-address-grid">
                                <div className="prop-detail-address-item">
                                  <span className="prop-detail-address-label">Address</span>
                                  <p className="prop-detail-address-value">{getPropData?.address}</p>
                                </div>
                                <div className="prop-detail-address-item">
                                  <span className="prop-detail-address-label">City</span>
                                  <p className="prop-detail-address-value">{getPropData?.city}</p>
                                </div>
                                <div className="prop-detail-address-item">
                                  <span className="prop-detail-address-label">State</span>
                                  <p className="prop-detail-address-value">{getPropData?.state}</p>
                                </div>
                                <div className="prop-detail-address-item">
                                  <span className="prop-detail-address-label">Country</span>
                                  <p className="prop-detail-address-value">{getPropData?.country}</p>
                                </div>
                              </div>
                              <div className="prop-detail-map-wrap">
                                {showMap ? (
                                  <Map latitude={getPropData.latitude} longitude={getPropData.longitude} />
                                ) : (
                                  <div className="prop-detail-map-placeholder">
                                    <div className="prop-detail-map-blur" />
                                    <button type="button" onClick={handleShowMap} className="prop-detail-map-btn">
                                      <FiMapPin size={20} />
                                      {translate("ViewMap")}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3D Virtual Tour */}
                        {imageURL && (
                          <div className="prop-detail-card">
                            <div className="prop-detail-card-header">
                              <span className="prop-detail-card-accent" />
                              <h3 className="prop-detail-card-title">{translate("vertualView")}</h3>
                            </div>
                            <div className="prop-detail-card-body">
                              <div className="prop-detail-panorama-wrap">
                                <div id="panorama" className="w-full h-full" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Video */}
                        {getPropData && getPropData.video_link && (
                          <div className="prop-detail-card">
                            <div className="prop-detail-card-header">
                              <span className="prop-detail-card-accent" />
                              <h3 className="prop-detail-card-title">{translate("video")}</h3>
                            </div>
                            <div className="prop-detail-card-body">
                              {!playing ? (
                                <div
                                  className="prop-detail-video-thumb"
                                  style={{ backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
                                  onClick={() => setPlaying(true)}
                                >
                                  <div className="prop-detail-video-overlay">
                                    <div className="prop-detail-video-play-btn">
                                      <PiPlayCircleThin size={50} />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="prop-detail-video-player">
                                  <ReactPlayer
                                    className="absolute top-0 left-0"
                                    width="100%"
                                    height="100%"
                                    url={getPropData.video_link}
                                    playing={playing}
                                    controls={true}
                                    onPlay={() => handleVideoReady(true)}
                                    onPause={() => { setManualPause(true); handlePause(); }}
                                    onEnded={() => setPlaying(false)}
                                    onProgress={handleSeek}
                                    onSeek={handleSeek}
                                    onSeekEnd={handleSeekEnd}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Documents */}
                        {getPropData && getPropData.documents?.length > 0 && (
                          <div className="prop-detail-card">
                            <div className="prop-detail-card-header">
                              <span className="prop-detail-card-accent" />
                              <h3 className="prop-detail-card-title">{translate("docs")}</h3>
                            </div>
                            <div className="prop-detail-card-body">
                              <div className="prop-detail-docs-grid">
                                {getPropData.documents.map((ele, index) => {
                                  const fileName = ele.file_name.split("/").pop();
                                  return (
                                    <div key={index} className="prop-detail-doc-card">
                                      <div className="prop-detail-doc-icon">
                                        <IoDocumentAttachOutline size={28} />
                                      </div>
                                      <p className="prop-detail-doc-name">{fileName}</p>
                                      <button
                                        type="button"
                                        onClick={() => handleDownload(ele.file)}
                                        className="prop-detail-doc-btn"
                                      >
                                        <BiDownload size={18} />
                                        {translate("download")}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Sidebar */}
                      <aside className="prop-detail-sidebar">
                        <div className="prop-detail-sidebar-card">
                          <OwnerDeatilsCard
                            getPropData={getPropData}
                            showChat={showChat}
                            userCurrentId={userCurrentId}
                            interested={interested}
                            isReported={isReported}
                            handleInterested={handleInterested}
                            isMessagingSupported={isMessagingSupported}
                            handleNotInterested={handleNotInterested}
                            notificationPermissionGranted={notificationPermissionGranted}
                            handleChat={handleChat}
                            handleReportProperty={handleReportProperty}
                            PlaceHolderImg={PlaceHolderImg}
                            handlecheckPremiumUserAgent={handlecheckPremiumUserAgent}
                            propertyPageUrl={propertyPageUrl}
                            platformLabel={platformLabel}
                          />
                        </div>

                        {getPropData.property_type === "sell" && (
                          <div className="prop-detail-sidebar-card">
                            <MortgageCalculator data={getPropData} />
                          </div>
                        )}
                      </aside>
                    </div>

                    {/* Similar Properties */}
                    {getSimilerData && (
                      <div className="prop-detail-similar">
                        <SimilerPropertySlider
                          data={getSimilerData}
                          isLoading={isLoading}
                          currentPropertyId={getPropData?.id}
                        />
                      </div>
                    )}

                    {isReporteModal && (
                      <ReportPropertyModal
                        show={handleReportProperty}
                        onHide={() => setIsReporteModal(false)}
                        propertyId={getPropData?.id}
                        setIsReported={setIsReported}
                      />
                    )}
                  </div>
                </section>

                {isMobile && isShare && <MobileBottomSheet isOpen={true} />}
              </Layout>
            </div>
          ) : (
            <Layout>
              <Breadcrumb />
              <div className="container mx-auto px-4 py-12">
                <NoData />
              </div>
            </Layout>
          )}
        </>
      )}

      {showModal && <LoginModal isOpen={showModal} onClose={handleCloseModal} />}
    </>
  );
};

export default withAuth(PropertyDetails);