import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { theme, updateTheme } = useAuth();

  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    document.documentElement.setAttribute("data-bs-theme", theme);
  }, [theme]);

  const toggleTheme = (newTheme) => {
    const nextTheme = newTheme || (theme === "dark" ? "light" : "dark");
    updateTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
