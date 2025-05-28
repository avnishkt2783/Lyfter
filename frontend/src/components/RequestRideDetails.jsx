import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { getRegex } from "../utils/Regex";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaMapSigns,
  FaChair,
  FaSearch,
  FaCarSide,
} from "react-icons/fa";

const RequestRideDetails = () => {
  const navigate = useNavigate();
  const [seats, setSeats] = useState(1);
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhoneNo, setPassengerPhoneNo] = useState("");
   const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const startLocation = localStorage.getItem("startLocationCoordinatesA");
  const destination = localStorage.getItem("destinationCoordinatesB");
  const startLocationText = localStorage.getItem("startLocation");
  const destinationText = localStorage.getItem("destination");

  const apiURL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    axios
      .get(`${apiURL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.fullName) setPassengerName(res.data.fullName);
        if (res.data.phoneNo) setPassengerPhoneNo(res.data.phoneNo);
      })
      .catch((err) => console.error("Error fetching user:", err));
  }, []);

   const validateForm = () => {
        // REGEX
          const phoneRegex = getRegex("phone");
         
      if (!phoneRegex.test(passengerPhoneNo)) {
        setError("Invalid Phone number");
        return false;
      }
    
         setError("");
      return true;
    
      }

  const handleSubmit = (e) => {
    e.preventDefault();
    
        if (!validateForm()) {
    setSuccess("");
    return;
  }
    if (
      !passengerName ||
      !passengerPhoneNo ||
      !startLocation ||
      !destination ||
      !seats
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      localStorage.setItem("seatsRequired", seats);
      const passengerNamePhoneNo = JSON.stringify({
        passengerName,
        passengerPhoneNo,
      });
      localStorage.setItem("passengerNamePhoneNo", passengerNamePhoneNo);
      navigate(`/matchingRides`);
    } catch (error) {
      console.error("Error saving passenger ride request", error);
    }
  };

  return (
    <div
      className={`container py-5 ${
        isDark ? "bg-dark text-light" : "text-dark"
      }`}
    >
      <div
        className={`card shadow mx-auto p-4 ${
          isDark
            ? "bg-dark text-white border-secondary"
            : "bg-white border-dark"
        }`}
        style={{ maxWidth: "750px" }}
      >
        <div className="card-body">
          <h3 className="card-title mb-4 text-center">
            <FaCarSide className="me-2" />
            Request a Ride
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">
                <FaUser className="me-2" />
                Full Name:
              </label>
              <input
                type="text"
                className="form-control"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                <FaPhone className="me-2" />
                Phone Number:
              </label>
              <input
                type="tel"
                className="form-control"
                value={passengerPhoneNo}
                onChange={(e) => setPassengerPhoneNo(e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                <FaMapMarkerAlt className="me-2" />
                Start Location:
              </label>
              <input
                type="text"
                className="form-control"
                value={startLocationText}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                <FaMapSigns className="me-2" />
                Destination:
              </label>
              <input
                type="text"
                className="form-control"
                value={destinationText}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                <FaChair className="me-2" />
                Seats Required:
              </label>
              <input
                type="number"
                className="form-control"
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                min="1"
                placeholder="Seats Required"
                required
              />
            </div>
            <div className="text-center">
              {/* <button
                type="button"
                className="btn btn-secondary px-4 me-3"
                onClick={handleRequestOnly}
              >
                <FaSearch className="me-2" />
                Request Only
              </button> */}
              <button type="submit" className="btn btn-primary px-4">
                <FaSearch className="me-2" />
                Request & Find Rides
              </button>
            </div>
                {error && (
  <div className="alert alert-danger mt-3">
    {error}
  </div>
)}
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestRideDetails;
