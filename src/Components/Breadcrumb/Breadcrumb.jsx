// "use client";
// import React, { useEffect, useState } from "react";
// import ViewPageImg from "@/assets/Images/Breadcrumbs.jpg";

// import { CiLocationOn } from "react-icons/ci";
// import { BiTime } from "react-icons/bi";
// import { useSelector } from "react-redux";
// import { settingsData } from "@/store/reducer/settingsSlice";
// import { toast } from "react-hot-toast";
// import { AddFavourite } from "@/store/actions/campaign";
// import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
// import { Tooltip, Dropdown, Menu } from "antd";
// import { useRouter } from "next/router";
// import { RxShare2 } from "react-icons/rx";
// import { CiLink } from "react-icons/ci";

// import {
//   FacebookShareButton,
//   TwitterShareButton,
//   WhatsappShareButton,
//   FacebookIcon,
//   WhatsappIcon,
//   XIcon,
// } from "react-share";
// import { formatNumberWithCommas, translate } from "@/utils/helper";
// import Swal from "sweetalert2";
// import LoginModal from "../LoginModal/LoginModal";

// const Breadcrumb = (props) => {
//   const router = useRouter();
//   let { data, title } = props;
//   const priceSymbol = useSelector(settingsData);
//   const CompanyName = priceSymbol && priceSymbol.company_name;
//   const isLoggedIn = useSelector((state) => state.User_signup);
//   const userCurrentId =
//     isLoggedIn && isLoggedIn.data ? isLoggedIn.data.data.id : null;
//   const [isLiked, setIsLiked] = useState(props.data && props.data.is_favourite);

//   // Initialize isDisliked as false
//   const [isDisliked, setIsDisliked] = useState(false);

//   const [showModal, setShowModal] = useState(false);
//   const handleCloseModal = () => {
//     setShowModal(false);
//   };

//   const handleLike = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (userCurrentId) {
//       AddFavourite(
//         props.data.propId,
//         "1",
//         (response) => {
//           setIsLiked(true);
//           setIsDisliked(false);
//           toast.success(response.message);
//         },
//         (error) => {
//           console.log(error);
//         }
//       );
//     } else {
//       Swal.fire({
//         title: translate("plzLogFirst"),
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

//   const handleDislike = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     AddFavourite(
//       props.data.propId,
//       "0",
//       (response) => {
//         setIsLiked(false);
//         setIsDisliked(true);
//         toast.success(response.message);
//       },
//       (error) => {
//         console.log(error);
//       }
//     );
//   };

//   const slug = router?.query.slug;

//   const currentUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/properties-details/${slug}?share=true`;

//   const handleCopyUrl = async (e) => {
//     e.preventDefault();

//     // Get the current URL from the router

//     try {
//       // Use the Clipboard API to copy the URL to the clipboard
//       await navigator.clipboard.writeText(currentUrl);
//       toast.success(translate("copuyclipboard"));
//     } catch (error) {
//       console.error("Error copying to clipboard:", error);
//     }
//   };

//   useEffect(() => {
//     // Update the state based on props.data.is_favourite  when the component mounts
//     setIsLiked(props.data && props.data.is_favourite === 1);
//     setIsDisliked(false);
//   }, [props.data && props.data.is_favourite]);

//   const shareMenu = (
//     <Menu>
//       <Menu.Item key="1">
//         <FacebookShareButton
//           url={currentUrl}
//           title={data?.title + CompanyName}
//           hashtag={CompanyName}
//         >
//           <FacebookIcon size={30} round /> {""} {translate("Facebook")}
//         </FacebookShareButton>
//       </Menu.Item>
//       <Menu.Item key="2">
//         <TwitterShareButton url={currentUrl}>
//           <XIcon size={30} round /> {""} {translate("Twitter")}
//         </TwitterShareButton>
//       </Menu.Item>
//       <Menu.Item key="3">
//         <WhatsappShareButton
//           url={currentUrl}
//           title={data?.title + "" + " - " + "" + CompanyName}
//           hashtag={CompanyName}
//         >
//           <WhatsappIcon size={30} round /> {""} {translate("Whatsapp")}
//         </WhatsappShareButton>
//       </Menu.Item>
//       <Menu.Item key="4">
//         <span onClick={handleCopyUrl}>
//           <CiLink size={30} /> {""} {translate("Copy Link")}
//         </span>
//       </Menu.Item>
//     </Menu>
//   );

