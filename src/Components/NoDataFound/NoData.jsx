"use client";
import React from "react";
import { translate } from "@/utils/helper";
import { FiInbox } from "react-icons/fi";

const NoData = () => {
  return (
    <div className="no-data-found">
      <div className="no-data-found-icon">
        <FiInbox size={48} strokeWidth={1.5} />
      </div>
      <h3 className="no-data-found-title">{translate("noData")}</h3>
      <p className="no-data-found-text">{translate("noDatatext")}</p>
    </div>
  );
};

export default NoData;
