import { formatDuration, translate } from "@/utils/helper";
import { Tooltip } from "antd";
import Link from "next/link";
import React, { useState } from "react";
import { BiSolidCheckCircle, BiSolidXCircle } from "react-icons/bi";
import { FaUpload, FaCrown, FaClock } from "react-icons/fa";
import { FiInfo, FiArrowRight } from "react-icons/fi";
import { MdVerified, MdPending, MdError } from "react-icons/md";
import UploadReceiptModal from "../User/UploadReceiptModal";

const SubscriptionCard = ({
  elem,
  subscribePayment,
  systemsettings,
  allFeatures,
}) => {
  const isActive = elem.is_active === 1;
  const isReview = elem.package_status === "review";
  const isRejected = elem.package_status === "rejected";
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  let packageClass = "other-package";
  if (isActive) packageClass = "active-package";
  else if (isReview) packageClass = "review-package";

  return (
    <article className={`subscription-card ${packageClass}`} aria-label={elem?.name}>
      {/* Top accent – paid plans */}
      {elem.package_type === "paid" && <div className="subscription-card__accent" aria-hidden />}

      {/* Header: badge, name, price, duration */}
      <header className="card-header">
        <div className="package-type-badge">
          {elem.package_type === "paid" ? (
            <span className="premium-badge">
              <FaCrown size={12} aria-hidden />
              {translate("premium")}
            </span>
          ) : (
            <span className="free-badge">{translate("free")}</span>
          )}
        </div>
        <h3 className="package-name">{elem?.name}</h3>
        <div className="package-price">
          {elem.package_type === "paid" ? (
            <>
              <span className="currency">{systemsettings?.currency_symbol}</span>
              <span className="amount">{elem.price}</span>
            </>
          ) : (
            <span className="free-text">{translate("free")}</span>
          )}
        </div>
        <div className="package-duration">
          <FaClock className="duration-icon" size={12} aria-hidden />
          <span>{formatDuration(elem.duration)}</span>
        </div>
      </header>

      {/* Body: features list */}
      <div className="card-body">
        <h4 className="features-title">{translate("packageFeatures")}</h4>
        <ul className="features-list" role="list">
          <li className="feature-item">
            <span className={`feature-icon-wrapper assigned`} aria-hidden>
              <BiSolidCheckCircle className="feature-icon assigned" size={16} />
            </span>
            <span className="feature-content">
              <span className="feature-name">{translate("validity")}</span>
              <span className="feature-value">{formatDuration(elem.duration)}</span>
            </span>
          </li>
          {allFeatures.map((feature, index) => {
            const assignedFeature = elem.features?.find((f) => f.id === feature.id);
            return (
              <li className="feature-item" key={feature.id ?? index}>
                <span className={`feature-icon-wrapper ${assignedFeature ? "assigned" : "not-assigned"}`} aria-hidden>
                  {assignedFeature ? (
                    <BiSolidCheckCircle className="feature-icon assigned" size={16} />
                  ) : (
                    <BiSolidXCircle className="feature-icon not-assigned" size={16} />
                  )}
                </span>
                <span className="feature-content">
                  <span className="feature-name">{feature?.name}</span>
                  <span className={`feature-value ${assignedFeature ? "assigned" : "not-assigned"}`}>
                    {assignedFeature
                      ? assignedFeature.limit_type === "limited"
                        ? assignedFeature.limit
                        : translate("unlimited")
                      : translate("notIncluded")}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer: status or CTA */}
      <footer className="card-footer">
        {isActive && (
          <div className="card-footer__status active-status">
            <span className="status-badge active">
              <MdVerified size={16} aria-hidden />
              {translate("active")}
            </span>
            <Tooltip title={translate("activePackageDescription")}>
              <span className="info-icon-wrap" tabIndex={0} role="button" aria-label="Info">
                <FiInfo className="info-icon" size={16} />
              </span>
            </Tooltip>
          </div>
        )}
        {isReview && (
          <div className="card-footer__status review-status">
            <span className="status-badge review">
              <MdPending size={16} aria-hidden />
              {translate("pendingVerification")}
            </span>
            <div className="card-footer__actions">
              <Tooltip title={translate("pendingVerificationDescription")}>
                <span className="info-icon-wrap" tabIndex={0} role="button" aria-label="Info">
                  <FiInfo className="info-icon" size={16} />
                </span>
              </Tooltip>
              <Link href="/user/transaction-history" className="view-btn">
                <span>{translate("view")}</span>
                <FiArrowRight size={14} aria-hidden />
              </Link>
            </div>
          </div>
        )}
        {isRejected && (
          <div className="card-footer__status rejected-status">
            <span className="status-badge rejected">
              <MdError size={16} aria-hidden />
              {translate("verificationRejected")}
            </span>
            <div className="card-footer__actions">
              <Tooltip title={translate("rejectedVerificationDescription")}>
                <span className="info-icon-wrap" tabIndex={0} role="button" aria-label="Info">
                  <FiInfo className="info-icon" size={16} />
                </span>
              </Tooltip>
              <Tooltip title={translate("reuploadReceipt")}>
                <button type="button" className="reupload-btn" onClick={() => setIsUploadModalOpen(true)}>
                  <FaUpload size={14} aria-hidden />
                  <span>{translate("reupload")}</span>
                </button>
              </Tooltip>
            </div>
          </div>
        )}
        {!isActive && !isReview && !isRejected && (
          <button type="button" className="find" onClick={(e) => subscribePayment(e, elem)}>
            <span>{translate("subscribe")}</span>
            <FiArrowRight size={16} aria-hidden />
          </button>
        )}
      </footer>

      <UploadReceiptModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        transactionId={elem?.payment_transaction_id}
      />
    </article>
  );
};

export default SubscriptionCard;
