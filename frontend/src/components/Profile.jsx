import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const Profile = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${apiURL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err?.response?.data?.message || "Failed to load profile");
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2>Profile</h2>
      <p><strong>Full Name:</strong> {profile.fullName}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Phone:</strong> {profile.phoneNo}</p>
      <p><strong>Age:</strong> {profile.age}</p>
      <p><strong>Address:</strong> {profile.address}</p>
    </div>
  );
};

export default Profile;
