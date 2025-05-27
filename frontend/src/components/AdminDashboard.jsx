// import React, { useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { ThemeContext } from "../ThemeContext";

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const { theme } = useContext(ThemeContext);
//   const isDark = theme === "dark";

//   return (
//     <div
//       className={`p-4 ${isDark ? "bg-dark text-light" : "bg-light text-dark"}`}
//     >
//       <div className="container py-5">
//         <h2 className="mb-5 text-center">Admin Dashboard</h2>
//         <div className="d-grid gap-4 col-12 col-md-6 mx-auto">
//           <button
//             onClick={() => navigate("/verify-aadhar")}
//             className="btn btn-primary btn-lg shadow"
//           >
//             Verify Aadhaar Card
//           </button>
//           <button
//             onClick={() => navigate("/pending-drivers")}
//             className="btn btn-success btn-lg shadow"
//           >
//             Verify Driving License
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../ThemeContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <div
      className={`p-4 ${isDark ? "bg-dark text-light" : "bg-light text-dark"}`}
    >
      <div className="container py-5">
        <h2 className="mb-5 text-center">Admin Dashboard</h2>
        <div className="d-grid gap-4 col-12 col-md-6 mx-auto">
          <button
            onClick={() => navigate("/verify-aadhar")}
            className="btn btn-primary btn-lg shadow"
          >
            Verify Aadhaar Card
          </button>
          <button
            onClick={() => navigate("/pending-drivers")}
            className="btn btn-success btn-lg shadow"
          >
            Verify Driving License
          </button>
          <button
            onClick={() => navigate("/manage-admins")}
            className="btn btn-warning btn-lg shadow"
          >
            Manage Admins
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
