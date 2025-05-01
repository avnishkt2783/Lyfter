import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

import LogoutButton from "./LogoutButton";

import "./Navbar.css";

const Navbar = () => {

  const { token } = useAuth();

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img src="lyfter_logo.png" alt="Logo" height="40" className="me-2"/>
          </Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarContent">
        <ul className="navbar-nav align-items-center">
          <li className="nav-item">
            <Link className="nav-link" to="/dashboard">Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/about">About</Link>
          </li>
      
          {token ? (
            <>
              <li className="nav-item">
                <LogoutButton className="nav-link"/>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/profile">
                  <img src="profile.png" alt="Profile" className="rounded-circle" height="35" width="35" style={{ objectFit: "cover" }} />
                </Link>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link className="nav-link" to="/login">Login</Link>
            </li>
          )}
        </ul>

          
        </div>
      </nav>
    </>
  );
};
export default Navbar;
