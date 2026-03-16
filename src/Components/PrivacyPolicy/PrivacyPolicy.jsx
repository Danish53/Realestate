"use client"
import React, { useEffect, useState } from "react";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import { languageData } from "@/store/reducer/languageSlice";
import { settingsData } from "@/store/reducer/settingsSlice";
import { translate } from "@/utils/helper";
import Skeleton from "react-loading-skeleton";
import { useSelector } from "react-redux";
import Layout from "../Layout/Layout";

const PrivacyPolicy = () => {
  const settings = useSelector(settingsData);
  const privacyDataFromSettings = settings?.privacy_policy;
  const [privacyData, setPrivacyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const lang = useSelector(languageData);

  useEffect(() => {
    const t = setTimeout(() => {
      setPrivacyData(privacyDataFromSettings ?? "");
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(t);
  }, [privacyDataFromSettings]);

  return (
    <Layout>
      <Breadcrumb title={translate("privacyPolicy")} />
      <section className="privacy-policy-page" aria-label={translate("privacyPolicy")}>
        <div className="privacy-policy-container">
          <header className="privacy-policy-hero">
            <p className="privacy-policy-hero__eyebrow">{translate("privacyPolicy")}</p>
            <h1 className="privacy-policy-hero__title">{translate("privacyPolicy")}</h1>
          </header>
          <div className="privacy-policy-content">
            {isLoading ? (
              <div className="privacy-policy-content__loading">
                <Skeleton height={16} count={2} style={{ marginBottom: 16 }} />
                <Skeleton height={14} count={8} style={{ marginBottom: 12 }} />
                <Skeleton height={14} count={6} style={{ marginBottom: 12 }} />
                <Skeleton height={16} count={2} style={{ marginBottom: 16 }} />
                <Skeleton height={14} count={10} />
              </div>
            ) : (
              <div
                className="privacy-policy-content__body legal-prose prose"
                dangerouslySetInnerHTML={{ __html: privacyData || "" }}
              />
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;
