import express from "express";
import authenticate from "../middleware/authenticate.js";
import { upload } from "../middleware/upload.js";
import {
  addVehicle,
  deleteVehicle,
  getVehicles,
} from "../controllers/vehicleController.js";

const router = express.Router();

router.post("/add", authenticate, upload.single("vehiclePhoto"), addVehicle);

router.delete("/:vehicleId", authenticate, deleteVehicle);
router.get("/getvehicles", getVehicles);
export default router;