//   return (
//     <div
//       id="breadcrumb"
//       style={{
//         backgroundImage: `url(${ViewPageImg.src})`,
//       }}
//     >
//       {!props.data ? (
//         <div className="container" id="breadcrumb-headline">
//           <h3 className="headline">{props.title}</h3>
//         </div>
//       ) : (
//         <>
//           <div id="breadcrumb-content" className="container">
//             <div className="row" id="breadcrumb_row">
//               <div className="col-12 col-md-6 col-lg-6">
//                 <div className="left-side-content">
//                   <span className="prop-types">{data.type}</span>
//                   <span className="prop-name">{data.title}</span>
//                   <span className="prop-Location">
//                     <CiLocationOn size={25} /> {data.loc}
//                   </span>
//                   <div className="prop-sell-time">
//                     <span>
//                       {/* {data?.promoted ? <span className="feature_tag">{translate("featured")}</span> : null} */}
//                     </span>
//                     <span
//                       className={`${
//                         data.propertyType === "sell"
//                           ? "propertie-sell-tag"
//                           : "propertie-rent-tag"
//                       }`}
//                     >
//                       {translate(data.propertyType)}
//                     </span>
//                     <span>
//                       {" "}
//                       <BiTime size={20} /> {data.time}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//               <div className="col-12 col-md-6 col-lg-6">
//                 <div className="right-side-content">
//                   <span>
//                     {" "}
//                     {formatNumberWithCommas(data.price)}{" "}
//                     {/* {data.propertyType === "rent" && data.rentduration ? `/ ${data.rentduration}` : ""} */}
//                   </span>

//                   <div className="rightside_buttons">
//                     {!data.isUser && (
//                       <div>
//                         {isLiked ? (
//                           <button onClick={handleDislike}>
//                             <AiFillHeart size={25} className="liked_property" />
//                           </button>
//                         ) : isDisliked ? (
//                           <button onClick={handleLike}>
//                             <AiOutlineHeart
//                               size={25}
//                               className="disliked_property"
//                             />
//                           </button>
//                         ) : (
//                           <button onClick={handleLike}>
//                             <AiOutlineHeart size={25} />
//                           </button>
//                         )}
//                       </div>
//                     )}

//                     {
//                       props?.data?.propertyStatus === 1 && (
//                         <Dropdown
//                           overlay={shareMenu}
//                           placement="bottomLeft"
//                           arrow
//                           trigger={["click"]}
//                         >
//                           <button>
//                             <RxShare2 size={25} className="disliked_property" />
//                           </button>
//                         </Dropdown>
//                       )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {showModal && (
//         <LoginModal isOpen={showModal} onClose={handleCloseModal} />
//       )}
//     </div>
//   );
// };

// export default Breadcrumb;




"use client";
import React, { useEffect, useState } from "react";
import ViewPageImg from "@/assets/Images/dashboard_img.jpg";

import { CiLocationOn } from "react-icons/ci";
import { BiTime } from "react-icons/bi";
import { useSelector } from "react-redux";
import { settingsData } from "@/store/reducer/settingsSlice";
import { toast } from "react-hot-toast";
import { AddFavourite } from "@/store/actions/campaign";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { Tooltip, Dropdown, Menu } from "antd";
import { useRouter } from "next/router";
import { RxShare2 } from "react-icons/rx";
import { CiLink } from "react-icons/ci";

import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  WhatsappIcon,
  XIcon,
} from "react-share";
import { formatNumberWithCommas, translate } from "@/utils/helper";
import Swal from "sweetalert2";
import LoginModal from "../LoginModal/LoginModal";

