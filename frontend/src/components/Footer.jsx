import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin, FaGithub} from "react-icons/fa";
import { useTheme } from "../ThemeContext";
import "./Footer.css";

const Footer = () => {

  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <footer className={`pt-5 pb-3 mt-5 ${isDark ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <div className="container text-center">
        <h5 className="fw-bold mb-4">Follow Us</h5>
        <div className="d-flex justify-content-center gap-4 fs-4 social-icons">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebookF />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <FaTwitter />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <FaLinkedin />
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            <FaGithub />
          </a>
        </div>
      </div>

      <div className={`text-center mt-4 pt-3 border-top small ${isDark ? "text-white border-light" : "text-dark border-dark"}`}>
        © {new Date().getFullYear()} Lyfter. All rights reserved. | Made with ❤ by Lyfter Team
      </div>
    </footer>
  );
};

export default Footer;
