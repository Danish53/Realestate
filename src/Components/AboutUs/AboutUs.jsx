"use client";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { translate } from "@/utils/helper";
import { languageData } from "@/store/reducer/languageSlice";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import { settingsData } from "@/store/reducer/settingsSlice";
import { useSelector } from "react-redux";
import Layout from "../Layout/Layout";

const AboutUs = () => {
  const lang = useSelector(languageData);
  const settings = useSelector(settingsData);
  const aboutUsData = settings?.about_us;
  const [aboutData, setAboutData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAboutData(aboutUsData ?? "");
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [aboutUsData]);

  return (
    <Layout>
      <Breadcrumb title={translate("aboutUs")} />

      <section className="about-us-page" aria-label={translate("aboutUs")}>
        <div className="about-us-container">
          {/* Hero / intro */}
          <header className="about-us-hero">
            <p className="about-us-hero__eyebrow">{translate("aboutUs")}</p>
            <h1 className="about-us-hero__title">{translate("aboutUs")}</h1>
          </header>

          {/* Main content card */}
          <div className="about-us-content">
            {isLoading ? (
              <div className="about-us-content__loading">
                <Skeleton height={16} count={2} style={{ marginBottom: 16 }} />
                <Skeleton height={14} count={8} style={{ marginBottom: 12 }} />
                <Skeleton height={14} count={6} style={{ marginBottom: 12 }} />
                <Skeleton height={16} count={2} style={{ marginBottom: 16 }} />
                <Skeleton height={14} count={10} />
              </div>
            ) : (
              <div
                className="about-us-content__body prose"
                dangerouslySetInnerHTML={{ __html: aboutData || "" }}
              />
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutUs;
