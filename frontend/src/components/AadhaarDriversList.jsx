import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Make sure this is imported
import axios from "axios";
import { ThemeContext } from "../ThemeContext";
import { Spinner } from "react-bootstrap";

const AadhaarDriversList = () => {
  const navigate = useNavigate(); // ✅ You need this
  const [drivers, setDrivers] = useState([]);
  const { theme } = useContext(ThemeContext);
  const apiURL = import.meta.env.VITE_API_URL;
  const [loadingV, setLoadingV] = useState(false);
  const [loadingR, setLoadingR] = useState(false);

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${apiURL}/drivers/aadhaar-submitted`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedDrivers = res.data.map((d) => ({
        ...d,
        aadharPhotoUrl: d.aadharImg || null,
      }));

      setDrivers(formattedDrivers);
    } catch (err) {
      console.error("Failed to fetch drivers:", err);
    }
  };

  const verifyDriver = async (driverId) => {
    setLoadingV(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${apiURL}/drivers/verify-aadhaar/${driverId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLoadingV(false);
      alert("Aadhaar verified successfully.");
      setDrivers((prev) => prev.filter((d) => d.driverId !== driverId));
    } catch (err) {
      console.error("Verification failed:", err);
      alert("Failed to verify Aadhaar.");
    }
  };

  const rejectAadhaar = async (driverId) => {
    if (
      !window.confirm(
        "Reject this driver's Aadhaar? This will delete Aadhaar number and photo."
      )
    )
      return;

    setLoadingR(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${apiURL}/drivers/reject-aadhaar/${driverId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLoadingR(false);
      alert("Aadhaar rejected and data deleted.");
      setDrivers((prev) => prev.filter((d) => d.driverId !== driverId));
    } catch (err) {
      console.error("Rejection failed:", err);
      alert("Failed to reject Aadhaar.");
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return (
    <div
      className={`container py-4 ${
        theme === "dark" ? "bg-dark text-light" : "text-dark"
      }`}
    >
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="btn btn-primary mb-4"
      >
        ← Back to Admin Dashboard
      </button>

      <h2 className="mb-4">Verify Aadhaar Requests</h2>

      {drivers.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <div className="table-responsive">
          <table
            className={`table table-bordered ${
              theme === "dark" ? "table-dark" : "table-light"
            }`}
          >
            <thead className={theme === "dark" ? "table-dark" : "table-light"}>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Aadhaar Number</th>
                <th>Aadhaar Photo</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.driverId}>
                  <td className="text-center">{d.driverId}</td>
                  <td>{d.user?.fullName || "N/A"}</td>
                  <td>{d.user?.email || "N/A"}</td>
                  <td>{d.user?.phoneNo || "N/A"}</td>
                  <td>{d.aadharNumber}</td>
                  <td>
                    {d.aadharPhotoUrl ? (
                      <a
                        href={d.aadharPhotoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={d.aadharPhotoUrl}
                          alt="Aadhaar"
                          className="img-thumbnail"
                          style={{
                            height: "64px",
                            width: "64px",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-placeholder.png";
                          }}
                        />
                      </a>
                    ) : (
                      "No Photo"
                    )}
                  </td>
                  <td className="d-flex flex-column gap-2">
                    <button
                      onClick={() => verifyDriver(d.driverId)}
                      className="btn btn-success"
                    >
                      {/* Verify */}
                      {loadingV ? (
                        <Spinner
                          animation="border"
                          variant={theme === "dark" ? "light" : "light"}
                        />
                      ) : (
                        "Verify"
                      )}
                    </button>
                    <button
                      onClick={() => rejectAadhaar(d.driverId)}
                      className="btn btn-danger"
                    >
                      {/* Reject */}
                      {loadingR ? (
                        <Spinner
                          animation="border"
                          variant={theme === "dark" ? "light" : "light"}
                        />
                      ) : (
                        "Reject"
                      )}
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

export default AadhaarDriversList;
