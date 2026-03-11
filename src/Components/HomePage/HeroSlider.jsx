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
// import SliderComponent from '../HomeSlider/SliderComponent' // Update the import path
import SearchTab from '../SearchTab/SearchTab'
import SliderSkeleton from '../Skeleton/SliderSkeleton'
import SliderComponent from '../HomeSlider/SliderComponent'

const HeroSlider = ({isLoading, sliderData, Categorydata}) => {
    return (
        <>
            {isLoading ? (
                <SliderSkeleton />
            ) : (
                sliderData && sliderData?.length > 0 ? (
                    <section id="mainheroImage" className="hero-section">
                        <div className="hero-container">
                            <SliderComponent sliderData={sliderData} />
                        </div>
                        
                        <SearchTab getCategories={Categorydata} />
                    </section>
                ) : (
                    null
                )
            )}

            <style jsx>{`
                .hero-section {
                    position: relative;
                    width: 100%;
                    padding: 5px 0 0px 0;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                }

                .hero-container {
                    margin: 0 auto;
                }

                @media (max-width: 768px) {
                    .hero-section {
                        padding: 20px 0 10px 0;
                    }
                }
            `}</style>
        </>
    )
}

export default HeroSlider