const Breadcrumb = (props) => {
  const router = useRouter();
  let { data, title } = props;
  const priceSymbol = useSelector(settingsData);
  const CompanyName = priceSymbol && priceSymbol.company_name;
  const isLoggedIn = useSelector((state) => state.User_signup);
  const userCurrentId =
    isLoggedIn && isLoggedIn.data ? isLoggedIn.data.data.id : null;
  const [isLiked, setIsLiked] = useState(props.data && props.data.is_favourite);

  // Initialize isDisliked as false
  const [isDisliked, setIsDisliked] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (userCurrentId) {
      AddFavourite(
        props.data.propId,
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
        allowOutsideClick: true,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
          cancelButton: "Swal-cancel-buttons",
        },
        confirmButtonText: translate("ok"),
      }).then((result) => {
        if (result.isConfirmed) {
          setShowModal(true);
        }
      });
    }
  };

  const handleDislike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    AddFavourite(
      props.data.propId,
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

  const slug = router?.query.slug;

  const currentUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/properties-details/${slug}?share=true`;

  const handleCopyUrl = async (e) => {
    e.preventDefault();

    // Get the current URL from the router

    try {
      // Use the Clipboard API to copy the URL to the clipboard
      await navigator.clipboard.writeText(currentUrl);
      toast.success(translate("copuyclipboard"));
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  useEffect(() => {
    // Update the state based on props.data.is_favourite  when the component mounts
    setIsLiked(props.data && props.data.is_favourite === 1);
    setIsDisliked(false);
  }, [props.data && props.data.is_favourite]);

  const shareMenu = (
    <Menu className="share-menu-dropdown">
      <Menu.Item key="1" className="share-menu-item">
        <FacebookShareButton
          url={currentUrl}
          title={data?.title + CompanyName}
          hashtag={CompanyName}
          className="flex items-center gap-3 w-full"
        >
          <FacebookIcon size={28} round /> 
          <span className="text-sm font-medium">{translate("Facebook")}</span>
        </FacebookShareButton>
      </Menu.Item>
      <Menu.Item key="2" className="share-menu-item">
        <TwitterShareButton url={currentUrl} className="flex items-center gap-3 w-full">
          <XIcon size={28} round /> 
          <span className="text-sm font-medium">{translate("Twitter")}</span>
        </TwitterShareButton>
      </Menu.Item>
      <Menu.Item key="3" className="share-menu-item">
        <WhatsappShareButton
          url={currentUrl}
          title={data?.title + "" + " - " + "" + CompanyName}
          hashtag={CompanyName}
          className="flex items-center gap-3 w-full"
        >
          <WhatsappIcon size={28} round /> 
          <span className="text-sm font-medium">{translate("Whatsapp")}</span>
        </WhatsappShareButton>
      </Menu.Item>
      <Menu.Item key="4" className="share-menu-item">
        <span onClick={handleCopyUrl} className="flex items-center gap-3 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
            <CiLink size={18} className="text-gray-600" />
          </div>
          <span className="text-sm font-medium">{translate("Copy Link")}</span>
        </span>
      </Menu.Item>
    </Menu>
  );

  // Primary color
  const primaryColor = "#F1592A";

  return (
    <>
      <div 
        className="relative bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{
          backgroundImage: `url(${ViewPageImg.src})`,
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/60"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
        
        {!props.data ? (
          <div className="relative z-10 container mx-auto px-4 py-20 lg:py-28">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                {props.title}
              </h1>
              <div className="flex items-center justify-center gap-2 text-gray-300">
                <span className="hover:text-white transition-colors cursor-pointer" onClick={() => router.push('/')}>Home</span>
                <span className="text-primary-500">/</span>
                <span className="text-white">{props.title}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 container mx-auto px-4 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
              {/* Left Side - Property Info */}
              <div className="space-y-4">
                {/* Type Badge */}
                <div className="flex items-center gap-3">
                  <span className="inline-block px-4 py-1.5 bg-primary-500 text-white text-sm font-semibold rounded-full shadow-lg">
                    {data.type}
                  </span>
                  <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg ${
                    data.propertyType === "sell" 
                      ? "bg-green-500 text-white" 
                      : "bg-blue-500 text-white"
                  }`}>
                    {translate(data.propertyType)}
                  </span>
                </div>

                {/* Property Title */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                  {data.title}
                </h1>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-200">
                  <CiLocationOn size={22} className="text-primary-500" />
                  <span className="text-base">{data.loc}</span>
                </div>

                {/* Time & Featured */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <BiTime size={20} className="text-primary-500" />
                    <span className="text-sm">{data.time}</span>
                  </div>
                  {data?.promoted && (
                    <span className="inline-flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      ⭐ {translate("featured")}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Side - Price & Actions */}
              <div className="lg:text-right space-y-4">
                {/* Price */}
                <div className="inline-block lg:block">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">
                    <span className="text-sm text-gray-300 block mb-1">{translate("price")}</span>
                    <span className="text-3xl md:text-4xl font-bold text-white">
                      {formatNumberWithCommas(data.price)}
                    </span>
                    {data.propertyType === "rent" && data.rentduration && (
                      <span className="text-gray-300 text-base ml-2">/ {data.rentduration}</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {!data.isUser && (
                  <div className="flex items-center justify-end gap-3">
                    {/* Like Button */}
                    <button
                      onClick={isLiked ? handleDislike : handleLike}
                      className="group relative w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:bg-white hover:scale-110 transition-all duration-300"
                    >
                      {isLiked ? (
                        <AiFillHeart size={22} className="text-red-500" />
                      ) : (
                        <AiOutlineHeart size={22} className="text-white group-hover:text-primary-500" />
                      )}
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {isLiked ? translate("removeFromFav") : translate("addToFav")}
                      </span>
                    </button>

                    {/* Share Button */}
                    {props?.data?.propertyStatus === 1 && (
                      <Dropdown 
                        overlay={shareMenu} 
                        placement="bottomRight" 
                        arrow 
                        trigger={["click"]}
                      >
                        <button className="group relative w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:bg-white hover:scale-110 transition-all duration-300">
                          <RxShare2 size={22} className="text-white group-hover:text-primary-500" />
                          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {translate("share")}
                          </span>
                        </button>
                      </Dropdown>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <LoginModal isOpen={showModal} onClose={handleCloseModal} />
        )}
      </div>

      {/* Add custom styles for dropdown */}
      <style jsx global>{`
        .share-menu-dropdown {
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(10px) !important;
          border-radius: 16px !important;
          padding: 8px !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          min-width: 200px !important;
        }
        
        .share-menu-item {
          padding: 8px 12px !important;
          border-radius: 12px !important;
          transition: all 0.2s !important;
        }
        
        .share-menu-item:hover {
          background-color: ${primaryColor}10 !important;
        }
        
        .share-menu-item .ant-menu-title-content {
          width: 100% !important;
        }
        
        .share-menu-item button,
        .share-menu-item span {
          width: 100% !important;
          color: #1f2937 !important;
        }
      `}</style>
    </>
  );
};

export default Breadcrumb;