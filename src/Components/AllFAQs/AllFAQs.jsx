"use client"
import React, { useEffect, useState } from "react";
import Layout from "../Layout/Layout";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { translate } from "@/utils/helper";
import { Accordion } from "react-bootstrap";
import { FiMinusCircle, FiPlusCircle } from "react-icons/fi";
import { getFAQSApi } from "@/store/actions/campaign";
import NoData from "../NoDataFound/NoData";

const AllFAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [activeKey, setActiveKey] = useState(null);
  const [offsetdata, setOffsetdata] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);
  const limit = 5;

  const handleToggle = (key) => {
    setActiveKey(activeKey === key ? null : key);
  };

  const fetchFAQs = () => {
    getFAQSApi({
      limit: limit.toString(),
      offset: offsetdata?.toString(),
      onSuccess: (res) => {
        const data = res.data || [];
        setFaqs((prev) => [...prev, ...data]);
        setHasMoreData(data.length === limit);
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };

  const handleLoadMore = () => {
    setOffsetdata((prev) => prev + limit);
  };

  useEffect(() => {
    fetchFAQs();
  }, [offsetdata]);

  return (
    <Layout>
      <Breadcrumb title={translate("faqs")} />
      <section className="faq-page" aria-label={translate("faqs")}>
        <div className="faq-container">
          {faqs?.length > 0 ? (
            <>
              <header className="faq-hero">
                <p className="faq-hero__eyebrow">{translate("faqs")}</p>
                <h1 className="faq-hero__title">{translate("gotQueAbout")}</h1>
                <p className="faq-hero__subtitle">{translate("stillHaveQue")}</p>
              </header>
              <div className="faq-accordion-wrap">
                <Accordion activeKey={activeKey} className="faq-accordion">
                  {faqs.map((item) => (
                    <Accordion.Item
                      eventKey={item.id}
                      key={item.id}
                      className="faq-accordion__item"
                    >
                      <Accordion.Header
                        onClick={() => handleToggle(item.id)}
                        className="faq-accordion__header"
                      >
                        <span className="faq-accordion__question">{item.question}</span>
                        <span className="faq-accordion__icon">
                          {activeKey === item.id ? (
                            <FiMinusCircle size={22} aria-hidden />
                          ) : (
                            <FiPlusCircle size={22} aria-hidden />
                          )}
                        </span>
                      </Accordion.Header>
                      <Accordion.Body className="faq-accordion__body">
                        <div
                          className="faq-accordion__answer legal-prose prose"
                          dangerouslySetInnerHTML={{ __html: item.answer || "" }}
                        />
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </div>
              {hasMoreData && (
                <div className="faq-load-more">
                  <button
                    type="button"
                    className="faq-load-more__btn"
                    onClick={handleLoadMore}
                  >
                    {translate("loadmore")}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="faq-empty">
              <NoData />
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default AllFAQs;