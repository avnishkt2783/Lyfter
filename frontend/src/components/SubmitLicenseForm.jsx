import React, { useState } from "react";
import axios from "axios";

const SubmitLicenseForm = ({ onSubmitted }) => {
  const apiURL = import.meta.env.VITE_API_URL;

  const [licenseNumber, setLicenseNumber] = useState("");
  const [licensePhoto, setLicensePhoto] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!licensePhoto) return alert("Upload your license photo");

    const formData = new FormData();
    formData.append("licenseNumber", licenseNumber);
    formData.append("licensePhoto", licensePhoto);

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${apiURL}/drivers/submit-license`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("License submitted successfully!");
      onSubmitted(true);
    } catch (err) {
      console.error("❌ License submit error:", err);
      alert("License submission failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>License Number</label>
        <input
          type="text"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          className="border px-2 py-1 rounded w-full"
          required
        />
      </div>
      <div>
        <label>Upload License Photo</label>
        <input
          type="file"
          onChange={(e) => setLicensePhoto(e.target.files[0])}
          className="w-full"
          accept="image/*"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-1 rounded"
      >
        Submit License
      </button>
    </form>
  );
};

export default SubmitLicenseForm;
