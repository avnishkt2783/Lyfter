import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import sequelize from "./config/db.js"; // Sequelize DB connection
import userRoutes from "./routes/userRoutes.js"; // User-related routes

// Import models to register them with Sequelize
import "./models/user/user.js"; 

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON request body

// Routes
app.use('/api', userRoutes); // All user routes will start from /api/users

// Connect to Database and Start Server
sequelize.sync({ alter: true }) // alter:true for development - auto updates table structure if changed
  .then(() => {
    console.log("✅ MySQL Database connected successfully!");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error connecting to the database:", error);
  });
