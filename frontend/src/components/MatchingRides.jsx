import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import {
  FaCar,
  FaPhone,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaMoneyBillWave,
  FaClock,
  FaChair,
  FaCarSide,
} from "react-icons/fa";

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

const loadGoogleMapsScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) return resolve();

    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com/maps/api/js"]`
    );
    if (existingScript) {
      existingScript.onload = resolve;
      existingScript.onerror = reject;
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    }&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      resolve();
    };
    script.onerror = (err) => {
      console.error("Error loading Google Maps script:", err);
      reject(err);
    };

    document.head.appendChild(script);
  });
};

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
  const hasRun = useRef(false);

  const createPassengerRide = async () => {
    try {
      await axios.post(
        `${apiURL}/rides/createPassengerRide`,
        {
          userId,
          passengerName: passengerNamePhoneNo.passengerName,
          passengerPhoneNo: passengerNamePhoneNo.passengerPhoneNo,
          startLocation,
          destination,
          seatsRequired,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error creating ride frontend:", error);
    }
  };

  const fetchMatchingRides = async () => {
    const start = JSON.parse(startLocation);
    const dest = JSON.parse(destination);

    if (!start || !dest) {
      console.error("Start or destination coordinates are missing.");
      setLoading(false);
      return;
    }

    try {
      await loadGoogleMapsScript();

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

      const ridesData = await Promise.all(
        response.data.rides.map(async (ride) => {
          try {
            const driverStart = JSON.parse(ride.startLocation);
            const driverEnd = JSON.parse(ride.destination);

            const startAddress = await geocodeLatLng(
              driverStart.lat,
              driverStart.lng
            );
            const endAddress = await geocodeLatLng(
              driverEnd.lat,
              driverEnd.lng
            );

            return {
              ...ride,
              startLocation: startAddress,
              destination: endAddress,
            };
          } catch (err) {
            console.error("Error in geocoding ride:", err);
            return ride;
          }
        })
      );

      setRides(
        response.data.success && Array.isArray(ridesData) ? ridesData : []
      );
    } catch (error) {
      console.error("❌ Error fetching matching rides:", error);
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (!user || hasRun.current) return;
  //   hasRun.current = true;
  //   createPassengerRide();
  //   fetchMatchingRides();
  // }, [user]);

  useEffect(() => {
    const runOnce = async () => {
      if (!user || hasRun.current) return;
      hasRun.current = true;
  
      try {
        await createPassengerRide(); // Wait for this to finish
        await fetchMatchingRides();  // Then do this
      } catch (error) {
        console.error("Error during ride setup:", error);
      }
    };
  
    runOnce();
  }, [user]);

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
      console.error("Error confirming ride frontend:", error);
    }
  };

  const handleNavigate = () => {
    navigate("/yourRequestedRides");
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
            const profileImg = ride.driver?.user?.profileImg;

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
                    <h5 className="card-title d-flex align-items-center">
                      {profileImg ? (
                        <img
                          src={profileImg}
                          alt="Driver Profile"
                          className="me-2 rounded-circle"
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                            border: "2px solid #AAA",
                          }}
                        />
                      ) : (
                        <img
                          src="default.jpg"
                          alt="Driver Profile"
                          className="me-2 rounded-circle"
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                            border: "2px solid #AAA",
                          }}
                        />
                      )}

                      {driverName || "Unknown Driver"}

                      {ride.driver?.isVerified && (
                        <FaCheckCircle
                          className={`ms-2 text-success `}
                          style={{ fontSize: "1.5rem" }}
                        />
                      )}
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
                      <FaMapMarkerAlt className="me-2" />
                      <strong>From:</strong> {ride.startLocation}
                    </p>
                    <p className="card-text">
                      <FaMapMarkerAlt className="me-2" />
                      <strong>To:</strong> {ride.destination}
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

                    <hr />
                    <h6 className="mt-3">
                      <strong>Vehicle Information</strong>
                    </h6>
                    <p className="card-text">
                      <strong>Vehicle: </strong>
                      {ride.vehicle?.brand || "N/A"}{" "}
                      {ride.vehicle?.model || "N/A"} <br />
                      <strong>Color:</strong> {ride.vehicle?.color || "N/A"}{" "}
                      <br />
                      <strong>Plate:</strong>{" "}
                      {ride.vehicle?.plateNumber || "N/A"}
                    </p>
                    {ride.vehicle?.vehiclePhoto && (
                      <div className="text-center mb-2">
                        <img
                          src={ride.vehicle.vehiclePhoto}
                          alt="Vehicle"
                          className="img-fluid rounded"
                          style={{ maxHeight: "120px", objectFit: "cover" }}
                        />
                      </div>
                    )}
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
