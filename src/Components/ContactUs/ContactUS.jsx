"use client";
import React, { useEffect, useRef, useState } from "react";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import { BsInstagram } from "react-icons/bs";
import { FiMail, FiPhoneCall, FiSend } from "react-icons/fi";
import { MdLocationPin } from "react-icons/md";
import { PiFacebookLogoBold } from "react-icons/pi";
import { toast } from "react-hot-toast";
import { translate } from "@/utils/helper";
import { useSelector } from "react-redux";
import { languageData } from "@/store/reducer/languageSlice";
import { ContactUsApi } from "@/store/actions/campaign";
import { settingsData } from "@/store/reducer/settingsSlice";
import Layout from "../Layout/Layout";
import { FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { BiMessageRoundedDetail } from "react-icons/bi";

const ContactUS = () => {
  const lang = useSelector(languageData);
  const systemsettings = useSelector(settingsData);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isloading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const formRef = useRef(null);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) errors.firstName = translate("firstNameRequired");
    if (!formData.lastName.trim()) errors.lastName = translate("lastNameRequired");
    if (!formData.email.trim()) {
      errors.email = translate("emailRequired");
    } else if (!isValidEmail(formData.email)) {
      errors.email = translate("emailIsNotValid");
    }
    if (!formData.subject.trim()) errors.subject = translate("subjectRequired");
    if (!formData.message.trim()) errors.message = translate("messageRequired");

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleContactUsSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(translate("pleaseFillAllFields"));
      return;
    }

    setIsLoading(true);
    ContactUsApi(
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.subject,
      formData.message,
      (response) => {
        toast.success(response.message || translate("messageSent"));
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "",
          message: "",
        });
        setIsLoading(false);
      },
      (error) => {
        toast.error(error || translate("somethingWentWrong"));
        setIsLoading(false);
      }
    );
  };

  return (
    <Layout>
      <Breadcrumb title={translate("contactUs")} />

      <section className="contact-us-page" id="contact-us" aria-label={translate("contactUs")}>
        <div className="contact-us-container">
          {/* Hero */}
          <header className="contact-us-hero">
            <p className="contact-us-hero__eyebrow">{translate("contactUs")}</p>
            <h1 className="contact-us-hero__title">
              {translate("getInTouch")} <span className="contact-us-hero__title-accent">{translate("withUs")}</span>
            </h1>
          </header>

          {/* Form + Info */}
          <div className="contact-us-layout">
            <div className="contact-us-form-wrap">
              <div className="contact-us-form-card">
                <div className="contact-us-form-card__header">
                  <span className="contact-us-form-card__icon" aria-hidden>
                    <BiMessageRoundedDetail size={28} />
                  </span>
                  <div>
                    <h2 className="contact-us-form-card__title">{translate("haveQue")}</h2>
                    <p className="contact-us-form-card__subtitle">{translate("weWouldLoveToHear")}</p>
                  </div>
                </div>

                <form ref={formRef} onSubmit={handleContactUsSubmit} className="contact-us-form">
                  <div className="contact-us-form__grid">
                    <div className={`contact-us-field ${formErrors.firstName ? "contact-us-field--error" : ""}`}>
                      <label htmlFor="firstName">{translate("firstName")} <span className="contact-us-field__required">*</span></label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="contact-us-input"
                        placeholder={translate("enterFirstName")}
                        value={formData.firstName}
                        onChange={handleInputChange}
                        onFocus={() => handleFocus("firstName")}
                        onBlur={handleBlur}
                      />
                      {formErrors.firstName && <span className="contact-us-field__error">{formErrors.firstName}</span>}
                    </div>
                    <div className={`contact-us-field ${formErrors.lastName ? "contact-us-field--error" : ""}`}>
                      <label htmlFor="lastName">{translate("lastName")} <span className="contact-us-field__required">*</span></label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="contact-us-input"
                        placeholder={translate("enterLastName")}
                        value={formData.lastName}
                        onChange={handleInputChange}
                        onFocus={() => handleFocus("lastName")}
                        onBlur={handleBlur}
                      />
                      {formErrors.lastName && <span className="contact-us-field__error">{formErrors.lastName}</span>}
                    </div>
                    <div className={`contact-us-field ${formErrors.email ? "contact-us-field--error" : ""}`}>
                      <label htmlFor="email">{translate("email")} <span className="contact-us-field__required">*</span></label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="contact-us-input"
                        placeholder={translate("enterEmail")}
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() => handleFocus("email")}
                        onBlur={handleBlur}
                      />
                      {formErrors.email && <span className="contact-us-field__error">{formErrors.email}</span>}
                    </div>
                    <div className={`contact-us-field ${formErrors.subject ? "contact-us-field--error" : ""}`}>
                      <label htmlFor="subject">{translate("subject")} <span className="contact-us-field__required">*</span></label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        className="contact-us-input"
                        placeholder={translate("enterSubject")}
                        value={formData.subject}
                        onChange={handleInputChange}
                        onFocus={() => handleFocus("subject")}
                        onBlur={handleBlur}
                      />
                      {formErrors.subject && <span className="contact-us-field__error">{formErrors.subject}</span>}
                    </div>
                    <div className={`contact-us-field contact-us-field--full ${formErrors.message ? "contact-us-field--error" : ""}`}>
                      <label htmlFor="message">{translate("message")} <span className="contact-us-field__required">*</span></label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        className="contact-us-input contact-us-textarea"
                        placeholder={translate("enterMessage")}
                        value={formData.message}
                        onChange={handleInputChange}
                        onFocus={() => handleFocus("message")}
                        onBlur={handleBlur}
                      />
                      {formErrors.message && <span className="contact-us-field__error">{formErrors.message}</span>}
                    </div>
                    <div className="contact-us-form__submit contact-us-field--full">
                      <button type="submit" className="contact-us-submit" disabled={isloading} aria-label={translate("sendMessage")}>
                        {isloading ? (
                          <span className="contact-us-submit__loading">{translate("sending")}</span>
                        ) : (
                          <>
                            <span>{translate("sendMessage")}</span>
                            <FiSend size={18} aria-hidden />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <aside className="contact-us-info-card">
              <h3 className="contact-us-info-card__title">{translate("contactInfo")}</h3>
              <div className="contact-us-info-card__list">
                <div className="contact-us-info-item">
                  <span className="contact-us-info-item__icon" aria-hidden>
                    <MdLocationPin size={20} />
                  </span>
                  <div className="contact-us-info-item__content">
                    <span className="contact-us-info-item__label">{translate("officeAdd")}</span>
                    <p className="contact-us-info-item__text">{systemsettings?.company_address || "—"}</p>
                  </div>
                </div>
                <div className="contact-us-info-item">
                  <span className="contact-us-info-item__icon" aria-hidden>
                    <FiPhoneCall size={20} />
                  </span>
                  <div className="contact-us-info-item__content">
                    <span className="contact-us-info-item__label">{translate("tele")}</span>
                    <a href={`tel:${systemsettings?.company_tel1}`} className="contact-us-info-item__link">{systemsettings?.company_tel1 || "—"}</a>
                    {systemsettings?.company_tel2 && (
                      <a href={`tel:${systemsettings?.company_tel2}`} className="contact-us-info-item__link">{systemsettings?.company_tel2}</a>
                    )}
                  </div>
                </div>
                <div className="contact-us-info-item">
                  <span className="contact-us-info-item__icon" aria-hidden>
                    <FiMail size={20} />
                  </span>
                  <div className="contact-us-info-item__content">
                    <span className="contact-us-info-item__label">{translate("emailUs")}</span>
                    <a href={`mailto:${systemsettings?.company_email}`} className="contact-us-info-item__link">{systemsettings?.company_email || "—"}</a>
                  </div>
                </div>
                {(systemsettings?.facebook_id || systemsettings?.instagram_id || systemsettings?.twitter_id || systemsettings?.youtube_id) && (
                  <div className="contact-us-info-item contact-us-info-item--social">
                    <span className="contact-us-info-item__label">{translate("followUs")}</span>
                    <div className="contact-us-social">
                      {systemsettings?.facebook_id && (
                        <a href={systemsettings.facebook_id} target="_blank" rel="noopener noreferrer" className="contact-us-social__link" aria-label="Facebook">
                          <PiFacebookLogoBold size={20} />
                        </a>
                      )}
                      {systemsettings?.instagram_id && (
                        <a href={systemsettings.instagram_id} target="_blank" rel="noopener noreferrer" className="contact-us-social__link" aria-label="Instagram">
                          <BsInstagram size={20} />
                        </a>
                      )}
                      {systemsettings?.youtube_id && (
                        <a href={systemsettings.youtube_id} target="_blank" rel="noopener noreferrer" className="contact-us-social__link" aria-label="YouTube">
                          <FaYoutube size={20} />
                        </a>
                      )}
                      {systemsettings?.twitter_id && (
                        <a href={systemsettings.twitter_id} target="_blank" rel="noopener noreferrer" className="contact-us-social__link" aria-label="Twitter">
                          <FaXTwitter size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>

          {systemsettings?.iframe_link && (
            <div className="contact-us-map">
              <iframe
                src={systemsettings.iframe_link}
                title={translate("officeAdd")}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="contact-us-map__iframe"
              />
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ContactUS;