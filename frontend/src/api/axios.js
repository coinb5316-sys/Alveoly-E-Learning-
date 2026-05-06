import axios from "axios";

// Use production server URL - NO localhost
const API_BASE_URL = "https://alveoly-e-learning-of-health-api.onrender.com";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  timeout: 30000,
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("Response Error:", error.response?.status, error.message);
    
    if (error.code === "ERR_NETWORK") {
      console.error("Network error - cannot connect to server");
      alert("⚠️ Cannot connect to server. Please check your internet connection.");
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

export default API;
export { API_BASE_URL };