// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useAuth } from "../AuthContext";

// const MatchingRides = () => {
//   const apiURL = import.meta.env.VITE_API_URL;
//   const { token } = useAuth();

//   const [loading, setLoading] = useState(true);
//   const [rides, setRides] = useState([]);

//   const destinationText = localStorage.getItem("destination");

//   useEffect(() => {
//     const fetchMatchingRides = async () => {
//       const start = JSON.parse(
//         localStorage.getItem("startLocationCoordinatesA")
//       );
//       const dest = JSON.parse(localStorage.getItem("destinationCoordinatesB"));

//       if (!start || !dest) {
//         console.error("Start or destination coordinates are missing.");
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await axios.post(
//           `${apiURL}/rides/matchingrides`,
//           { passengerStart: start, passengerEnd: dest },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         console.log("Matching rides response:", response.data);
//         setRides(response.data || []);
//       } catch (error) {
//         console.error("Error fetching matching rides:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (token) {
//       fetchMatchingRides();
//     }
//   }, [token]);

//   return (
//     <div>
//       <h2>Available Rides to {destinationText || "destination"}</h2>

//       {loading ? (
//         <p>Loading rides...</p>
//       ) : rides.length === 0 ? (
//         <p>No matching rides available.</p>
//       ) : (
//         rides.map((ride) => (
//           <div
//             key={ride.rideId}
//             style={{
//               border: "1px solid #ccc",
//               padding: "15px",
//               margin: "15px 0",
//               borderRadius: "8px",
//             }}
//           >
//             <p>
//               <strong>Driver:</strong>{" "}
//               {ride.driver?.User?.fullName || "Unknown"}
//             </p>
//             <p>
//               <strong>Phone:</strong> {ride.driver?.User?.phoneNo || "N/A"}
//             </p>
//             <p>
//               <strong>Seats Available:</strong> {ride.seats}
//             </p>
//             <p>
//               <strong>Fare:</strong> ₹{ride.fare}
//             </p>
//             <button onClick={() => confirmRide(ride.rideId)}>
//               Confirm Ride
//             </button>
//             <button style={{ marginLeft: "10px" }}>Reject</button>
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default MatchingRides;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const MatchingRides = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);

  const destinationText = localStorage.getItem("destination");

  // Dummy placeholder confirmRide until you pass the real one
  const confirmRide = async (rideId) => {
    try {
      // Send confirmation request here
      console.log("Confirming ride ID:", rideId);
      // TODO: Add confirmation logic or modal
    } catch (error) {
      console.error("Error confirming ride:", error);
    }
  };

  useEffect(() => {
    const fetchMatchingRides = async () => {
      const start = JSON.parse(
        localStorage.getItem("startLocationCoordinatesA")
      );
      const dest = JSON.parse(localStorage.getItem("destinationCoordinatesB"));

      if (!start || !dest) {
        console.error("Start or destination coordinates are missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          `${apiURL}/rides/matchingrides`,
          { passengerStart: start, passengerEnd: dest },
          // Send SeatsRequired Value for backend...
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // console.log("Matching rides response:", response.data);

        // Check that the response contains the rides array and handle accordingly
        setRides(
          response.data.success && Array.isArray(response.data.rides)
            ? response.data.rides
            : []
        );
      } catch (error) {
        console.error("Error fetching matching rides:", error);
        setRides([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMatchingRides();
    }
  }, [token]);

  return (
    <div>
      <h2>Available Rides to {destinationText || "destination"}</h2>

      {loading ? (
        <p>Loading rides...</p>
      ) : rides.length === 0 ? (
        <p>No matching rides available.</p>
      ) : (
        rides.map((ride) => {
          const driverName = ride.driver?.user?.fullName;
          const driverPhone = ride.driver?.user?.phoneNo;

          return (
            <div
              key={ride.rideId}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                margin: "15px 0",
                borderRadius: "8px",
              }}
            >
              <p>
                <strong>Driver:</strong> {driverName || "Unknown"}
              </p>
              <p>
                <strong>Phone:</strong> {driverPhone || "N/A"}
              </p>
              <p>
                <strong>Seats Available:</strong> {ride.seats}
              </p>
              <p>
                <strong>Fare:</strong> ₹{ride.fare}
              </p>
              <p>
                <strong>Departure:</strong>{" "}
                {new Date(ride.departureTime).toLocaleString()}
              </p>
              <button onClick={() => confirmRide(ride.rideId)}>
                Confirm Ride
              </button>
              <button style={{ marginLeft: "10px" }}>Reject</button>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MatchingRides;
