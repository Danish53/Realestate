"use client";
import React, { useState, useEffect, useRef } from "react";
import ebroker from "@/assets/Logo_Color.png";
import { RiArrowDownSLine, RiUserLine, RiUserSmileLine } from "react-icons/ri";
import { Dropdown } from "react-bootstrap";
import Link from "next/link";
import { FiChevronRight, FiPhone, FiPlusCircle } from "react-icons/fi";
import LoginModal from "../LoginModal/LoginModal";
import AreaConverter from "../AreaConverter/AreaConverter";
import { GiHamburgerMenu } from "react-icons/gi";
import { useSelector, useDispatch } from "react-redux";
import { logoutSuccess, userSignUpData } from "@/store/reducer/authSlice";
import { selectCurrentLocation, setLocation } from "@/store/reducer/locationSlice";

import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "react-hot-toast";
import { Fcmtoken, settingsData } from "@/store/reducer/settingsSlice";
import { languageLoaded, setLanguage } from "@/store/reducer/languageSlice";
import {
  handlePackageCheck,
  placeholderImage,
  translate,
  truncate,
} from "@/utils/helper";
import { store } from "@/store/store";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import Image from "next/image";
import FirebaseData from "@/utils/Firebase";
import { beforeLogoutApi, GetLimitsApi } from "@/store/actions/campaign";
import MobileOffcanvas from "./MobileOffcanvas";
import { PackageTypes } from "@/utils/checkPackages/packageTypes";
import { HiOutlineMail } from "react-icons/hi";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { FaX } from "react-icons/fa6";
// import LocationPopup from "../LocationSelector/LocationPopup";
import { BiMapPin } from "react-icons/bi";
import LocationModal from "../LocationSelector/LocationPopup";


