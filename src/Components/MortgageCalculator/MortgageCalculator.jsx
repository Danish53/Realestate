"use client";
import {
  checkPackageLimitApi,
  MortgagegetAllProjectsLoanCalApi,
} from "@/store/actions/campaign";
import { settingsData } from "@/store/reducer/settingsSlice";
import { formatNumberWithCommas, translate } from "@/utils/helper";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import SemiDonutChart from "../SemiDonutChart/SemiDonutChart";
import { Modal } from "react-bootstrap";
import CollapsibleTable from "../SemiDonutChart/CollapsibleTable";
import LoginModal from "../LoginModal/LoginModal";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import { checkPackageLimit } from "@/utils/api";
import { PackageTypes } from "@/utils/checkPackages/packageTypes";

const MortgageCalculator = ({ data }) => {
  const systemSettings = useSelector(settingsData);
  const CurrencySymbol = systemSettings?.currency_symbol || "$";
  const isLoggedIn = useSelector((state) => state.User_signup);
  const userCurrentId =
    isLoggedIn && isLoggedIn.data ? isLoggedIn.data.data.id : null;
  const themeColor = systemSettings?.system_color;
  const router = useRouter();

  const minRateInterest = 1;
  const maxRateInterest = 100;
  const maxInterestYears = 30;

  const [interestRate, setInterestRate] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [downPaymentType, setDownPaymentType] = useState("price");
  const [years, setYears] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [totalEmiData, setTotalEmiData] = useState();
  const [totalEmiYearlyData, setTotalEmiYearlyData] = useState([]);

  const handleInputChangeforInterest = (event) => {
    let value = parseFloat(event.target.value.trim()) || 0;
    if (value > maxRateInterest) {
      toast.error(`Interest rate cannot exceed ${maxRateInterest}%`);
      value = maxRateInterest;
    }
    setInterestRate(value);
  };

  const handleInputChangeforDownPayment = (event) => {
    let value = parseFloat(event.target.value.trim()) || 0;

    if (downPaymentType === "price") {
      if (value > data?.price) {
        toast.error(
          `Down payment cannot exceed property price of ${CurrencySymbol}${data.price}`
        );
        value = data.price;
      }
    } else if (downPaymentType === "rate") {
      if (value > 100) {
        toast.error("Down payment rate cannot exceed 100%");
        value = 100;
      }
    }

    setDownPayment(value);
  };

  const calculatedDownPayment =
    downPaymentType === "price"
      ? downPayment
      : (downPayment / 100) * data?.price;

  const handleInputChangeforYear = (event) => {
    let value = parseInt(event.target.value.trim(), 10) || 1;
    if (value > maxInterestYears) {
      toast.error(`Loan term cannot exceed ${maxInterestYears} years`);
      value = maxInterestYears;
    } else if (value < 1) {
      toast.error("Loan term must be at least 1 year");
      value = 1;
    }
    setYears(value);
  };

  const fetchLoanCalculation = (isFeatureAvailable) => {

    MortgagegetAllProjectsLoanCalApi({
      loan_amount: data?.price,
      down_payment: calculatedDownPayment > 0 ? calculatedDownPayment : "",
      interest_rate: interestRate,
      loan_term_years: years,
      show_all_details: isFeatureAvailable ? 1 : "",
      onSuccess: (res) => {
        setTotalEmiData(res.data.main_total);
        setTotalEmiYearlyData(res.data.yearly_totals);
        setShowModal(true);
      },
      onError: (err) => {
        console.error("Calculation Error:", err);
      },
    });
  };

  const handleCalculate = async () => {
    if (
      downPaymentType === "price" &&
      (downPayment < 0 || downPayment >= data?.price)
    ) {
      toast.error(
        `Down payment should be less than ${CurrencySymbol}${data.price}`
      );
      return;
    }

    if (downPaymentType === "rate" && (downPayment < 0 || downPayment > 100)) {
      toast.error("Down payment rate should be between 0% and 100%");
      return;
    }

    if (interestRate < minRateInterest || interestRate > maxRateInterest) {
      toast.error(
        `Interest rate should be between ${minRateInterest}% and ${maxRateInterest}%`
      );
      return;
    }

    if (years < 1 || years > maxInterestYears) {
      toast.error(
        `Loan term should be between 1 and ${maxInterestYears} years`
      );
      return;
    }

    try {
     const res = await checkPackageLimitApi({
        type: PackageTypes.MORTGAGE_CALCULATOR_DETAIL,
      });
      
      const { feature_available } = res?.data;
      fetchLoanCalculation(feature_available);
    } catch (error) {
      console.error("Error in package limit check:", error);
      toast.error("Unexpected error occurred. Please try again.");
    }
  };

  
  const TotalEMIData = [
    { name: "Principal Amount", value: totalEmiData?.principal_amount },
    { name: "Principal Amount", value: totalEmiData?.principal_amount },
    { name: "Interest Payable", value: totalEmiData?.payable_interest },
  ];

  const COLORS = [themeColor, "#282f39"];

  useEffect(() => {}, [totalEmiData, totalEmiYearlyData]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Mortgage Form Card */}
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-100">
          <span className="text-xl font-bold text-gray-900">{translate("MLC")}</span>
        </div>
        <div className="p-6 flex flex-col gap-5 flex-1">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-gray-700">{translate("propAmount")}</span>
            <div className="bg-gray-50/50 border border-gray-200 rounded-lg p-3 text-gray-900 font-semibold shadow-sm">
              <span>{CurrencySymbol} {formatNumberWithCommas(data?.price)}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-gray-700">{translate("downpayment")}</span>
            <div className="flex items-center gap-0 w-full rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
              <div className="px-3 bg-gray-50 text-gray-500 border-r border-gray-200 font-medium whitespace-nowrap">
                {downPaymentType === "price" ? CurrencySymbol : "%"}
              </div>
              <input
                type="number"
                placeholder={`${translate("EnterDownPayment")}`}
                className="flex-1 w-full bg-transparent p-2.5 outline-none text-gray-900 font-medium"
                value={downPayment}
                onChange={handleInputChangeforDownPayment}
                min={0}
                max={downPaymentType === "rate" ? 100 : data?.price}
              />
              <select
                className="bg-gray-50 text-gray-700 font-medium outline-none p-2.5 border-l border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                value={downPaymentType}
                onChange={(e) => setDownPaymentType(e.target.value)}
              >
                <option value="price">{CurrencySymbol}</option>
                <option value="rate">%</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-gray-700">{translate("intrestRate")}</span>
            <div className="flex items-center gap-0 w-full rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
              <div className="px-3 bg-gray-50 text-gray-500 border-r border-gray-200 font-medium">%</div>
              <input
                type="number"
                placeholder={translate("enterIntrestRate")}
                className="flex-1 w-full bg-transparent p-2.5 outline-none text-gray-900 font-medium"
                value={interestRate}
                onChange={handleInputChangeforInterest}
                min={minRateInterest}
                max={maxRateInterest}
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-gray-700">{translate("years")}</span>
            <div className="flex items-center gap-0 w-full rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
              <div className="px-3 bg-gray-50 text-gray-500 border-r border-gray-200 font-medium">{translate("yrs")}</div>
              <input
                type="number"
                placeholder={translate("enterYears")}
                className="flex-1 w-full bg-transparent p-2.5 outline-none text-gray-900 font-medium"
                value={years}
                onChange={handleInputChangeforYear}
                min={1}
                max={maxInterestYears}
              />
            </div>
          </div>
        </div>
        
        <div className="p-6 pt-0 mt-auto">
          <button 
            type="button" 
            onClick={handleCalculate} 
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-xl shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5"
            aria-label={translate("Calculate")}
          >
            {translate("Calculate")}
          </button>
        </div>
      </div>

      {showModal && (
        <EMIModal
          show={showModal}
          TotalEMIData={TotalEMIData}
          data={totalEmiData}
          handleClose={() => setShowModal(false)}
          COLORS={COLORS}
          totalEmiYearlyData={totalEmiYearlyData}
          router={router}
          userCurrentId={userCurrentId}
          showLoginModal={showLoginModal}
          setShowLoginModal={setShowLoginModal}
        />
      )}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
};

