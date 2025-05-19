import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import {
  FaCar,
  FaPhone,
  FaUser,
  FaRupeeSign,
  FaMoneyBillWave,
  FaClock,
  FaChair,
  FaCarSide,
} from "react-icons/fa";

const MatchingRides = () => {
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;
  const { token, user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const userId = user?.userId;
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);
  const [requestedRideId, setRequestedRideId] = useState(null);

  const startLocation = localStorage.getItem("startLocationCoordinatesA");
  const destination = localStorage.getItem("destinationCoordinatesB");
  const destinationText = localStorage.getItem("destination");
  const seatsRequired = localStorage.getItem("seatsRequired");
  const passengerNamePhoneNo = JSON.parse(
    localStorage.getItem("passengerNamePhoneNo")
  );

  useEffect(() => {
    const fetchMatchingRides = async () => {
      const start = JSON.parse(startLocation);
      const dest = JSON.parse(destination);

      if (!start || !dest) {
        console.error("Start or destination coordinates are missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          `${apiURL}/rides/matchingRides`,
          {
            passengerStart: start,
            passengerEnd: dest,
            seatsRequired,
            currentUserId: userId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRides(
          response.data.success && Array.isArray(response.data.rides)
            ? response.data.rides
            : []
        );
      } catch (error) {
        console.error("Error fetching matching rides:", error);
        setRides([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMatchingRides();
    }
  }, [token, userId]);

  const handleNavigate = () => {
    navigate("/yourRequestedRides");
  };

  const confirmRide = async (ride) => {
    try {
      await axios.post(
        `${apiURL}/rides/requestRideDetails`,
        {
          userId,
          passengerName: passengerNamePhoneNo.passengerName,
          passengerPhoneNo: passengerNamePhoneNo.passengerPhoneNo,
          startLocation,
          destination,
          seatsRequired,
          driverRideId: ride?.driverRideId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRequestedRideId(ride.driverRideId);
    } catch (error) {
      console.error("Error confirming ride:", error);
    }
  };

  return (
    <div
      className={`container py-5 ${
        isDark ? "bg-dark text-light" : "text-dark"
      }`}
    >
      <div className="justify-content-between align-items-center mb-4">
        <div className="mb-2">
          <button className="btn btn-warning" onClick={handleNavigate}>
            <FaCarSide /> Your Requested Rides
          </button>
        </div>
        <h3>
          <FaCar className="me-2" />
          Available Rides to {destinationText || "destination"}
        </h3>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Loading rides...</p>
        </div>
      ) : rides.length === 0 ? (
        <p className="alert alert-warning">No matching rides available.</p>
      ) : (
        <div className="row">
          {rides.map((ride) => {
            const driverName = ride.driver?.user?.fullName;
            const driverPhone = ride.driver?.user?.phoneNo;

            return (
              <div className="col-md-6 col-lg-4 mb-4" key={ride.rideId}>
                <div
                  className={`card h-100 shadow ${
                    isDark
                      ? "bg-dark text-white border-secondary"
                      : "bg-white border-dark"
                  }`}
                >
                  <div className="card-body">
                    <h5 className="card-title">
                      <FaUser className="me-2" />
                      {driverName || "Unknown Driver"}
                    </h5>
                    <p className="card-text">
                      <FaPhone className="me-2" />
                      <strong>Phone:</strong> {driverPhone || "N/A"}
                      {driverPhone && (
                        <a
                          href={`tel:${driverPhone}`}
                          className="btn btn-sm btn-success ms-3"
                        >
                          Call
                        </a>
                      )}
                    </p>
                    <p className="card-text">
                      <FaChair className="me-2" />
                      <strong>Seats Available:</strong> {ride.seats}
                    </p>
                    <p className="card-text">
                      <FaMoneyBillWave className="me-2" />
                      <strong>One Seat @</strong> ₹{ride.fare}
                    </p>
                    <p className="card-text">
                      <FaClock className="me-2" />
                      <strong>Expected Departure:</strong>{" "}
                      {new Date(ride.departureTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="card-footer text-center">
                    <button
                      className={`btn ${
                        requestedRideId === ride.driverRideId
                          ? "btn-success"
                          : "btn-warning"
                      }`}
                      onClick={() => confirmRide(ride)}
                      disabled={requestedRideId === ride.driverRideId}
                    >
                      {requestedRideId === ride.driverRideId
                        ? "Ride Requested Successfully"
                        : "Request Ride"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchingRides;
