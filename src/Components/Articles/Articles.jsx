"use client"
import React, { useEffect, useState } from 'react'
import { AiOutlineUnorderedList } from "react-icons/ai";
import { RiGridFill } from "react-icons/ri";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import { GetAllArticlesApi } from "@/store/actions/campaign";
import ArticleCard from "@/Components/Cards/ArticleCard";
import Skeleton from "react-loading-skeleton";
import ArticleCardSkeleton from "@/Components/Skeleton/ArticleCardSkeleton";
import ArticleHorizonatalCard from "@/Components/Cards/ArticleHorizonatalCard";
import { translate } from "@/utils/helper";
import { useDispatch, useSelector } from "react-redux";
import { languageData } from "@/store/reducer/languageSlice";
import { settingsData } from "@/store/reducer/settingsSlice";
import NoData from "@/Components/NoDataFound/NoData";
import { articlecachedataCategoryId, categoriesCacheData } from "@/store/reducer/momentSlice";
import Layout from '../Layout/Layout';

const Articles = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [expandedStates, setExpandedStates] = useState([]);
    const [grid, setGrid] = useState(false);

    const [getArticles, setGetArticles] = useState([]);
    const [total, setTotal] = useState(0);
    const [offsetdata, setOffsetdata] = useState(0);
    const [hasMoreData, setHasMoreData] = useState(true); // Track if more data is available
    const limit = 3;
    const lang = useSelector(languageData);
    const Categorydata = useSelector(categoriesCacheData);
    const ArticleCateId = useSelector(articlecachedataCategoryId);

    const toggleGrid = () => {
        setGrid(!grid);
    }

    useEffect(() => {
        loadArticles(true);
    }, [ArticleCateId, lang, grid]);

    const loadArticles = (reset = false, cateID = ArticleCateId) => {
        setIsLoading(true);
        const offset = reset ? 0 : offsetdata;
        GetAllArticlesApi({
            category_id: cateID > 0 ? cateID : "",
            limit,
            offset,
            onSuccess: (response) => {
                const Articles = response.data;
                    setTotal(response.total);
                setIsLoading(false);
                if (reset) {
                    setGetArticles(Articles);
                } else {
                    setGetArticles(prevArticles => [...prevArticles, ...Articles]);
                }
                setExpandedStates(new Array(offset + Articles.length).fill(false));
                setOffsetdata(offset + limit);
                setHasMoreData(Articles.length === limit);
            },
            onError: (error) => {
                console.log(error);
                setIsLoading(false)
            }
        });
    };

    const SettingsData = useSelector(settingsData);
    const PlaceHolderImg = SettingsData?.web_placeholder_logo;

    const getArticleByCategory = (cateId) => {
        setOffsetdata(0);
        loadArticles(true, cateId);
    };

    const getGeneralArticles = () => {
        setOffsetdata(0);
        loadArticles(true, 0);
    };

    return (
        <Layout>
            <Breadcrumb title={translate("articles")} />
            <section className="articles-page">
                <div className="articles-page__container">
                    <div className="articles-page__layout">
                        <div className="articles-page__main">
                            {total != null && total > 0 && (
                                <div className="articles-page__toolbar">
                                    <span className="articles-page__count">
                                        {total} {translate("articleFound")}
                                    </span>
                                    <button
                                        type="button"
                                        className="articles-page__view-toggle"
                                        onClick={toggleGrid}
                                        aria-label={grid ? "List view" : "Grid view"}
                                    >
                                        {grid ? <AiOutlineUnorderedList size={22} /> : <RiGridFill size={22} />}
                                    </button>
                                </div>
                            )}
                            {getArticles && getArticles.length > 0 ? (
                                !grid ? (
                                    <div className="articles-page__cards" id="rowCards">
                                        <div className="articles-page__grid">
                                            {isLoading
                                                ? Array.from({ length: getArticles?.length || 6 }).map((_, index) => (
                                                    <div className="articles-page__card-wrap" key={index}>
                                                        <ArticleCardSkeleton />
                                                    </div>
                                                ))
                                                : getArticles?.map((ele, index) => (
                                                    <div className="articles-page__card-wrap" key={index}>
                                                        <ArticleCard ele={ele} expandedStates={expandedStates} language={lang} />
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="articles-page__list" id="columnCards">
                                        {isLoading
                                            ? Array.from({ length: getArticles?.length || 6 }).map((_, index) => (
                                                <div className="articles-page__list-item" key={index}>
                                                    <ArticleCardSkeleton />
                                                </div>
                                            ))
                                            : getArticles?.map((ele, index) => (
                                                <div className="articles-page__list-item" key={index}>
                                                    <ArticleHorizonatalCard ele={ele} expandedStates={expandedStates} index={index} PlaceHolderImg={PlaceHolderImg} />
                                                </div>
                                            ))}
                                    </div>
                                )
                            ) : (
                                <div className="articles-page__empty">
                                    <NoData />
                                </div>
                            )}
                            {hasMoreData && getArticles?.length > 0 && (
                                <div className="articles-page__load-more">
                                    <button type="button" className="articles-page__load-more-btn" onClick={() => loadArticles(false)}>
                                        {translate("loadmore")}
                                    </button>
                                </div>
                            )}
                        </div>
                        <aside className="articles-page__sidebar">
                            <div className="articles-page__sidebar-card">
                                <h3 className="articles-page__sidebar-title">{translate("categories")}</h3>
                                <ul className="articles-page__categories">
                                    <li className="articles-page__category-item">
                                        <button type="button" className="articles-page__category-btn" onClick={getGeneralArticles}>
                                            <span>{translate("General")}</span>
                                            {lang?.rtl === 1 ? <IoMdArrowDropleft size={20} className="articles-page__category-arrow" /> : <IoMdArrowDropright size={20} className="articles-page__category-arrow" />}
                                        </button>
                                    </li>
                                    {Categorydata?.map((elem, index) => (
                                        <li className="articles-page__category-item" key={index}>
                                            <button
                                                type="button"
                                                className="articles-page__category-btn"
                                                onClick={() => getArticleByCategory(elem.id)}
                                            >
                                                <span>{elem.category}</span>
                                                {lang?.rtl === 1 ? (
                                                    <IoMdArrowDropleft size={20} className="articles-page__category-arrow" />
                                                ) : (
                                                    <IoMdArrowDropright size={20} className="articles-page__category-arrow" />
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </Layout>
    )
}

export default Articles
