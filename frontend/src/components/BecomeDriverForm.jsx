// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const BecomeDriverForm = ({ onSubmitted }) => {
//   const navigate = useNavigate();
//   const apiURL = import.meta.env.VITE_API_URL;

//   const [aadharNumber, setAadharNumber] = useState("");
//   const [aadharPhoto, setAadharPhoto] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!aadharPhoto) return alert("Upload your Aadhar photo");

//     const formData = new FormData();
//     formData.append("aadharNumber", aadharNumber);
//     formData.append("aadharPhoto", aadharPhoto);

//     try {
//       const token = localStorage.getItem("token");
//       await axios.post(`${apiURL}/drivers/request`, formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       navigate("/driver-dashboard");
//       // alert("Driver request submitted!");
//       onSubmitted(true);
//     } catch (err) {
//       console.error(err);
//       // alert("Submission failed.");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div>
//         <label>Aadhar Number</label>
//         <input
//           type="text"
//           value={aadharNumber}
//           onChange={(e) => setAadharNumber(e.target.value)}
//           className="border rounded px-2 py-1 w-full"
//           required
//         />
//       </div>
//       <div>
//         <label>Aadhar Photo</label>
//         <input
//           type="file"
//           onChange={(e) => setAadharPhoto(e.target.files[0])}
//           className="w-full"
//           accept="image/*"
//           required
//         />
//       </div>
//       <button
//         type="submit"
//         className="bg-blue-600 text-white px-4 py-1 rounded"
//       >
//         Submit
//       </button>
//     </form>
//   );
// };

// export default BecomeDriverForm;

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BecomeDriverForm = () => {
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;

  const [aadharNumber, setAadharNumber] = useState("");
  const [aadharPhoto, setAadharPhoto] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!aadharPhoto) {
      alert("Upload your Aadhaar photo");
      return;
    }

    const formData = new FormData();
    formData.append("aadharNumber", aadharNumber);
    formData.append("aadharPhoto", aadharPhoto); // Field name must match multer field

    try {
      const token = localStorage.getItem("token");

      await axios.post(`${apiURL}/drivers/request`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // onSubmitted(true);
      navigate("/driver-dashboard");
    } catch (err) {
      console.error(err);
      alert("Driver request submission failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Aadhaar Number</label>
        <input
          type="text"
          value={aadharNumber}
          onChange={(e) => setAadharNumber(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>
      <div>
        <label>Aadhaar Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAadharPhoto(e.target.files[0])}
          className="w-full"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-1 rounded"
      >
        Submit
      </button>
    </form>
  );
};

export default BecomeDriverForm;
