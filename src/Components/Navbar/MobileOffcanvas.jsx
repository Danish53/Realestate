import React, { useState, useEffect } from 'react';
import { Offcanvas } from 'react-bootstrap';
import Link from 'next/link';
import Image from 'next/image';
import { RiArrowRightSLine, RiUserLine, RiUserSmileLine } from 'react-icons/ri';
import { FiPlusCircle } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { handlePackageCheck, truncate } from '@/utils/helper';
import { PackageTypes } from '@/utils/checkPackages/packageTypes';
import { FiMapPin } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import LocationModal from '../LocationSelector/LocationPopup';
import { BiMapPin } from 'react-icons/bi';
import { selectCurrentLocation } from '@/store/reducer/locationSlice';

const MobileOffcanvas = ({
  show,
  handleClose,
  settingData,
  signupData,
  translate,
  handleOpenModal,
  handleShowDashboard,
  handleLogout,
  handleLanguageChange,
  LanguageList,
  defaultlang,
  handleOpenAcModal,
  selectedLanguage,
  language,
  formattedLocationText,
  handleSelectLocation,
  handleCloseLocationPopup
}) => {
  const router = useRouter();
  const [expandedItem, setExpandedItem] = useState(null);
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  // Get current location from Redux
  const currentLocationFromRedux = useSelector(selectCurrentLocation);

  // Toggle expand/collapse with animation
  const toggleExpand = (item) => {
    if (expandedItem === item) {
      // First set a class for animation
      const submenu = document.querySelector(`.mobile-submenu[data-name="${item}"]`);
      if (submenu) {
        submenu.classList.add('collapsing');
        // After animation completes, reset the state
        setTimeout(() => {
          setExpandedItem(null);
        }, 300); // Match transition duration
      }
    } else {
      setExpandedItem(item);
    }
  };

  const MenuItem = ({ title, onClick, hasSubmenu = false, name }) => (
    <button
      className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors font-medium text-sm
        ${expandedItem === name ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500' : 'text-text hover:bg-gray-50 border-l-4 border-transparent'}
      `}
      onClick={onClick}
    >
      <span className="flex-1 truncate">{title}</span>
      {hasSubmenu && (
        <RiArrowRightSLine
          size={20}
          className={`text-gray-400 transition-transform duration-300 ${expandedItem === name ? 'rotate-90 text-primary-500' : ''}`}
        />
      )}
    </button>
  );

  const handlePropertyRoute = (routerPath) => {
    if (routerPath) {
      handleClose();
      router.push(routerPath);
    }
  };

  const handlePageRoute = (routerPath) => {
    if (routerPath) {
      handleClose();
      router.push(routerPath);
    } else {
      handleOpenAcModal();
    }
  };

  const PropertyPages = [
    { name: translate('allProperties'), route: '/properties/all-properties' },
    { name: translate('featuredProp'), route: '/featured-properties' },
    { name: translate('mostViewedProp'), route: '/most-viewed-properties' },
    { name: translate('nearbyCities'), route: '/properties-nearby-city' },
    { name: translate('mostFavProp'), route: '/most-favorite-properties' },
  ];

  const Pages = [
    { name: translate('subscriptionPlan'), route: '/subscription-plan' },
    { name: translate('articles'), route: '/articles' },
    { name: translate('faqs'), route: '/faqs' },
    { name: translate('areaConverter'), route: '' },
    { name: translate('terms&condition'), route: '/terms-and-condition' },
    { name: translate('privacyPolicy'), route: '/privacy-policy' },
  ];

  const handleToggleLocationPopup = () => {
    setShowLocationPopup(!showLocationPopup);
    
    // Toggle body scroll locking
    if (!showLocationPopup) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    handleClose();
  };

  // Handle mobile location popup close
  const handleMobileLocationClose = () => {
    setShowLocationPopup(false);
    document.body.classList.remove('no-scroll');
  };

  // Handle location selection in mobile view
  const handleMobileLocationSelect = (location) => {
    handleSelectLocation(location);
    setShowLocationPopup(false);
    document.body.classList.remove('no-scroll');
  };

  return (
    <>
      <Offcanvas show={show} onHide={handleClose} placement={language.rtl === 1 ? 'start' : 'end'} className="bg-white w-[85%] max-w-sm sm:w-80 shadow-2xl">
        <Offcanvas.Header closeButton className="border-b border-gray-100 py-4 px-6 flex justify-between items-center">
          <Offcanvas.Title>
            {settingData?.web_footer_logo && (
              <Link href="/">
                <Image
                  src={settingData.web_logo}
                  alt="logo"
                  width={150}
                  height={40}
                  className="h-8 w-auto object-contain"
                />
              </Link>
            )}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0 flex flex-col h-full overflow-y-auto">
          <div className="flex-1 pb-24">
            {/* Location Selector */}
            <MenuItem
              title={
                <span className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center shrink-0">
                    <FiMapPin size={16} />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{translate('location')}</span>
                    <span className="text-sm font-semibold truncate text-text">
                      {formattedLocationText ? formattedLocationText : translate('selectLocation')}
                    </span>
                  </div>
                </span>
              }
              onClick={handleToggleLocationPopup}
              hasSubmenu={false}
              name="selectLocation"
            />

            <MenuItem
              title={translate('home')}
              onClick={() => {
                router?.push('/');
                handleClose();
              }}
            />

            {/* Properties Section */}
            <MenuItem
              title={translate('properties')}
              onClick={() => toggleExpand('properties')}
              hasSubmenu
              name="properties"
            />
            <div
              className={`overflow-hidden transition-all duration-300 bg-gray-50 ${expandedItem === 'properties' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              data-name="properties"
            >
              <div className="py-2">
                {PropertyPages.map((property, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-12 py-3 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-colors flex items-center justify-between"
                    onClick={() => handlePropertyRoute(property?.route)}
                  >
                    <span>{property.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pages Section */}
            <MenuItem
              title={translate('pages')}
              onClick={() => toggleExpand('pages')}
              hasSubmenu
              name="pages"
            />
            <div
              className={`overflow-hidden transition-all duration-300 bg-gray-50 ${expandedItem === 'pages' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
              data-name="pages"
            >
              <div className="py-2">
                {Pages.map((page, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-12 py-3 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-colors flex items-center justify-between"
                    onClick={() => handlePageRoute(page?.route)}
                  >
                    <span>{page.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact and About */}
            <MenuItem
              title={translate('contactUs')}
              onClick={() => {
                router?.push('/contact-us');
                handleClose();
              }}
            />
            <MenuItem
              title={translate('aboutUs')}
              onClick={() => {
                router?.push('/about-us');
                handleClose();
              }}
            />

            {/* Language Section */}
            <MenuItem
              title={
                <span className="flex items-center gap-2">
                  <span className="text-gray-500 font-normal">Language:</span> {selectedLanguage || defaultlang}
                </span>
              }
              onClick={() => toggleExpand('language')}
              hasSubmenu
              name="language"
            />
            <div
              className={`overflow-hidden transition-all duration-300 bg-gray-50 ${expandedItem === 'language' ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}
              data-name="language"
            >
              <div className="py-2">
                {LanguageList &&
                  LanguageList.map((ele, index) => (
                    <button
                      key={index}
                      onClick={() => handleLanguageChange(ele.code)}
                      className="w-full text-left px-12 py-3 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-colors"
                    >
                      {ele.name}
                    </button>
                  ))}
              </div>
            </div>

            {/* User Section */}
            {signupData?.data?.data?.name || signupData?.data?.data?.email || signupData?.data?.data?.mobile ? (
              <>
                <MenuItem
                  title={
                    <span className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                        <RiUserSmileLine size={18} />
                      </div>
                      <span className="truncate">{signupData.data.data.name ? truncate(signupData.data.data.name, 15) : translate("welcmGuest")}</span>
                    </span>
                  }
                  onClick={() => toggleExpand('user')}
                  hasSubmenu
                  name="user"
                />
                <div
                  className={`overflow-hidden transition-all duration-300 bg-gray-50 ${expandedItem === 'user' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                  data-name="user"
                >
                  <div className="py-2">
                    <button className="w-full text-left px-12 py-3 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-colors" onClick={handleShowDashboard}>
                      {translate('dashboard')}
                    </button>
                    <button className="w-full text-left px-12 py-3 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors" onClick={handleLogout}>
                      {translate('logout')}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <MenuItem
                title={
                  <span className="flex items-center gap-2 text-primary-600 font-semibold">
                    <RiUserLine size={18} />
                    {translate('login&Register')}
                  </span>
                }
                onClick={handleOpenModal}
              />
            )}
          </div>

          {/* Add Property Button (Fixed at bottom) */}
          {settingData && (
            <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)]">
               <button 
                type="button" 
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl transition-all shadow-md shadow-primary-500/30 active:scale-95" 
                onClick={(e) => {
                  if (signupData?.data?.data?.name) {
                    handlePackageCheck(e, PackageTypes.PROPERTY_LIST, router);
                  } else {
                    handleClose();
                    handleOpenModal();
                  }
                }} 
                aria-label={translate('addProp')}
               >
                 <FiPlusCircle size={20} />
                 <span>{translate('addProp')}</span>
               </button>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Location Modal for Mobile */}
      <LocationModal
        show={showLocationPopup}
        onHide={handleMobileLocationClose}
        onSave={handleMobileLocationSelect}
      />
    </>
  );
};

export default MobileOffcanvas;
