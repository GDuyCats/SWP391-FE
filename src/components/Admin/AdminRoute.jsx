import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function getUserRole() {
  try {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      const user = JSON.parse(userRaw);
      if (user && user.role) return user.role;
    }
  } catch {
    void 0; // ignore parse errors
  }
  const role = localStorage.getItem("role");
  return role || null;
}

export default function AdminRoute({ children }) {
  const location = useLocation();
  const role = getUserRole();

  if (role !== "admin") {
    // Redirect to a Forbidden page carrying original location
    return <Navigate to="/admin/forbidden" replace state={{ from: location }} />;
  }

  return children;
}
