import React from "react";
import { translate } from "@/utils/helper";

const SubscriptionHeader = () => {
  return (
    <header className="subscription-plan-header">
      <p className="subscription-plan-header__eyebrow">{translate("subscriptionPlan")}</p>
      <h1 className="subscription-plan-header__title">
        {translate("chooseA")}{" "}
        <span className="subscription-plan-header__title-accent">{translate("plan")}</span>{" "}
        {translate("thatsRightForYou")}
      </h1>
    </header>
  );
};

export default SubscriptionHeader;
