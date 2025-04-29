import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";

const RequireAuth = () => {
  const { token } = useAuth();

  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default RequireAuth;
