import { useAuth } from "../AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const LogoutButton = ({ className }) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        await axios.post(
          `${apiURL}/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      logout();
      navigate("/login"); 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Link to="/login" id="logoutBtn" className={className} onClick={handleLogout}>
      Logout
    </Link>
  );
};

export default LogoutButton;
