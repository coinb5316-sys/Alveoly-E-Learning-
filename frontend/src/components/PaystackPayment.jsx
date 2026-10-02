// components/PaystackPayment.jsx - COMPLETE UPDATED VERSION (GHS Conversion)
import React, { useState, useEffect } from "react";
import { FaSpinner, FaLock, FaDollarSign } from "react-icons/fa";
import axios from "../api/axios";
import toast from "react-hot-toast";

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

  // Fallback exchange rate
  const FALLBACK_USD_TO_GHS = 15.50;

  // Fetch exchange rate if not provided as prop
  useEffect(() => {
    if (!propExchangeRate) {
      fetchExchangeRate();
    }
  }, [propExchangeRate]);

  const fetchExchangeRate = async () => {
    try {
      setRateLoading(true);
      setRateError(null);

      const apis = [
        {
          url: "https://api.exchangerate-api.com/v4/latest/USD",
          extract: (data) => data.rates?.GHS
        },
        {
          url: "https://open.er-api.com/v6/latest/USD",
          extract: (data) => data.rates?.GHS
        },
        {
          url: "https://api.frankfurter.app/latest?from=USD&to=GHS",
          extract: (data) => data.rates?.GHS
        }
      ];

      let rate = null;

      for (const api of apis) {
        try {
          const response = await fetch(api.url);
          if (response.ok) {
            const data = await response.json();
            const extractedRate = api.extract(data);
            if (extractedRate && extractedRate > 0) {
              rate = extractedRate;
              break;
            }
          }
        } catch (err) {
          continue;
        }
      }

      if (rate) {
        setExchangeRate(rate);
      } else {
        setExchangeRate(FALLBACK_USD_TO_GHS);
        setRateError("Using fallback rate");
      }
    } catch (err) {
      console.error("Error fetching exchange rate:", err);
      setExchangeRate(FALLBACK_USD_TO_GHS);
      setRateError("Using fallback rate");
    } finally {
      setRateLoading(false);
    }
  };

  // Calculate GHS amount
  const calculateGHSAmount = () => {
    // If amountInGHS provided directly, use it
    if (propAmountInGHS) {
      return parseFloat(propAmountInGHS);
    }
    
    // Otherwise convert from USD
    const usdPrice = parseFloat(plan?.price) || 0;
    const rate = exchangeRate || FALLBACK_USD_TO_GHS;
    return usdPrice * rate;
  };

  // Format GHS for display
  const formatGHS = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return "GH₵0.00";
    return `GH₵${num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Format USD for display
  const formatUSD = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return "$0.00";
    return `$${num.toFixed(2)}`;
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      const ghsAmount = calculateGHSAmount();
      const rate = exchangeRate || FALLBACK_USD_TO_GHS;

      // Validate amount
      if (ghsAmount <= 0) {
        toast.error("Invalid payment amount");
        return;
      }

      // Send payment initiation with both USD and GHS info
      const res = await axios.post("/payments/initiate-plan", {
        planId: plan._id,
        // Send the GHS amount for accurate charging
        amountInGHS: parseFloat(ghsAmount.toFixed(2)),
        // Send exchange rate used for record keeping
        exchangeRate: parseFloat(rate.toFixed(4)),
        // Send USD price for reference
        priceUSD: parseFloat(plan.price),
        currency: "GHS"
      });

      // Check if we got an authorization URL
      if (res.data.authorizationUrl) {
        // Redirect to Paystack checkout
        window.location.href = res.data.authorizationUrl;
      } else if (res.data.success && res.data.redirectUrl) {
        window.location.href = res.data.redirectUrl;
      } else {
        toast.error(res.data.message || "Failed to initiate payment");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(
        err.response?.data?.message || 
        "Payment failed: Please try again"
      );
    } finally {
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
              <span className="text-gray-500 dark:text-gray-400">Exchange Rate</span>
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

      {/* Secure note */}
      <p className="text-xs text-center text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
        <FaLock className="h-3 w-3" />
        Secure payment powered by Paystack
      </p>
    </div>
  );
};

export default PaystackPayment;