"use client"
import { BadgeSvg, placeholderImage, translate } from '@/utils/helper'
import Image from 'next/image'
import React, { useMemo } from 'react'
import { CiLocationOn } from 'react-icons/ci'
import { FaWhatsapp } from 'react-icons/fa'
import { FiMail, FiMessageSquare, FiPhoneCall, FiThumbsUp } from 'react-icons/fi'
import { MdReport } from 'react-icons/md'
import { RiMailSendLine, RiThumbUpFill } from 'react-icons/ri'

/** Local PK / +92 → wa.me digits (no +), e.g. 0323… → 92323… */
function toWhatsAppIntlDigits(input) {
    const d = String(input || "").replace(/\D/g, "");
    if (!d) return "";
    if (d.startsWith("92")) return d;
    if (d.startsWith("0") && d.length >= 10) return `92${d.slice(1)}`;
    if (d.length === 10) return `92${d}`;
    return d;
}

function buildWhatsAppListingHref(intlDigits, pageUrl, detail, platformLabel) {
    if (!intlDigits) return "#";
    const title = detail?.title?.trim();
    const price = detail?.price != null ? String(detail.price).trim() : "";
    const loc = (detail?.address || detail?.client_address || "").trim();
    const label = platformLabel?.trim() || "eBroker";
    const lines = [
        "Hello!",
        "",
        `I am interested in this property on ${label}:`,
        "",
    ];
    if (title) lines.push(title);
    if (price) lines.push(`Price: ${price}`);
    if (loc) lines.push(`Location: ${loc}`);
    lines.push("");
    lines.push("Listing link:");
    lines.push(pageUrl || "—");
    const qs = new URLSearchParams({ text: lines.join("\n") });
    return `https://wa.me/${intlDigits}?${qs.toString()}`;
}

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
        handlecheckPremiumUserAgent,
        propertyPageUrl,
        platformLabel,
    }) => {
    const whatsappIntlDigits = useMemo(
        () => toWhatsAppIntlDigits(getPropData?.mobile),
        [getPropData?.mobile]
    );

    const whatsappHref = useMemo(() => {
        if (!whatsappIntlDigits) return "#";
        if (propertyPageUrl && getPropData) {
            return buildWhatsAppListingHref(
                whatsappIntlDigits,
                propertyPageUrl,
                getPropData,
                platformLabel
            );
        }
        return `https://wa.me/${whatsappIntlDigits}`;
    }, [whatsappIntlDigits, propertyPageUrl, getPropData, platformLabel]);

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

                {/* WhatsApp — opens with prefilled message + listing link when propertyPageUrl is set */}
                {whatsappIntlDigits && getPropData?.mobile && (
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 hover:shadow-sm transition-all group"
                        aria-label={`${translate("whatsapp")} ${getPropData.mobile}`}
                    >
                        <div className="w-12 h-12 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center group-hover:scale-105 transition-all shrink-0">
                            <FaWhatsapp size={26} />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-gray-500">{translate("whatsapp")}</span>
                            <span className="text-gray-900 font-semibold truncate text-[15px]">{getPropData.mobile}</span>
                        </div>
                    </a>
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
