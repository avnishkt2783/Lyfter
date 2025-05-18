import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // fix import (not destructured)

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme"));
  const [authLoading, setAuthLoading] = useState(true); // <-- new loading state

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        // localStorage.setItem("token", token);
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
      setAuthLoading(false); // <-- done initializing
    };

    initializeAuth();
  }, [token]);

  const login = (newToken) => {
    setAuthLoading(true);
    setToken(newToken);
    localStorage.setItem("token", newToken); // <-- only here
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("startLocation");
    localStorage.removeItem("destination");
    localStorage.removeItem("startLocationCoordinatesA");
    localStorage.removeItem("destinationCoordinatesB");
    localStorage.removeItem("routePath");
    localStorage.removeItem("seatsRequired");
    localStorage.removeItem("passengerNamePhoneNo");
  };

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, theme, login, logout, updateTheme, authLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
