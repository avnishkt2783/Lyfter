import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useTheme } from "./ThemeContext";

import Navbar from "./components/Navbar";
import Landing from "./components/Landing";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer";
import Profile from "./components/Profile";
import LogoutButton from "./components/LogoutButton";
import RequireAuth from "./utils/RequireAuth";
import RideDetails from "./components/RideDetails";
import PassengerDetails from "./components/PassengerDetails";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "./App.css";

function App() {
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "dark";
    document.body.classList.add(storedTheme);
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<LogoutButton />} />

          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/ridedetails" element={<RideDetails />} />
            <Route path="/passengerdetails" element={<PassengerDetails />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
