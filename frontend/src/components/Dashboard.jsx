import React from "react";
import { useNavigate } from "react-router-dom";
import GoogleMapView from "./GoogleMapView"; // adjust path if needed

const Dashboard = () => {

  const navigate = useNavigate();

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

  return (
    <div>
      <h2>Welcome to the Lyfter</h2>
      <GoogleMapView />
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleOfferRide}>Offer a Ride</button>
      </div>
    </div>
  );
};

export default Dashboard;
