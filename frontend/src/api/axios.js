// api/axios.js
import axios from "axios";

const API_BASE_URL = "https://alveoly-e-learning-of-health-api.onrender.com";

console.log("🚀 API Base URL:", API_BASE_URL);

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  timeout: 60000,
});

// Don't show network errors too frequently
let lastNetworkErrorTime = 0;
let networkErrorCount = 0;

const showNetworkError = () => {
  const now = Date.now();
  // Only show error every 10 seconds max, and only 3 times
  if (now - lastNetworkErrorTime > 10000 && networkErrorCount < 3) {
    lastNetworkErrorTime = now;
    networkErrorCount++;
    console.warn("⚠️ Network connection issue detected");
    // You can show a non-intrusive toast instead of alert
    // For now, just log to console
  }
};

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    networkErrorCount = 0; // Reset on successful response
    return response;
  },
  (error) => {
    if (error.code === "ERR_NETWORK") {
      console.error("❌ Network Error - Cannot reach server");
      console.error("   URL:", error.config?.url);
      showNetworkError();
    } else if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } else if (error.response) {
      console.error(`❌ ${error.response.status} Error:`, error.response.data?.message);
    }
    
    return Promise.reject(error);
  }
);

export default API;
export { API_BASE_URL };