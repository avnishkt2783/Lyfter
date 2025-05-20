import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Make sure this is imported
import axios from "axios";
import { ThemeContext } from "../ThemeContext";
import "./PendingDriversList.css"; // Optional: Scoped styles if needed

const PendingDriversList = () => {
  const navigate = useNavigate(); // ✅ You need this
  const [drivers, setDrivers] = useState([]);
  const apiURL = import.meta.env.VITE_API_URL;
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

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
      fetchDrivers();
    } catch (err) {
      console.error("Verification failed:", err);
      alert("Failed to verify driver.");
    }
  };

  const rejectDriver = async (driverId) => {
    if (
      !window.confirm(
        "Are you sure you want to reject this driver? This action cannot be undone."
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${apiURL}/drivers/reject/${driverId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Driver rejected and removed from pending list.");
      fetchDrivers();
    } catch (err) {
      console.error("Rejection failed:", err);
      alert("Failed to reject driver.");
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return (
    <div
      className={`container py-4 ${
        isDark ? "bg-dark text-light" : "bg-light text-dark"
      }`}
    >
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="btn btn-primary mb-4"
      >
        ← Back to Admin Dashboard
      </button>

      <h2 className="mb-4">Pending Driver Verifications</h2>
      {drivers.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <div className="table-responsive">
          <table
            className={`table table-bordered ${
              isDark ? "table-dark" : "table-light"
            }`}
          >
            <thead className={isDark ? "thead-dark" : "thead-light"}>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Aadhar Number</th>
                <th>License Number</th>
                <th>Aadhar Photo</th>
                <th>License Photo</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.driverId}>
                  <td>{d.driverId}</td>
                  <td>{d.fullName}</td>
                  <td>{d.email}</td>
                  <td>{d.phoneNo}</td>
                  <td>{d.aadharNumber}</td>
                  <td>{d.licenseNumber}</td>
                  <td>
                    <a
                      href={d.aadharImg}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={d.aadharImg}
                        alt="Aadhar"
                        className="img-thumbnail"
                        style={{ height: "64px", width: "64px" }}
                      />
                    </a>
                  </td>
                  <td>
                    <a
                      href={d.licensePhoto}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={d.licensePhoto}
                        alt="License"
                        className="img-thumbnail"
                        style={{ height: "64px", width: "64px" }}
                      />
                    </a>
                  </td>
                  <td className="d-flex flex-column gap-2">
                    <button
                      onClick={() => verifyDriver(d.driverId)}
                      className="btn btn-success"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => rejectDriver(d.driverId)}
                      className="btn btn-danger"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PendingDriversList;
