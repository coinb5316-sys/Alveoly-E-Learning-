// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";
import { initializeSocket } from "../config/socket.js";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  // ================= SOCKET =================
  const connectSocket = (userData) => {
    if (!userData?._id) return;
    
    const socketInstance = initializeSocket();
    setSocket(socketInstance);
    
    if (socketInstance && !socketInstance.connected) {
      socketInstance.connect();
    }

    socketInstance.emit("join:user", userData._id);
    
    if (userData.role === "lecturer") {
      socketInstance.emit("join:lecturer", userData._id);
    } else if (userData.role === "admin") {
      socketInstance.emit("join:admin", userData._id);
    }
  };

  const disconnectSocket = () => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
  };

  // ================= SET AUTH =================
  const setAuth = (newToken, userData) => {
    console.log("🔐 Setting auth with token:", newToken ? "present" : "null", "user:", userData?.email);
    
    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setIsAuthenticated(true);
    }
    setUser(userData);
    if (userData) {
      connectSocket(userData);
    }
  };

  // ================= CLEAR AUTH =================
  const clearAuth = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsAuthenticated(false);
    disconnectSocket();
    setUser(null);
  };

  // ================= FETCH CURRENT USER =================
  const fetchUser = async () => {
    const storedToken = localStorage.getItem("token");
    console.log("🔍 Fetching user, token exists:", !!storedToken);
    
    if (!storedToken) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const res = await API.get("/auth/me");
      setUser(res.data);
      setIsAuthenticated(true);
      connectSocket(res.data);
      return res.data;
    } catch (err) {
      console.error("Fetch user error:", err);
      if (err.response?.status === 401) {
        clearAuth();
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    
    return () => {
      disconnectSocket();
    };
  }, []);

  // ================= LOGIN =================
  const login = async (form) => {
    try {
      console.log("🔑 Logging in with:", form.email);
      const res = await API.post("/auth/login", form);
      console.log("🔑 Login response:", res.data);
      
      const { token: newToken, user: userData, requiresProgram, requiresPlan } = res.data;
      
      setAuth(newToken, userData);
      return { user: userData, requiresProgram, requiresPlan };
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  // ================= REGISTER =================
  const register = async (form) => {
    try {
      const res = await API.post("/auth/register", form);
      const { token: newToken, user: userData, requiresProgram } = res.data;
      
      setAuth(newToken, userData);
      return { user: userData, requiresProgram };
    } catch (err) {
      console.error("Register error:", err);
      throw err;
    }
  };

  // ================= NON-ALVEOLY REGISTER - FIXED =================
  const registerNonAlveoly = async (form) => {
    try {
      console.log("📝 Registering non-alveoly student with form:", form);
      
      const res = await API.post("/auth/register/non-alveoly", form);
      console.log("📝 Registration response:", res.data);
      
      const { token: newToken, user: userData, requiresPlan, userId } = res.data;
      
      // Set auth with the token
      setAuth(newToken, userData);
      
      return { 
        user: userData, 
        requiresPlan, 
        userId: userId || userData?._id,
        message: res.data.message,
        token: newToken // Also return the token explicitly
      };
    } catch (err) {
      console.error("Non-Alveoly register error:", err);
      throw err;
    }
  };

  // ================= GOOGLE LOGIN =================
  const googleLogin = async (idToken, userType = null, registrationSource = null, registrationDetails = null) => {
    try {
      const payload = { idToken };
      if (userType) {
        payload.userType = userType;
      }
      if (registrationSource) {
        payload.registrationSource = registrationSource;
      }
      if (registrationDetails) {
        payload.registrationDetails = registrationDetails;
      }
      
      const res = await API.post("/auth/google-login", payload);
      const { token: newToken, user: userData, requiresProgram, requiresApproval, requiresPlan } = res.data;
      
      console.log("Google login response:", { userData, requiresProgram, requiresApproval, requiresPlan });
      
      setAuth(newToken, userData);
      
      return { user: userData, requiresProgram, requiresApproval, requiresPlan };
    } catch (err) {
      console.error("Google login error:", err);
      if (err.response?.status === 404 && err.response?.data?.requiresUserType) {
        throw err;
      }
      throw err;
    }
  };

  // ================= LOGOUT =================
  const logout = () => {
    clearAuth();
  };

  // ================= ASSIGN PROGRAM =================
  const assignProgram = async (programId) => {
    try {
      const res = await API.put("/auth/me/program", { programId });
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error("Assign program error:", err);
      throw err;
    }
  };

  // ================= HELPER METHODS =================
  const isAdmin = () => user?.role === "admin";
  const isLecturer = () => user?.role === "lecturer";
  const isStudent = () => user?.role === "student";

  const getDashboardPath = () => {
    if (isAdmin()) return "/admin";
    if (isLecturer()) return "/lecturer";
    if (isStudent()) return "/student";
    return "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        isAuthenticated,
        login,
        register,
        registerNonAlveoly,
        googleLogin,
        logout,
        setUser,
        setAuth,
        assignProgram,
        fetchUser,
        isAdmin,
        isLecturer,
        isStudent,
        getDashboardPath,
        userRole: user?.role,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};