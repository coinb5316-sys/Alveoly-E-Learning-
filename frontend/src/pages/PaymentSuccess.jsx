// pages/PaymentSuccess.jsx - Updated to handle program selection redirect
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import { Loader2, CheckCircle, XCircle, Crown } from "lucide-react";
import toast from "react-hot-toast";

const PaymentSuccess = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { setUser, user } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [planTitle, setPlanTitle] = useState("");
  const [requiresProgram, setRequiresProgram] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const reference = params.get("reference");

    if (!reference) {
      setError("No payment reference found");
      setVerifying(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        console.log("Verifying payment with reference:", reference);
        const res = await API.get(`/payments/verify?reference=${reference}`);
        console.log("Verification response:", res.data);
        
        // Refresh user data to get updated plan
        const userRes = await API.get("/auth/me");
        setUser(userRes.data);
        
        // Check if user has program selected
        const hasProgram = userRes.data?.programId && userRes.data?.courseId;
        setRequiresProgram(!hasProgram);
        
        if (res.data.success === true || 
            res.data.message === "Plan activated successfully" || 
            res.data.message === "Subject unlocked successfully") {
          setSuccess(true);
          setPlanTitle(res.data.planTitle || "Plan");
          
          // Start countdown redirect
          const interval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                // Redirect based on whether user has a program
                if (!hasProgram) {
                  navigate("/select-program");
                  toast.info("Please select your program to continue");
                } else {
                  navigate("/student/dashboard");
                }
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
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
  }, [search, navigate, setUser]);

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-6" />
        <h2 className="text-2xl font-semibold text-gray-900">Verifying Payment...</h2>
        <p className="text-gray-500 mt-3">Please wait while we confirm your payment.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="bg-green-100 rounded-full p-4 mb-6">
          <CheckCircle className="h-20 w-20 text-green-600" />
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-3 mb-4">
          <Crown className="h-12 w-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-green-600 mb-3">Payment Successful! 🎉</h2>
        <p className="text-gray-700 text-lg mb-2 text-center max-w-md">
          Your {planTitle || "plan"} has been activated!
        </p>
        <p className="text-gray-500 mb-4 text-center max-w-md">
          {requiresProgram 
            ? "Please select your program to start learning." 
            : "You now have full access to all learning materials in your plan."}
        </p>
        <p className="text-sm text-gray-400">Redirecting in {countdown} seconds...</p>
        <button
          onClick={() => {
            if (requiresProgram) {
              navigate("/select-program");
              toast.info("Please select your program to continue");
            } else {
              navigate("/student/dashboard");
            }
          }}
          className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
        >
          {requiresProgram ? "Select Program Now" : "Go to Dashboard"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-red-100 rounded-full p-4 mb-6">
        <XCircle className="h-20 w-20 text-red-600" />
      </div>
      <h2 className="text-3xl font-bold text-red-600 mb-3">Payment Failed</h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">{error || "Something went wrong"}</p>
      <button
        onClick={() => navigate("/pricing")}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Back to Plans
      </button>
    </div>
  );
};

export default PaymentSuccess;