// src/api/axios.js - COMPLETE FIXED
import axios from "axios";

const API_BASE_URL = "https://alveoly-e-learning-755w.onrender.com";

console.log("🚀 API Base URL:", API_BASE_URL);

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    // ✅ DO NOT set Content-Type here — Axios picks per-request
  },
  timeout: 120000,
});

let lastNetworkErrorTime = 0;
let networkErrorCount = 0;

const showNetworkError = () => {
  const now = Date.now();
  if (now - lastNetworkErrorTime > 10000 && networkErrorCount < 3) {
    lastNetworkErrorTime = now;
    networkErrorCount++;
    console.warn("⚠️ Network connection issue detected");
  }
};

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ If we have FormData, DELETE any Content-Type so the browser/Axios
    // sets multipart/form-data WITH the boundary automatically.
    const isFormData =
      config.data &&
      (config.data instanceof FormData ||
        (typeof config.data === "object" &&
          typeof config.data.append === "function" &&
          typeof config.data.getAll === "function"));

    if (isFormData) {
      // Remove any Content-Type — Axios will inject the correct multipart header
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
      // Also clear from defaults on this specific request
      if (config.headers.common) delete config.headers.common["Content-Type"];
    } else if (
      config.data &&
      !config.headers["Content-Type"] &&
      !config.headers["content-type"]
    ) {
      config.headers["Content-Type"] = "application/json";
    }

    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    console.log("   Content-Type:", config.headers["Content-Type"] || "(auto)");
    console.log("   isFormData:", !!isFormData);

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
    networkErrorCount = 0;
    return response;
  },
  (error) => {
    if (error.code === "ERR_NETWORK") {
      console.error("❌ Network Error - Cannot reach server");
      console.error("   URL:", error.config?.url);
      showNetworkError();
    } else if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const isBlogPublicRoute =
        url.includes("/blog/posts") ||
        url.includes("/blog/categories") ||
        url.includes("/blog/comments");

      if (!isBlogPublicRoute) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (!window.location.pathname.includes("/blog")) {
          window.location.href = "/login";
        }
      } else {
        console.warn("⚠️ Public blog route returned 401 - ignoring");
      }
    } else if (error.response) {
      console.error(
        `❌ ${error.response.status} Error:`,
        error.response.data?.message || error.response.data
      );
    } else if (error.request) {
      console.error("❌ No response received:", error.request);
    }

    return Promise.reject(error);
  }
);

export { API, API_BASE_URL };
export default API;