import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";

import LogoutButton from "./LogoutButton";
import ThemeToggle from "./ThemeToggle";

import "./Navbar.css";

const Navbar = () => {
  const { token, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg ${
          isDark ? "navbar-dark bg-dark" : "navbar-light bg-light"
        } px-3`}
      >
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src={isDark ? "lyfter_text_white.png" : "lyfter_text_black.png"}
            alt="Logo"
            height="40"
            className="me-2"
          />
        </Link>
        <div className="d-flex align-items-center ms-auto d-lg-none me-2">
          <ThemeToggle />
        </div>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarContent"
        >
          <div className="d-none d-lg-block me-3">
            <ThemeToggle />
          </div>
          <ul className="navbar-nav align-items-end">
            <li className="nav-item me-2"></li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">
                About
              </Link>
            </li>

            {token ? (
              <>
                <li className="nav-item">
                  <LogoutButton className="nav-link" />
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    <img
                      src={user?.profileImg || "default.jpg"}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "default.jpg";
                      }}
                      alt="Profile"
                      className="rounded-circle"
                      height="35"
                      width="35"
                      style={{ objectFit: "cover" }}
                    />
                  </Link>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
};
export default Navbar;
