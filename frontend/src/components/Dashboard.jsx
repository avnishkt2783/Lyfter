import React from "react";
import { useNavigate } from "react-router-dom";
import GoogleMapView from "./GoogleMapView";
import { useAuth } from "../AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const handleOfferRide = () => {
    const start = localStorage.getItem("startLocation");
    const destination = localStorage.getItem("destination");

    if (!start || !destination || start === "" || destination === "") {
      alert("Please set both start and destination locations on the map.");
      return;
    }
    navigate("/offerRideDetails");
  };

  const handleRequestRide = async () => {
    const start = localStorage.getItem("startLocation");
    const destination = localStorage.getItem("destination");

    if (!start || !destination || start === "" || destination === "") {
      alert("Please set both start and destination locations on the map.");
      return;
    }
    navigate("/requestRideDetails");
  };

  return (
    <div>
      <h2>Welcome to the Lyfter</h2>
      <GoogleMapView />
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleOfferRide}>Offer Ride</button>
        <button onClick={handleRequestRide} style={{ marginLeft: "10px" }}>
          Request Ride
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
