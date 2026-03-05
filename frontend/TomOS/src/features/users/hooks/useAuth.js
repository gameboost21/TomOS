import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Hook to access authentication context.
 *
 * Returns the object provided by `AuthContext` (token, user, login, logout, etc.).
 * @returns {Object} Auth context value
 */
export function useAuth() {
  return useContext(AuthContext);
}