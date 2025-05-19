import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";

import {
  FaUser,
  FaPhone,
  FaCar,
  FaMotorcycle,
  FaUsers,
  FaMoneyBillAlt,
  FaClock,
  FaMapMarkerAlt,
  FaHandshake,
} from "react-icons/fa";

const OfferRideDetails = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [user, setUser] = useState({});
  const [mode, setMode] = useState("Car");
  const [seats, setSeats] = useState(1);
  const [fare, setFare] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const startLocation = localStorage.getItem("startLocationCoordinatesA");
  const destination = localStorage.getItem("destinationCoordinatesB");
  const startLocationText = localStorage.getItem("startLocation");
  const destinationText = localStorage.getItem("destination");
  const routePath = localStorage.getItem("routePath");
  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const adjusted = new Date(now.getTime() - offset * 60000)
      .toISOString()
      .slice(0, 16);
    setDepartureTime(adjusted);
  }, []);

  useEffect(() => {
    axios
      .get(`${apiURL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        if (res.data.fullName) setName(res.data.fullName);
        if (res.data.phoneNo) setPhone(res.data.phoneNo);
      })
      .catch((err) => console.error("Error fetching user:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !name ||
      !phone ||
      !startLocation ||
      !destination ||
      !mode ||
      !seats ||
      !fare ||
      !departureTime ||
      !routePath
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const rideData = {
        userId: user.userId,
        mode,
        startLocation,
        destination,
        seats,
        fare,
        departureTime,
        routePath,
        status: "Waiting",
      };

      await axios.post(`${apiURL}/rides/offerRideDetails`, rideData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/yourOfferedRides");
    } catch (error) {
      console.error("Failed to offer ride:", error);
      alert("Something went wrong while offering the ride.");
    }
  };

  return (
    <div
      className={`container m-5 p-4 rounded shadow mx-auto border ${
        isDark ? "bg-dark text-light border-secondary" : "text-dark border-dark"
      }`}
      style={{ maxWidth: "600px" }}
    >
      <h2 className="mb-4 text-center">
        <FaHandshake className="me-2" />
        Offer a Ride
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">
            <FaUser className="me-2" /> Name:
          </label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            <FaPhone className="me-2" /> Phone Number:
          </label>
          <input
            type="tel"
            className="form-control"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            <FaCar className="me-2" /> Mode of Transport:
          </label>
          <select
            className="form-select"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            required
          >
            <option value="Car">Car 🚗</option>
            <option value="Bike">Bike 🏍️</option>
            <option value="Auto">Auto 🚖</option>
            <option value="Van">Van 🚐</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">
            <FaMapMarkerAlt className="me-2" /> Start Location:
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
            <FaMapMarkerAlt className="me-2" /> Destination:
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
            <FaUsers className="me-2" /> Seats Available:
          </label>
          <input
            type="number"
            className="form-control"
            value={seats}
            onChange={(e) => setSeats(parseInt(e.target.value))}
            min="1"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            <FaMoneyBillAlt className="me-2" /> Fare (₹):
          </label>
          <input
            type="number"
            className="form-control"
            value={fare}
            onChange={(e) => setFare(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="form-label">
            <FaClock className="me-2" /> Departure Time:
          </label>
          <input
            type="datetime-local"
            className="form-control"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          <FaHandshake className="me-2" />
          Offer Ride
        </button>
      </form>
    </div>
  );
};

export default OfferRideDetails;
