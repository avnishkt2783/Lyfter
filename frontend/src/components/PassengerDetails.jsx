import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const PassengerDetails = () => {
  const navigate = useNavigate();
    const [userData, setUserData] = useState({});
  const [seats, setSeats] = useState(1);
    // Editable fields
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

  const startLocation = localStorage.getItem("startLocation");
  const destination = localStorage.getItem("destination");
  // const userId = localStorage.getItem("userId");

  const apiURL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();

  useEffect(() => {
    axios
      .get(`${apiURL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUserData(res.data);
        
      // If fullName or phoneNo exists, set them in editable state
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
      // const passengerRes = await axios.get(`${apiURL}/passenger/getbyuser/${userId}`);
      // const passengerId = passengerRes.data.passenger.passengerId;

      await axios.post(`${apiURL}/rides/passengerdetails`, {
        // passengerId,
        name,
        phone,
        startLocation,
        destination,
        seatsRequired: seats,
      },{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate(`/matchingrides?destination=${destination}`);
    } catch (error) {
      console.error("Error saving passenger ride request", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Passenger Details</h2>
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

      {/* Display start and destination from localStorage */}
      <div>
        <label>Start Location:</label>
        <input type="text" value={startLocation} readOnly />
      </div>
      <div>
        <label>Destination:</label>
        <input type="text" value={destination} readOnly />
      </div>

      {/* Seats input */}
      <div>
        <label>Seats Required:</label>
        <input
          type="number"
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
          min="1"
          required
          placeholder="Seats Required"
        />
      </div>

      <button type="submit">Show Rides</button>
    </form>
  );
};

export default PassengerDetails;
