import express from 'express';
import { getPendingDriverRequests } from '../controllers/adminController.js';
// import authenticate from '../middleware/authenticate.js'; // or your auth middleware
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

router.get('/pending-drivers', isAdmin, getPendingDriverRequests);

export default router;
