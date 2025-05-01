import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

import LogoutButton from "./LogoutButton";

const Navbar = () => {

  const { token } = useAuth();

  return (
    <>
      <nav>
        <div>
          <Link to="/">
            <img src="lyfter_text_white.png" />
          </Link>
        </div>
        <div>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/about">About</Link>
      
          {token ? (
            <>
            <LogoutButton />
            <Link to="/profile"><img height="30px" src="default.jpg" /></Link>
            </>
          ) : (
            <Link to="/login">Login</Link> 
          )}

          
        </div>
      </nav>
    </>
  );
};
export default Navbar;
