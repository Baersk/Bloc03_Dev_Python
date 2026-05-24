import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "user";
}

export default function ProtectedRoute({ children, requiredRole = "user" }: ProtectedRouteProps) {
  const token = localStorage.getItem("access_token");
  const userStr = localStorage.getItem("user");

  // Pas de token = pas connecté
  if (!token || !userStr) {
    return <Navigate to="/signup" replace />;
  }

  // Essayer de parser l'utilisateur
  try {
    const user = JSON.parse(userStr);

    // Si on demande les droits admin
    if (requiredRole === "admin") {
      if (!user.is_admin) {
        return <Navigate to="/" replace />;
      }
    }
    // Si on demande juste un utilisateur connecté
    else if (requiredRole === "user") {
      if (!user.id) {
        return <Navigate to="/signup" replace />;
      }
    }
  } catch (err) {
    console.error("Erreur lors de la vérification des droits", err);
    return <Navigate to="/signup" replace />;
  }

  return <>{children}</>;
}
