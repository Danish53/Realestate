import { formatDuration, translate } from "@/utils/helper";
import { Tooltip } from "antd";
import Link from "next/link";
import React, { useState } from "react";
import { BiSolidCheckCircle, BiSolidXCircle } from "react-icons/bi";
import { FaUpload, FaCrown, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { FiInfo, FiArrowRight, FiRefreshCw } from "react-icons/fi";
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
  if (isActive) {
    packageClass = "active-package";
  } else if (isReview) {
    packageClass = "review-package";
  }

  const handleUploadReceipt = (id) => {
    setIsUploadModalOpen(true);
  };

  return (
    <div className={`subscription-card mt-3 ${packageClass}`}>
      {/* Card Header */}
      <div className="card-header">
        <div className="package-type-badge">
          {elem.package_type === "paid" ? (
            <span className="premium-badge">
              <FaCrown size={14} />
              {translate("premium")}
            </span>
          ) : (
            <span className="free-badge">
              {translate("free")}
            </span>
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
          <FaClock className="duration-icon" />
          <span>{formatDuration(elem.duration)}</span>
        </div>
      </div>

      {/* Card Body - Features */}
      <div className="card-body">
        <h4 className="features-title">{translate("packageFeatures")}</h4>
        
        <div className="features-list">
          {/* Validity Feature */}
          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <BiSolidCheckCircle className="feature-icon" />
            </div>
            <div className="feature-content">
              <span className="feature-name">{translate("validity")}</span>
              <span className="feature-value">{formatDuration(elem.duration)}</span>
            </div>
          </div>

          {/* Dynamic Features */}
          {allFeatures.map((feature, index) => {
            const assignedFeature = elem.features.find(
              (f) => f.id === feature.id
            );

            return (
              <div className="feature-item" key={index}>
                <div className={`feature-icon-wrapper ${assignedFeature ? 'assigned' : 'not-assigned'}`}>
                  {assignedFeature ? (
                    <BiSolidCheckCircle className="feature-icon assigned" />
                  ) : (
                    <BiSolidXCircle className="feature-icon not-assigned" />
                  )}
                </div>
                <div className="feature-content">
                  <span className="feature-name">{feature?.name}</span>
                  <span className={`feature-value ${assignedFeature ? 'assigned' : 'not-assigned'}`}>
                    {assignedFeature
                      ? assignedFeature.limit_type === "limited"
                        ? assignedFeature.limit
                        : translate("unlimited")
                      : translate("notIncluded")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Footer - Actions */}
      <div className="card-footer">
        {isActive ? (
          <div className="active-status">
            <div className="status-badge active">
              <MdVerified size={18} />
              <span>{translate("active")}</span>
            </div>
            <Tooltip title={translate("activePackageDescription")}>
              <FiInfo className="info-icon" size={18} />
            </Tooltip>
          </div>
        ) : isReview ? (
          <div className="review-status">
            <div className="status-badge review">
              <MdPending size={18} />
              <span>{translate("pendingVerification")}</span>
            </div>
            <div className="review-actions">
              <Tooltip title={translate("pendingVerificationDescription")}>
                <FiInfo className="info-icon" size={18} />
              </Tooltip>
              <Link href="/user/transaction-history">
                <button className="view-btn">
                  <span>{translate("view")}</span>
                  <FiArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        ) : isRejected ? (
          <div className="rejected-status">
            <div className="status-badge rejected">
              <MdError size={18} />
              <span>{translate("verificationRejected")}</span>
            </div>
            <div className="rejected-actions">
              <Tooltip title={translate("rejectedVerificationDescription")}>
                <FiInfo className="info-icon" size={18} />
              </Tooltip>
              <Tooltip title={translate("reuploadReceipt")}>
                <button
                  className="reupload-btn"
                  onClick={() => handleUploadReceipt(elem.id)}
                >
                  <FaUpload size={16} />
                  <span>{translate("reupload")}</span>
                </button>
              </Tooltip>
            </div>
          </div>
        ) : (
          <button
            className="find"
            onClick={(e) => subscribePayment(e, elem)}
          >
            <span>{translate("subscribe")}</span>
            <FiArrowRight size={18} />
          </button>
        )}
      </div>

      {/* Upload Receipt Modal */}
      <UploadReceiptModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        transactionId={elem?.payment_transaction_id}
      />
    </div>
  );
};

export default SubscriptionCard;