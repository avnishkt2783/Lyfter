import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaPlus,
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
  const [vehicles, setVehicles] = useState([]); // To store vehicles fetched from the database
  const [selectedVehicle, setSelectedVehicle] = useState(""); // To store the selected vehicle ID
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

  // Fetch vehicles owned by the driver
  useEffect(() => {
    if (!user.userId) return;

    const fetchVehicles = async () => {
      try {
        const res = await axios.get(`${apiURL}/vehicle/getvehicles`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.data.isDriver) {
          console.log("res.isDriver", res.isDriver); //undefined ?
          navigate("/become-driver");
          return;
        }

        setVehicles(res.data.vehicles);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        alert("Failed to load vehicles.");
      }
    };
    fetchVehicles();
  }, [user.userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !name ||
      !phone ||
      !startLocation ||
      !destination ||
      !selectedVehicle ||
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
        vehicleId: selectedVehicle,
        startLocation,
        destination,
        seats,
        fare: parseFloat(fare),
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
          <label className="form-label">Mode of Transport:</label>
          <div className="d-flex align-items-center gap-2">
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              required
              className="form-select"
              style={{ flex: 1 }}
            >
              <option value="">Select Your Vehicle</option>
              {Array.isArray(vehicles) &&
                vehicles.map((vehicle) => (
                  <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                    {vehicle.brand} {vehicle.model} ({vehicle.plateNumber})
                  </option>
                ))}
            </select>

            <Link
              to="/add-vehicle"
              className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
              title="Add Vehicle"
              style={{ height: "38px", width: "38px", padding: 0 }}
            >
              <FaPlus />
            </Link>
          </div>
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
