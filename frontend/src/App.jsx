import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useTheme } from "./ThemeContext";

import Navbar from "./components/Navbar";
import Landing from "./components/Landing";
import Login from "./components/Login";
import About from "./components/About";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer";
import Profile from "./components/Profile";
import LogoutButton from "./components/LogoutButton";
import RequireAuth from "./utils/RequireAuth";
import OfferRideDetails from "./components/OfferRideDetails";
import RequestRideDetails from "./components/RequestRideDetails";
import MatchingRides from "./components/MatchingRides";
import YourOfferedRides from "./components/YourOfferedRides";
import YourRequestedRides from "./components/YourRequestedRides";
import ForgotPassword from "./components/ForgotPassword";
import BecomeDriver from "./components/BecomeDriverForm";
import PendingDriversList from "./components/PendingDriversList";
import AddVehicleForm from "./components/AddVehicleForm";
import AadhaarDriversList from "./components/AadhaarDriversList";
import AdminDashboard from "./components/AdminDashboard";
import DriverPage from "./components/DriverPage";
import ManageAdmins from "./components/ManageAdmins";
import AdminRoute from "./AdminRoute";
import RedirectExternal from "./components/RedirectExternal";

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
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<LogoutButton />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/lyfter-video-ppt" element={<RedirectExternal />} />

          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/offerRideDetails" element={<OfferRideDetails />} />
            <Route
              path="/requestRideDetails"
              element={<RequestRideDetails />}
            />
            <Route path="/matchingRides" element={<MatchingRides />} />
            <Route path="/yourOfferedRides" element={<YourOfferedRides />} />
            <Route
              path="/yourRequestedRides"
              element={<YourRequestedRides />}
            />
            <Route path="/become-driver" element={<BecomeDriver />} />
            <Route path="/add-vehicle" element={<AddVehicleForm />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/pending-drivers"
              element={
                <AdminRoute>
                  <PendingDriversList />
                </AdminRoute>
              }
            />
            <Route
              path="/verify-aadhar"
              element={
                <AdminRoute>
                  <AadhaarDriversList />
                </AdminRoute>
              }
            />
            <Route path="/driver-dashboard" element={<DriverPage />} />
            <Route path="/manage-admins" element={<ManageAdmins />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
