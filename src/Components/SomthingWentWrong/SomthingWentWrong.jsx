"use client"
import React from "react";
import { FiAlertCircle } from "react-icons/fi";
import { translate } from "@/utils/helper";

const SomthingWentWrong = () => {
    return (
        <div className="col-12 d-flex justify-content-center">
            <div
                style={{
                    width: "100%",
                    maxWidth: "640px",
                    margin: "32px auto",
                    padding: "24px",
                    border: "1px solid var(--ds-border)",
                    borderRadius: "var(--ds-radius-lg)",
                    background: "var(--ds-surface)",
                    boxShadow: "var(--ds-shadow)",
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        width: "56px",
                        height: "56px",
                        margin: "0 auto 12px",
                        borderRadius: "999px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--ds-border-light)",
                        color: "var(--primary-color)",
                    }}
                >
                    <FiAlertCircle size={24} />
                </div>
                <h3 style={{ margin: "0 0 8px", color: "var(--ds-text)" }}>
                    {translate("oppsSomthingWentWrong")}
                </h3>
                <p style={{ margin: 0, color: "var(--ds-muted)" }}>
                    Please check your internet connection and try again.
                </p>
            </div>
        </div>
    );
};

export default SomthingWentWrong;
