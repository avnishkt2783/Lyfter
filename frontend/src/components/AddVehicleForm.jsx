import React, { useState, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../ThemeContext";
import { getRegex } from "../utils/Regex";
import { Spinner } from "react-bootstrap";

const AddVehicleForm = () => {
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    customModel: "",
    color: "",
    plateNumber: "",
    vehiclePhoto: null,
  });

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const apiURL = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "vehiclePhoto") {
      setFormData({ ...formData, vehiclePhoto: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const licensePlateNumberRegex = getRegex("licensePlateNumber");

    if (!licensePlateNumberRegex.test(formData.plateNumber)) {
      setError(
        "Invalid license plate number. Format should be like 'MH12 AB 1234'"
      );
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSuccess("");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in");

    const form = new FormData();
    const modelToSave =
      formData.model === "Other" ? formData.customModel : formData.model;

    form.append("brand", formData.brand);
    form.append("model", modelToSave);
    form.append("color", formData.color);
    form.append("plateNumber", formData.plateNumber);
    form.append("vehiclePhoto", formData.vehiclePhoto);

    setLoading(true);
    try {
      const res = await axios.post(`${apiURL}/vehicle/add`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert(res.data.message);
      setLoading(false);
      setMessage("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to add vehicle.";
      alert(errorMessage);
      setLoading(false);
      setMessage("");
    }
  };

  return (
    <div
      className={`container my-5 p-4 rounded shadow ${
        isDark
          ? "bg-dark text-light border border-secondary"
          : "bg-light text-dark border"
      }`}
      style={{ maxWidth: "500px" }}
    >
      <h2 className="mb-4 text-center">Add Vehicle</h2>

      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-12">
          <label className="form-label fw-semibold">
            Vehicle Brand and Name:
          </label>
          <input
            type="text"
            name="brand"
            placeholder="e.g. Hyundai Creta"
            value={formData.brand}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="col-12">
          <label className="form-label fw-semibold">Type of Vehicle</label>
          <select
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="" disabled>
              Select Vehicle Type:
            </option>
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
            <option value="Auto rickshaw">Auto rickshaw</option>
            <option value="Van">Van</option>
            <option value="Bus">Bus</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {formData.model === "Other" && (
          <div className="col-12">
            <input
              type="text"
              name="customModel"
              placeholder="Specify vehicle type"
              value={formData.customModel}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        )}

        <div className="col-12">
          <label className="form-label fw-semibold">Color:</label>
          <input
            type="text"
            name="color"
            placeholder="e.g. Red"
            value={formData.color}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="col-12">
          <label className="form-label fw-semibold">
            License Plate Number:
          </label>
          <input
            type="text"
            name="plateNumber"
            placeholder="e.g. MH12AB 3456"
            value={formData.plateNumber}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="col-12 mb-3">
          <label htmlFor="vehiclePhoto" className="form-label fw-semibold">
            Upload Vehicle Photo:
          </label>
          <input
            type="file"
            id="vehiclePhoto"
            name="vehiclePhoto"
            accept="image/png, image/jpeg, image/jpg"
            onChange={(e) => {
              const file = e.target.files[0];
              const maxSize = 2 * 1024 * 1024;
              const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

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

                handleChange(e);
              }
            }}
            className="form-control"
            required
          />
          <small className="text-muted">
            Only JPG, JPEG, or PNG formats allowed. Max file size: 2MB.
          </small>
        </div>

        <div className="col-12 d-grid">
          <button type="submit" className="btn btn-primary btn-lg">
            {loading ? (
              <Spinner
                animation="border"
                variant={isDark ? "light" : "light"}
              />
            ) : (
              "Submit Vehicle"
            )}
          </button>
        </div>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
    </div>
  );
};

export default AddVehicleForm;
