import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme"));

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);

      try {
        const decoded = jwtDecode(token);
        setUser(decoded);

        const userTheme = decoded.theme;
        if (!localStorage.getItem("theme")) {
          setTheme(userTheme);
          localStorage.setItem("theme", userTheme);
        }
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
        setUser(null);
      }
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("startLocation");
    localStorage.removeItem("destination");
  };

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, theme, login, logout, updateTheme }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
