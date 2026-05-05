// api/axios.js
import axios from "axios";

// ✅ FIX: Use VITE_APP_API_BASE_URL (not VITE_API_URL)
const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,  // This will be http://localhost:5000/api
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= REQUEST INTERCEPTOR =================
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR =================
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || "";

    if (message.includes("logged out because your account was used on another device")) {
      alert("⚠️ Your account was logged in on another device.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } else if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default API;