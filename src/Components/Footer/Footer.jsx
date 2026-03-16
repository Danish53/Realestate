"use client"
import React from "react";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { AiOutlineInstagram } from "react-icons/ai";
import { CiFacebook } from "react-icons/ci";
import { ImPinterest2 } from "react-icons/im";
import playstore from "../../assets/playStore.png";
import appstore from "../../assets/appStore.png";
import Link from "next/link";
import { useSelector } from "react-redux";
import { settingsData } from "@/store/reducer/settingsSlice";
import { placeholderImage, translate } from "@/utils/helper";
import Image from "next/image";
import { FaXTwitter } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";
import facebook from "../../../public/facebook.svg";
import twit from "../../../public/twit.svg";
import linkedin from "../../../public/linked.svg";
import instagram from "../../../public/insta.svg";
import youtube from "../../../public/youtu.svg";
import logofooter from "../../../public/logofooter.png"

const Footer = () => {
    const systemData = useSelector(settingsData);
    const webdata = systemData && systemData;
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="bg-[#282F39] text-gray-300 py-16 lg:pt-20 lg:pb-0 mt-auto border-t border-gray-800">
            <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
                    
                    {/* Column 1: Properties */}
                    <div>
                        <h3 className="text-white text-sm font-semibold mb-3 tracking-wider uppercase">Properties</h3>
                        <ul className="space-y-2.5">
                            <li><Link href="/properties/all-properties" className="text-gray-400 hover:text-white transition-colors text-sm inline-block">All Properties</Link></li>
                            <li><Link href="/featured-properties" className="text-gray-400 hover:text-white transition-colors text-sm inline-block">Featured Properties</Link></li>
                            <li><Link href="/most-viewed-properties" className="text-gray-400 hover:text-white transition-colors text-sm inline-block">Most Viewed Properties</Link></li>
                            <li><Link href="/properties-nearby-city" className="text-gray-400 hover:text-white transition-colors text-sm inline-block">Nearby Cities Properties</Link></li>
                            <li><Link href="/most-favorite-properties" className="text-gray-400 hover:text-white transition-colors text-sm inline-block">Most Favorite Properties</Link></li>
                        </ul>
                    </div>

                    {/* Column 2: Pages */}
                    <div>
                        <h3 className="text-white text-sm font-semibold mb-3 tracking-wider uppercase">Pages</h3>
                        <ul className="space-y-2.5">
                            <li><Link href="/subscription-plan" className="text-gray-400 hover:text-white transition-colors text-sm inline-block">Subscription Plan</Link></li>
                            <li><Link href="/articles" className="text-gray-400 hover:text-white transition-colors text-sm inline-block">Articles</Link></li>
                            <li><Link href="/faqs" className="text-gray-400 hover:text-white transition-colors text-sm inline-block">FAQs</Link></li>
                            <li><Link href="/terms-and-condition" className="text-gray-400 hover:text-white transition-colors text-sm inline-block">Terms & Condition</Link></li>
                            <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm inline-block">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Head Office */}
                    <div>
                        <h3 className="text-white text-sm font-semibold mb-3 tracking-wider uppercase">Head Office</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <FiMapPin className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                                <p className="text-sm text-gray-400 leading-relaxed">Gulberg II, Lahore, Pakistan</p>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <FiPhone className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                                <div className="text-sm text-gray-400 leading-relaxed">
                                    <div className="text-gray-400 text-xs">0800-(92633)</div>
                                    <div className="text-gray-400 text-xs mt-1">Monday To Sunday 9AM To 6PM</div>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <FiMail className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                                <Link href="mailto:info@ebroker.com" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Email us
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Column 4: MKT Digital Account & Social */}
                    <div>
                        <h3 className="text-white text-sm font-semibold mb-3 tracking-wider uppercase">MKT Digital Account</h3>
                        <Image src={logofooter} alt="" width={60} height={60} />
                        
                        <h3 className="text-white text-sm font-semibold mb-3 tracking-wider uppercase mt-6">Get Connected</h3>
                        <div className="flex items-center gap-2">
                            <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm"><Image src={facebook} alt="" width={36} height={36} /></Link>
                            {/* <span className="text-gray-600">|</span> */}
                            <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm"><Image src={twit} alt="" width={36} height={36} /></Link>
                            {/* <span className="text-gray-600">|</span> */}
                            <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm"><Image src={linkedin} alt="" width={36} height={36} /></Link>
                            {/* <span className="text-gray-600">|</span> */}
                            <Link href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm"><Image src={youtube} alt="" width={36} height={36} /></Link>
                            {/* <span className="text-gray-600">|</span> */}
                            <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm"><Image src={instagram} alt="" width={36} height={36} /></Link>
                        </div>
                    </div>
                </div>

                {/* Windows Activation Message */}
                <div className="border-t border-gray-800 pt-6 pb-4 text-center">
                    <p className="text-xs text-gray-400">
                        Copyright @ 2026 AI LANDS MKT All Rights Reserved
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;