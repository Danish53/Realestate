import React from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import PackageCard from "@/Components/Skeleton/PackageCard";
import SubscriptionCard from "@/Components/Cards/SubscriptionCard";
import NoData from "@/Components/NoDataFound/NoData";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const SubscriptionSwiper = ({
  loading,
  packagedata,
  language,
  subscribePayment,
  systemsettings,
  allFeatures
}) => {
  const sliderBreakpoints = {
    0: { slidesPerView: 1, spaceBetween: 16 },
    576: { slidesPerView: 2, spaceBetween: 20 },
    992: { slidesPerView: 3, spaceBetween: 24 },
  };

  return (
    <Swiper
      dir={language.rtl === 1 ? "rtl" : "ltr"}
      slidesPerView={3}
      spaceBetween={24}
      freeMode={false}
      centeredSlides={false}
      watchOverflow={true}
      pagination={{
        clickable: true,
      }}
      modules={[Pagination]}
      className="subscription-swiper"
      breakpoints={sliderBreakpoints}
    >
      {loading ? (
        <>
          {Array.from({ length: 6 }).map((_, index) => (
            <SwiperSlide key={index}>
              <div className="col-lg-3 col-md-6 col-12 main_box">
                <PackageCard />
              </div>
            </SwiperSlide>
          ))}
        </>
      ) : (
        <>
          {packagedata.length > 0 ? (
            packagedata.map((elem, index) => (
              <SwiperSlide key={index}>
                <SubscriptionCard
                  elem={elem}
                  subscribePayment={subscribePayment}
                  systemsettings={systemsettings}
                  allFeatures={allFeatures}
                />
              </SwiperSlide>
            ))
          ) : (
            <div className="noDataFoundDiv">
              <NoData />
            </div>
          )}
        </>
      )}
    </Swiper>
  );
};

export default SubscriptionSwiper; 