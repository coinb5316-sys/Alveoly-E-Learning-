// src/context/AuthContext.jsx - COMPLETELY FIXED
import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";
import { initializeSocket } from "../config/socket.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // ================= SOCKET =================
  const connectSocket = (userData) => {
    if (!userData?._id) return;
    
    // Initialize socket properly
    const socketInstance = initializeSocket();
    setSocket(socketInstance);
    
    // Make sure socket is connected
    if (socketInstance && !socketInstance.connected) {
      socketInstance.connect();
    }

    socketInstance.emit("join:user", userData._id);
  };

  const disconnectSocket = () => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
  };

  // ================= SET AUTH (CENTRALIZED) =================
  const setAuth = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
    connectSocket(userData);
  };

  // ================= CLEAR AUTH =================
  const clearAuth = () => {
    localStorage.removeItem("token");
    disconnectSocket();
    setUser(null);
  };

  // ================= FETCH CURRENT USER =================
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await API.get("/auth/me");
      setUser(res.data);
      connectSocket(res.data);
    } catch (err) {
      console.error("Fetch user error:", err);
      clearAuth();
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
      const { token, user: userData } = res.data;

      setAuth(token, userData);
      return userData;
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  // ================= REGISTER =================
  const register = async (form) => {
    try {
      const res = await API.post("/auth/register", form);
      const { token, user: userData } = res.data;

      setAuth(token, userData);
      return userData;
    } catch (err) {
      console.error("Register error:", err);
      throw err;
    }
  };

  // ================= GOOGLE LOGIN =================
  const googleLogin = async (idToken) => {
    try {
      const res = await API.post("/auth/google-login", { idToken });
      const { token, user: userData, requiresCourse } = res.data;

      setAuth(token, userData);

      return { user: userData, requiresCourse };
    } catch (err) {
      console.error("Google login error:", err);
      throw err;
    }
  };

  // ================= LOGOUT =================
  const logout = () => {
    clearAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);