import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const DriverPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [licenseNumberInput, setLicenseNumberInput] = useState("");
  const [licensePhotoFile, setLicensePhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const apiURL = import.meta.env.VITE_API_URL;
  const apiHost = apiURL.replace(/\/api\/?$/, "");
  const photoBase = `${apiHost}/uploads`;
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${apiURL}/drivers/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data?.driverId) {
        navigate("/become-driver");
      } else {
        setProfile(res.data);
        setLicenseNumberInput(res.data.licenseNumber || "");
      }
    } catch (error) {
      console.error("Failed to fetch driver profile:", error);
      navigate("/become-driver");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProfile();
  }, []);

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiURL}/vehicle/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile((prev) => ({
        ...prev,
        vehicles: prev.vehicles.filter((v) => v.vehicleId !== vehicleId),
      }));
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      alert("Failed to delete vehicle.");
    }
  };

  const handleLicenseSubmit = async (e) => {
    e.preventDefault();
    if (!licenseNumberInput || !licensePhotoFile) {
      alert("Please provide both license number and photo.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("licenseNumber", licenseNumberInput);
    formData.append("licensePhoto", licensePhotoFile);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${apiURL}/drivers/submit-license`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfile(res.data);
      setLicenseNumberInput("");
      setLicensePhotoFile(null);
      await fetchProfile();
    } catch (error) {
      console.error("Error submitting license:", error);
      alert("Failed to submit license info.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-4">Loading Driver Page...</div>;
  if (!profile) return null;

  const {
    driverId,
    aadharNumber,
    licenseNumber,
    licensePhoto,
    isVerified,
    user = {},
    vehicles = [],
    aadharImg,
  } = profile;

  const { fullName, email, phoneNo } = user;

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-8">Driver Page</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Driver Profile</h3>
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

          <div>
            <strong>Aadhar Photo:</strong>
            <br />
            {aadharImg ? (
              <img
                src={`${aadharImg}`}
                alt="Aadhar"
                className="w-60 border rounded"
              />
            ) : (
              <p className="text-gray-500">No Aadhar photo uploaded.</p>
            )}
          </div>

          <p>
            <strong>License Number:</strong> {licenseNumber || "Not provided"}
          </p>

          <div>
            <strong>License Photo:</strong>
            <br />
            {licensePhoto ? (
              <img
                src={`${licensePhoto}`}
                alt="License"
                className="w-60 border rounded"
              />
            ) : (
              <p className="text-gray-500">No License photo uploaded.</p>
            )}
          </div>

          {(!licenseNumber || !licensePhoto) && (
            <form
              onSubmit={handleLicenseSubmit}
              className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg border"
            >
              <h4 className="text-lg font-medium">Submit License Info</h4>
              <input
                type="text"
                placeholder="License Number"
                value={licenseNumberInput}
                onChange={(e) => setLicenseNumberInput(e.target.value)}
                className="w-full border px-4 py-2 rounded"
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLicensePhotoFile(e.target.files[0])}
                className="w-full"
                required
              />
              <button
                type="submit"
                disabled={uploading}
                className="bg-yellow-600 text-white px-5 py-2 rounded hover:bg-yellow-700 transition"
              >
                {uploading ? "Uploading..." : "Submit License Info"}
              </button>
            </form>
          )}

          <p>
            <strong>Verification Status:</strong>{" "}
            <span className={isVerified ? "text-green-600" : "text-red-600"}>
              {isVerified ? "Verified" : "Pending"}
            </span>
          </p>
        </div>
      </div>

      <div className="mb-6">
        <Link
          to="/add-vehicle"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition"
        >
          Add Vehicle
        </Link>
      </div>

      {vehicles.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
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
                  src={`${v.vehiclePhoto}`}
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

export default DriverPage;
