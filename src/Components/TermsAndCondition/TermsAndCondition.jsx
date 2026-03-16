"use client"
import React, { useEffect, useState } from "react";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import { settingsData } from "@/store/reducer/settingsSlice";
import { useSelector } from "react-redux";
import Skeleton from "react-loading-skeleton";
import { translate } from "@/utils/helper";
import { languageData } from "@/store/reducer/languageSlice";
import Layout from "../Layout/Layout";

const TermsAndCondition = () => {
  const settings = useSelector(settingsData);
  const termsFromSettings = settings?.terms_conditions;
  const [termsData, setTermsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const lang = useSelector(languageData);

  useEffect(() => {
    const t = setTimeout(() => {
      setTermsData(termsFromSettings ?? "");
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(t);
  }, [termsFromSettings]);

  return (
    <Layout>
      <Breadcrumb title={translate("terms&condition")} />
      <section className="terms-page" aria-label={translate("terms&condition")}>
        <div className="terms-container">
          <header className="terms-hero">
            <p className="terms-hero__eyebrow">{translate("terms&condition")}</p>
            <h1 className="terms-hero__title">{translate("terms&condition")}</h1>
          </header>
          <div className="terms-content">
            {isLoading ? (
              <div className="terms-content__loading">
                <Skeleton height={16} count={2} style={{ marginBottom: 16 }} />
                <Skeleton height={14} count={8} style={{ marginBottom: 12 }} />
                <Skeleton height={14} count={6} style={{ marginBottom: 12 }} />
                <Skeleton height={16} count={2} style={{ marginBottom: 16 }} />
                <Skeleton height={14} count={10} />
              </div>
            ) : (
              <div
                className="terms-content__body legal-prose prose"
                dangerouslySetInnerHTML={{ __html: termsData || "" }}
              />
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TermsAndCondition;