const Nav = () => {
  const router = useRouter();
  const language = store.getState().Language.languages;
  const dispatch = useDispatch();

  const { signOut } = FirebaseData();
  const signupData = useSelector(userSignUpData);
  const settingData = store.getState().Settings?.data;
  const FcmToken = useSelector(Fcmtoken);

  // Use useSelector to directly access the current location from Redux
  const currentLocationFromRedux = useSelector(selectCurrentLocation);

  const LanguageList = settingData && settingData.languages;
  const systemDefaultLanguageCode = settingData?.default_language;
  const [showModal, setShowModal] = useState(false);
  const [areaconverterModal, setAreaConverterModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState();
  const [defaultlang, setDefaultlang] = useState(language.name);
  const [show, setShow] = useState(false);
  const [headerTop, setHeaderTop] = useState(0);
  const [scroll, setScroll] = useState(0);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("");
  const [formattedLocationText, setFormattedLocationText] = useState('');

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    if (language && language.rtl === 1) {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  }, [language]);


  useEffect(() => {
    const header = document.querySelector(".header");
    setHeaderTop(header?.offsetTop);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!language || Object.keys(language).length === 0) {
      languageLoaded(
        systemDefaultLanguageCode,
        "1",
        (response) => {
          const currentLang = response && response.data.name;

          // Dispatch the setLanguage action to update the selected language in Redux
          store.dispatch(setLanguage(currentLang));
          setSelectedLanguage(currentLang);
          setDefaultlang(currentLang);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }, [language]);
  const handleLanguageChange = (languageCode) => {
    languageLoaded(
      languageCode,
      "1",
      (response) => {
        const currentLang = response && response.data.name;
        setSelectedLanguage(currentLang);

        // Dispatch the setLanguage action to update the selected language in Redux
        store.dispatch(setLanguage(currentLang));
      },
      (error) => {
        toast.error(error);
        console.log(error);
      }
    );
  };
  useEffect(() => { }, [selectedLanguage, language, defaultlang]);

  const handleScroll = () => {
    setScroll(window.scrollY);
  };

  const handleOpenModal = () => {
    setShow(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleOpenAcModal = () => {
    setShow(false);
    setAreaConverterModal(true);
  };
  const handleCloseAcModal = () => {
    setAreaConverterModal(false);
  };

  const handleShowDashboard = () => {
    router.push("/user/dashboard"); // Use an absolute path here
  };

  const handleLogout = () => {
    handleClose();
    Swal.fire({
      title: translate("areYouSure"),
      text: translate("youNotAbelToRevertThis"),
      icon: "warning",
      showCancelButton: true,
      customClass: {
        confirmButton: "Swal-confirm-buttons",
        cancelButton: "Swal-cancel-buttons",
      },
      confirmButtonText: translate("yesLogout"),
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          beforeLogoutApi({
            fcm_id: FcmToken,
            onSuccess: (res) => {
              // Perform the logout action
              logoutSuccess();
              signOut();

              toast.success(translate("logoutSuccess"));
            },
            onError: (err) => {
              console.log(err);
            },
          });
        } catch (error) {
          console.log(error);
        }
      } else {
        toast.error(translate("logoutcancel"));
      }
    });
  };

  const CheckActiveUserAccount = () => {
    if (settingData?.is_active === false) {
      Swal.fire({
        title: translate("opps"),
        text: "Your account has been deactivated by the admin. Please contact them.",
        icon: "warning",
        allowOutsideClick: false,
        showCancelButton: false,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
          cancelButton: "Swal-cancel-buttons",
        },
        confirmButtonText: translate("logout"),
      }).then((result) => {
        if (result.isConfirmed) {
          logoutSuccess();
          signOut();
          router.push("/contact-us");
        }
      });
    }
  };
  useEffect(() => {
    CheckActiveUserAccount();
  }, [settingData?.is_active]);

  const handleToggleLocationPopup = () => {
    setShowLocationPopup(!showLocationPopup);
    // Toggle body scroll locking
    if (!showLocationPopup) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  };

  const handleCloseLocationPopup = () => {
    setShowLocationPopup(false);
    document.body.classList.remove('no-scroll');
  };

  useEffect(() => {
    if (currentLocationFromRedux) {
      setCurrentLocation(currentLocationFromRedux.formatted_address || '');
    } else {
      setCurrentLocation('');
    }
  }, [currentLocationFromRedux]);

  const handleSelectLocation = (location) => {
    // No need to set local state as it will be updated by the useEffect above
    dispatch(setLocation(location));
  };

  // Format the location display to show city, state, country
  useEffect(() => {
    if (currentLocationFromRedux) {
      let locationParts = [];

      // Add city if available
      if (currentLocationFromRedux.city) {
        locationParts.push(currentLocationFromRedux.city);
      }

      // Add state if available
      if (currentLocationFromRedux.state) {
        locationParts.push(currentLocationFromRedux.state);
      }

      // Add country if available
      if (currentLocationFromRedux.country) {
        locationParts.push(currentLocationFromRedux.country);
      }

      // If we have location parts, join them with commas
      if (locationParts.length > 0) {
        setFormattedLocationText(locationParts.join(', '));
      } else if (currentLocationFromRedux.formatted_address) {
        // Fallback to formatted address if no parts available
        setFormattedLocationText(currentLocationFromRedux.formatted_address);
      } else {
        setFormattedLocationText('');
      }
    } else {
      setFormattedLocationText('');
    }
  }, [currentLocationFromRedux]); // Only depend on currentLocation from Redux

  return (
    <>
      <div className={`${scroll > headerTop ? "fixed top-0 w-full shadow-md z-50 animate-fadeInDown" : "relative z-50"} transition-all duration-300`}>
        {/* Top bar (Matching Vulpo Design) */}
        <div className="hidden lg:block bg-secondary text-white/90 py-2.5 text-[13.5px] font-medium border-b border-white/5 relative">
          <div className="mx-auto px-4 lg:px-0 flex justify-between items-center">

            {/* Socials & Language (Left side) */}
            <div className="flex items-center space-x-4">
              <Dropdown className="inline-block relative">
                <Dropdown.Toggle as="button" className="flex items-center gap-1 text-white transition-colors bg-transparent border-none p-0 focus:outline-none">
                  {selectedLanguage ? selectedLanguage : defaultlang}
                </Dropdown.Toggle>
                <Dropdown.Menu className="absolute left-0 mt-2 w-40 bg-white shadow-card rounded-lg py-2 z-50 border-none text-text">
                  {LanguageList && LanguageList.map((ele, index) => (
                    <Dropdown.Item key={index} onClick={() => handleLanguageChange(ele.code)} className="px-4 py-2 hover:bg-primary-50 hover:text-primary-600 transition-colors cursor-pointer text-sm">
                      {ele.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>

            {/* Centered Message */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center pointer-events-none">
              <span className="bg-white/10 px-2 py-0.5 rounded-full text-[11px] font-bold mr-3 border border-white/20 text-white">New</span>
              <span className="text-white">Simplify your property search with our platform <FiChevronRight className="inline ml-1" /></span>
            </div>

            {/* Contacts (Right side) */}
            <div className="flex items-center space-x-6 z-10 relative">
              {settingData?.company_email && (
                <a href={`mailto:${settingData?.company_email}`} className="flex items-center gap-1.5 hover:text-white transition-colors" target="_blank" rel="noreferrer">
                  <HiOutlineMail size={15} />
                  <span>{settingData?.company_email}</span>
                </a>
              )}
              {settingData?.company_tel1 && (
                <a href={`tel:${settingData?.company_tel1}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <FiPhone size={13} />
                  <span>{settingData?.company_tel1}</span>
                </a>
              )}
            </div>

          </div>
        </div>

        {/* Main Header (Matching Vulpo Design) */}
        <header className="bg-white shadow-sm transition-all duration-300 relative z-40">
          <div className=" mx-auto px-4 lg:px-0 py-0 lg:py-0">
            <div className="flex items-center h-[5rem] lg:h-[5rem]">

              {/* Logo and Mobile controls */}
              <div className="flex items-center justify-between w-full lg:w-auto h-full">
                <Link href="/" className="flex-shrink-0 flex items-center h-full">
                  <Image
                    loading="lazy"
                    src={settingData?.web_logo ? settingData?.web_logo : ebroker}
                    alt="Logo"
                    width={150}
                    height={48}
                    className="h-10 lg:h-16 w-auto object-contain"
                    onError={placeholderImage}
                  />
                </Link>

                <div className="flex items-center gap-3 lg:hidden">
                  <button type="button" onClick={handleToggleLocationPopup} className="p-2 text-secondary hover:text-primary-500 rounded-full hover:bg-gray-50 transition-colors bg-transparent border border-gray-200">
                    <BiMapPin size={22} />
                  </button>
                  <button type="button" onClick={handleShow} className="p-2 text-secondary hover:text-primary-500 rounded-lg hover:bg-gray-50 transition-colors bg-transparent border border-gray-200">
                    <GiHamburgerMenu size={24} />
                  </button>
                </div>
              </div>

              {/* Desktop Navigation & Auth */}
              <div className="hidden lg:flex items-center flex-1 justify-between pl-8 xl:pl-12 h-full">

                {/* Nav Links (Left aligned, tightly spaced) */}
                <nav className="flex items-center space-x-2 xl:space-x-4 h-full">

                  <Link href="/" className="px-2 py-2 text-[15px] text-secondary font-bold hover:text-primary-500 transition-colors">
                    {translate("home")}
                  </Link>

                  <Dropdown className="h-full flex items-center">
                    <Dropdown.Toggle as="button" className="px-2 py-2 text-[15px] text-secondary font-bold hover:text-primary-500 transition-colors flex items-center gap-1 bg-transparent border-none focus:ring-0 after:hidden">
                      {translate("properties")} <RiArrowDownSLine size={20} className="text-secondary opacity-80" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="absolute top-full left-0 mt-0 w-56 bg-white shadow-card rounded-xl py-2 z-50 border border-gray-100">
                      <Dropdown.Item as={Link} href="/properties/all-properties/" className="px-5 py-3.5 hover:bg-primary-50 hover:text-primary-600 transition-colors block text-sm font-semibold text-text">{translate("allProperties")}</Dropdown.Item>
                      <Dropdown.Item as={Link} href="/featured-properties" className="px-5 py-3.5 mt-2 hover:bg-primary-50 hover:text-primary-600 transition-colors block text-sm font-semibold text-text">{translate("featuredProp")}</Dropdown.Item>
                      <Dropdown.Item as={Link} href="/most-viewed-properties" className="px-5 py-3.5 mt-2 hover:bg-primary-50 hover:text-primary-600 transition-colors block text-sm font-semibold text-text">{translate("mostViewedProp")}</Dropdown.Item>
                      <Dropdown.Item as={Link} href="/properties-nearby-city" className="px-5 py-3.5 mt-2 hover:bg-primary-50 hover:text-primary-600 transition-colors block text-sm font-semibold text-text">{translate("nearbyCities")}</Dropdown.Item>
                      <Dropdown.Item as={Link} href="/most-favorite-properties" className="px-5 py-3.5 mt-2 hover:bg-primary-50 hover:text-primary-600 transition-colors block text-sm font-semibold text-text">{translate("mostFavProp")}</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                  <Dropdown className="h-full flex items-center">
                    <Dropdown.Toggle as="button" className="px-2 py-2 text-[15px] text-secondary font-bold hover:text-primary-500 transition-colors flex items-center gap-1 bg-transparent border-none focus:ring-0 after:hidden">
                      {translate("pages")} <RiArrowDownSLine size={20} className="text-secondary opacity-80" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="absolute top-full left-0 mt-0 w-48 bg-white shadow-card rounded-xl py-2 z-50 border border-gray-100">
                      <Dropdown.Item as={Link} href="/subscription-plan" className="px-5 py-2.5 hover:bg-primary-50 hover:text-primary-600 transition-colors block text-sm font-semibold text-text">{translate("subscriptionPlan")}</Dropdown.Item>
                      <Dropdown.Item as={Link} href="/articles" className="px-5 py-2.5 mt-2 hover:bg-primary-50 hover:text-primary-600 transition-colors block text-sm font-semibold text-text">{translate("articles")}</Dropdown.Item>
                      <Dropdown.Item as={Link} href="/faqs" className="px-5 py-2.5 mt-2 hover:bg-primary-50 hover:text-primary-600 transition-colors block text-sm font-semibold text-text">{translate("faqs")}</Dropdown.Item>
                      {/* <Dropdown.Item onClick={handleOpenAcModal} className="px-5 py-2.5 mt-2 hover:bg-primary-50 hover:text-primary-600 transition-colors block text-sm font-semibold text-text cursor-pointer">{translate("areaConverter")}</Dropdown.Item> */}
                      <Dropdown.Item as={Link} href="/terms-and-condition" className="px-5 py-2.5 mt-2 hover:bg-primary-50 hover:text-primary-600 transition-colors block text-sm font-semibold text-text">{translate("terms&condition")}</Dropdown.Item>
                      <Dropdown.Item as={Link} href="/privacy-policy" className="px-5 py-2.5 mt-2 hover:bg-primary-50 hover:text-primary-600 transition-colors block text-sm font-semibold text-text">{translate("privacyPolicy")}</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                  <Link href="/about-us" className="px-2 py-2 text-[15px] text-secondary font-bold hover:text-primary-500 transition-colors">
                    {translate("aboutUs")}
                  </Link>

                  <Link href="/contact-us" className="px-2 py-2 text-[15px] text-secondary font-bold hover:text-primary-500 transition-colors">
                    {translate("contactUs")}
                  </Link>
                </nav>

                {/* Auth and Add Property (Right Aligned) */}
                <div className="flex items-center space-x-6 h-full">

                  {/* Location - Placed here unobtrusively if needed, else we can skip if it breaks the look. Let's keep it as an icon for compactness. */}
                  <button type="button" onClick={handleToggleLocationPopup} title={formattedLocationText || translate("location")} className="text-secondary hover:text-primary-500 transition-colors">
                    <BiMapPin size={24} />
                  </button>

                  <div className="w-px h-6 bg-gray-200"></div>

                  {signupData?.data === null ? (
                    <button onClick={(e) => { e.preventDefault(); handleOpenModal(); }} className="text-[16px] text-secondary font-bold hover:text-primary-500 transition-colors tracking-wide">
                      {translate("login&Register")}
                    </button>
                  ) : signupData?.data?.data.name || signupData?.data?.data.email || signupData?.data?.data.mobile ? (
                    <Dropdown className="relative h-full flex items-center">
                      <Dropdown.Toggle as="button" className="flex items-center gap-2 text-secondary hover:text-primary-500 font-bold transition-colors bg-transparent focus:ring-0 after:hidden">
                        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 border border-primary-100">
                          <RiUserSmileLine size={20} />
                        </div>
                        <span className="text-[15px] hidden xl:block">
                          {signupData.data.data.name ? truncate(signupData.data.data.name, 12) : translate("welcmGuest")}
                        </span>
                        <RiArrowDownSLine size={18} className="opacity-80" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="absolute right-0 top-full mt-0 w-48 bg-white shadow-card rounded-xl py-2 z-50 border border-gray-100">
                        <Dropdown.Item onClick={handleShowDashboard} className="px-5 py-2.5 hover:bg-primary-50 hover:text-primary-600 transition-colors block text-[15px] font-semibold text-secondary cursor-pointer">{translate("dashboard")}</Dropdown.Item>
                        <Dropdown.Divider className="my-1 border-t border-gray-100" />
                        <Dropdown.Item onClick={handleLogout} className="px-5 py-2.5 hover:bg-red-50 hover:text-red-600 transition-colors block text-[15px] font-semibold text-red-500 cursor-pointer">{translate("logout")}</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  ) : null}

                  {/* {settingData && (
                    <button
                      type="button"
                      onClick={(e) => {
                        if (signupData?.data?.data.name) {
                          handlePackageCheck(e, PackageTypes.PROPERTY_LIST, router);
                        } else {
                          handleOpenModal();
                        }
                      }}
                      className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-3 rounded-full transition-all shadow-md active:scale-95"
                    >
                      <span className="text-[15px] tracking-wide">{translate("addProp")}</span>
                    </button>
                  )} */}
                </div>
              </div>
            </div>
          </div>
        </header>

        <LocationModal
          show={showLocationPopup}
          onHide={handleCloseLocationPopup}
          onSave={handleSelectLocation}
        />
      </div>

      <MobileOffcanvas
        show={show}
        handleClose={handleClose}
        settingData={settingData}
        signupData={signupData}
        translate={translate}
        handleOpenModal={handleOpenModal}
        handleShowDashboard={handleShowDashboard}
        handleLogout={handleLogout}
        handleLanguageChange={handleLanguageChange}
        LanguageList={LanguageList}
        defaultlang={defaultlang}
        handleOpenAcModal={handleOpenAcModal}
        selectedLanguage={selectedLanguage}
        language={language}
        formattedLocationText={formattedLocationText}
        handleSelectLocation={handleSelectLocation}
        handleCloseLocationPopup={handleCloseLocationPopup}
        currentLocationFromRedux={currentLocationFromRedux}
      />

      {showModal && <LoginModal isOpen={showModal} onClose={handleCloseModal} />}
      <AreaConverter isOpen={areaconverterModal} onClose={handleCloseAcModal} />
    </>
  );
};

export default Nav;
