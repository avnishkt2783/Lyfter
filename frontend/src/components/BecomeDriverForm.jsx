import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../ThemeContext";
import { getRegex } from "../utils/Regex";
import "bootstrap/dist/css/bootstrap.min.css";
import { Spinner } from "react-bootstrap";

const BecomeDriverForm = () => {
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [aadharNumber, setAadharNumber] = useState("");
  const [aadharPhoto, setAadharPhoto] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    // REGEX
    const aadharNumberRegex = getRegex("aadharNumber");

    if (!aadharNumberRegex.test(aadharNumber)) {
      setError("Invalid Aadhaar number. Use format: 1234 5678 9012");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!aadharPhoto) {
      setError("Upload your Aadhaar photo");
      return;
    }
    if (!validateForm()) {
      setSuccessMsg("");
      return;
    }

    const formData = new FormData();
    formData.append("aadharNumber", aadharNumber);
    formData.append("aadharPhoto", aadharPhoto);

    try {
      const token = localStorage.getItem("token");

      await axios.post(`${apiURL}/drivers/request`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setLoading(false);
      setSuccessMsg("Driver request submitted successfully!");
      setError("");
      setTimeout(() => navigate("/driver-dashboard"), 1500);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Driver request submission failed."
      );
      setSuccessMsg("");
    }
  };

  return (
    <div
      className={`container my-4 p-4 rounded shadow ${
        isDark ? "bg-dark text-white border-secondary" : "bg-white border-dark"
      }`}
    >
      <h3 className="mb-4 text-center">Become a Driver</h3>

      {successMsg && (
        <div
          className={`alert ${
            isDark
              ? "alert-success bg-success bg-opacity-25 text-white"
              : "alert-success"
          }`}
        >
          {successMsg}
        </div>
      )}
      {error && (
        <div
          className={`alert ${
            isDark
              ? "alert-danger bg-danger bg-opacity-25 text-white"
              : "alert-danger"
          }`}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group mb-3">
          <label htmlFor="aadharNumber" className="form-label">
            Aadhaar Number
          </label>
          <input
            type="text"
            id="aadharNumber"
            value={aadharNumber}
            onChange={(e) => setAadharNumber(e.target.value)}
            className={`form-control ${
              isDark ? "text-white border-light" : ""
            }`}
            required
          />
        </div>

        <div className="form-group mb-4">
          <label htmlFor="aadharPhoto" className="form-label">
            Aadhaar Photo
          </label>
          <input
            type="file"
            id="aadharPhoto"
            accept=".jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const allowedTypes = ["image/jpeg", "image/png"];
                const maxSizeInBytes = 2 * 1024 * 1024;

                if (!allowedTypes.includes(file.type)) {
                  alert("Only JPG, JPEG, or PNG files are allowed.");
                  e.target.value = null;
                  return;
                }

                if (file.size > maxSizeInBytes) {
                  alert("File size should not exceed 2MB.");
                  e.target.value = null;
                  return;
                }

                setAadharPhoto(file);
              }
            }}
            className={`form-control ${
              isDark ? "text-white border-light" : ""
            }`}
            required
          />
          <small className="text-muted">
            Only JPG, JPEG, or PNG formats allowed. Max file size: 2MB.
          </small>
        </div>

        <button type="submit" className="btn btn-primary w-100 fw-bold">
          {loading ? (
            <Spinner animation="border" variant={isDark ? "light" : "light"} />
          ) : (
            "Submit Request"
          )}
        </button>
      </form>
    </div>
  );
};

export default BecomeDriverForm;
