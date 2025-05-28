import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../ThemeContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const ManageAdmins = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const { user } = useAuth();
  const currentUserId = user?.userId;

  const [promotingUserId, setPromotingUserId] = useState(null);
  const [revokingUserId, setRevokingUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${apiURL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Error fetching users.");
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (userId) => {
    setPromotingUserId(userId);
    try {
      await axios.patch(
        `${apiURL}/admin/promote/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("User promoted to admin.");
      fetchUsers();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to promote user.");
    } finally {
      setPromotingUserId(null);
    }
  };

  const revokeAdmin = async (userId) => {
    setRevokingUserId(userId);
    try {
      await axios.patch(
        `${apiURL}/admin/demote/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Admin rights revoked.");
      fetchUsers();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to revoke admin.");
    } finally {
      setRevokingUserId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [message]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const resetSearch = () => {
    setSearchTerm("");
  };

  const filteredAdmins = users.filter(
    (u) =>
      u.role === "admin" &&
      (u.fullName.toLowerCase().includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm) ||
        u.phoneNo?.toLowerCase().includes(searchTerm))
  );

  const filteredNonAdmins = users.filter(
    (u) =>
      u.role !== "admin" &&
      (u.fullName.toLowerCase().includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm) ||
        u.phoneNo?.toLowerCase().includes(searchTerm))
  );

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

      {/* <div className="container"> */}
      <h2 className="mb-4">Manage Admins</h2>

      {message && <div className="alert alert-info text-center">{message}</div>}

      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control form-control-outline-success border border-success me-2"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={handleSearchChange}
        />

        <button className="btn btn-warning" onClick={resetSearch}>
          Clear
        </button>
      </div>

      {loading ? (
        <p className="text-center">Loading users...</p>
      ) : (
        <div className="accordion" id="userAccordion">
          {/* Admins */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="adminsHeader">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#adminsCollapse"
                aria-expanded="true"
                aria-controls="adminsCollapse"
              >
                Admin Users ({filteredAdmins.length})
              </button>
            </h2>
            <div
              id="adminsCollapse"
              className="accordion-collapse collapse show"
              aria-labelledby="adminsHeader"
              data-bs-parent="#userAccordion"
            >
              <div className="accordion-body">
                {filteredAdmins.length === 0 ? (
                  <p>No matching admin users found.</p>
                ) : (
                  <table className="table table-bordered table-hover table-responsive">
                    <thead className={isDark ? "table-dark" : "table-light"}>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone No.</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdmins.map((u) => (
                        <tr key={u.userId}>
                          <td>{u.fullName}</td>
                          <td>{u.email}</td>
                          <td>{u.phoneNo}</td>
                          <td className="text-center">
                            <button
                              className={`btn btn-sm ${
                                u.userId === currentUserId
                                  ? "btn-secondary"
                                  : "btn-danger"
                              }`}
                              onClick={() => revokeAdmin(u.userId)}
                              disabled={
                                u.userId === currentUserId ||
                                revokingUserId === u.userId
                              }
                            >
                              {revokingUserId === u.userId ? (
                                <span
                                  className="spinner-border spinner-border-sm text-light"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                              ) : (
                                "Revoke Admin"
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Non-admins */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="usersHeader">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#usersCollapse"
                aria-expanded="false"
                aria-controls="usersCollapse"
              >
                Regular Users ({filteredNonAdmins.length})
              </button>
            </h2>
            <div
              id="usersCollapse"
              className="accordion-collapse collapse"
              aria-labelledby="usersHeader"
              data-bs-parent="#userAccordion"
            >
              <div className="accordion-body">
                {filteredNonAdmins.length === 0 ? (
                  <p>No matching regular users found.</p>
                ) : (
                  <table className="table table-bordered table-hover table-responsive">
                    <thead className={isDark ? "table-dark" : "table-light"}>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone No.</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNonAdmins.map((u) => (
                        <tr key={u.userId}>
                          <td>{u.fullName}</td>
                          <td>{u.email}</td>
                          <td>{u.phoneNo}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => promoteToAdmin(u.userId)}
                              disabled={promotingUserId === u.userId}
                            >
                              {promotingUserId === u.userId ? (
                                <span
                                  className="spinner-border spinner-border-sm text-light"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                              ) : (
                                "Promote to Admin"
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    // </div>
  );
};

export default ManageAdmins;
