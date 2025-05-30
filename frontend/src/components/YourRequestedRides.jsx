import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { Spinner, Accordion } from "react-bootstrap";
import {
  FaPhone,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaChair,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import { useTheme } from "../ThemeContext";
import "./YourRequestedRides.css";

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

const YourRequestedRides = () => {
  const { token, user, authLoading } = useAuth();
  const userId = user?.userId;
  const apiURL = import.meta.env.VITE_API_URL;
  const [requestedRides, setRequestedRides] = useState([]);
  const [loading, setLoading] = useState(false);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (authLoading) return;

    if (!userId || !token) {
      setRequestedRides([]);
      return;
    }

    const fetchRequestedRides = async () => {
      setLoading(true);
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

        const ridesData = await Promise.all(
          response.data.rides.map(async (ride) => {
            try {
              const startCoords = JSON.parse(ride.driverRide?.startLocation);
              const endCoords = JSON.parse(ride.driverRide?.destination);
              const pRstartCoords = JSON.parse(
                ride.passengerRide?.startLocation
              );
              const pRendCoords = JSON.parse(ride.passengerRide?.destination);

              const startAddress = await geocodeLatLng(
                startCoords.lat,
                startCoords.lng
              );
              const endAddress = await geocodeLatLng(
                endCoords.lat,
                endCoords.lng
              );

              const pRstartAddress = await geocodeLatLng(
                pRstartCoords.lat,
                pRstartCoords.lng
              );
              const pRendAddress = await geocodeLatLng(
                pRendCoords.lat,
                pRendCoords.lng
              );

              return {
                ...ride,
                startLocation: startAddress,
                destination: endAddress,
                pRstartLocation: pRstartAddress,
                pRdestination: pRendAddress,
              };
            } catch (err) {
              console.error("Error in geocoding:", err);
              return ride;
            }
          })
        );

        setRequestedRides(ridesData || []);
      } catch (error) {
        console.error("Error fetching requested rides:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequestedRides();
  }, [authLoading, userId, token]);

  if (authLoading) return <p>Authenticating...</p>;
  if (!userId || !token)
    return <p>Please log in to see your requested rides.</p>;
  if (loading)
    return (
      <>
        <div className={`your-requested-rides-container`}>
          <h2
            className={`your-requested-rides-heading ${
              isDark ? "text-white" : "text-dark"
            }`}
          >
            Your Requested Rides
          </h2>
          <div className="your-requested-loading text-center py-5">
            <Spinner
              animation="border"
              variant={isDark ? "light" : "primary"}
            />
            <p className="mt-3">Loading rides...</p>
          </div>
        </div>
      </>
    );

  const handleRevoke = async (passengerRideId, driverRideId) => {
    try {
      await axios.delete(
        `${apiURL}/rides/revoke/${passengerRideId}/${driverRideId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequestedRides((prevRides) =>
        prevRides.filter(
          (ride) =>
            !(
              ride.passengerRide.passengerRideId === passengerRideId &&
              ride.driverRide.driverRideId === driverRideId
            )
        )
      );
    } catch (error) {
      console.error("Error revoking ride:", error);
    }
  };

  const handleConfirm = async (passengerRideId, driverRideId) => {
    try {
      const response = await axios.post(
        `${apiURL}/rides/confirm/${passengerRideId}/${driverRideId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequestedRides((prevRides) =>
        prevRides.map((ride) =>
          ride.passengerRide.passengerRideId === passengerRideId &&
          ride.driverRide.driverRideId === driverRideId
            ? { ...ride, status: "Confirmed" }
            : ride
        )
      );
    } catch (error) {
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data?.error === "Insufficient seats available"
      ) {
        const shouldRevoke = window.confirm(
          "Insufficient seats available. Click OK to revoke your request."
        );
        if (shouldRevoke) {
          const ride = requestedRides.find(
            (r) =>
              r.passengerRide.passengerRideId === passengerRideId &&
              r.driverRide.driverRideId === driverRideId
          );

          if (ride) {
            await handleRevoke(
              ride.passengerRide.passengerRideId,
              ride.driverRide.driverRideId
            );
          }
        }
      } else {
        console.error("Error confirming ride:", error);
        alert("Failed to confirm the ride.");
      }
    }
  };

  return (
    <>
      <div className="your-requested-rides-container">
        <h2
          className={`your-requested-rides-heading ${
            isDark ? "text-white" : "text-dark"
          }`}
        >
          Your Requested Rides
        </h2>

        {requestedRides.length === 0 ? (
          <p
            className={`your-requested-no-rides ${
              isDark ? "text-light" : "text-secondary"
            }`}
          >
            No requested rides found.
          </p>
        ) : (
          requestedRides.map((ride) => {
            const driverName =
              ride.driverRide?.driver?.user?.fullName || "Unknown";
            const driverPhone = ride.driverRide?.driver?.user?.phoneNo || "N/A";
            const profileImg = ride.driverRide?.driver?.user?.profileImg;

            let message = "";
            let showConfirm = false;
            let showRevoke = true;
            let statusClass = "";

            switch (ride.status) {
              case "Requested":
                message = "Waiting for driver to accept your request.";
                statusClass = "yr-status-requested";
                break;
              case "Accepted":
                message = "Request accepted. Confirm ASAP!";
                showConfirm = true;
                statusClass = "yr-status-accepted";
                break;
              case "Confirmed":
                message =
                  "You booked your seats. Driver can Start or Cancel Ride.";
                showRevoke = false;
                statusClass = "yr-status-confirmed";
                break;
              case "Rejected":
                message = "Ride was cancelled or request rejected.";
                statusClass = "yr-status-rejected";
                break;
              case "Finished":
                message = "Ride completed.";
                showRevoke = false;
                statusClass = "yr-status-finished";
                break;
              default:
                message = "Unknown status.";
                statusClass = "yr-status-unknown";
            }

            return (
              <div
                className={`your-requested-card card mb-4 shadow-sm border ${
                  isDark
                    ? "bg-dark text-white border-secondary"
                    : "bg-light text-dark border-dark"
                }`}
                key={ride.passengerRide.passengerRideId}
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

                    {ride.driverRide?.driver?.isVerified && (
                      <FaCheckCircle
                        className={`ms-2 text-success `}
                        style={{ fontSize: "1.5rem" }}
                      />
                    )}
                  </h5>

                  <p>
                    <FaPhone /> <strong>Phone:</strong> {driverPhone}
                    {driverPhone && (
                      <a
                        href={`tel:${driverPhone}`}
                        className="btn btn-sm btn-success ms-3"
                      >
                        Call
                      </a>
                    )}
                  </p>
                  <p>
                    <FaChair /> <strong>Seats Requested:</strong>{" "}
                    {ride.passengerRide?.seatsRequired || "N/A"}
                  </p>
                  <p>
                    <FaChair /> <strong>Seats Available:</strong>{" "}
                    {ride.driverRide?.seats || "N/A"}
                  </p>
                  <Accordion defaultActiveKey={null} className="my-3">
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>Route</Accordion.Header>
                      <Accordion.Body>
                        <div>
                          <strong>Driver Route:</strong>
                          <p>
                            <FaMapMarkerAlt className="me-2" />
                            <strong>From:</strong> {ride.startLocation}
                          </p>
                          <p>
                            <FaMapMarkerAlt className="me-2" />
                            <strong>To:</strong> {ride.destination}
                          </p>
                        </div>

                        <hr />

                        <div>
                          <strong>Passenger Route:</strong>
                          <p>
                            <FaMapMarkerAlt className="me-2" />
                            <strong>From:</strong> {ride.pRstartLocation}
                          </p>
                          <p>
                            <FaMapMarkerAlt className="me-2" />
                            <strong>To:</strong> {ride.pRdestination}
                          </p>
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                  <p>
                    <FaMoneyBillWave /> <strong>One Seat @ </strong> ₹
                    {ride.driverRide?.fare || "N/A"}
                  </p>
                  <p className="card-text">
                    <FaClock />
                    <strong>Expected Departure:</strong>{" "}
                    {new Date(ride.driverRide?.departureTime).toLocaleString()}
                  </p>

                  <div className="card mt-3">
                    <div className="card-body">
                      <h6 className="card-title">
                        <strong>Vehicle Information</strong>
                      </h6>
                      <div className="row align-items-center">
                        <div className="col-md-8 mb-3">
                          <p className="mb-1">
                            <strong>Vehicle: </strong>
                            {ride.driverRide?.vehicle?.brand || "N/A"}{" "}
                            {ride.driverRide?.vehicle?.model || "N/A"}
                          </p>
                          <p className="mb-1">
                            <strong>Color:</strong>{" "}
                            {ride.driverRide?.vehicle?.color || "N/A"}
                          </p>
                          <p className="mb-0">
                            <strong>Plate:</strong>{" "}
                            {ride.driverRide?.vehicle?.plateNumber || "N/A"}
                          </p>
                        </div>
                        <div className="col-md-4 text-center my-3">
                          {ride.driverRide?.vehicle?.vehiclePhoto ? (
                            <img
                              src={ride.driverRide.vehicle.vehiclePhoto}
                              alt="Vehicle"
                              className="img-fluid rounded shadow"
                              style={{ maxHeight: "120px", objectFit: "cover" }}
                            />
                          ) : (
                            <div className="text-muted">No Image</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className={`mt-3 your-requested-status ${statusClass}`}>
                    <FaInfoCircle /> {message}
                  </p>

                  <div className="your-requested-actions d-flex gap-2 mt-3">
                    {showConfirm && (
                      <button
                        className="btn btn-success"
                        onClick={() =>
                          handleConfirm(
                            ride.passengerRide.passengerRideId,
                            ride.driverRide.driverRideId
                          )
                        }
                      >
                        <FaCheckCircle /> Confirm
                      </button>
                    )}
                    {showRevoke && (
                      <button
                        className="btn btn-danger"
                        onClick={() =>
                          handleRevoke(
                            ride.passengerRide.passengerRideId,
                            ride.driverRide.driverRideId
                          )
                        }
                      >
                        <FaTimesCircle /> Revoke / Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default YourRequestedRides;
