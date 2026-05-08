// components/ProtectedRoutes.jsx - FULLY UPDATED
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  // ✅ WAIT until auth is fully loaded
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // ❌ No user → go login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ ROLE CHECKING - Allow admin to access everything
  if (role) {
    // Admin can access ANY route (student, lecturer, admin)
    if (user.role === "admin") {
      return children;
    }
    
    // For non-admin users, check role match
    if (user.role !== role) {
      // Redirect to appropriate dashboard based on user's actual role
      const redirectMap = {
        student: "/student",
        lecturer: "/lecturer",
        admin: "/admin"
      };
      const redirectPath = redirectMap[user.role] || "/login";
      return <Navigate to={redirectPath} replace />;
    }
  }

  // ✅ Allow access
  return children;
};

export default ProtectedRoute;