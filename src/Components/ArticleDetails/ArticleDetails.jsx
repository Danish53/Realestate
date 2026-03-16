"use client";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

import Image from "next/image";
import { IoMdArrowDropright } from "react-icons/io";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import Skeleton from "react-loading-skeleton";
import { placeholderImage, translate } from "@/utils/helper";
import { languageData } from "@/store/reducer/languageSlice";
import { GetAllArticlesApi } from "@/store/actions/campaign";
import { store } from "@/store/store";
import ArticleCard from "@/Components/Cards/ArticleCard";
import { categoriesCacheData, getArticleId } from "@/store/reducer/momentSlice";
import Layout from "../Layout/Layout";
import { settingsData } from "@/store/reducer/settingsSlice";
import ReactShare from "@/Components/ShareUrl/ReactShare";
import toast from "react-hot-toast";

const ArticleDetails = () => {
  const router = useRouter();
  const currentUrl = `${process.env.NEXT_PUBLIC_WEB_URL}${router.asPath}`;

  const articleId = router.query;
  const Categorydata = useSelector(categoriesCacheData);
  const settings = useSelector(settingsData);
  const CompanyName = settings && settings.company_name;
  const [isLoading, setIsLoading] = useState(false);
  const [articleData, setArticleData] = useState();
  const [similerArticles, setSimilerArticles] = useState([]);
  const [expandedStates, setExpandedStates] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    GetAllArticlesApi({
      slug_id: articleId.slug,
      onSuccess: (response) => {
        const AData = response.data[0];
        setIsLoading(false);
        setArticleData(AData);
        setSimilerArticles(response.similar_articles);
      },
      onError: (error) => {
        console.log(error);
        setIsLoading(true);
      },
    });
  }, [articleId]);

  const getArticlesByCategory = (cateId) => {
    getArticleId(cateId);
    router.push("/articles");
  };
  const lang = useSelector(languageData);

  useEffect(() => {}, [lang]);

  const breakpoints = {
    320: {
      slidesPerView: 1,
    },
    375: {
      slidesPerView: 1.5,
    },
    576: {
      slidesPerView: 1.5,
    },
    768: {
      slidesPerView: 2,
    },
    992: {
      slidesPerView: 2,
    },
    1200: {
      slidesPerView: 3,
    },
    1400: {
      slidesPerView: 4,
    },
  };
  const language = store.getState().Language.languages;


  const handleCopyUrl = async (e) => {
    e.preventDefault();

    // Get the current URL from the router

    try {
      // Use the Clipboard API to copy the URL to the clipboard
      await navigator.clipboard.writeText(currentUrl);
      toast.success(translate("copuyclipboard"));
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      // toast.error("Failed to copy URL to clipboard.");
    }
  };

  return (
    <Layout>
      <Breadcrumb title={articleData?.title || translate("articleDetails")} />
      <section className="article-detail-page">
        <div className="article-detail-page__container">
          <div className="article-detail-page__layout">
            <div className="article-detail-page__main">
              <article className="article-detail-page__content">
                {isLoading ? (
                  <div className="article-detail-page__skeleton">
                    <Skeleton height={20} count={20} />
                  </div>
                ) : articleData ? (
                  <>
                    <div className="article-detail-page__hero">
                      <div className="article-detail-page__image-wrap">
                        <Image
                          loading="lazy"
                          src={articleData.image}
                          alt={articleData.title || "Article"}
                          className="article-detail-page__image"
                          fill
                          sizes="(max-width: 992px) 100vw, 75vw"
                          onError={placeholderImage}
                        />
                      </div>
                    </div>
                    <div className="article-detail-page__body">
                      <h1 className="article-detail-page__title">{articleData.title}</h1>
                      <div
                        className="article-detail-page__prose prose"
                        dangerouslySetInnerHTML={{
                          __html: articleData.description || "",
                        }}
                      />
                    </div>
                  </>
                ) : null}
              </article>
            </div>
            <aside className="article-detail-page__sidebar">
              <div className="article-detail-page__sidebar-card">
                <h3 className="article-detail-page__sidebar-title">{translate("categories")}</h3>
                <ul className="article-detail-page__categories">
                  {Categorydata?.map((elem, index) => (
                    <li className="article-detail-page__category-item" key={index}>
                      <button
                        type="button"
                        className="article-detail-page__category-btn"
                        onClick={() => getArticlesByCategory(elem.id)}
                      >
                        <span>{elem.category}</span>
                        <IoMdArrowDropright
                          size={20}
                          className="article-detail-page__category-arrow"
                          style={{ transform: language.rtl === 1 ? "rotate(180deg)" : "none" }}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="article-detail-page__share">
                <ReactShare
                  CompanyName={CompanyName}
                  data={articleData?.title}
                  handleCopyUrl={handleCopyUrl}
                  currentUrl={currentUrl}
                />
              </div>
            </aside>
          </div>
          {similerArticles?.length > 0 && (
            <div className="article-detail-page__related">
              <h2 className="article-detail-page__related-title">
                {translate("related")} {translate("articles")}
              </h2>
              <div className="article-detail-page__related-slider">
                <Swiper
                  key={language.rtl}
                  dir={language.rtl === 1 ? "rtl" : "ltr"}
                  slidesPerView={4}
                  spaceBetween={24}
                  freeMode
                  pagination={{ clickable: true }}
                  modules={[FreeMode, Pagination]}
                  className="article-detail-page__swiper"
                  breakpoints={breakpoints}
                >
                  {!isLoading &&
                    similerArticles?.map((ele) => (
                      <SwiperSlide key={ele.id} className="article-detail-page__slide">
                        <ArticleCard ele={ele} expandedStates={expandedStates} language={lang} />
                      </SwiperSlide>
                    ))}
                </Swiper>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ArticleDetails;
