import React from "react";
import { useNavigate } from "react-router-dom";
import GoogleMapView from "./GoogleMapView"; // adjust path if needed

const Dashboard = () => {

  const navigate = useNavigate();


  return (
    <div>
      <h2>Welcome to the Lyfter</h2>
      <GoogleMapView />
    </div>
  );
};

export default Dashboard;
