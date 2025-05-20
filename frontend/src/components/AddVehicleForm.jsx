import React, { useState } from "react";
import axios from "axios";

const AddVehicleForm = () => {
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    customModel: "",
    color: "",
    plateNumber: "",
    vehiclePhoto: null,
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in");

    const form = new FormData();

    // Save model based on dropdown or custom input
    const modelToSave =
      formData.model === "Other" ? formData.customModel : formData.model;

    form.append("brand", formData.brand);
    form.append("model", modelToSave);
    form.append("color", formData.color);
    form.append("plateNumber", formData.plateNumber);
    form.append("vehiclePhoto", formData.vehiclePhoto);

    try {
      const res = await axios.post(`${apiURL}/vehicle/add`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert(res.data.message);
      setMessage("");
    } catch (err) {
      // Handle backend validation message or generic error
      const errorMessage =
        err.response?.data?.message || "Failed to add vehicle.";
      alert(errorMessage);
      setMessage("");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Add Vehicle</h2>

      {/* {message && <p className="mb-4 text-blue-600">{message}</p>} */}

      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Vehicle Brand */}
        <input
          type="text"
          name="brand"
          placeholder="Vehicle Brand"
          value={formData.brand}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        {/* Model Dropdown */}
        <select
          name="model"
          value={formData.model}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        >
          <option value="">Select Vehicle Type</option>
          <option value="Bike">Bike</option>
          <option value="Tempo">Tempo</option>
          <option value="4 Wheeler">4 Wheeler</option>
          <option value="Bus">Bus</option>
          <option value="Other">Other</option>
        </select>

        {/* Custom model input if 'Other' is selected */}
        {formData.model === "Other" && (
          <input
            type="text"
            name="customModel"
            placeholder="Specify vehicle type"
            value={formData.customModel}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
        )}

        {/* Color */}
        <input
          type="text"
          name="color"
          placeholder="Color"
          value={formData.color}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        {/* Plate Number */}
        <input
          type="text"
          name="plateNumber"
          placeholder="License Plate Number"
          value={formData.plateNumber}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        {/* Vehicle Photo */}
        <div>
          <label className="block mb-1 font-medium">
            Upload Vehicle Photo:
          </label>
          <input
            type="file"
            name="vehiclePhoto"
            accept="image/*"
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Submit Vehicle
        </button>
      </form>
    </div>
  );
};

export default AddVehicleForm;
