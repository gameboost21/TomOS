import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Guard a route by authentication and optionally by role.
 *
 * @param {{ children: React.ReactNode, requiredRole?: string }} props
 *   - `requiredRole`: if provided, the user's role must match (e.g. "admin")
 */

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/tasks" replace />
  }

  return children;
}