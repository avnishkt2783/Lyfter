import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    // Not logged in, redirect to login or landing
    return <Navigate to="/" replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role !== "admin") {
      // Not admin, redirect to home or unauthorized page
      return <Navigate to="/" replace />;
    }
  } catch (err) {
    // Invalid token or parsing error
    return <Navigate to="/" replace />;
  }

  // Authorized admin, render the child component(s)
  return children;
};

export default AdminRoute;
