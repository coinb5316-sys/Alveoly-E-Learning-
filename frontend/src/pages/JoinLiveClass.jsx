// pages/JoinLiveClass.jsx - NEW FILE
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Video, Loader2, LogIn, AlertCircle, Calendar, User, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

const JoinLiveClass = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [liveClass, setLiveClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      // Save the intended URL to redirect back after login
      localStorage.setItem("redirectAfterLogin", `/join/${classId}`);
      toast.info("Please login to join the class");
      navigate("/login");
      return;
    }

    if (user) {
      fetchClassDetails();
    }
  }, [classId, user, authLoading, navigate]);

  const fetchClassDetails = async () => {
    try {
      const res = await axios.get(`/live-class/${classId}`);
      setLiveClass(res.data);
    } catch (err) {
      console.error("Error fetching class:", err);
      setError(err.response?.data?.message || "Class not found");
    } finally {
      setLoading(false);
    }
  };

  const joinClass = async () => {
    setJoining(true);
    try {
      await axios.post(`/live-class/${classId}/join`);
      toast.success("Joined class successfully!");
      
      // Redirect based on user role
      const role = user?.role;
      if (role === "admin") {
        navigate(`/admin/live-class/${classId}`);
      } else if (role === "lecturer") {
        navigate(`/lecturer/live-class/${classId}`);
      } else {
        navigate(`/student/live-class/${classId}`);
      }
    } catch (err) {
      console.error("Error joining class:", err);
      toast.error(err.response?.data?.message || "Failed to join class");
      setJoining(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-16 w-16 text-indigo-500 mx-auto" />
          <p className="mt-4 text-white">Loading class...</p>
        </div>
      </div>
    );
  }

  if (error || !liveClass) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center text-white">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Class Not Found</h2>
          <p className="text-gray-400">{error || "The live class you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-4 py-2 bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isClassActive = liveClass.status === "ongoing";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Video className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">{liveClass.title}</h1>
          <p className="text-gray-400 text-sm mb-6">{liveClass.description || "Live Class Session"}</p>
          
          <div className="space-y-3 mb-8 text-left bg-gray-900/50 rounded-xl p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <User className="h-4 w-4" /> Lecturer:
              </span>
              <span className="text-white">{liveClass.lecturerId?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Course:
              </span>
              <span className="text-white">{liveClass.courseId?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Subject:
              </span>
              <span className="text-white">{liveClass.subjectId?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isClassActive ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`}></div>
                Status:
              </span>
              <span className={`${isClassActive ? "text-green-400" : "text-yellow-400"}`}>
                {isClassActive ? "Live Now" : "Scheduled"}
              </span>
            </div>
            {!isClassActive && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Starts:
                </span>
                <span className="text-white">
                  {new Date(liveClass.scheduledStartTime).toLocaleString()}
                </span>
              </div>
            )}
          </div>
          
          {isClassActive ? (
            <button
              onClick={joinClass}
              disabled={joining}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {joining ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              {joining ? "Joining..." : "Join Class Now"}
            </button>
          ) : (
            <div className="text-center">
              <p className="text-yellow-400 text-sm mb-4">
                This class hasn't started yet
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinLiveClass;