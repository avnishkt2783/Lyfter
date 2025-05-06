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

  const startLocation = localStorage.getItem("startLocationCoordinatesA");
  const destination = localStorage.getItem("destinationCoordinatesB");
  const startLocationText = localStorage.getItem("startLocation");
  const destinationText = localStorage.getItem("destination");

  const routePath = localStorage.getItem("routePath");

  const apiURL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();

  useEffect(() => {
    const now = new Date();
    const localISO = now.toISOString().slice(0, 16);
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
          {/* CREATE A DROPDOWN, FOR VEHICLES */}
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
          <input type="text" value={startLocationText} disabled />
        </div>
        <div>
          <label>Destination:</label>
          <input type="text" value={destinationText} disabled />
        </div>

        <div>
          <label>Seats Available:</label>
          <input
            type="number"
            value={seats}
            onChange={(e) => setSeats(parseInt(e.target.value))}
            min="1"
            required
          />
        </div>
        <div>
          <label>Fare:</label>
          <input
            type="number"
            value={fare}
            onChange={(e) => setFare(e.target.value)}
            placeholder="e.g. ₹200"
            required
          />
        </div>
        <div>
          <label>Departure Time:</label>
          <input
            type="datetime-local"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            required
          />
        </div>
        <button type="submit">Offer Ride</button>
      </form>

      <p>
        Create a redirect to a page of "Your Rides**" where the user sees what
        rides the have created. show the start and destination location using
        google maps API on frontend. addition of Three/Four buttons to manage
        the rides. Delete Ride, Start Ride, etc.
      </p>
    </div>
  );
};

export default RideDetails;
