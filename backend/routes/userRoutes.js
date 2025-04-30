import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post('/logout/:email', logoutUser);
// routes.get('/user/profile', )

export default router;
