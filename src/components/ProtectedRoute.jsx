// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) return <div className="text-center p-10">Loading...</div>;

  // 1. Not logged in? Go to Login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // 2. Logged in but wrong role? Go Home
  // (e.g. An Attendee trying to access Dashboard)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  // 3. All good? Render the page
  return children;
};

export default ProtectedRoute;
