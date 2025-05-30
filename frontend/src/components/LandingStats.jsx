import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  FaUsers,
  FaCar,
  FaUserFriends,
  FaRoad,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import { useTheme } from "../ThemeContext";
import { useAuth } from "../AuthContext";
import "./Landing.css";

const LandingStats = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const apiURL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${apiURL}/stats/platform-stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Stats fetch error:", err);
      }
    };

    fetchStats();
  }, []);

  if (!stats) return null;

  const cardData = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: <FaUsers />,
      color: "#0d6efd",
    },
    {
      label: "Drivers",
      value: stats.totalDrivers,
      icon: <FaCar />,
      color: "#6610f2",
    },
    {
      label: "Passengers",
      value: stats.totalPassengers,
      icon: <FaUserFriends />,
      color: "#fd7e14",
    },
    {
      label: "Driver Rides",
      value: stats.totalDriverRides,
      icon: <FaRoad />,
      color: "#20c997",
    },
    {
      label: "Passenger Rides",
      value: stats.totalPassengerRides,
      icon: <FaRoad />,
      color: "#6f42c1",
    },
    {
      label: "Ongoing Rides",
      value: stats.ongoingRides,
      icon: <FaClock />,
      color: "#ffc107",
    },
    {
      label: "Completed Rides",
      value: stats.completedRides,
      icon: <FaCheckCircle />,
      color: "#198754",
    },
    {
      label: "Total Passengers Lyfted",
      value: stats.passengersLyfted,
      icon: <FaUserFriends />,
      color: "#aa8724",
    },
    {
      label: "Passengers In Lyft",
      value: stats.passengersInLyft,
      icon: <FaUserFriends />,
      color: "#11aaaa",
    },
  ];

  const userPieData = [
    { name: "Users", value: stats.totalUsers },
    { name: "Drivers", value: stats.totalDrivers },
    { name: "Passengers", value: stats.totalPassengers },
  ];

  const rideBarData = [
    {
      name: "Rides",
      Ongoing: stats.ongoingRides,
      Completed: stats.completedRides,
    },
  ];

  const colors = ["#007bff", "#fd7e14"];

  return (
    <section
      className={`landing-stats-section py-5 ${
        isDark ? "bg-dark text-light" : "bg-light text-dark"
      }`}
    >
      <div className="container">
        <h2 className="fw-bold text-center mb-5">🚘 Lyfter in Numbers</h2>

        <div className="row g-4 mb-5 px-5">
          {cardData.map((card, idx) => (
            <div className="col-md-6 col-lg-3" key={idx}>
              <div
                className={`p-4 rounded shadow h-100 text-center ${
                  isDark
                    ? "border border-secondary text-light"
                    : "bg-white text-dark"
                }`}
              >
                <div className="mb-3 fs-1" style={{ color: card.color }}>
                  {card.icon}
                </div>
                <h5>{card.label}</h5>
                <h3 className="fw-bold">{card.value || 0}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <div
              className={`p-4 rounded shadow ${
                isDark
                  ? "border border-secondary text-light"
                  : "bg-white text-dark"
              }`}
            >
              <h5 className="text-center mb-4">User Distribution</h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {userPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div
              className={`p-4 rounded shadow ${
                isDark
                  ? "border border-secondary text-light"
                  : "bg-white text-dark"
              }`}
            >
              <h5 className="text-center mb-4">Ride Status Overview</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={rideBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Ongoing" fill="#ffc107" />
                  <Bar dataKey="Completed" fill="#198754" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingStats;
