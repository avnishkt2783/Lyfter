import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GoogleMapView from "./GoogleMapView"; // adjust path if needed
import { useAuth } from "../AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();

  const { token, user } = useAuth();
  // Force user to reselect start and destination
  // localStorage.removeItem("startLocation");
  // localStorage.removeItem("destination");

  const handleOfferRide = () => {
    const start = localStorage.getItem("startLocation");
    const destination = localStorage.getItem("destination");

    if (!start || !destination || start === "" || destination === "") {
      alert("Please set both start and destination locations on the map.");
      return;
    }

    // Navigate to ride details form if locations are set
    navigate("/ridedetails");
  };

  const handleRequestRide = async () => {
    const start = localStorage.getItem("startLocation");
    const destination = localStorage.getItem("destination");

    if (!start || !destination || start === "" || destination === "") {
      alert("Please set both start and destination locations on the map.");
      return;
    }
    const userId = user.userId;
    // Check if userId is available
    if (!userId) {
      alert("User ID is missing. Please log in again.");
      return;
    }

    const apiURL = import.meta.env.VITE_API_URL;

    // const userId = localStorage.getItem("userId");
    try {
      console.log("userId:", userId);
      console.log("token:", token);
      await axios.post(
        `${apiURL}/rides/register`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate("/passengerdetails");
    } catch (error) {
      console.error("Failed to register as passenger:", error);
    }
  };

  return (
    <div>
      <h2>Welcome to the Lyfter</h2>
      <GoogleMapView />
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleOfferRide}>Offer a Ride</button>
        <button onClick={handleRequestRide} style={{ marginLeft: "10px" }}>
          Request a Ride
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
