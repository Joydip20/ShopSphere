import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  console.log("ProtectedRoute user:", user);
  console.log("Required role:", requiredRole);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role?.toUpperCase() !== requiredRole.toUpperCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
