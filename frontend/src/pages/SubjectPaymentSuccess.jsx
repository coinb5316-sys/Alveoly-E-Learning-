// src/pages/SubjectPaymentSuccess.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { Loader2, CheckCircle, XCircle, BookOpen } from "lucide-react";

const SubjectPaymentSuccess = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [subjectName, setSubjectName] = useState("");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const reference = params.get("reference");
    const courseIdFromUrl = params.get("courseId");
    const subjectIdFromUrl = params.get("subjectId");

    setCourseId(courseIdFromUrl);

    if (!reference) {
      setError("No payment reference found");
      setVerifying(false);
      return;
    }

    // Fetch subject name for better UX
    if (subjectIdFromUrl) {
      axios.get(`/subjects/${subjectIdFromUrl}`)
        .then(res => setSubjectName(res.data.name))
        .catch(err => console.error("Error fetching subject:", err));
    }

    const verifyPayment = async () => {
      try {
        console.log("Verifying subject payment with reference:", reference);
        const res = await axios.get(`/payments/verify?reference=${reference}`);
        console.log("Verification response:", res.data);
        
        if (res.data.success === true || res.data.message === "Subject unlocked successfully") {
          setSuccess(true);
          
          // Start countdown redirect
          const interval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                if (courseIdFromUrl) {
                  navigate(`/student/subjects?course=${courseIdFromUrl}`);
                } else {
                  navigate("/student/courses");
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
  }, [search, navigate]);

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-6" />
        <h2 className="text-2xl font-semibold text-gray-900">Verifying Payment...</h2>
        <p className="text-gray-500 mt-3">Please wait while we confirm your transaction.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="bg-green-100 rounded-full p-4 mb-6">
          <CheckCircle className="h-20 w-20 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-green-600 mb-3">Payment Successful! 🎉</h2>
        <p className="text-gray-700 text-lg mb-2 text-center max-w-md">
          {subjectName ? `"${subjectName}"` : "Your subject"} has been unlocked successfully!
        </p>
        <p className="text-gray-500 mb-8">You now have full access to all learning materials.</p>
        <p className="text-sm text-gray-400">Redirecting in {countdown} seconds...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-red-100 rounded-full p-4 mb-6">
        <XCircle className="h-20 w-20 text-red-600" />
      </div>
      <h2 className="text-3xl font-bold text-red-600 mb-3">Payment Failed</h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">{error || "Something went wrong with your payment"}</p>
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/student/plans")}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <BookOpen className="h-4 w-4" />
          Browse Plans
        </button>
        <button
          onClick={() => navigate("/student/courses")}
          className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Go to Courses
        </button>
      </div>
    </div>
  );
};

export default SubjectPaymentSuccess;