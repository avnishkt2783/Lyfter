import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const RideDetails = () => {
  const [user, setUser] = useState({});
  const [mode, setMode] = useState("Car");
  const [seats, setSeats] = useState(1);
  const [fare, setFare] = useState("");
  const [departureTime, setDepartureTime] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const startLocation = localStorage.getItem("startLocation");
  const destination = localStorage.getItem("destination");

  const apiURL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();

  useEffect(() => {
    axios.get(`${apiURL}/profile`, {
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

    if (!name || !phone || !startLocation || !destination) {
        alert("Please fill in all required fields.");
        return;
      }

    try {
      const rideData = {
        userId: user.userId,
        name,
        phone,
        mode,
        startLocation,
        destination,
        seats,
        fare,
        departureTime,
      };

      const res = await axios.post(`${apiURL}/rides/offerride`, rideData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Ride offered successfully!");
      console.log(res.data);
    } catch (error) {
      console.error("Failed to offer ride:", error);
      alert("Something went wrong while offering the ride.");
    }
  };

  return (
    <div>
      <h2>Offer a Ride</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>
        <div>
          <label>Phone Number:</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            required
          />
        </div>
        <div>
        <label>Mode of Transport:</label>
        <input
          type="text"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          required
        />
        </div>
        
        <div>
        <label>Start Location:</label>
        <input type="text" value={startLocation} readOnly />
        </div>
        <div>
        <label>Destination:</label>
        <input type="text" value={destination} readOnly />
        </div>
        
        <div>
          <label>Seats Available:</label>
          <input
            type="number"
            value={seats}
            onChange={(e) => setSeats(parseInt(e.target.value))}
            min="1"
          />
        </div>
        <div>
          <label>Fare:</label>
          <input
            type="text"
            value={fare}
            onChange={(e) => setFare(e.target.value)}
            placeholder="e.g. ₹200"
          />
        </div>
        <div>
          <label>Departure Time:</label>
          <input
            type="datetime-local"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
          />
        </div>
        <button type="submit">Offer Ride</button>
      </form>
    </div>
  );
};

export default RideDetails;
