// pages/PaymentSuccess.jsx - FIXED for plan payments
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const PaymentSuccess = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const reference = params.get("reference");
    const courseId = params.get("courseId");

    if (!reference) {
      setError("No payment reference found");
      setVerifying(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        console.log("Verifying payment with reference:", reference);
        const res = await axios.get(`/payments/verify?reference=${reference}`);
        console.log("Verification response:", res.data);
        
        if (res.data.message === "Plan activated successfully" || res.data.message === "Subject unlocked successfully") {
          setSuccess(true);
          setTimeout(() => {
            if (courseId) {
              navigate(`/student/subjects?course=${courseId}`);
            } else {
              navigate("/student/plans");
            }
          }, 2000);
        } else {
          setError(res.data.message || "Payment verification failed");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError(err.response?.data?.message || "Failed to verify payment");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [search, navigate]);

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Verifying Payment...</h2>
        <p className="text-gray-500 mt-2">Please wait while we confirm your payment.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-green-100 rounded-full p-3 mb-4">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">Your plan has been activated successfully.</p>
        <p className="text-gray-500">Redirecting you to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-red-100 rounded-full p-3 mb-4">
        <XCircle className="h-16 w-16 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
      <p className="text-gray-600 mb-4">{error || "Something went wrong"}</p>
      <button
        onClick={() => navigate("/student/plans")}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Back to Plans
      </button>
    </div>
  );
};

export default PaymentSuccess;