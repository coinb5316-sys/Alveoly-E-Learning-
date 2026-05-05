// pages/ContentPaymentSuccess.jsx - Fixed redirect to lessons
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";
import {
  Loader2,
  BookOpen,
  Sparkles,
  PartyPopper,
  ArrowRight,
  XCircle
} from "lucide-react";

const ContentPaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const verifyPayment = async () => {
      const urlParams = new URLSearchParams(location.search);
      let reference = urlParams.get('reference');
      let contentIdParam = urlParams.get('contentId');
      
      console.log("Payment callback received:", { reference, contentId: contentIdParam });
      
      // Also check localStorage for payment info
      if (!reference) {
        reference = localStorage.getItem('pending_payment_reference');
        contentIdParam = localStorage.getItem('current_content_id');
      }
      
      if (!reference) {
        toast.error("No payment reference found");
        setTimeout(() => navigate('/student/dashboard'), 2000);
        return;
      }
      
      try {
        const res = await axios.post("/content-payments/verify", {
          reference: reference,
          contentId: contentIdParam,
        });
        
        console.log("Verification response:", res.data);
        
        if (res.data.success) {
          setSuccess(true);
          toast.success("Payment successful! Content unlocked.");
          
          // Clear storage
          localStorage.removeItem('pending_payment_reference');
          localStorage.removeItem('payment_session_id');
          
          // Get the subjectId from localStorage and redirect
          const subjectId = localStorage.getItem('current_subject_id');
          const contentTitle = localStorage.getItem('current_content_title');
          
          console.log("Redirecting to lessons page with subjectId:", subjectId);
          
          // Start countdown then redirect
          let timer = 3;
          const interval = setInterval(() => {
            timer--;
            setCountdown(timer);
            if (timer <= 0) {
              clearInterval(interval);
              // Clear current content data
              localStorage.removeItem('current_subject_id');
              localStorage.removeItem('current_content_id');
              localStorage.removeItem('current_content_title');
              // Redirect to lessons page with the subjectId
              if (subjectId) {
                navigate(`/student/lessons/${subjectId}`);
              } else {
                navigate('/student/courses');
              }
            }
          }, 1000);
        } else {
          setSuccess(false);
          toast.error(res.data.message || "Payment verification failed");
          setTimeout(() => {
            const subjectId = localStorage.getItem('current_subject_id');
            if (subjectId) {
              navigate(`/student/lessons/${subjectId}`);
            } else {
              navigate('/student/courses');
            }
          }, 3000);
        }
      } catch (err) {
        console.error("Verification error:", err);
        setSuccess(false);
        toast.error(err.response?.data?.message || "Failed to verify payment");
        setTimeout(() => {
          const subjectId = localStorage.getItem('current_subject_id');
          if (subjectId) {
            navigate(`/student/lessons/${subjectId}`);
          } else {
            navigate('/student/courses');
          }
        }, 3000);
      } finally {
        setVerifying(false);
      }
    };
    
    verifyPayment();
  }, [location, navigate]);

  const handleContinue = () => {
    const subjectId = localStorage.getItem('current_subject_id');
    localStorage.removeItem('current_subject_id');
    localStorage.removeItem('current_content_id');
    localStorage.removeItem('current_content_title');
    
    if (subjectId) {
      navigate(`/student/lessons/${subjectId}`);
    } else {
      navigate('/student/courses');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="absolute top-0 -left-4 w-32 h-32 bg-green-500 rounded-full opacity-10 blur-2xl" />
        <div className="absolute bottom-0 -right-4 w-32 h-32 bg-blue-500 rounded-full opacity-10 blur-2xl" />
        
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          <div className={`h-2 ${verifying ? 'bg-gradient-to-r from-blue-600 to-purple-600' : success ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-red-600 to-rose-600'}`} />
          
          <div className="p-8 text-center">
            <div className="mb-6">
              {verifying ? (
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <Loader2 className="h-10 w-10 text-white animate-spin" />
                </div>
              ) : success ? (
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg animate-scaleIn">
                  <PartyPopper className="h-10 w-10 text-white" />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                  <XCircle className="h-10 w-10 text-white" />
                </div>
              )}
            </div>

            {verifying ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Verifying Payment
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Please wait while we confirm your payment...
                </p>
              </>
            ) : success ? (
              <>
                <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  Payment Successful!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Your content has been unlocked successfully.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/30 rounded-full text-sm text-green-600 dark:text-green-400">
                  <Sparkles className="h-4 w-4" />
                  Redirecting to lessons in {countdown} seconds...
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                  Payment Failed
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We couldn't verify your payment. Please contact support.
                </p>
              </>
            )}

            <div className="mt-8 flex gap-3 justify-center">
              {!verifying && (
                <button
                  onClick={handleContinue}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25"
                >
                  <BookOpen className="h-4 w-4" />
                  {success ? "Continue to Lessons" : "Back to Lessons"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
              Need help? Contact our support team at alveolyelearning@gmail.com
            </p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default ContentPaymentSuccess;