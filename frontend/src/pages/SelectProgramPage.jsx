// SelectProgramPage.jsx - Billion-Dollar Professional UI
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaGraduationCap, 
  FaBookOpen, 
  FaSpinner, 
  FaCheckCircle, 
  FaBuilding, 
  FaArrowRight, 
  FaCalendarAlt,
  FaExclamationTriangle
} from "react-icons/fa";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

const SelectProgramPage = () => {
  const [programs, setPrograms] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [hoveredProgram, setHoveredProgram] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { assignProgram, user, loading: authLoading } = useAuth();

  // ================= FETCH PROGRAMS =================
 // src/pages/SelectProgramPage.jsx - UPDATE the fetchPrograms function
useEffect(() => {
  const fetchPrograms = async () => {
    try {
      setLoadingPrograms(true);
      setError(null);
      // CHANGE: Use the public endpoint
      const res = await API.get("/programs/public");
      console.log("Fetched programs:", res.data);
      
      const activePrograms = (res.data || []).filter(p => p.isActive !== false);
      setPrograms(activePrograms);
      
      if (activePrograms.length === 0) {
        setError("No active programs available. Please contact support.");
      }
    } catch (err) {
      console.error("Error fetching programs:", err);
      setError(err.response?.data?.message || "Failed to load programs");
      toast.error("Failed to load programs");
    } finally {
      setLoadingPrograms(false);
    }
  };

  fetchPrograms();
}, []);

  // ================= HANDLE SELECT PROGRAM =================
  const handleSelectProgram = async () => {
    if (!selected) {
      toast.error("Please select a program");
      return;
    }

    setLoading(true);
    try {
      console.log("Assigning program:", selected);
      const updatedUser = await assignProgram(selected);
      console.log("Program assigned successfully:", updatedUser);
      
      toast.success("Program selected successfully!");
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        navigate("/student/dashboard");
      }, 500);
    } catch (err) {
      console.error("Assign program error:", err);
      toast.error(err.response?.data?.message || "Failed to assign program");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-indigo-500 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full mb-4 backdrop-blur-sm">
            <FaGraduationCap className="text-indigo-600 dark:text-indigo-400 text-sm" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Choose Your Path</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Select Your Program
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-2xl mx-auto">
            Choose the academic program that aligns with your career goals
          </p>
        </motion.div>

        {loadingPrograms ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FaGraduationCap className="w-6 h-6 text-indigo-500 animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Loading programs...</p>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-950/50 dark:to-orange-950/50 flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Error Loading Programs</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg"
            >
              Try Again
            </button>
          </motion.div>
        ) : programs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/50 dark:to-orange-950/50 flex items-center justify-center mx-auto mb-4">
              <FaBuilding className="w-12 h-12 text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Programs Available</h3>
            <p className="text-slate-500 dark:text-slate-400">Please contact support for assistance.</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {programs.map((program, index) => (
                <motion.div
                  key={program._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredProgram(program._id)}
                  onMouseLeave={() => setHoveredProgram(null)}
                  className={`group cursor-pointer rounded-2xl transition-all duration-500 ${
                    selected === program._id
                      ? "ring-2 ring-indigo-500 shadow-xl scale-[1.02]"
                      : "hover:shadow-xl hover:-translate-y-1"
                  } ${
                    selected === program._id
                      ? "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30"
                      : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
                  } border border-slate-200 dark:border-slate-800 overflow-hidden`}
                  onClick={() => setSelected(program._id)}
                >
                  <div className="p-6">
                    {/* Program Icon with Gradient */}
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg transition-all duration-300 ${
                      hoveredProgram === program._id ? "scale-110 rotate-3" : ""
                    }`}>
                      <FaBuilding className="text-white text-2xl" />
                    </div>

                    {/* Program Info */}
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {program.name}
                    </h3>
                    
                    {program.code && (
                      <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-2">
                        {program.code}
                      </p>
                    )}

                    {program.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                        {program.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt className="w-3 h-3" />
                        <span>Est. {new Date(program.createdAt).getFullYear()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaBookOpen className="w-3 h-3" />
                        <span>{program.courseCount || 0} Courses</span>
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {selected === program._id && (
                      <div className="mt-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <FaCheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Continue Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 text-center"
            >
              <button
                onClick={handleSelectProgram}
                disabled={!selected || loading}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 text-lg"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin w-5 h-5" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Dashboard
                    <FaArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
                You can change your program later in settings
              </p>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default SelectProgramPage;