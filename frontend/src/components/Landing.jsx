import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold">Welcome to Lyfter!</h2>
      <p className="mt-4">
        This is the home page. You can go to the{" "}
        <Link to="/register" className="text-blue-500 underline">Register</Link> page or{" "}
        <Link to="/login" className="text-blue-500 underline">Login</Link> page.
      </p>
    </div>
  );
};

export default Landing;
