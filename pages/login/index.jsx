import React from "react";
import Meta from "@/Components/Seo/Meta";
import dynamic from "next/dynamic";

const LoginModal = dynamic(
  () => import("@/Components/LoginModal/LoginModal"),
  { ssr: false }
);

const LoginPage = () => {
  return (
    <>
      <Meta
        title="Login / Register"
        description="Sign in or create an account"
        pathName={typeof window !== "undefined" ? window.location?.href : "/login"}
      />
      <LoginModal asPage />
    </>
  );
};

export default LoginPage;
