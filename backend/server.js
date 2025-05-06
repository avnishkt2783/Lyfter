import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from 'path';

import userRoutes from "./routes/userRoutes.js";
import rideRoutes from './routes/rideRoutes.js';

import sequelize from "./config/db.js"; 
import "./models/user/user.js"; 
import "./models/auth/auth.js";

import authenticate from './middleware/authenticate.js';

import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(bodyParser.json());

app.use(express.json()); 
app.use(authenticate);

app.use('/api', userRoutes); 
app.use('/api/rides', rideRoutes);

sequelize.sync()
  .then(() => {
    console.log("✅ MySQL Database connected successfully!");

    const PORT = process.env.BACKEND_PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error connecting to the database:", error);
  });
