import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaRoute,
  FaMoneyBillWave,
  FaChair,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { useTheme } from "../ThemeContext";
import "./YourRequestedRides.css";

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
  const { token, user, authLoading } = useAuth();
  const userId = user?.userId;
  const apiURL = import.meta.env.VITE_API_URL;
  const [requestedRides, setRequestedRides] = useState([]);
  const [loading, setLoading] = useState(false);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (authLoading) return; // wait for auth to finish

    if (!userId || !token) {
      setRequestedRides([]); // clear rides if no auth
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

        // Convert coordinates to text addresses
        const ridesData = await Promise.all(
          response.data.rides.map(async (ride) => {
            try {
              const startCoords = JSON.parse(ride.driverRide?.startLocation);
              const endCoords = JSON.parse(ride.driverRide?.destination);

              const startAddress = await geocodeLatLng(
                startCoords.lat,
                startCoords.lng
              );
              const endAddress = await geocodeLatLng(
                endCoords.lat,
                endCoords.lng
              );

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
      } finally {
        setLoading(false); // ✅ MAKE SURE THIS IS CALLED NO MATTER WHAT
      }
    };
    fetchRequestedRides();
  }, [authLoading, userId, token]);

  if (authLoading) return <p>Authenticating...</p>;
  if (!userId || !token)
    return <p>Please log in to see your requested rides.</p>;
  if (loading) return <p>Loading rides...</p>;

  // const handleRevoke = async (rideId) => {
  //   try {
  //     await axios.delete(`${apiURL}/rides/revoke/${rideId}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     setRequestedRides((prevRides) =>
  //       prevRides.filter(
  //         (ride) => ride.passengerRide.passengerRideId !== rideId
  //       )
  //     );
  //   } catch (error) {
  //     console.error("Error revoking ride:", error);
  //   }
  // };

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

      // Success — update status
      setRequestedRides((prevRides) =>
        prevRides.map((ride) =>
          ride.passengerRide.passengerRideId === passengerRideId &&
          ride.driverRide.driverRideId === driverRideId
            ? { ...ride, status: "Confirmed" }
            : ride
        )
      );

      // alert("Ride confirmed successfully!");
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
            (r) => r.passengerRide.passengerRideId === rideId
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

  // return (
  //   <div>
  //     <h2>Your Requested Rides</h2>
  //     {requestedRides.length === 0 ? (
  //       <p>No requested rides found.</p>
  //     ) : (
  //       requestedRides.map((ride) => {
  //         const driverName =
  //           ride.driverRide?.driver?.user?.fullName || "Unknown";
  //         const driverPhone = ride.driverRide?.driver?.user?.phoneNo || "N/A";

  //         let message = "";
  //         let showConfirm = false;
  //         let showRevoke = true;

  //         if (ride.status === "Requested") {
  //           message = "Waiting for driver to accept your request.";
  //         } else if (ride.status === "Accepted") {
  //           message =
  //             "Your request was accepted by the Driver. Confirm ASAP before seats get occupied.";
  //           showConfirm = true;
  //         } else if (ride.status === "Confirmed") {
  //           message = "You booked your seats. Driver can Start or Cancel Ride.";
  //           showRevoke = false;
  //         } else if (ride.status === "Rejected") {
  //           message =
  //             "The Ride was Cancelled or the request was Rejected by the Driver.";
  //         } else if (ride.status === "Finished") {
  //           message = "Your Ride has Finished.";
  //           showRevoke = false;
  //         }

  //         return (
  //           <div
  //             key={ride.passengerRide.passengerRideId}
  //             style={{
  //               border: "1px solid #ccc",
  //               padding: "15px",
  //               margin: "15px 0",
  //               borderRadius: "8px",
  //             }}
  //           >
  //             <p>
  //               <strong>Driver:</strong> {driverName}
  //             </p>
  //             <p>
  //               <strong>Phone:</strong> {driverPhone}
  //             </p>
  //             <p>
  //               <strong>Start Location:</strong> {ride.startLocation}
  //             </p>
  //             <p>
  //               <strong>Destination:</strong> {ride.destination}
  //             </p>
  //             <p>
  //               <strong>Fare:</strong> ₹{ride.driverRide?.fare || "N/A"}
  //             </p>
  //             <p>
  //               <strong>Seats Requested:</strong>{" "}
  //               {ride.passengerRide?.seatsRequired || "N/A"}
  //             </p>
  //             <p>
  //               <strong>Seats Available:</strong>{" "}
  //               {ride.driverRide?.seats || "N/A"}
  //             </p>
  //             <p>
  //               <strong>Status:</strong> {message}
  //             </p>
  //             {showConfirm && (
  //               <button
  //                 onClick={() =>
  //                   handleConfirm(
  //                     ride.passengerRide.passengerRideId,
  //                     ride.driverRide.driverRideId
  //                   )
  //                 }
  //               >
  //                 Confirm
  //               </button>
  //             )}
  //             {showRevoke && (
  //               <button
  //                 onClick={() =>
  //                   handleRevoke(
  //                     ride.passengerRide.passengerRideId,
  //                     ride.driverRide.driverRideId
  //                   )
  //                 }
  //                 style={{ marginLeft: "10px" }}
  //               >
  //                 Revoke / Delete
  //               </button>
  //             )}
  //           </div>
  //         );
  //       })
  //     )}
  //   </div>
  // );

  return (
    // <div className="rides-container">
    //   <h2 className="rides-heading">Your Requested Rides</h2>
    //   {requestedRides.length === 0 ? (
    //     <p className="no-rides">No requested rides found.</p>
    //   ) : (
    //     requestedRides.map((ride) => {
    //       const driverName =
    //         ride.driverRide?.driver?.user?.fullName || "Unknown";
    //       const driverPhone = ride.driverRide?.driver?.user?.phoneNo || "N/A";

    //       let message = "";
    //       let showConfirm = false;
    //       let showRevoke = true;
    //       let statusClass = "";

    //       switch (ride.status) {
    //         case "Requested":
    //           message = "Waiting for driver to accept your request.";
    //           statusClass = "status-requested";
    //           break;
    //         case "Accepted":
    //           message = "Request accepted. Confirm ASAP!";
    //           showConfirm = true;
    //           statusClass = "status-accepted";
    //           break;
    //         case "Confirmed":
    //           message =
    //             "You booked your seats. Driver can Start or Cancel Ride.";
    //           showRevoke = false;
    //           statusClass = "status-confirmed";
    //           break;
    //         case "Rejected":
    //           message = "Ride was cancelled or request rejected.";
    //           statusClass = "status-rejected";
    //           break;
    //         case "Finished":
    //           message = "Ride completed.";
    //           showRevoke = false;
    //           statusClass = "status-finished";
    //           break;
    //         default:
    //           message = "Unknown status.";
    //           statusClass = "status-unknown";
    //       }

    //       return (
    //         <div className="ride-card" key={ride.passengerRide.passengerRideId}>
    //           <div className="ride-info">
    //             <p>
    //               <FaUser /> <strong>Driver:</strong> {driverName}
    //             </p>
    //             <p>
    //               <FaPhone /> <strong>Phone:</strong> {driverPhone}
    //             </p>
    //             <p>
    //               <FaMapMarkerAlt /> <strong>Start:</strong>{" "}
    //               {ride.startLocation}
    //             </p>
    //             <p>
    //               <FaRoute /> <strong>Destination:</strong> {ride.destination}
    //             </p>
    //             <p>
    //               <FaMoneyBillWave /> <strong>Fare:</strong> ₹
    //               {ride.driverRide?.fare || "N/A"}
    //             </p>
    //             <p>
    //               <FaChair /> <strong>Seats Requested:</strong>{" "}
    //               {ride.passengerRide?.seatsRequired || "N/A"}
    //             </p>
    //             <p>
    //               <FaChair /> <strong>Seats Available:</strong>{" "}
    //               {ride.driverRide?.seats || "N/A"}
    //             </p>
    //           </div>
    //           <p className={`ride-status ${statusClass}`}>
    //             <FaInfoCircle /> {message}
    //           </p>
    //           <div className="ride-actions">
    //             {showConfirm && (
    //               <button
    //                 className="btn btn-confirm"
    //                 onClick={() =>
    //                   handleConfirm(
    //                     ride.passengerRide.passengerRideId,
    //                     ride.driverRide.driverRideId
    //                   )
    //                 }
    //               >
    //                 <FaCheckCircle /> Confirm
    //               </button>
    //             )}
    //             {showRevoke && (
    //               <button
    //                 className="btn btn-revoke"
    //                 onClick={() =>
    //                   handleRevoke(
    //                     ride.passengerRide.passengerRideId,
    //                     ride.driverRide.driverRideId
    //                   )
    //                 }
    //               >
    //                 <FaTimesCircle /> Revoke / Delete
    //               </button>
    //             )}
    //           </div>
    //         </div>
    //       );
    //     })
    //   )}
    // </div>

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
                  <p>
                    <FaUser /> <strong>Driver:</strong> {driverName}
                  </p>
                  <p>
                    <FaPhone /> <strong>Phone:</strong> {driverPhone}
                  </p>
                  <p>
                    <FaMapMarkerAlt /> <strong>Start:</strong>{" "}
                    {ride.startLocation}
                  </p>
                  <p>
                    <FaRoute /> <strong>Destination:</strong> {ride.destination}
                  </p>
                  <p>
                    <FaMoneyBillWave /> <strong>Fare:</strong> ₹
                    {ride.driverRide?.fare || "N/A"}
                  </p>
                  <p>
                    <FaChair /> <strong>Seats Requested:</strong>{" "}
                    {ride.passengerRide?.seatsRequired || "N/A"}
                  </p>
                  <p>
                    <FaChair /> <strong>Seats Available:</strong>{" "}
                    {ride.driverRide?.seats || "N/A"}
                  </p>

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
