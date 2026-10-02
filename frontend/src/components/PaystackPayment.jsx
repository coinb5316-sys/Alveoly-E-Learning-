// components/PaystackPayment.jsx - COMPLETE UPDATED VERSION
import React, { useState, useEffect } from "react";
import { FaSpinner, FaLock, FaDollarSign } from "react-icons/fa";
import axios from "../api/axios";
import toast from "react-hot-toast";

// ================= CONSTANTS =================
const FALLBACK_USD_TO_GHS = 11.74;   // ← Updated to current live rate
const MIN_REASONABLE_RATE = 5.0;
const MAX_REASONABLE_RATE = 30.0;

const PaystackPayment = ({ 
  plan, 
  onSuccess, 
  exchangeRate: propExchangeRate,
  amountInGHS: propAmountInGHS 
}) => {
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(propExchangeRate || null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState(null);

  // ================= FETCH EXCHANGE RATE =================
  useEffect(() => {
    if (!propExchangeRate) {
      fetchExchangeRate();
    } else {
      setExchangeRate(propExchangeRate);
    }
  }, [propExchangeRate]);

  const fetchExchangeRate = async () => {
    try {
      setRateLoading(true);
      setRateError(null);

      const apis = [
        {
          url: "https://open.er-api.com/v6/latest/USD",
          extract: (data) => data?.rates?.GHS,
        },
        {
          url: "https://api.exchangerate-api.com/v4/latest/USD",
          extract: (data) => data?.rates?.GHS,
        },
      ];

      let rate = null;
      let failedApis = [];

      for (const api of apis) {
        try {
          const response = await fetch(api.url, { cache: "no-store" });
          if (!response.ok) {
            failedApis.push(`${api.url} (HTTP ${response.status})`);
            continue;
          }
          const data = await response.json();
          const extractedRate = api.extract(data);

          console.log(`📡 [PaystackPayment] ${api.url} → GHS = ${extractedRate}`);

          if (
            extractedRate &&
            extractedRate >= MIN_REASONABLE_RATE &&
            extractedRate <= MAX_REASONABLE_RATE
          ) {
            rate = extractedRate;
            break;
          } else if (extractedRate) {
            failedApis.push(`${api.url} (rate ${extractedRate} out of range)`);
          } else {
            failedApis.push(`${api.url} (no GHS in response)`);
          }
        } catch (err) {
          failedApis.push(`${api.url} (${err.message})`);
          continue;
        }
      }

      if (rate) {
        setExchangeRate(rate);
        console.log(`✅ [PaystackPayment] Exchange rate loaded: 1 USD = ${rate} GHS`);
      } else {
        console.warn(
          `⚠️ [PaystackPayment] All exchange rate APIs failed. Failed: ${failedApis.join(", ")}. Using fallback ${FALLBACK_USD_TO_GHS}`
        );
        setExchangeRate(FALLBACK_USD_TO_GHS);
        setRateError("Using fallback rate");
      }
    } catch (err) {
      console.error("❌ [PaystackPayment] Exchange rate fetch error:", err);
      setExchangeRate(FALLBACK_USD_TO_GHS);
      setRateError("Using fallback rate");
    } finally {
      setRateLoading(false);
    }
  };

  // ================= CALCULATE GHS AMOUNT =================
  const calculateGHSAmount = () => {
    if (propAmountInGHS && parseFloat(propAmountInGHS) > 0) {
      return parseFloat(propAmountInGHS);
    }
    const usdPrice = parseFloat(plan?.price) || 0;
    const rate = exchangeRate || FALLBACK_USD_TO_GHS;
    return usdPrice * rate;
  };

  // ================= FORMATTERS =================
  const formatGHS = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return "GH₵0.00";
    return `GH₵${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatUSD = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return "$0.00";
    return `$${num.toFixed(2)}`;
  };

  // ================= HANDLE PAYMENT =================
  const handlePayment = async () => {
    try {
      setLoading(true);

      const ghsAmount = calculateGHSAmount();
      const rate = exchangeRate || FALLBACK_USD_TO_GHS;

      if (ghsAmount <= 0) {
        toast.error("Invalid payment amount");
        setLoading(false);
        return;
      }

      console.log("💳 [PaystackPayment] Sending to backend:", {
        planName: plan?.title || plan?.name,
        priceUSD: plan?.price,
        amountInGHS: ghsAmount,
        rate,
      });

      const res = await axios.post("/payments/initiate-plan", {
        planId: plan._id,
        amountInGHS: parseFloat(ghsAmount.toFixed(2)),
        exchangeRate: parseFloat(rate.toFixed(4)),
        priceUSD: parseFloat(plan.price),
        currency: "GHS",
      });

      if (res.data?.amountChargedGHS) {
        console.log(
          `✅ [PaystackPayment] Backend charged GH₵${res.data.amountChargedGHS} (rate: ${res.data.exchangeRateUsed})`
        );
      }

      if (res.data.authorizationUrl) {
        window.location.href = res.data.authorizationUrl;
      } else if (res.data.success && res.data.redirectUrl) {
        window.location.href = res.data.redirectUrl;
      } else {
        toast.error(res.data.message || "Failed to initiate payment");
        setLoading(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(
        err.response?.data?.message || "Payment failed: Please try again"
      );
      setLoading(false);
    }
  };

  const ghsAmount = calculateGHSAmount();
  const isLoading = loading || rateLoading;

  return (
    <div className="space-y-3">
      {/* Payment Summary */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Price (USD)</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatUSD(plan?.price)}
          </span>
        </div>

        {exchangeRate && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Exchange Rate
              </span>
              <span className="font-medium text-gray-600 dark:text-gray-300">
                1 USD = {exchangeRate.toFixed(2)} GHS
              </span>
            </div>
            <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                You Pay (GHS)
              </span>
              <span className="font-bold text-green-600 dark:text-green-400 text-base">
                {formatGHS(ghsAmount)}
              </span>
            </div>
          </>
        )}

        {rateError && (
          <p className="text-xs text-amber-500 text-center pt-1">
            ⚠ {rateError}
          </p>
        )}
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={isLoading || !plan || ghsAmount <= 0}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <FaSpinner className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <FaLock className="h-4 w-4" />
            <span>
              Pay {exchangeRate ? formatGHS(ghsAmount) : `$${plan?.price || 0}`}
            </span>
          </>
        )}
      </button>

      <p className="text-xs text-center text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
        <FaLock className="h-3 w-3" />
        Secure payment powered by Paystack • Charged in GHS
      </p>
    </div>
  );
};

export default PaystackPayment;