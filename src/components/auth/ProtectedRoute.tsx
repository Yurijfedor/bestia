import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "client";
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, role, isLoading, isProfileLoading } = useAuth();

  if (isLoading || (user && isProfileLoading)) {
    return <p>Завантаження...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
