"use client";
import React from "react";
import { Card } from "react-bootstrap";
import Image from "next/image";
import { BadgeSvg, placeholderImage, translate, truncate } from "@/utils/helper";
import { FiHome, FiBriefcase, FiStar } from "react-icons/fi";

const AgentCard = ({ ele, handlecheckPremiumUserAgent }) => {
  return (
    <Card 
      id="main_agent_card" 
      onClick={(e) => handlecheckPremiumUserAgent(e, ele)}
      className="agent-card"
    >
      <div className="agent-card-inner">
        {/* Background Pattern */}
        <div className="card-bg-pattern"></div>
        
        {/* Premium Badge */}
        {ele?.is_premium && (
          <div className="premium-badge">
            <FiStar size={14} />
            <span>Premium</span>
          </div>
        )}

        <Card.Body>
          <div className="agent-card-content">
            {/* Profile Image with Verification Badge */}
            <div className="agent-image-wrapper">
              <div className="agent-image-container">
                <Image
                  loading="lazy"
                  src={ele?.profile || placeholderImage}
                  className="agent-profile"
                  width={100}
                  height={100}
                  alt={ele?.name || "Agent profile"}
                  onError={(e) => {
                    e.target.src = placeholderImage;
                  }}
                />
                {ele?.is_verified && (
                  <span className="verified-badge">
                    {BadgeSvg}
                  </span>
                )}
              </div>
            </div>

            {/* Agent Info */}
            <div className="agent-info">
              <h3 className="agent-name">
                {truncate(ele?.name, 15)}
              </h3>
              
              {ele?.designation && (
                <p className="agent-designation">{ele.designation}</p>
              )}
            </div>

            {/* Stats Divider */}
            <div className="stats-divider"></div>

            {/* Property/Projects Stats */}
            <div className="agent-stats">
              {ele?.property_count > 0 && (
                <div className="stat-item">
                  <div className="stat-icon property-icon">
                    <FiHome size={16} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{ele.property_count}</span>
                    <span className="stat-label">
                      {ele.property_count > 1 ? translate("properties") : translate("property")}
                    </span>
                  </div>
                </div>
              )}

              {ele?.property_count > 0 && ele?.projects_count > 0 && (
                <div className="stat-separator"></div>
              )}

              {ele?.projects_count > 0 && (
                <div className="stat-item">
                  <div className="stat-icon project-icon">
                    <FiBriefcase size={16} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{ele.projects_count}</span>
                    <span className="stat-label">
                      {ele.projects_count > 1 ? translate("projects") : translate("project")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* View Profile CTA */}
            <div className="view-profile-cta">
              <span className="cta-text">{translate("viewProfile")}</span>
              <div className="cta-arrow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </Card.Body>
      </div>
    </Card>
  );
};

export default AgentCard;