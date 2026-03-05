import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * ProtectedRoute component to guard routes that require authentication.
 *
 * Wrap route children with this component to redirect unauthenticated
 * users to the login page.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
}