import React, { useEffect, useState } from "react";
import axios from "axios";

const AadhaarDriversList = () => {
  const [drivers, setDrivers] = useState([]);
  const apiURL = import.meta.env.VITE_API_URL;
  const apiHost = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
  const photoBase = `${apiHost}/uploads`;

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${apiURL}/drivers/aadhaar-submitted`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedDrivers = res.data.map((d) => {
        // const cleanPhoto = d.aadharPhoto?.replace(/^uploads\//, "") || null;
        // return {
        //   ...d,
        //   aadharPhotoUrl: cleanPhoto ? `${apiURL}/uploads/${cleanPhoto}` : null,
        // };
        return {
          ...d,
          aadharPhotoUrl: d.aadharImg || null,
        };
      });

      setDrivers(formattedDrivers);
    } catch (err) {
      console.error("Failed to fetch drivers:", err);
    }
  };

  const verifyDriver = async (driverId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${apiURL}/drivers/verify-aadhaar/${driverId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Aadhaar verified successfully.");
      setDrivers((prev) => prev.filter((d) => d.driverId !== driverId));
    } catch (err) {
      console.error("Verification failed:", err);
      alert("Failed to verify Aadhaar.");
    }
  };

  const rejectAadhaar = async (driverId) => {
    console.log("'''''''''''''''''");
    console.log(driverId);

    if (
      !window.confirm(
        "Reject this driver's Aadhaar? This will delete Aadhaar number and photo."
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${apiURL}/drivers/reject-aadhaar/${driverId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Drivers with Aadhaar Submitted</h2>
      {drivers.length === 0 ? (
        <p>No drivers found.</p>
      ) : (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Phone</th>
              <th className="border px-2 py-1">Aadhar #</th>
              <th className="border px-2 py-1">Aadhar Photo</th>
              <th className="border px-2 py-1">Action</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.driverId}>
                <td className="border px-2 py-1 text-center">{d.driverId}</td>
                <td className="border px-2 py-1">
                  {d.user?.fullName || "N/A"}
                </td>
                <td className="border px-2 py-1">{d.user?.email || "N/A"}</td>
                <td className="border px-2 py-1">{d.user?.phoneNo || "N/A"}</td>
                <td className="border px-2 py-1">{d.aadharNumber}</td>
                {/* <td className="border px-2 py-1">
                  {d.aadharPhoto ? (
                    <a
                      href={`${photoBase}/${d.aadharPhoto}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={`${photoBase}/${d.aadharPhoto}`}
                        alt="Aadhar"
                        className="h-16 w-16 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-placeholder.png";
                        }}
                      />
                    </a>
                  ) : (
                    "No Photo"
                  )}
                </td> */}
                <td className="border px-2 py-1">
                  {d.aadharPhotoUrl ? (
                    <a
                      href={d.aadharPhotoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={d.aadharPhotoUrl}
                        alt="Aadhaar"
                        className="h-16 w-16 object-cover rounded"
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

                <td className="border px-2 py-1 flex space-x-2 justify-center">
                  <button
                    onClick={() => verifyDriver(d.driverId)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => rejectAadhaar(d.driverId)}
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

export default AadhaarDriversList;
