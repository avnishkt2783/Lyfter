import React from "react";
import { useNavigate } from "react-router-dom";
import GoogleMapView from "./GoogleMapView";
import { useAuth } from "../AuthContext";
import { FaCarSide, FaHandshake } from "react-icons/fa";

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

  const handleNavigateRequestedRides = () => {
    navigate("/yourRequestedRides");
  };

  const handleNavigateOfferedRides = () => {
    navigate("/yourOfferedRides");
  };

  return (
    <>
      <div className="card shadow-sm m-4">
        <div className="card-header">
          <h5 className="mb-0">Manage Your Rides</h5>
        </div>
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row gap-3">
            <button
              className="btn btn-warning flex-fill"
              onClick={handleNavigateRequestedRides}
            >
              <FaCarSide className="me-2" />
              Your Requested Rides
            </button>
            <button
              className="btn btn-success flex-fill"
              onClick={handleNavigateOfferedRides}
            >
              <FaHandshake className="me-2" />
              Your Offered Rides
            </button>
          </div>
        </div>
      </div>

      <div className="card shadow-sm m-4">
        <div className="card-header">
          <h5 className="mb-0">Plan a route</h5>
        </div>
        {/* <div className="card-body p-0" style={{ height: "400px" }}> */}
        <div className="flex-grow-1 d-flex flex-column">
          <GoogleMapView />
        </div>

        <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
          <button
            className="btn btn-warning btn-lg d-flex align-items-center"
            onClick={handleRequestRide}
          >
            <FaCarSide className="me-2" /> Request Ride
          </button>
          <button
            className="btn btn-success btn-lg d-flex align-items-center"
            onClick={handleOfferRide}
          >
            <FaHandshake className="me-2" /> Offer Ride
          </button>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
