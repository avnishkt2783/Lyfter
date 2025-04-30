// components/LogoutButton.jsx
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const LogoutButton = ({ className }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();              // clears token & user from state and localStorage
    navigate("/login");    // redirects to login page
  };

  return <a id="logoutBtn" className={className} onClick={handleLogout}>Logout</a>;
};

export default LogoutButton;
