import { useEffect, useState } from "react";
import axios from "axios";

const DriverStatus = () => {
  const [status, setStatus] = useState(null);
  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${apiURL}/drivers/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { aadharNumber, licenseNumber, isVerified } = res.data;

        if (!aadharNumber) {
          // Case 1: No Aadhar, so user is NOT a driver
          setStatus("not_driver");
        } else if (aadharNumber && !licenseNumber) {
          // Case 2: Aadhar submitted, no license info yet, not verified
          setStatus("driver_no_license");
        } else if (licenseNumber && !isVerified) {
          // Case 3: License submitted but not verified yet (verification pending)
          setStatus("pending_verification");
        } else if (isVerified) {
          // Case 4: Verified driver
          setStatus("verified_driver");
        } else {
          // fallback, treat as not_driver
          setStatus("not_driver");
        }
      } catch (err) {
        console.error("Failed to fetch status", err);
        setStatus("not_driver");
      }
    };

    fetchStatus();
  }, []);

  return (
    <div className="mt-4">
      {status === null && <p>Checking driver status...</p>}
      {status === "not_driver" && (
        <p className="text-red-600">❌ You are not registered as a driver.</p>
      )}
      {status === "driver_no_license" && (
        <p className="text-blue-600">
          ℹ️ You have submitted your Aadhar but haven't applied for driver
          verification yet.
        </p>
      )}
      {status === "pending_verification" && (
        <p className="text-yellow-600">⏳ Awaiting admin verification.</p>
      )}
      {status === "verified_driver" && (
        <p className="text-green-600">✅ You are a verified driver!</p>
      )}
    </div>
  );
};

export default DriverStatus;
