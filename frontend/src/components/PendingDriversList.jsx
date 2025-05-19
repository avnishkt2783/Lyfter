import React, { useEffect, useState } from "react";
import axios from "axios";

const PendingDriversList = () => {
  const [drivers, setDrivers] = useState([]);
  const apiURL = import.meta.env.VITE_API_URL;

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${apiURL}/drivers/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrivers(res.data);
    } catch (err) {
      console.error("Failed to fetch pending drivers:", err);
    }
  };

  const verifyDriver = async (driverId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${apiURL}/drivers/verify/${driverId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Driver verified successfully.");
      fetchDrivers(); // Refresh the list after verification
    } catch (err) {
      console.error("Verification failed:", err);
      alert("Failed to verify driver.");
    }
  };

  // New reject handler
  const rejectDriver = async (driverId) => {
    if (
      !window.confirm(
        "Are you sure you want to reject this driver? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${apiURL}/drivers/reject/${driverId}`, // backend reject route you will create
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Driver rejected and removed from pending list.");
      fetchDrivers(); // Refresh the list after rejection
    } catch (err) {
      console.error("Rejection failed:", err);
      alert("Failed to reject driver.");
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Pending Driver Verifications</h2>
      {drivers.length === 0 ? (
        <p>No pending drivers.</p>
      ) : (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Phone</th>
              <th className="border px-2 py-1">Aadhar #</th>
              <th className="border px-2 py-1">License #</th>
              <th className="border px-2 py-1">Aadhar Photo</th>
              <th className="border px-2 py-1">License Photo</th>
              <th className="border px-2 py-1">Action</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.driverId}>
                <td className="border px-2 py-1 text-center">{d.driverId}</td>
                <td className="border px-2 py-1">{d.fullName}</td>
                <td className="border px-2 py-1">{d.email}</td>
                <td className="border px-2 py-1">{d.phoneNo}</td>
                <td className="border px-2 py-1">{d.aadharNumber}</td>
                <td className="border px-2 py-1">{d.licenseNumber}</td>
                <td className="border px-2 py-1">
                  <a
                    href={d.aadharPhotoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={d.aadharPhotoUrl}
                      alt="Aadhar"
                      className="h-16 w-16 object-cover rounded"
                    />
                  </a>
                </td>
                <td className="border px-2 py-1">
                  <a
                    href={d.licensePhotoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={d.licensePhotoUrl}
                      alt="License"
                      className="h-16 w-16 object-cover rounded"
                    />
                  </a>
                </td>
                <td className="border px-2 py-1 flex space-x-2 justify-center">
                  <button
                    onClick={() => verifyDriver(d.driverId)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => rejectDriver(d.driverId)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingDriversList;
