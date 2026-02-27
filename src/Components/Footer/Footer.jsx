"use client"
import React from "react";
import { FiMail, FiPhone } from "react-icons/fi";
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
import image1 from "../../../public/facebook.svg"

const Footer = () => {
    const systemData = useSelector(settingsData);
    const webdata = systemData && systemData;
    const currentYear = new Date().getFullYear();
    return (
        <section id="footer">
            <div className="container px-4">
                <div className="row py-5" id="footer_deatils">
                    {/* {(webdata?.web_footer_logo || webdata?.company_email || webdata?.company_tel1 || webdata?.company_tel2) && (
                        <div className="col-12 col-md-6 col-lg-3">
                            <div id="footer_logo_section">
                                {webdata?.web_footer_logo &&
                                    <Link href="/">
                                        <Image
                                            loading="lazy"
                                            src={webdata?.web_footer_logo}
                                            alt="eBroker_logo"
                                            width={100}
                                            height={100}
                                            className="footer_logo"
                                            onError={placeholderImage}
                                        />
                                    </Link>
                                }
                                {webdata?.company_email &&
                                    <div className="footer_contact_us">
                                        <div>
                                            <FiMail size={18} />
                                        </div>
                                        <div className="footer_contactus_deatils">
                                            <span className="footer_span">{translate("email")}</span>
                                            <a href={`mailto:${webdata.company_email}`} target="_blank" rel="noopener noreferrer">
                                                <span className="footer_span_value">{webdata.company_email}</span>
                                            </a>
                                        </div>
                                    </div>
                                }
                                {webdata && webdata.company_tel1 &&
                                    <div className="footer_contact_us">
                                        <div>
                                            <FiPhone size={18} />
                                        </div>
                                        <div className="footer_contactus_deatils">
                                            <span className="footer_span">{translate("contactOne")}</span>
                                            <a href={`tel:${webdata && webdata.company_tel1}`}>
                                                <span className="footer_span_value">{webdata && webdata.company_tel1}</span>
                                            </a>
                                        </div>
                                    </div>
                                }
                                {webdata && webdata.company_tel2 &&
                                    <div className="footer_contact_us">
                                        <div>
                                            <FiPhone size={18} />
                                        </div>
                                        <div className="footer_contactus_deatils">
                                            <span className="footer_span">{translate("contactTwo")}</span>
                                            <a href={`tel:${webdata && webdata.company_tel2}`}>
                                                <span className="footer_span_value">{webdata && webdata.company_tel2}</span>
                                            </a>
                                        </div>
                                    </div>
                                }
                                 {webdata?.facebook_id || webdata?.instagram_id || webdata?.youtube_id || webdata?.twitter_id ? (
                                    <div>
                                        <h4> {translate("followUs")}</h4>
                                        <div id="follow_us">
                                            {webdata?.facebook_id ? (
                                                <a href={webdata?.facebook_id} target="_blank">
                                                    <CiFacebook size={28} />
                                                </a>
                                            ) : null}
                                            {webdata?.instagram_id ? (
                                                <a href={webdata?.instagram_id} target="_blank">
                                                    <AiOutlineInstagram size={28} />
                                                </a>
                                            ) : null}
                                            {webdata?.youtube_id ? (
                                                <a href={webdata?.youtube_id}>
                                                    <FaYoutube size={25} />
                                                </a>
                                            ) : null}
                                            {webdata?.twitter_id ? (
                                                <a href={webdata?.twitter_id} target="_blank">
                                                    <FaXTwitter size={25} />
                                                </a>
                                            ) : null}
                                        </div>
                                    </div>
                                ) : (null)}
                            </div>
                        </div>
                    )} */}

                    <div className="col-12 col-md-6 col-lg-3">
                        <div id="footer_prop_section">
                            <div id="footer_headlines">
                                <span>{translate("properties")}</span>
                            </div>
                            <div className="prop_links">
                                <Link href="/properties/all-properties">{translate("allProperties")}</Link>
                            </div>
                            <div className="prop_links">
                                <Link href="/featured-properties">{translate("featuredProp")}</Link>
                            </div>

                            <div className="prop_links">
                                <Link href="/most-viewed-properties">{translate("mostViewedProp")}</Link>
                            </div>

                            <div className="prop_links">
                                <Link href="/properties-nearby-city">{translate("nearbyCities")}</Link>
                            </div>

                            <div className="prop_links">
                                <Link href="/most-favorite-properties">{translate("mostFavProp")}</Link>
                            </div>

                            {/* <div className='prop_links'>
                                <Link href="/listby-agents">
                                    List by Agents Properties
                                </Link>
                            </div> */}
                        </div>
                    </div>
                    <div className="col-12 col-md-6 col-lg-3">
                        <div id="footer_page_section">
                            <div id="footer_headlines">
                                <span>{translate("pages")}</span>
                            </div>
                            <div className="page_links">
                                <Link href="/subscription-plan">{translate("subscriptionPlan")}</Link>
                            </div>
                            <div className="page_links">
                                <Link href="/articles">{translate("articles")}</Link>
                            </div>
                            <div className="page_links">
                                <Link href="/faqs">{translate("faqs")}</Link>
                            </div>
                            <div className="page_links">
                                <Link href="/terms-and-condition">{translate("terms&condition")}</Link>
                            </div>

                            <div className="page_links">
                                <Link href="/privacy-policy">{translate("privacyPolicy")}</Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 col-lg-3">
                        {/* <div id="footer_download_section">
                            <div id="footer_headlines">
                                <span>{translate("downloadApps")}</span>
                            </div>
                            <div className="download_app_desc">
                                <span>{translate("Getthelatest")} {webdata?.company_name} {translate("Selectyourdevice")}</span>
                            </div>

                            <div className="download_app_platforms">
                                {webdata?.playstore_id ? (
                                    <div id="playstore_logo">
                                        <a href={webdata?.playstore_id} target="_blank">
                                            <Image loading="lazy" src={playstore?.src} alt="no_img" className="platforms_imgs" width={0} height={0} style={{ width: "100%", height: "100%" }} onError={placeholderImage} />
                                        </a>
                                    </div>
                                ) : null}
                                {webdata?.appstore_id ? (
                                    <div id="appstore_logo">
                                        <a href={webdata?.appstore_id} target="_blank">
                                            <Image loading="lazy" src={appstore?.src} alt="no_img" className="platforms_imgs" width={0} height={0} style={{ width: "100%", height: "100%" }} onError={placeholderImage} />
                                        </a>
                                    </div>
                                ) : null}
                            </div>
                        </div> */}
                        <div id="footer_download_section">
                            <div id="footer_headlines">
                                {/* <span>{translate("pages")}</span> */}
                                <span>Head Office</span>
                            </div>
                            <div className="page_links d-flex gap-2">
                                <svg fill="#ffffffc2" className="icons_footer_office" width={"1.4rem"} height={"1.4rem"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M25.6 4.8A12.1 12.1 0 0 0 6.4 19.5L16 32l9.6-12.6a12 12 0 0 0 0-14.6zm-9.6.7c3.5 0 6.3 2.8 6.3 6.3s-2.8 6.3-6.3 6.3-6.3-2.8-6.3-6.3 2.8-6.3 6.3-6.3z"></path></svg>
                                <p>Gulberg II, Lahore, Pakistan</p>
                            </div>
                            <div className="page_links d-flex gap-2">
                                <svg fill="#ffffffc2" className="icons_footer_office" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="_248017cf"><path d="M13.3 10.3A7.6 7.6 0 0 1 11 10a.7.7 0 0 0-.7.1l-1 1.4a10.1 10.1 0 0 1-4.6-4.6L6 5.7A.7.7 0 0 0 6 5a7.4 7.4 0 0 1-.3-2.3A.7.7 0 0 0 5 2H2.8c-.4 0-.8.2-.8.7A11.4 11.4 0 0 0 13.3 14a.7.7 0 0 0 .7-.8V11a.7.7 0 0 0-.7-.6z"></path></svg>
                                <p>0800-(92633) <br/>
Monday To Sunday 9AM To 6PM</p>
                            </div>
                            <div className="page_links d-flex gap-2">
                                <svg fill="#ffffffc2" className="icons_footer_office" width={"1.1rem"} height={"1.1rem"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="_248017cf"><path d="M2.3 5.5C1.1 5.5 0 6.5 0 7.8v16.4c0 1.3 1 2.3 2.3 2.3h27.4c1.3 0 2.3-1 2.3-2.3V7.8c0-1.3-1-2.3-2.3-2.3H2.3zM4 9.4c.2 0 .5.1.6.2l10.3 9.5c.6.6 1.6.6 2.2 0l10.3-9.5c.3-.3.8-.2 1.1.1.2.3.2.7 0 1l-5.8 5.4 5.8 5.2c.3.3.4.8.1 1.1-.3.3-.8.4-1.1.1l-.1-.1-5.9-5.3-3.3 3.1a3.21 3.21 0 0 1-4.3 0l-3.3-3.1-5.9 5.3c-.3.3-.8.3-1.1 0s-.3-.8 0-1.1l.1-.1L9.5 16l-5.8-5.4c-.3-.3-.4-.8-.1-1.1 0 0 .2-.1.4-.1z"></path></svg>
                                <p>Email us</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 col-lg-3">
                        <div id="footer_download_section">
                            <div id="footer_headlines">
                                {/* <span>{translate("pages")}</span> */}
                                <span>MKT Digital Account</span>
                            </div>
                            {webdata?.web_footer_logo &&
                                    <Link href="/">
                                        <Image
                                            loading="lazy"
                                            src={webdata?.web_footer_logo}
                                            alt="eBroker_logo"
                                            width={100}
                                            height={100}
                                            className="footer_logo"
                                            onError={placeholderImage}
                                        />
                                    </Link>
                                }
                            <span id="footer_headlines">Get Connected</span>
                            <div className="d-flex gap-3 flex-wrap">
                            <Link href="/" style={{width:"2.2rem"}}><img src="/facebook.svg" width={"100%"} alt="facebook" /></Link>
                            <Link href="/" style={{width:"2.2rem"}}><img src="/insta.svg" width={"100%"} alt="instagram" /></Link>
                            <Link href="/" style={{width:"2.2rem"}}><img src="/youtu.svg" width={"100%"} alt="youtube" /></Link>
                            <Link href="/" style={{width:"2.2rem"}}><img src="/twit.svg" width={"100%"} alt="twitter" /></Link>
                            <Link href="/" style={{width:"2.2rem"}}><img src="/linked.svg" width={"100%"} alt="linkedin" /></Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="rights_footer">
                {/* <hr /> */}
                <div className="container">

                    <div>
                        <p>{translate("Copyright")} {currentYear} {webdata?.company_name} {translate("All Rights Reserved")}</p>
                    </div>
                    {/* <div>
                        {webdata?.facebook_id || webdata?.instagram_id || webdata?.youtube_id || webdata?.twitter_id ? (
                            <div>
                                <h4> {translate("followUs")}</h4>
                                <div id="follow_us">
                                    <span>
                                    {translate("followUs")}
                                    </span>
                                    {webdata?.facebook_id ? (
                                        <a href={webdata?.facebook_id} target="_blank">
                                            <CiFacebook size={28} />
                                        </a>
                                    ) : null}
                                    {webdata?.instagram_id ? (
                                        <a href={webdata?.instagram_id} target="_blank">
                                            <AiOutlineInstagram size={28} />
                                        </a>
                                    ) : null}
                                    {webdata?.youtube_id ? (
                                        <a href={webdata?.youtube_id} target="_blank">
                                            <FaYoutube size={25} />
                                        </a>
                                    ) : null}
                                    {webdata?.twitter_id ? (
                                        <a href={webdata?.twitter_id} target="_blank">
                                            <FaXTwitter size={25} />
                                        </a>
                                    ) : null}
                                </div>
                            </div>
                        ) : (null)}
                    </div> */}
                </div>
            </div>
        </section>
    );
};

export default Footer;
