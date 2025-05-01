// src/components/ThemeToggle.jsx
import React from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "./ThemeContext";
import "./ThemeToggle.css";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="theme-toggle-wrapper d-flex justify-content-center my-2">
      <div className={`theme-switch ${isDark ? "dark" : "light"}`} onClick={toggleTheme}>
        <div className="toggle-thumb">
          {isDark ? <FaMoon size={14} /> : <FaSun size={14} />}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
