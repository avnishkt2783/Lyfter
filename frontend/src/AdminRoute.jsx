import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role !== "admin") {
      return <Navigate to="/" replace />;
    }
  } catch (err) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default AdminRoute;
