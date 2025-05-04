import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const MatchingRides = () => {
  const [rides, setRides] = useState([]);
  const query = new URLSearchParams(useLocation().search);
  const destination = query.get("destination");

  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function fetchRides() {
      try {
        const res = await axios.get(
          `${apiURL}/rides/matchingrides?destination=${destination}`
        );
        setRides(res.data.rides);
      } catch (error) {
        console.error("Error loading rides", error);
      }
    }
    fetchRides();
  }, [destination]);

  const confirmRide = async (rideId) => {
    alert(`Ride ${rideId} confirmed. All others rejected.`);
    // Save selected ride ID in passengerRide table here if needed
  };

  return (
    <div>
      <h2>Available Rides to {destination}</h2>
      {rides.length === 0 ? (
        <p>No rides available.</p>
      ) : (
        rides.map((ride) => (
          <div
            key={ride.rideId}
            style={{
              border: "1px solid gray",
              padding: "10px",
              margin: "10px",
            }}
          >
            <p>
              <b>Driver:</b> {ride.driver.user.name}
            </p>
            <p>
              <b>Phone:</b> {ride.driver.user.phone}
            </p>
            <p>
              <b>Seats Available:</b> {ride.seats}
            </p>
            <p>
              <b>Fare:</b> ₹{ride.fare}
            </p>
            <button onClick={() => confirmRide(ride.rideId)}>
              Confirm Ride
            </button>
            <button style={{ marginLeft: "10px" }}>Reject</button>
          </div>
        ))
      )}
    </div>
  );
};

export default MatchingRides;
