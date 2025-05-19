import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import {
  Card,
  Button,
  Badge,
  Accordion,
  Modal,
  Spinner,
} from "react-bootstrap";
import {
  FaMapMarkerAlt,
  FaClock,
  FaChair,
  FaUser,
  FaPhone,
  FaInfoCircle,
} from "react-icons/fa";
import { useTheme } from "../ThemeContext";
import "./YourOfferedRides.css";

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

const YourOfferedRides = () => {
  const [rides, setRides] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiURL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();

  const { theme } = useTheme();
  const isDark = theme === "dark";
  // console.log(token)
  // Fetch the offered rides for the driver

  const fetchOfferedRides = async () => {
    try {
      await loadGoogleMapsScript();

      const response = await axios.get(`${apiURL}/rides/yourofferedrides`, {
        headers: { Authorization: `Bearer ${token}` },
      }); // API to get offered rides
      console.log(response);
      // Convert coordinates to text addresses
      const ridesData = await Promise.all(
        response.data.rides.map(async (ride) => {
          try {
            const startCoords = JSON.parse(ride.startLocation);
            const endCoords = JSON.parse(ride.destination);

            const startAddress = await geocodeLatLng(
              startCoords.lat,
              startCoords.lng
            );
            const endAddress = await geocodeLatLng(
              endCoords.lat,
              endCoords.lng
            );

            // Fetch accepted or confirmed rides
            const acceptedRidesResponse = await axios.get(
              `${apiURL}/rides/acceptedorconfirmed/${ride.driverRideId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            const acceptedRidesWithAddress = await Promise.all(
              (acceptedRidesResponse.data.rides || []).map(
                async (acceptedRide) => {
                  try {
                    const passengerRide = acceptedRide.passengerRide;

                    if (passengerRide) {
                      const passengerStartCoords = JSON.parse(
                        passengerRide.startLocation
                      );
                      const passengerEndCoords = JSON.parse(
                        passengerRide.destination
                      );

                      const passengerStartAddress = await geocodeLatLng(
                        passengerStartCoords.lat,
                        passengerStartCoords.lng
                      );

                      const passengerEndAddress = await geocodeLatLng(
                        passengerEndCoords.lat,
                        passengerEndCoords.lng
                      );

                      return {
                        ...acceptedRide,
                        passengerRide: {
                          ...passengerRide,
                          startLocation: passengerStartAddress,
                          destination: passengerEndAddress,
                        },
                      };
                    } else {
                      return acceptedRide;
                    }
                  } catch (innerErr) {
                    console.error("Error geocoding accepted ride:", innerErr);
                    return acceptedRide;
                  }
                }
              )
            );

            return {
              ...ride,
              startLocation: startAddress,
              destination: endAddress,
              acceptedRides: acceptedRidesWithAddress,
            };
          } catch (err) {
            console.error("Error processing offered ride:", err);
            return { ...ride, acceptedRides: [] };
          }
        })
      );

      // setRides(response.data.rides);
      setRides(ridesData);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching offered rides:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfferedRides();
  }, []);

  // Handle clicking on the badge to show pending requests
  const handleBadgeClick = async (driverRideId) => {
    try {
      const response = await axios.get(
        `${apiURL}/rides/pendingrequests/${driverRideId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ); // API to get pending requests for a ride
      console.log("Pending Requests Response:", response.data);
      const requestsData = await Promise.all(
        response.data.requests.map(async (ride) => {
          try {
            const startCoords = JSON.parse(ride.startLocation);
            const endCoords = JSON.parse(ride.destination);
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
              driverRideId,
              startLocation: startAddress,
              destination: endAddress,
            };
          } catch (err) {
            console.error("Error in geocoding:", err);
            return ride; // Return ride without changes if geocoding fails
          }
        })
      );

      // setSelectedRequest(response.data.requests);
      setSelectedRequest(requestsData);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const handleRequestStatusChange = async (
    passengerRideId,
    driverRideId,
    status
  ) => {
    try {
      const response = await axios.post(
        `${apiURL}/rides/updaterequeststatus`,
        { passengerRideId, driverRideId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        if (status === "Accepted") {
          setSelectedRequest((prevRequests) =>
            prevRequests.filter(
              (request) => !(request.passengerRideId === passengerRideId)
            )
          );
        }

        if (status === "Rejected") {
          setSelectedRequest((prevRequests) =>
            prevRequests.filter(
              (request) =>
                !(
                  request.passengerRideId === passengerRideId &&
                  request.driverRideId === driverRideId
                )
            )
          );
        }

        // Update ride's pendingRequests count
        setRides((prevRides) =>
          prevRides.map((ride) => {
            if (ride.driverRideId === driverRideId) {
              return {
                ...ride,
                pendingRequests: Math.max(ride.pendingRequests - 1, 0),
              };
            }
            return ride;
          })
        );

        console.log(`Request ${status} successfully.`);
      }
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  // Start, Cancel, and Finish Ride buttons logic
  const handleRideAction = async (driverRideId, action) => {
    try {
      const response = await axios.post(
        `${apiURL}/rides/rideAction`,
        {
          driverRideId,
          action,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Make sure yourToken is retrieved from localStorage or context
          },
        }
      );
      if (response.data.success) {
        // Optionally, handle UI changes like ride status update
        console.log(`${action} action successfully performed`);
        fetchOfferedRides(); // Re-fetch the updated ride list
      }
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
    }
  };

  return (
    <div className={`your-offered-rides-container px-4 py-3`}>
      <h2 className="your-offered-rides-heading mb-4 fw-bold text-center">
        Your Offered Rides
      </h2>

      {loading ? (
        <div className="your-offered-loading text-center py-5">
          <Spinner animation="border" variant={isDark ? "light" : "primary"} />
          <p className="mt-3">Loading rides...</p>
        </div>
      ) : rides.length === 0 ? (
        <p
          className={`your-offered-no-rides ${
            isDark ? "text-light" : "text-secondary"
          }`}
        >
          No rides offered.
        </p>
      ) : (
        <div className="your-offered-ride-cards d-flex flex-wrap gap-4 justify-content-center">
          {rides.map((ride) => (
            <Card
              key={ride.driverRideId}
              className={`your-offered-ride-card shadow rounded position-relative ${
                isDark
                  ? "bg-dark text-white border-secondary"
                  : "bg-light text-dark border-dark"
              }`}
              style={{ width: "100%", maxWidth: "450px" }}
            >
              <Card.Body>
                <Card.Title
                  className={`your-offered-ride-title fw-semibold mb-3 ${
                    isDark ? "text-secondary-light" : "text-secondary"
                  }`}
                >
                  Ride ID: #{ride.driverRideId}
                </Card.Title>

                <Card.Text className="your-offered-ride-details">
                  <p>
                    <FaMapMarkerAlt /> <strong>From:</strong>{" "}
                    {ride.startLocation}
                  </p>
                  <p>
                    <FaMapMarkerAlt /> <strong>To:</strong> {ride.destination}
                  </p>
                  <p>
                    <FaChair /> <strong>Seats Available:</strong> {ride.seats}
                  </p>
                  <p>
                    <FaClock /> <strong>Expected Departure:</strong>{" "}
                    {new Date(ride.departureTime).toLocaleString()}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <Badge
                      bg={
                        ride.status === "Waiting"
                          ? "warning"
                          : ride.status === "Started"
                          ? "primary"
                          : ride.status === "Finished"
                          ? "success"
                          : "danger"
                      }
                      text={ride.status === "Waiting" ? "dark" : "light"}
                    >
                      {ride.status}
                    </Badge>
                  </p>
                </Card.Text>

                {/* Pending Requests Badge */}
                {ride.pendingRequests > 0 && (
                  <Badge
                    bg="warning"
                    pill
                    className="your-offered-pending-badge position-absolute top-0 end-0 m-2 text-dark"
                    onClick={() => handleBadgeClick(ride.driverRideId)}
                    style={{ cursor: "pointer" }}
                  >
                    {ride.pendingRequests} Pending
                  </Badge>
                )}

                {/* Ride Action Buttons */}
                <div className="your-offered-ride-buttons mt-3 d-flex flex-wrap gap-2">
                  {ride.status === "Waiting" && (
                    <>
                      <Button
                        variant="primary"
                        // size="sm"
                        onClick={() =>
                          handleRideAction(ride.driverRideId, "Start Ride")
                        }
                      >
                        Start
                      </Button>
                      <Button
                        variant="danger"
                        // size="sm"
                        onClick={() =>
                          handleRideAction(ride.driverRideId, "Cancel Ride")
                        }
                      >
                        Cancel
                      </Button>
                    </>
                  )}

                  {ride.status === "Started" && (
                    <Button
                      variant="success"
                      // size="sm"
                      onClick={() =>
                        handleRideAction(ride.driverRideId, "Finish Ride")
                      }
                    >
                      Finish
                    </Button>
                  )}

                  {["Cancelled", "Finished"].includes(ride.status) && (
                    <Button variant="secondary" disabled>
                      {ride.status}
                    </Button>
                  )}
                </div>

                {/* Accepted Passengers Accordion */}
                {ride.acceptedRides?.length > 0 && (
                  <Accordion className="your-offered-accordion mt-3">
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>
                        Accepted/Confirmed Passengers
                      </Accordion.Header>
                      <Accordion.Body>
                        {ride.acceptedRides.map((acceptedRide) => (
                          <div
                            key={acceptedRide.passengerRideDriverRideId}
                            className={`your-offered-passenger border-bottom pb-2 mb-3 ${
                              isDark ? "border-secondary" : "border-dark"
                            }`}
                          >
                            <p>
                              <FaUser /> <strong>Name:</strong>{" "}
                              {acceptedRide.passengerRide?.passengerName ||
                                "Unknown"}
                            </p>
                            <p>
                              <FaPhone /> <strong>Phone:</strong>{" "}
                              {acceptedRide.passengerRide?.passengerPhoneNo ||
                                "N/A"}
                              {acceptedRide.passengerRide?.passengerPhoneNo && (
                                <a
                                  href={`tel:${acceptedRide.passengerRide?.passengerPhoneNo}`}
                                  className="btn btn-sm btn-success ms-3"
                                >
                                  Call
                                </a>
                              )}
                            </p>
                            <p>
                              <FaMapMarkerAlt /> <strong>From:</strong>{" "}
                              {acceptedRide.passengerRide?.startLocation ||
                                "N/A"}
                            </p>
                            <p>
                              <FaMapMarkerAlt /> <strong>To:</strong>{" "}
                              {acceptedRide.passengerRide?.destination || "N/A"}
                            </p>
                            <p>
                              <FaChair /> <strong>Seats Requested:</strong>{" "}
                              {acceptedRide.passengerRide?.seatsRequired || 0}
                            </p>
                            <p>
                              <FaInfoCircle /> <strong>Status:</strong>{" "}
                              {acceptedRide.status}
                            </p>
                            {/* <p className="text-muted small">
                              <strong>Created:</strong>{" "}
                              {new Date(
                                acceptedRide.createdAt
                              ).toLocaleString()}
                              <br />
                              <strong>Updated:</strong>{" "}
                              {new Date(
                                acceptedRide.updatedAt
                              ).toLocaleString()}
                            </p> */}
                          </div>
                        ))}
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Pending Requests Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        className={isDark ? "modal-dark" : ""}
      >
        <Modal.Header closeButton>
          <Modal.Title>Pending Requests</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest?.length > 0 ? (
            selectedRequest.map((request) => (
              <div
                key={request.passengerRideId}
                className={`your-offered-modal-request mb-4 p-3 border rounded ${
                  isDark ? "border-secondary text-white" : "border-dark"
                }`}
              >
                <p>
                  <FaUser /> <strong>Name:</strong>{" "}
                  {request.passengerName || "Unknown"}
                </p>
                <p>
                  <FaPhone /> <strong>Phone:</strong>{" "}
                  {request.passengerPhoneNo || "N/A"}
                  {request.passengerPhoneNo && (
                    <a
                      href={`tel:${request.passengerPhoneNo}`}
                      className="btn btn-sm btn-success ms-3"
                    >
                      Call
                    </a>
                  )}
                </p>
                <p>
                  <FaMapMarkerAlt /> <strong>From:</strong>{" "}
                  {request.startLocation || "N/A"}
                </p>
                <p>
                  <FaMapMarkerAlt /> <strong>To:</strong>{" "}
                  {request.destination || "N/A"}
                </p>
                <p>
                  <FaChair /> <strong>Seats Requested:</strong>{" "}
                  {request.seatsRequired || 0}
                </p>

                <div className="d-flex gap-2 mt-2">
                  <Button
                    variant="success"
                    // size="sm"
                    onClick={() =>
                      handleRequestStatusChange(
                        request.passengerRideId,
                        request.driverRideId,
                        "Accepted"
                      )
                    }
                  >
                    Accept
                  </Button>
                  <Button
                    variant="danger"
                    // size="sm"
                    onClick={() =>
                      handleRequestStatusChange(
                        request.passengerRideId,
                        request.driverRideId,
                        "Rejected"
                      )
                    }
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p>No pending requests.</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default YourOfferedRides;
