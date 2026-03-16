"use client"
import { BadgeSvg, placeholderImage, translate } from '@/utils/helper'
import Image from 'next/image'
import React from 'react'
import { CiLocationOn } from 'react-icons/ci'
import { FiMail, FiMessageSquare, FiPhoneCall, FiThumbsUp } from 'react-icons/fi'
import { MdReport } from 'react-icons/md'
import { RiMailSendLine, RiThumbUpFill } from 'react-icons/ri'

const OwnerDeatilsCard = (
    {
        getPropData,
        showChat,
        interested,
        isReported,
        handleInterested,
        isMessagingSupported,
        handleNotInterested,
        notificationPermissionGranted,
        handleChat,
        userCurrentId,
        handleReportProperty,
        PlaceHolderImg,
        handlecheckPremiumUserAgent
    }) => {
    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header / Profile Section */}
            <div className="p-6 border-b border-gray-100 flex flex-col items-center justify-center text-center relative">
                <div className="relative w-24 h-24 mb-4">
                    <Image
                        loading="lazy"
                        fill
                        src={getPropData && getPropData?.profile ? getPropData?.profile : PlaceHolderImg}
                        className="rounded-full object-cover shadow-sm border-2 border-white ring-2 ring-primary-50"
                        alt="Profile Image"
                        onError={placeholderImage}
                    />
                </div>
                
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2 justify-center">
                        <span 
                            className="text-xl font-bold text-gray-900 cursor-pointer hover:text-primary-500 transition-colors" 
                            onClick={(e) => handlecheckPremiumUserAgent(e)}
                        >
                            {getPropData && getPropData?.customer_name}
                        </span>
                        {getPropData?.is_verified && (
                            <div className="text-blue-500 w-5 h-5 flex items-center justify-center" title="Verified">
                                {BadgeSvg}
                            </div>
                        )}
                    </div>
                    {/* Add agent role/title if available, here just using email */}
                    {getPropData && getPropData?.email && (
                        <a href={`mailto:${getPropData?.email}`} target="_blank" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-500 transition-colors mt-1">
                            <RiMailSendLine size={16} />
                            <span className="truncate max-w-[200px]">{getPropData.email}</span>
                        </a>
                    )}
                </div>
            </div>

            {/* Contact Details Body */}
            <div className="p-6 flex flex-col gap-4 flex-1">
                {/* Call Button/Row */}
                {getPropData && getPropData?.mobile && (
                    <a href={`tel:${getPropData.mobile}`} className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 hover:shadow-sm transition-all group">
                        <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-green-100 transition-all shrink-0">
                            <FiPhoneCall size={22} className="group-hover:animate-pulse" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-gray-500">{translate("call")}</span>
                            <span className="text-gray-900 font-semibold truncate text-[15px]">{getPropData.mobile}</span>
                        </div>
                    </a>
                )}

                {/* Location Row */}
                {getPropData && getPropData?.client_address && (
                    <div className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all group">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-all shrink-0">
                            <CiLocationOn size={26} />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-gray-500">{translate("location")}</span>
                            <span className="text-gray-900 font-medium truncate text-[14px] leading-snug line-clamp-2 white-space-normal">{getPropData.client_address}</span>
                        </div>
                    </div>
                )}

                {/* Chat Button */}
                {showChat && isMessagingSupported && notificationPermissionGranted && (
                    <div className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 hover:shadow-sm cursor-pointer transition-all group" onClick={handleChat}>
                        <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center group-hover:scale-105 transition-all shrink-0">
                            {/* Note: FiMessageSquare imported from react-icons/fi above */}
                            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="22" width="22" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-gray-500">{translate("chat")}</span>
                            <span className="text-gray-900 font-semibold truncate text-[15px]">{translate("startAChat")}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions Footer */}
            {(handleReportProperty || handleInterested) && (
                <div className="p-6 pt-0 flex flex-col gap-3 mt-auto">
                    <hr className="border-gray-100 mb-2 border-t-2" />
                    <div className="flex flex-col sm:flex-row gap-3">
                        {userCurrentId !== getPropData?.added_by && (
                            <>
                                {interested ? (
                                    <button 
                                        onClick={handleNotInterested}
                                        className="flex-1 flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors text-sm"
                                    >
                                        <RiThumbUpFill size={18} className="text-primary-500" />
                                        <span className="truncate">{translate("intrested")}</span>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleInterested}
                                        className="flex-1 flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:border-primary-500 hover:text-primary-500 transition-colors text-sm"
                                    >
                                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                                        <span className="truncate">{translate("intrest")}</span>
                                    </button>
                                )}

                                {!isReported && (
                                    <button 
                                        onClick={handleReportProperty}
                                        className="flex-1 flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors text-sm"
                                    >
                                        <MdReport size={18} />
                                        <span className="truncate">{translate("reportProp")}</span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default OwnerDeatilsCard
