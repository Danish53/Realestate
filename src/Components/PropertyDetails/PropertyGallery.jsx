import React from 'react';
import Image from 'next/image';
import { BsGrid3X3Gap } from 'react-icons/bs';

const PropertyGallery = ({ galleryPhotos, titleImage, onImageClick, translate, placeholderImage, PlaceHolderImg }) => {
    // Determine how many extra photos to show
    const extraPhotosCount = galleryPhotos ? galleryPhotos.length : 0;

    return (
        <div className="relative w-full rounded-2xl overflow-hidden shadow-sm group/gallery select-none h-[300px] sm:h-[400px] md:h-[500px] lg:h-[550px]">
            {extraPhotosCount === 0 ? (
                // Single Image Layout
                <div 
                    className="w-full h-full relative cursor-pointer group"
                    onClick={() => onImageClick(0)}
                >
                    <Image
                        onError={placeholderImage}
                        loading="lazy"
                        src={titleImage || PlaceHolderImg}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                        alt="Main Image"
                        width={1200}
                        height={800}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
            ) : extraPhotosCount === 1 ? (
                // Two Images Layout (50/50 Split)
                <div className="flex w-full h-full gap-2">
                    <div 
                        className="w-1/2 h-full relative cursor-pointer group overflow-hidden"
                        onClick={() => onImageClick(0)}
                    >
                        <Image
                            onError={placeholderImage}
                            loading="lazy"
                            src={titleImage || PlaceHolderImg}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                            alt="Main Image"
                            width={800}
                            height={800}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                    <div 
                        className="w-1/2 h-full relative cursor-pointer group overflow-hidden"
                        onClick={() => onImageClick(1)}
                    >
                        <Image
                            onError={placeholderImage}
                            loading="lazy"
                            src={galleryPhotos[0]?.image_url || PlaceHolderImg}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                            alt="Gallery Image 1"
                            width={800}
                            height={800}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                </div>
            ) : (
                // Three or more Images Layout (1 Large, Grid on right)
                <div className="flex w-full h-full gap-2">
                    <div 
                        className="w-full md:w-2/3 h-full relative cursor-pointer group overflow-hidden"
                        onClick={() => onImageClick(0)}
                    >
                        <Image
                            onError={placeholderImage}
                            loading="lazy"
                            src={titleImage || PlaceHolderImg}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                            alt="Main Image"
                            width={1200}
                            height={800}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                    <div className="hidden md:flex w-1/3 h-full flex-col gap-2">
                        <div 
                            className="h-1/2 w-full relative cursor-pointer group overflow-hidden"
                            onClick={() => onImageClick(1)}
                        >
                            <Image
                                onError={placeholderImage}
                                loading="lazy"
                                src={galleryPhotos[0]?.image_url || PlaceHolderImg}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                                alt="Gallery Image 1"
                                width={600}
                                height={400}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        </div>
                        <div 
                            className="h-1/2 w-full relative cursor-pointer group overflow-hidden"
                            onClick={() => onImageClick(2)}
                        >
                            <Image
                                onError={placeholderImage}
                                loading="lazy"
                                src={galleryPhotos[1]?.image_url || PlaceHolderImg}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                                alt="Gallery Image 2"
                                width={600}
                                height={400}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        </div>
                    </div>
                </div>
            )}

            {/* See All Photos Button */}
            {extraPhotosCount > 0 && (
                <button 
                    onClick={() => onImageClick(0)}
                    className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-white/95 backdrop-blur-sm text-gray-900 border border-black/10 px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:bg-gray-50 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                    <BsGrid3X3Gap className="w-4 h-4" />
                    <span>{translate("seeAllPhotos")}</span>
                </button>
            )}
        </div>
    );
};

export default PropertyGallery;
