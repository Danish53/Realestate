"use client"
import React from 'react'
import MobileHeadline from '../MobileHeadlines/MobileHeadline'
import ArticleCard from '../Cards/ArticleCard'
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs'
import { translate } from '@/utils/helper'
import ArticleCardSkeleton from '../Skeleton/ArticleCardSkeleton'
import Link from 'next/link'

const HomeArticles = ({isLoading, getArticles, language, sectionTitle}) => {
    // Use sectionTitle from API if provided, otherwise use default translation
    const title = sectionTitle
    
    return (
        <div>
            {isLoading ? (
                <section className="bg-gray-50/50">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                                {title}
                            </h2>
                            <div className="hidden sm:block">
                                <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
                            </div>
                        </div>
                        
                        <div className="block sm:hidden mb-6">
                            <MobileHeadline
                                data={{
                                    text: sectionTitle || translate("ourArticles"),
                                    link: "/articles",
                                }}
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="w-full">
                                    <ArticleCardSkeleton />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            ) : (
                getArticles && getArticles?.length > 0 ? (
                    <section className="p-0 m-0 bg-white overflow-hidden mt-12">
                        <div className="container mx-auto px-4 max-w-7xl">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 gap-4">
                                <div className="max-w-2xl">
                                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                                        {!sectionTitle && translate("our")} {title}
                                    </h2>
                                    <p className="text-gray-500 text-sm sm:text-base">
                                        {translate("discoverArticles", "Read our latest news and articles")}
                                    </p>
                                </div>
                                
                                {getArticles?.length > 4 && (
                                    <div className="hidden sm:block shrink-0">
                                        <Link href="/articles">
                                            <button 
                                                type="button" 
                                                className="group inline-flex items-center justify-center gap-3 bg-white border-2 border-primary-500 text-primary-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-500 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                                aria-label={translate("seeAllArticles")}
                                            >
                                                <span>{translate("seeAllArticles")}</span>
                                                <div className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 group-hover:bg-white flex items-center justify-center transition-colors">
                                                    {language.rtl === 1 ? <BsArrowLeft size={14} /> : <BsArrowRight size={14} />}
                                                </div>
                                            </button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                            
                            {/* <div className="block sm:hidden mb-6">
                                <MobileHeadline
                                    data={{
                                        text: sectionTitle || translate("ourArticles"),
                                        link: getArticles.length > 4 ? "/articles" : "",
                                    }}
                                />
                            </div> */}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {getArticles?.slice(0, 4).map((ele, index) => (
                                    <div key={index} className="w-full">
                                        <ArticleCard ele={ele} language={language}/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                ) : null
            )}
        </div>
    )
}

export default HomeArticles