export default MortgageCalculator;

const EMIModal = ({
  show,
  handleClose,
  data,
  TotalEMIData,
  COLORS,
  totalEmiYearlyData,
  router,
  userCurrentId,
  setShowLoginModal,
}) => {
  const handleSubscribe = () => {
    if (userCurrentId) {
      router.push("/subscription-plan");
    } else {
      Swal.fire({
        title: translate("plzLogFirsttoAccess"),
        icon: "warning",
        allowOutsideClick: false,
        showCancelButton: false,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
          cancelButton: "Swal-cancel-buttons",
        },
        confirmButtonText: translate("ok"),
      }).then((result) => {
        if (result.isConfirmed) {
          setShowLoginModal(true);
          handleClose();
        }
      });
    }
  };
  
  return (
    <Modal show={show} onHide={handleClose} centered size="xl" contentClassName="bg-transparent border-0 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 m-0">{translate("MLCEMIData")}</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors focus:outline-none">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {data ? (
            <div className="flex flex-col lg:flex-row gap-8 items-center bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                <div className="w-full lg:w-1/3 flex justify-center">
                  <SemiDonutChart
                    width={350}
                    height={280}
                    stroke={45}
                    data={TotalEMIData}
                    colors={COLORS}
                    totalEmiData={data}
                  />
                </div>

                <div className="w-full lg:w-2/3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-sm font-semibold text-gray-500 block mb-1">{translate("MonthlyEMI")}</span>
                        <span className="text-2xl font-bold text-primary-500 tracking-tight">{formatNumberWithCommas(data?.monthly_emi)}</span>
                    </div>
                    
                    {data?.down_payment && (
                      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <span className="text-sm font-semibold text-gray-500 block mb-1">{translate("downpayment")}</span>
                          <span className="text-2xl font-bold text-gray-900 tracking-tight">{formatNumberWithCommas(data?.down_payment)}</span>
                      </div>
                    )}
                    
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-sm font-semibold text-gray-500 block mb-1">{translate("PrincipalAmount")}</span>
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">{formatNumberWithCommas(data?.principal_amount)}</span>
                    </div>
                    
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-sm font-semibold text-gray-500 block mb-1">{translate("InterestPayable")}</span>
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">{formatNumberWithCommas(data?.payable_interest)}</span>
                    </div>
                  </div>
                </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
                <p className="text-lg">{translate("NoDataAvailable")}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/30">
          {totalEmiYearlyData && totalEmiYearlyData.length > 0 ? (
            <CollapsibleTable data={totalEmiYearlyData} />
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between bg-primary-50/50 p-6 rounded-xl border border-primary-100/50">
              <div className="flex flex-col mb-4 sm:mb-0 text-center sm:text-left">
                <span className="text-lg font-bold text-gray-900 mb-1">{translate("accessTable")}</span>
                <span className="text-sm text-gray-600">{translate("viewTable")}</span>
              </div>
              <button 
                type="button" 
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm hover:shadow transition-all w-full sm:w-auto"
                onClick={handleSubscribe} 
                aria-label={translate("subScribeNow")}
              >
                {translate("subScribeNow")}
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
