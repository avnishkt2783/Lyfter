import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-4">
        <button
          onClick={() => navigate("/pending-drivers")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-5 rounded-lg shadow"
        >
          Verify Drivers
        </button>
        <button
          onClick={() => navigate("/verify-aadhar")}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-5 rounded-lg shadow"
        >
          Verify Aadhaar
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
