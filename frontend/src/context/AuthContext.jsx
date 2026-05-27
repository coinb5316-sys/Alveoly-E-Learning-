// src/context/AuthContext.jsx - FULLY UPDATED with Program support
import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";
import { initializeSocket } from "../config/socket.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

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
    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
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
    disconnectSocket();
    setUser(null);
  };

  // ================= FETCH CURRENT USER =================
  const fetchUser = async () => {
    const storedToken = localStorage.getItem("token");
    
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await API.get("/auth/me");
      setUser(res.data);
      connectSocket(res.data);
    } catch (err) {
      console.error("Fetch user error:", err);
      if (err.response?.status === 401) {
        clearAuth();
      }
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
      const res = await API.post("/auth/login", form);
      const { token: newToken, user: userData, requiresProgram } = res.data;
      
      setAuth(newToken, userData);
      return { user: userData, requiresProgram };
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

  // ================= GOOGLE LOGIN =================
const googleLogin = async (idToken) => {
  try {
    const res = await API.post("/auth/google-login", { idToken });
    const { token: newToken, user: userData, requiresProgram } = res.data;
    
    console.log("Google login response:", { userData, requiresProgram });
    
    setAuth(newToken, userData);
    
    // Return requiresProgram so the component knows where to redirect
    return { user: userData, requiresProgram };
  } catch (err) {
    console.error("Google login error:", err);
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
        login,
        register,
        googleLogin,
        logout,
        setUser,
        assignProgram,
        isAdmin,
        isLecturer,
        isStudent,
        getDashboardPath,
        isAuthenticated: !!user,
        userRole: user?.role,
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