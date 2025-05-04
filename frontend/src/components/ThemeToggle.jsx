import React, { useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../ThemeContext";
import { useAuth } from "../AuthContext";
import "./ThemeToggle.css";
import axios from "axios";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { token } = useAuth();
  const isDark = theme === "dark";

  const saveThemeToDatabase = async (newTheme) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/users/theme`,
        { theme: newTheme },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Theme updated successfully in the database");
    } catch (error) {
      console.error("Failed to save theme to the database:", error);
    }
  };

  const handleToggle = () => {
    const newTheme = isDark ? "light" : "dark";
    toggleTheme(newTheme);
    saveThemeToDatabase(newTheme);  
  };
  useEffect(() => {
    document.body.classList.remove(isDark ? "light" : "dark");
    document.body.classList.add(isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <div className="theme-toggle-wrapper d-flex justify-content-center my-2">
      <div className={`theme-switch ${isDark ? "dark" : "light"}`} onClick={handleToggle}>
        <div className="toggle-thumb">
          {isDark ? <FaMoon size={14} /> : <FaSun size={14} />}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
