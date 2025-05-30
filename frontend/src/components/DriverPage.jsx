import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { getRegex } from "../utils/Regex";

const DriverPage = () => {
  const { theme } = useTheme(); // get theme
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [licenseNumberInput, setLicenseNumberInput] = useState("");
  const [licensePhotoFile, setLicensePhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const apiURL = import.meta.env.VITE_API_URL;

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

  const validateForm = () => {
    const licenseNumberRegex = getRegex("drivingLicenseNumber");

    if (!licenseNumberRegex.test(licenseNumberInput)) {
      setError(
        "Invalid License number format. Expected format: 'DL01 12345678901' (2 uppercase letters, 2 digits, space, then 11 digits)"
      );
      return false;
    }
    setError("");

    return true;
  };

  const handleLicenseSubmit = async (e) => {
    e.preventDefault();
    if (!licenseNumberInput || !licensePhotoFile) {
      alert("Please provide both license number and photo.");
      return;
    }
    if (!validateForm()) {
      setSuccessMsg("");
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
    <div
      className={`container profile-form my-4 p-4 rounded shadow ${
        isDark ? "bg-dark text-white border-secondary" : "bg-white border-dark"
      }`}
    >
      <div className="mb-3">
        <Link
          to="/profile"
          style={{
            display: "inline-block",
            backgroundColor: "#0d6efd",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Go to Profile Page
        </Link>
      </div>
      <hr />
      <h2 className="text-center mb-4">Driver Dashboard</h2>

      <div
        className={`card shadow-sm mb-5 ${
          theme === "dark" ? "bg-dark text-light" : ""
        }`}
      >
        <div className="card-body">
          <h5 className="card-title">Driver Profile</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <strong>Driver ID:</strong> {driverId}
            </div>
            <div className="col-md-6">
              <strong>Name:</strong> {fullName}
            </div>
            <div className="col-md-6">
              <strong>Email:</strong> {email}
            </div>
            <div className="col-md-6">
              <strong>Phone:</strong> {phoneNo}
            </div>
            <div className="col-md-6">
              <strong>Aadhar Number:</strong> {aadharNumber}
            </div>
            <div className="col-md-6">
              <strong>Aadhar Photo:</strong>
              <br />
              {aadharImg ? (
                <img
                  src={aadharImg}
                  alt="Aadhar"
                  className="img-fluid rounded border"
                  style={{ maxWidth: "240px" }}
                />
              ) : (
                <p className="text-muted">No Aadhar photo uploaded.</p>
              )}
            </div>
            <div className="col-md-6">
              <strong>License Number:</strong> {licenseNumber || "Not provided"}
            </div>
            <div className="col-md-6">
              <strong>License Photo:</strong>
              <br />
              {licensePhoto ? (
                <img
                  src={licensePhoto}
                  alt="License"
                  className="img-fluid rounded border"
                  style={{ maxWidth: "240px" }}
                />
              ) : (
                <p className="text-muted">No License photo uploaded.</p>
              )}
            </div>
            <div className="col-md-12 mt-3">
              <div
                className={`p-3 rounded ${
                  isVerified
                    ? "bg-success bg-opacity-25"
                    : "bg-warning bg-opacity-25"
                }`}
              >
                <strong>Verification Status:</strong>{" "}
                <span
                  className={`isVerified ? "text-success" : "text-warning"`}
                >
                  {isVerified ? "Verified" : "Pending"}
                </span>
              </div>
            </div>
          </div>

          {(!licenseNumber || !licensePhoto) && (
            <form
              onSubmit={handleLicenseSubmit}
              className="mt-4 border-top pt-3"
            >
              <h6>Submit License Info</h6>
              <div className="mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="License Number"
                  value={licenseNumberInput}
                  onChange={(e) => setLicenseNumberInput(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    const maxSize = 2 * 1024 * 1024;
                    const allowedTypes = ["image/jpeg", "image/png"];

                    if (file) {
                      if (!allowedTypes.includes(file.type)) {
                        alert("Only JPG, JPEG, or PNG formats are allowed.");
                        e.target.value = null;
                        return;
                      }

                      if (file.size > maxSize) {
                        alert("File size should not exceed 2MB.");
                        e.target.value = null;
                        return;
                      }

                      setLicensePhotoFile(file);
                    }
                  }}
                  className="form-control"
                  required
                />
                <small className="text-muted">
                  Only JPG, JPEG, or PNG formats allowed. Max file size: 2MB.
                </small>
              </div>
              <button
                type="submit"
                className="btn btn-warning"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Submit License Info"}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="text-end mb-4">
        <Link to="/add-vehicle" className="btn btn-primary">
          Add Vehicle
        </Link>
      </div>

      {vehicles.length > 0 && (
        <div
          className={`card shadow ${
            theme === "dark" ? "bg-dark text-light" : ""
          }`}
        >
          <div className="card-body">
            <h5 className="card-title">Your Vehicles</h5>
            <div className="row">
              {vehicles.map((v) => (
                <div key={v.vehicleId} className="col-md-6 mb-4">
                  <div className="border rounded p-3 h-100">
                    <strong>Vehicle:</strong> {v.brand} {v.model} <br />
                    <strong>Color:</strong> {v.color} <br />
                    <strong>Plate:</strong> {v.plateNumber} <br />
                    <img
                      src={v.vehiclePhoto}
                      alt="Vehicle"
                      className="img-fluid border rounded mb-2"
                    />
                    <button
                      onClick={() => handleDeleteVehicle(v.vehicleId)}
                      className="btn btn-danger"
                    >
                      Delete Vehicle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverPage;
