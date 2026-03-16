// "use client"
// import React from 'react'
// import SliderComponent from '../HomeSlider/SliderComponent'
// import SearchTab from '../SearchTab/SearchTab'
// import SliderSkeleton from '../Skeleton/SliderSkeleton'

// const HeroSlider = ({isLoading, sliderData, Categorydata}) => {
//     return (
//         <>
//             {isLoading ? (
//                 <SliderSkeleton />
//             ) : (
//                 sliderData && sliderData?.length > 0 ? (
//                     <section id="mainheroImage">
//                         <div>
//                             <SliderComponent sliderData={sliderData} />
//                         </div>
//                         {/* Sell Rent  */}

//                         <SearchTab getCategories={Categorydata} />
//                     </section>
//                 ) : (
//                     null
//                 )
//             )}
//         </>
//     )
// }

// export default HeroSlider



"use client"
import React from 'react'
import SearchTab from '../SearchTab/SearchTab'
import SliderSkeleton from '../Skeleton/SliderSkeleton'
import SliderComponent from '../HomeSlider/SliderComponent'

const HeroSlider = ({ isLoading, sliderData, Categorydata }) => {
  return (
    <>
      {isLoading ? (
        <SliderSkeleton />
      ) : (
        sliderData && sliderData?.length > 0 ? (
          <section id="mainheroImage" className="hero-section-attractive">
            <div className="hero-slider-wrap">
              <SliderComponent sliderData={sliderData} />
            </div>
            <div className="hero-search-wrap">
              <div className="hero-search-card">
                <SearchTab getCategories={Categorydata} />
              </div>
            </div>
          </section>
        ) : null
      )}
    </>
  )
}

export default HeroSlider