"use client";
import React, { useEffect, useRef, useState } from "react";
import Breadcrumb from "@/Components/Breadcrumb/Breadcrumb";
import { AiFillTwitterCircle } from "react-icons/ai";
import { BsInstagram, BsPinterest } from "react-icons/bs";
import { FiMail, FiPhoneCall, FiSend, FiCheckCircle } from "react-icons/fi";
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
      
      {/* Hero Section */}
      <section className="mt-3">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title text-dark">
              {translate("getInTouch")}
              <span className="hero-highlight">{translate("withUs")}</span>
            </h1>
            {/* <p className="hero-description text-dark">
              {translate("contactDescription")}
            </p> */}
            <div className="hero-decoration text-dark">
              <span className="decoration-dot bg-dark"></span>
              <span className="decoration-dot bg-dark"></span>
              <span className="decoration-dot bg-dark"></span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact-us" className="contact-section">
        <div className="container">
          <div className="row g-4">
            {/* Contact Form */}
            <div className="col-12 col-lg-8">
              <div className="contact-form-card">
                <div className="form-header">
                  <div className="header-icon">
                    <BiMessageRoundedDetail size={32} />
                  </div>
                  <div className="header-content">
                    <h2>{translate("haveQue")}</h2>
                    <p>{translate("weWouldLoveToHear")}</p>
                  </div>
                </div>

                <form ref={formRef} onSubmit={handleContactUsSubmit} className="contact-form">
                  <div className="row g-4">
                    {/* First Name */}
                    <div className="col-md-6">
                      <div className={`form-group ${focusedField === 'firstName' ? 'focused' : ''} ${formErrors.firstName ? 'error' : ''}`}>
                        <label htmlFor="firstName">
                          {translate("firstName")} <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          className="form-input"
                          placeholder={translate("enterFirstName")}
                          value={formData.firstName}
                          onChange={handleInputChange}
                          onFocus={() => handleFocus('firstName')}
                          onBlur={handleBlur}
                        />
                        {formErrors.firstName && (
                          <span className="error-message">{formErrors.firstName}</span>
                        )}
                      </div>
                    </div>

                    {/* Last Name */}
                    <div className="col-md-6">
                      <div className={`form-group ${focusedField === 'lastName' ? 'focused' : ''} ${formErrors.lastName ? 'error' : ''}`}>
                        <label htmlFor="lastName">
                          {translate("lastName")} <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          className="form-input"
                          placeholder={translate("enterLastName")}
                          value={formData.lastName}
                          onChange={handleInputChange}
                          onFocus={() => handleFocus('lastName')}
                          onBlur={handleBlur}
                        />
                        {formErrors.lastName && (
                          <span className="error-message">{formErrors.lastName}</span>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-md-6">
                      <div className={`form-group ${focusedField === 'email' ? 'focused' : ''} ${formErrors.email ? 'error' : ''}`}>
                        <label htmlFor="email">
                          {translate("email")} <span className="required">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className="form-input"
                          placeholder={translate("enterEmail")}
                          value={formData.email}
                          onChange={handleInputChange}
                          onFocus={() => handleFocus('email')}
                          onBlur={handleBlur}
                        />
                        {formErrors.email && (
                          <span className="error-message">{formErrors.email}</span>
                        )}
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="col-md-6">
                      <div className={`form-group ${focusedField === 'subject' ? 'focused' : ''} ${formErrors.subject ? 'error' : ''}`}>
                        <label htmlFor="subject">
                          {translate("subject")} <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          className="form-input"
                          placeholder={translate("enterSubject")}
                          value={formData.subject}
                          onChange={handleInputChange}
                          onFocus={() => handleFocus('subject')}
                          onBlur={handleBlur}
                        />
                        {formErrors.subject && (
                          <span className="error-message">{formErrors.subject}</span>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="col-12">
                      <div className={`form-group ${focusedField === 'message' ? 'focused' : ''} ${formErrors.message ? 'error' : ''}`}>
                        <label htmlFor="message">
                          {translate("message")} <span className="required">*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={6}
                          className="form-textarea"
                          placeholder={translate("enterMessage")}
                          value={formData.message}
                          onChange={handleInputChange}
                          onFocus={() => handleFocus('message')}
                          onBlur={handleBlur}
                        />
                        {formErrors.message && (
                          <span className="error-message">{formErrors.message}</span>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="col-12">
                      <div className="form-submit">
                        <button
                          type="submit"
                          className="submit-btn"
                          disabled={isloading}
                        >
                          {isloading ? (
                            <div className="loader-container">
                              <div className="loader"></div>
                              <span>{translate("sending")}</span>
                            </div>
                          ) : (
                            <>
                              <span>{translate("sendMessage")}</span>
                              <FiSend className="send-icon" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Contact Info */}
            <div className="col-12 col-lg-4">
              <div className="contact-info-card">
                <div className="info-header">
                  <h3>{translate("contactInfo")}</h3>
                  <div className="header-decoration"></div>
                </div>

                <div className="info-content">
                  {/* Office Address */}
                  <div className="info-item">
                    <div className="info-icon-wrapper">
                      <div className="info-icon">
                        <MdLocationPin size={22} />
                      </div>
                    </div>
                    <div className="info-details">
                      <h4>{translate("officeAdd")}</h4>
                      <p>{systemsettings?.company_address}</p>
                    </div>
                  </div>

                  {/* Phone Numbers */}
                  <div className="info-item">
                    <div className="info-icon-wrapper">
                      <div className="info-icon">
                        <FiPhoneCall size={20} />
                      </div>
                    </div>
                    <div className="info-details">
                      <h4>{translate("tele")}</h4>
                      <a href={`tel:${systemsettings?.company_tel1}`}>
                        {systemsettings?.company_tel1}
                      </a>
                      {systemsettings?.company_tel2 && (
                        <a href={`tel:${systemsettings?.company_tel2}`}>
                          {systemsettings?.company_tel2}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="info-item">
                    <div className="info-icon-wrapper">
                      <div className="info-icon">
                        <FiMail size={20} />
                      </div>
                    </div>
                    <div className="info-details">
                      <h4>{translate("emailUs")}</h4>
                      <a href={`mailto:${systemsettings?.company_email}`}>
                        {systemsettings?.company_email}
                      </a>
                    </div>
                  </div>

                  {/* Social Media */}
                  {(systemsettings?.facebook_id ||
                    systemsettings?.instagram_id ||
                    systemsettings?.twitter_id ||
                    systemsettings?.youtube_id) && (
                    <div className="social-section">
                      <h4>{translate("followUs")}</h4>
                      <div className="social-grid">
                        {systemsettings?.facebook_id && (
                          <a
                            href={systemsettings.facebook_id}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link facebook"
                          >
                            <PiFacebookLogoBold size={22} />
                          </a>
                        )}
                        {systemsettings?.instagram_id && (
                          <a
                            href={systemsettings.instagram_id}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link instagram"
                          >
                            <BsInstagram size={22} />
                          </a>
                        )}
                        {systemsettings?.youtube_id && (
                          <a
                            href={systemsettings.youtube_id}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link youtube"
                          >
                            <FaYoutube size={22} />
                          </a>
                        )}
                        {systemsettings?.twitter_id && (
                          <a
                            href={systemsettings.twitter_id}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link twitter"
                          >
                            <FaXTwitter size={22} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Decorative Elements */}
                <div className="info-decoration">
                  <div className="decoration-circle"></div>
                  <div className="decoration-circle"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="map-section">
            <div className="map-container">
              <iframe
                src={systemsettings?.iframe_link}
                title="Office Location"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactUS;