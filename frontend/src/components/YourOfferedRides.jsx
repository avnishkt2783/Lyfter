import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Badge, Card } from 'react-bootstrap';
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
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`);
    if (existingScript) {
      existingScript.onload = resolve;
      existingScript.onerror = reject;
      return;
    }

     // Create a new script element to load the Google Maps API
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
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
  // console.log(token)
  // Fetch the offered rides for the driver
  useEffect(() => {
    const fetchOfferedRides = async () => {
      try {

        await loadGoogleMapsScript();

        const response = await axios.get(`${apiURL}/rides/yourofferedrides`,{
           headers: { Authorization: `Bearer ${token}` },
        }); // API to get offered rides
        console.log(response);
         // Convert coordinates to text addresses
        const ridesData = await Promise.all(
          response.data.rides.map(async (ride) => {
            try {
              const startCoords = JSON.parse(ride.startLocation);
              const endCoords = JSON.parse(ride.destination);
              console.log(startCoords);
              console.log(endCoords);
              
              const startAddress = await geocodeLatLng(startCoords.lat, startCoords.lng);
              const endAddress = await geocodeLatLng(endCoords.lat, endCoords.lng);
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


        // setRides(response.data.rides);
        setRides(ridesData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching offered rides:", error);
        setLoading(false);
      }
    };
    fetchOfferedRides();
  }, []);

  // Handle clicking on the badge to show pending requests
  const handleBadgeClick = async (driverRideId) => {
    try {


      const response = await axios.get(`${apiURL}/rides/pendingrequests/${driverRideId}`, {
      headers: { Authorization: `Bearer ${token}` },}); // API to get pending requests for a ride
       console.log("Pending Requests Response:", response.data);
        const requestsData = await Promise.all(
          response.data.requests.map(async (ride) => {
            try {
              const startCoords = JSON.parse(ride.startLocation);
              const endCoords = JSON.parse(ride.destination);
              console.log(startCoords);
              console.log(endCoords);
              
              const startAddress = await geocodeLatLng(startCoords.lat, startCoords.lng);
              const endAddress = await geocodeLatLng(endCoords.lat, endCoords.lng);
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

      // setSelectedRequest(response.data.requests);
      setSelectedRequest(requestsData);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  // Accept or reject a passenger request
  const handleRequestStatusChange = async (passengerRideId, status) => {
    try {
      const response = await axios.post(`${apiURL}/rides/updaterequeststatus`, { passengerRideId, status });
      if (response.data.success) {
        setShowModal(false);
        setRides(prevRides => prevRides.map(ride => {
          if (ride.driverRideId === passengerRideId) {
            return { ...ride, pendingRequests: ride.pendingRequests - 1 };
          }
          return ride;
        }));
      }
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  // Start, Cancel, and Finish Ride buttons logic
  const handleRideAction = async (driverRideId, action) => {
    try {
      const response = await axios.post(`${apiURL}/rides/rideaction`, { driverRideId, action });
      if (response.data.success) {
        // Optionally, handle UI changes like ride status update
        console.log(`${action} action successfully performed`);
      }
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
    }
  };

  return (
    <div>
      <h1>Your Offered Rides</h1>
      {loading ? (
        <p>Loading rides...</p>
      ) : (
        <div className="ride-cards-container">
          {rides.map((ride) => (
            <Card key={ride.driverRideId} className="ride-card" style={{ position: 'relative' }}> 
              <Card.Body>
                <Card.Title>Driver Ride ID: {ride.driverRideId}</Card.Title>
                <Card.Text>
                  <strong>Start Location:</strong> {ride.startLocation}
                  <br />
                  <strong>Destination:</strong> {ride.destination}
                  <br />
                  <strong>Departure Time:</strong> {new Date(ride.departureTime).toLocaleString()}
                  <br />
                  <strong>Seats Available:</strong> {ride.seats}
                </Card.Text>

                {/* Badge for pending requests */}
                {ride.pendingRequests > 0 && (
                  <Badge
                    pill
                    variant="warning"
                    style={{ position: 'absolute', top: 10, right: 10 }}
                    onClick={() => handleBadgeClick(ride.driverRideId)}
                  >
                    {ride.pendingRequests} Request(s) Pending
                  </Badge>
                )}

                {/* Buttons: Start Ride, Cancel Ride, Finish Ride */}
                <div className="ride-buttons">
                  <Button variant="primary" onClick={() => handleRideAction(ride.driverRideId, 'Start Ride')}>Start Ride</Button>
                  <Button variant="danger" onClick={() => handleRideAction(ride.driverRideId, 'Cancel Ride')}>Cancel Ride</Button>
                  <Button variant="success" onClick={() => handleRideAction(ride.driverRideId, 'Finish Ride')}>Finish Ride</Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for displaying pending requests */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Pending Requests</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { selectedRequest && selectedRequest.length > 0 ?(
            selectedRequest.map((request) => (
              <div key={request.passengerRideId} className="request-info">
                <p><strong>Passenger Name:</strong> {request.passengerName || "Unknown"}</p>
                <p><strong>Phone No:</strong> {request.passengerPhoneNo || "N/A"}</p>
                <p><strong>Start Location:</strong> {request.startLocation || "N/A"}</p>
                <p><strong>Destination:</strong> {request.destination || "N/A"}</p>
                <p><strong>Seats Required:</strong> {request.seatsRequired || 0}</p>

                <div className="request-buttons">
                  <Button variant="success" onClick={() => handleRequestStatusChange(request.passengerRideId, 'Accepted')} className="me-2">Accept</Button>
                  <Button variant="danger" onClick={() => handleRequestStatusChange(request.passengerRideId, 'Rejected')}>Reject</Button>
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
