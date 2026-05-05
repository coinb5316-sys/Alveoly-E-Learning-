// pages/PlanPaymentSuccess.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { Loader2, CheckCircle, Crown } from "lucide-react";

const PlanPaymentSuccess = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const reference = params.get("reference");

    if (!reference) {
      navigate("/student/plans");
      return;
    }

    const verify = async () => {
      try {
        await axios.get(`/payments/verify?reference=${reference}`);
        
        // Start countdown
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              navigate("/student/plans");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err) {
        console.error(err);
        navigate("/student/plans");
      }
    };

    verify();
  }, [search, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
        <div className="bg-green-100 rounded-full p-3 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-2 w-16 h-16 -mt-10 mx-auto mb-4 flex items-center justify-center shadow-lg">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-4">Your subscription plan has been activated.</p>
        <p className="text-sm text-gray-500">Redirecting in {countdown} seconds...</p>
      </div>
    </div>
  );
};

export default PlanPaymentSuccess;