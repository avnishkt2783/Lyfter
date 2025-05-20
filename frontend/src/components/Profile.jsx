import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext"; // import your ThemeContext
import { Link } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaMapMarkerAlt,
  FaSave,
  FaUpload,
  FaPencilAlt,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Profile.css";

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
  const { theme } = useTheme(); // get theme
  const isDark = theme === "dark";

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [profileImg, setProfileImg] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  useEffect(() => {
    if (error || successMsg) {
      const timer = setTimeout(() => {
        setError("");
        setSuccessMsg("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, successMsg]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

      await fetchProfile(); // Re-fetch to get the fresh and correct data
      setSuccessMsg("Profile updated successfully!");
      // setProfile(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile");
    }
  };

  if (error) return <p className="text-danger text-center">{error}</p>;
  if (!profile) return <p className="text-center">Loading profile...</p>;

  const age = formData.dob ? calculateAge(formData.dob) : null;

  return (
    <div
      className={`container profile-form my-4 p-4 rounded shadow ${
        isDark ? "bg-dark text-white border-secondary" : "bg-white border-dark"
      }`}
    >
      <div className="mb-3">
        <Link
          to="/driver-dashboard"
          style={{
            display: "inline-block",
            backgroundColor: "#22c55e",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Go to Driver Dashboard
        </Link>
      </div>
      <hr />
      <h2 className="text-center mb-4">Profile Page</h2>
      {/* <hr /> */}
      {successMsg && (
        <div
          className={`alert ${
            isDark
              ? "alert-success bg-success bg-opacity-25 text-white"
              : "alert-success"
          }`}
        >
          {successMsg}
        </div>
      )}
      {error && (
        <div
          className={`alert ${
            isDark
              ? "alert-danger bg-danger bg-opacity-25 text-white"
              : "alert-danger"
          }`}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Profile image with pencil overlay */}
        <div className="text-center mb-3">
          <label
            htmlFor="profileImageInput"
            className="profile-image-wrapper"
            style={{
              cursor: "pointer",
              display: "inline-block",
              position: "relative",
            }}
            title="Change Profile Image"
          >
            <img
              src={previewImg || profile.profileImg || "/default.jpg"}
              alt="Profile"
              className="rounded-circle"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              className={`profile-image-overlay ${
                isDark ? "overlay-dark" : "overlay-light"
              }`}
            >
              <FaPencilAlt size={22} />
            </div>
            <input
              id="profileImageInput"
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </label>
        </div>

        {/* Input fields */}
        <div className="form-group mb-3">
          <label>
            <FaUser className="me-2" />
            Full Name
          </label>
          <input
            className={`form-control ${
              isDark ? "text-white border-1 border-light" : ""
            }`}
            name="fullName"
            value={formData.fullName || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group mb-3">
          <label>
            <FaEnvelope className="me-2" />
            Email
          </label>
          <input
            className={`form-control ${
              isDark ? "text-white border-1 border-light" : ""
            }`}
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            disabled
          />
        </div>

        <div className="form-group mb-3">
          <label>
            <FaPhone className="me-2" />
            Phone No.
          </label>
          <input
            className={`form-control ${
              isDark ? "text-white border-1 border-light" : ""
            }`}
            name="phoneNo"
            value={formData.phoneNo || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group mb-3">
          <label>
            <FaCalendar className="me-2" />
            Date of Birth{" "}
            <span className="badge bg-danger">
              Cannot be changed once entered.
            </span>
          </label>
          <input
            type="date"
            className={`form-control ${
              isDark ? "text-white border-1 border-light" : ""
            }`}
            name="dob"
            value={formData.dob || ""}
            onChange={handleChange}
            disabled={!!profile.dob}
            required={!profile.dob}
          />
        </div>

        <div className="form-group mb-3">
          <label>Age</label>
          <input
            className={`form-control ${
              isDark ? "text-white border-1 border-light" : ""
            }`}
            value={age || ""}
            disabled
          />
        </div>

        <h5 className="mt-4 mb-3">
          <FaMapMarkerAlt className="me-2" />
          Location Details
        </h5>

        <div className="form-group mb-2">
          <label>Address</label>
          <input
            className={`form-control ${
              isDark ? "text-white border-1 border-light" : ""
            }`}
            name="addressAddress"
            value={formData.addressAddress || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group mb-2">
          <label>City</label>
          <input
            className={`form-control ${
              isDark ? "text-white border-1 border-light" : ""
            }`}
            name="addressCity"
            value={formData.addressCity || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group mb-2">
          <label>State</label>
          <input
            className={`form-control ${
              isDark ? "text-white border-1 border-light" : ""
            }`}
            name="addressState"
            value={formData.addressState || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group mb-2">
          <label>Pincode</label>
          <input
            className={`form-control ${
              isDark ? "text-white border-1 border-light" : ""
            }`}
            name="addressPincode"
            value={formData.addressPincode || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group mb-4">
          <label>Country</label>
          <input
            className={`form-control ${
              isDark ? "text-white border-1 border-light" : ""
            }`}
            name="addressCountry"
            value={formData.addressCountry || ""}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className={`btn btn-success w-100`}>
          <FaSave className="me-2" />
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;
