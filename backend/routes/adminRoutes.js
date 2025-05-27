// import express from 'express';
// import { getPendingDriverRequests } from '../controllers/adminController.js';
// // import authenticate from '../middleware/authenticate.js'; // or your auth middleware
// import { isAdmin } from '../middleware/isAdmin.js';

// const router = express.Router();

// router.get('/pending-drivers', isAdmin, getPendingDriverRequests);

// export default router;

import express from "express";
import {
  getPendingDriverRequests,
  getAllUsers,
  promoteToAdmin,
  demoteAdmin,
} from "../controllers/adminController.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/pending-drivers", isAdmin, getPendingDriverRequests);
router.get("/users", isAdmin, getAllUsers); // ✅ for ManageAdmins
router.patch("/promote/:userId", isAdmin, promoteToAdmin);
router.patch("/demote/:userId", isAdmin, demoteAdmin);

export default router;
