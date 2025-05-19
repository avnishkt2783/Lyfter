import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const DriverProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${apiURL}/drivers/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (error) {
        console.error("Failed to load driver profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Delete vehicle handler
  const handleDeleteVehicle = async (vehicleId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this vehicle?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiURL}/vehicle/${vehicleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove deleted vehicle from state to update UI
      setProfile((prevProfile) => ({
        ...prevProfile,
        vehicles: prevProfile.vehicles.filter((v) => v.vehicleId !== vehicleId),
      }));
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      alert("Failed to delete vehicle.");
    }
  };

  if (loading) return <div className="p-4">Loading driver profile...</div>;
  if (!profile) return <div className="p-4">No driver profile found.</div>;

  const {
    driverId,
    aadharNumber,
    licenseNumber,
    aadharPhoto,
    licensePhoto,
    isVerified,
    user = {},
    vehicles = [],
  } = profile;

  const { fullName, email, phoneNo } = user;

  const apiHost = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
  const photoBase = `${apiHost}/uploads`;

  return (
    <div className="p-6">
      <Link
        to="/add-vehicle"
        className="inline-block mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition"
      >
        Add Vehicle
      </Link>

      <h2 className="text-2xl font-bold mb-4">Driver Profile</h2>
      <div className="grid gap-4">
        <p>
          <strong>Driver ID:</strong> {driverId}
        </p>
        <p>
          <strong>Name:</strong> {fullName}
        </p>
        <p>
          <strong>Email:</strong> {email}
        </p>
        <p>
          <strong>Phone:</strong> {phoneNo}
        </p>
        <p>
          <strong>Aadhar Number:</strong> {aadharNumber}
        </p>
        <p>
          <strong>License Number:</strong> {licenseNumber}
        </p>
        <div>
          <strong>Aadhar Photo:</strong>
          <br />
          {aadharPhoto ? (
            <img
              src={`${photoBase}/${aadharPhoto}`}
              alt="Aadhar"
              className="w-60 border rounded"
            />
          ) : (
            <p className="text-gray-500">No Aadhar photo uploaded.</p>
          )}
        </div>
        <div>
          <strong>License Photo:</strong>
          <br />
          {licensePhoto ? (
            <img
              src={`${photoBase}/${licensePhoto}`}
              alt="License"
              className="w-60 border rounded"
            />
          ) : (
            <p className="text-gray-500">No License photo uploaded.</p>
          )}
        </div>
        <p>
          <strong>Verification Status:</strong>{" "}
          <span className={isVerified ? "text-green-600" : "text-red-600"}>
            {isVerified ? "Verified" : "Pending"}
          </span>
        </p>
      </div>

      {vehicles.length > 0 && (
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">Your Vehicles</h3>
          <div className="grid gap-6 sm:grid-cols-2">
            {vehicles.map((v) => (
              <div key={v.vehicleId} className="border rounded p-4 shadow">
                <p>
                  <strong>Brand:</strong> {v.brand}
                </p>
                <p>
                  <strong>Model:</strong> {v.model}
                </p>
                <p>
                  <strong>Color:</strong> {v.color}
                </p>
                <p>
                  <strong>Plate:</strong> {v.plateNumber}
                </p>
                <img
                  src={`${photoBase}/${v.vehiclePhoto}`}
                  alt={`${v.brand} ${v.model}`}
                  className="w-56 h-auto border rounded mt-2"
                />
                <button
                  onClick={() => handleDeleteVehicle(v.vehicleId)}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  Delete Vehicle
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverProfile;
