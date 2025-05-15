import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

// Function to convert coordinates to address
const geocodeLatLng = async (lat, lng) => {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject("Google Maps API not loaded.");
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const latLng = { lat: parseFloat(lat), lng: parseFloat(lng) };

    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK" && results[0]) {
        resolve(results[0].formatted_address);
      } else {
        reject("Geocode failed: " + status);
      }
    });
  });
};

// Function to load Google Maps API script
const loadGoogleMapsScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) return resolve();

    // Check if a script with the same source already exists in the document
    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com/maps/api/js"]`
    );
    if (existingScript) {
      existingScript.onload = resolve;
      existingScript.onerror = reject;
      return;
    }

    // Create a new script element to load the Google Maps API
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    }&libraries=places`;
    script.async = true;
    script.defer = true;
    // script.onload = resolve;
    // script.onerror = reject;

    // Resolve or reject based on script load
    script.onload = () => {
      console.log("Google Maps script loaded successfully.");
      resolve();
    };
    script.onerror = (err) => {
      console.error("Error loading Google Maps script:", err);
      reject(err);
    };

    document.head.appendChild(script);
  });
};

const YourRequestedRides = () => {
  const { token, user } = useAuth();
  const userId = user.userId;
  const apiURL = import.meta.env.VITE_API_URL;
  const [requestedRides, setRequestedRides] = useState([]);

  useEffect(() => {
    const fetchRequestedRides = async () => {
      try {
        await loadGoogleMapsScript();

        const response = await axios.get(
          `${apiURL}/rides/requestedRides/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("LAUDE KA RESPONSE-----------------------------");

        console.log(response);

        // Convert coordinates to text addresses
        const ridesData = await Promise.all(
          response.data.rides.map(async (ride) => {
            try {
              const startCoords = JSON.parse(ride.driverRide?.startLocation);
              const endCoords = JSON.parse(ride.driverRide?.destination);
              console.log(startCoords);
              console.log(endCoords);

              const startAddress = await geocodeLatLng(
                startCoords.lat,
                startCoords.lng
              );
              const endAddress = await geocodeLatLng(
                endCoords.lat,
                endCoords.lng
              );
              console.log(startAddress);
              console.log(endAddress);

              return {
                ...ride,
                startLocation: startAddress,
                destination: endAddress,
              };
            } catch (err) {
              console.error("Error in geocoding:", err);
              return ride; // Return ride without changes if geocoding fails
            }
          })
        );

        setRequestedRides(ridesData || []);
      } catch (error) {
        console.error("Error fetching requested rides:", error);
      }
    };
    fetchRequestedRides();
  }, [userId, token]);

  const handleRevoke = async (rideId) => {
    try {
      await axios.delete(`${apiURL}/rides/revoke/${rideId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequestedRides((prevRides) =>
        prevRides.filter(
          (ride) => ride.passengerRide.passengerRideId !== rideId
        )
      );
    } catch (error) {
      console.error("Error revoking ride:", error);
    }
  };

  const handleConfirm = async (rideId) => {
    try {
      await axios.post(
        `${apiURL}/rides/confirm/${rideId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRequestedRides((prevRides) =>
        prevRides.map((ride) =>
          ride.passengerRide.passengerRideId === rideId
            ? { ...ride, status: "Confirmed" }
            : ride
        )
      );
    } catch (error) {
      console.error("Error confirming ride:", error);
    }
  };

  return (
    <div>
      <h2>Your Requested Rides</h2>
      {requestedRides.length === 0 ? (
        <p>No requested rides found.</p>
      ) : (
        requestedRides.map((ride) => {
          const driverName =
            ride.driverRide?.driver?.user?.fullName || "Unknown";
          const driverPhone = ride.driverRide?.driver?.user?.phoneNo || "N/A";
          // const startLocation = JSON.parse(ride.driverRide?.startLocation || "{}");
          // const destination = JSON.parse(ride.driverRide?.destination || "{}");

          let message = "";
          let showConfirm = false;
          let showRevoke = true;

          if (ride.status === "Requested") {
            message = "Your request is pending. Waiting for driver to accept";
          } else if (ride.status === "Accepted") {
            message = "Your request is accepted. Please confirm to start";
            showConfirm = true;
          } else if (ride.status === "Confirmed") {
            message = "Ride has been successfully confirmed";
            showRevoke = false;
          }

          return (
            <div
              key={ride.passengerRide.passengerRideId}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                margin: "15px 0",
                borderRadius: "8px",
              }}
            >
              <p>
                <strong>Driver:</strong> {driverName}
              </p>
              <p>
                <strong>Phone:</strong> {driverPhone}
              </p>
              <p>
                <strong>Start Location:</strong> {ride.startLocation}
              </p>
              <p>
                <strong>Destination:</strong> {ride.destination}
              </p>
              <p>
                <strong>Fare:</strong> ₹{ride.driverRide?.fare || "N/A"}
              </p>
              <p>
                <strong>Seats Requested:</strong>{" "}
                {ride.passengerRide?.seatsRequired || "N/A"}
              </p>
              <p>
                <strong>Seats Available:</strong>{" "}
                {ride.driverRide?.seats || "N/A"}
              </p>
              <p>
                <strong>Status:</strong> {message}
              </p>
              {showConfirm && (
                <button
                  onClick={() =>
                    handleConfirm(ride.passengerRide.passengerRideId)
                  }
                >
                  Confirm
                </button>
              )}
              {showRevoke && (
                <button
                  onClick={() =>
                    handleRevoke(ride.passengerRide.passengerRideId)
                  }
                  style={{ marginLeft: "10px" }}
                >
                  Revoke
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default YourRequestedRides;
