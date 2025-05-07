import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  if (
    month < birthDate.getMonth() ||
    (month === birthDate.getMonth() && day < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

const Profile = () => {
  const apiURL = import.meta.env.VITE_API_URL;

  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [profileImg, setProfileImg] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${apiURL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setFormData({
          ...res.data,
          addressAddress: res.data.address?.address || "",
          addressCity: res.data.address?.city || "",
          addressState: res.data.address?.state || "",
          addressPincode: res.data.address?.pincode || "",
          addressCountry: res.data.address?.country || "",
          dob: res.data.dob || "",
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load profile");
      }
    };

    if (token) fetchProfile();
  }, [token]);

  useEffect(() => {
    if (error || successMsg) {
      const timer = setTimeout(() => {
        setError("");
        setSuccessMsg("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMsg]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImg(file);
      setPreviewImg(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value.toString().trim());
        }
      });
      if (profileImg) {
        data.append("profileImg", profileImg);
      }

      const res = await axios.put(`${apiURL}/profile/update`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMsg("Profile updated successfully!");
      setProfile(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile");
    }
  };

  if (error)
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  if (!profile)
    return <p style={{ textAlign: "center" }}>Loading profile...</p>;

  const age = formData.dob ? calculateAge(formData.dob) : null;
  const backendProfileURL = "http://localhost:3000";

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2>Edit Profile</h2>
      <h2>BUILD LOGIC FOR DELETION OF IMAGE WHENEVER NEW IMAGE IS UPLOADED</h2>

      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div style={{ marginBottom: "15px" }}>
          <img
            src={
              previewImg ||
              `${backendProfileURL}${profile.profileImg}` ||
              "/default.jpg"
            }
            alt="Profile"
            style={{ width: 120, height: 120, borderRadius: "50%" }}
          />
          <div>
            <label>
              Upload Image:
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "block", marginTop: "5px" }}
              />
            </label>
          </div>
        </div>

        <label>
          Full Name:
          <input
            name="fullName"
            value={formData.fullName || ""}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email:
          <input
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            disabled
          />
        </label>

        <label>
          Phone No:
          <input
            name="phoneNo"
            value={formData.phoneNo || ""}
            onChange={handleChange}
          />
        </label>

        <label>
          Date of Birth:
          <input
            type="date"
            name="dob"
            value={formData.dob || ""}
            onChange={handleChange}
            disabled={!!profile.dob}
            required={!profile.dob}
          />
        </label>

        <label>
          Age:
          <input name="age" value={age || ""} disabled />
        </label>

        <h4>Address</h4>
        <label>
          Address:
          <input
            name="addressAddress"
            value={formData.addressAddress || ""}
            onChange={handleChange}
          />
        </label>

        <label>
          City:
          <input
            name="addressCity"
            value={formData.addressCity || ""}
            onChange={handleChange}
          />
        </label>

        <label>
          State:
          <input
            name="addressState"
            value={formData.addressState || ""}
            onChange={handleChange}
          />
        </label>

        <label>
          Pincode:
          <input
            name="addressPincode"
            value={formData.addressPincode || ""}
            onChange={handleChange}
          />
        </label>

        <label>
          Country:
          <input
            name="addressCountry"
            value={formData.addressCountry || ""}
            onChange={handleChange}
          />
        </label>

        <button type="submit" style={{ marginTop: "15px" }}>
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;
