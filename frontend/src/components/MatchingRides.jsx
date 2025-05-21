import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import {
  FaCar,
  FaPhone,
  FaUser,
  FaCheckCircle,
  FaMoneyBillWave,
  FaClock,
  FaChair,
  FaCarSide,
} from "react-icons/fa";

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
    // console.log("userId", userId);
    // console.log(
    //   "passengerNamePhoneNo.passengerName",
    //   passengerNamePhoneNo.passengerName
    // );
    // console.log(
    //   "passengerNamePhoneNo.passengerPhoneNo",
    //   passengerNamePhoneNo.passengerPhoneNo
    // );
    // console.log("startLocation", startLocation);
    // console.log("destination", destination);
    // console.log("seatsRequired", seatsRequired);
    try {
      await axios.post(
        `${apiURL}/rides/createPassengerRide`,
        {
          //input variables to send in backend
          userId,
          passengerName: passengerNamePhoneNo.passengerName,
          passengerPhoneNo: passengerNamePhoneNo.passengerPhoneNo,
          startLocation,
          destination,
          seatsRequired,
          // driverRideId: ride?.driverRideId,
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
    // console.log("🚀 Fetching matching rides...");
    const start = JSON.parse(startLocation);
    const dest = JSON.parse(destination);

    if (!start || !dest) {
      console.error("Start or destination coordinates are missing.");
      setLoading(false);
      return;
    }

    try {
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

      setRides(
        response.data.success && Array.isArray(response.data.rides)
          ? response.data.rides
          : []
      );
    } catch (error) {
      console.error("❌ Error fetching matching rides:", error);
      setRides([]);
    } finally {
      console.log("🟢 fetchMatchingRides() completed.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || hasRun.current) return;
    hasRun.current = true;
    createPassengerRide();
    fetchMatchingRides();
  }, [user]);

  // useEffect(() => {
  //   if (hasRun.current) return; // If it has already run, exit early
  //   hasRun.current = true;
  //   createPassengerRide();
  //   fetchMatchingRides();
  // }, []);

  // useEffect(() => {
  //   createPassengerRide()
  //     .then(() => fetchMatchingRides())
  //     .catch((error) => {
  //       console.error("Error in ride creation or fetching:", error);
  //     });
  // }, []);

  // useEffect(() => {

  //   const executeAsync = async () => {
  //     await createPassengerRide();
  //     await fetchMatchingRides();
  //   };

  //   executeAsync();
  // }, []);

  const confirmRide = async (ride) => {
    try {
      // console.log("userId", userId);
      // console.log(
      //   "passengerNamePhoneNo.passengerName",
      //   passengerNamePhoneNo.passengerName
      // );
      // console.log(
      //   "passengerNamePhoneNo.passengerPhoneNo",
      //   passengerNamePhoneNo.passengerPhoneNo
      // );
      // console.log("startLocation", startLocation);
      // console.log("destination", destination);
      // console.log("seatsRequired", seatsRequired);
      // console.log("ride?.driverRideId", ride?.driverRideId);
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
                      {/* Profile Image */}
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

                      {/* Driver Name */}
                      {driverName || "Unknown Driver"}

                      {/* Verified Badge */}
                      {ride.driver?.isVerified && (
                        <FaCheckCircle
                          className={`ms-2 text-success `} // for tooltip
                          style={{ fontSize: "1.5rem" }}
                        />
                      )}
                    </h5>
                    {/* <h5 className="card-title d-flex align-items-center">
                      <FaUser className="me-2" />
                      {driverName || "Unknown Driver"}
                      {ride.driver?.isVerified && (
                        <FaCheckCircle
                          className="ms-2 text-success"
                          title="Verified Driver"
                          style={{ fontSize: "1.3rem" }}
                        />
                      )}
                    </h5> */}

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
