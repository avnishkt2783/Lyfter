// components/LogoutButton.jsx
import { useAuth } from "../AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const LogoutButton = ({ className }) => {

const apiURL = import.meta.env.VITE_API_URL;

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async() => {
    try{
        if(user?.email){
            await axios.post(`${apiURL}/logout/${user.email}`);
        }

        logout();              // clears token & user from state and localStorage
        navigate("/login");    // redirects to login page
    }
    catch (error) {
        console.error("Logout failed:", error);
      }
   
  };

  return <Link to="/login" id="logoutBtn" className={className} onClick={handleLogout}>Logout</Link>;
};

export default LogoutButton;
