import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaEye, FaEyeSlash, FaLock, FaArrowRight, FaCheckCircle } from "react-icons/fa";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      return alert("Passwords do not match");
    }

    if (password.length < 6) {
      return alert("Password must be at least 6 characters long");
    }

    try {
      setLoading(true);

      await API.post(`/auth/reset-password/${token}`, { password });

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Invalid or expired link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="grid md:grid-cols-2">
              {/* Left Side - Branding */}
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 md:p-12 text-white flex flex-col justify-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                    <FaLock className="text-3xl text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">Create New Password</h2>
                  <p className="text-blue-100 mb-6 text-sm md:text-base">
                    Your new password must be different from previously used passwords.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    <span className="text-sm text-blue-100">Minimum 6 characters</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    <span className="text-sm text-blue-100">Must include letters and numbers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    <span className="text-sm text-blue-100">Keep your password secure</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="p-8 md:p-12">
                {!success ? (
                  <>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
                    <p className="text-gray-500 mb-6 text-sm md:text-base">
                      Please enter your new password below.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* New Password */}
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                          New Password *
                        </label>
                        <div className="relative">
                          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirm ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>

                      {/* Password Strength Indicator */}
                      {password && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className={`h-1 flex-1 rounded-full ${
                              password.length < 6 ? "bg-red-500" : 
                              password.length < 8 ? "bg-yellow-500" : "bg-green-500"
                            }`}></div>
                            <span className="text-xs text-gray-500">
                              {password.length < 6 ? "Weak" : password.length < 8 ? "Medium" : "Strong"}
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base mt-6"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Resetting...
                          </>
                        ) : (
                          <>
                            Reset Password
                            <FaArrowRight />
                          </>
                        )}
                      </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                      Remember your password?{" "}
                      <button
                        onClick={() => navigate("/login")}
                        className="text-blue-600 font-semibold hover:text-blue-700"
                      >
                        Back to Login
                      </button>
                    </p>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FaCheckCircle className="text-4xl text-green-500" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Password Reset Successfully! 🎉</h2>
                    <p className="text-gray-600 mb-4">
                      Your password has been reset successfully.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Redirecting you to login page...
                    </p>
                    <button
                      onClick={() => navigate("/login")}
                      className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
                    >
                      Go to Login Now
                      <FaArrowRight />
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ResetPasswordPage;