import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";

import userRoutes from "./routes/userRoutes.js";
import rideRoutes from "./routes/rideRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import statsRoutes from "./routes/stats.js";

import sequelize from "./config/db.js";

// ✅ Import models first
import User from "./models/user/user.js";
import Driver from "./models/driver/driver.js";
import "./models/user/user.js";
import "./models/auth/auth.js";
import "./models/driver/vehicle.js";

// ✅ Define associations AFTER importing models
User.hasOne(Driver, { foreignKey: "userId" });
Driver.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

import authenticate from "./middleware/authenticate.js";
import ensureAdmin from "./utils/ensureAdmin.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(
  cors({
    origin: "https://lyfter-frontend.vercel.app",
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// app.use('/uploads', express.static('uploads'));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(bodyParser.json());

app.use(express.json());
app.use(authenticate);

app.use("/api", userRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/vehicle", vehicleRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stats", statsRoutes);

// sequelize.sync({ alter: true })
sequelize
  .sync()
  .then(async () => {
    console.log("✅ MySQL Database connected successfully!");

    // ✅ Ensure admin user is created
    await ensureAdmin();

    const PORT = process.env.BACKEND_PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error connecting to the database:", error);
  });
