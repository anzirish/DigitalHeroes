import express from 'express';
import { getDashboard, updateProfile } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { updateProfileValidator } from '../validators/userValidators.js';

const router = express.Router();

router.get('/dashboard', authenticate, getDashboard);
router.put('/profile', authenticate, updateProfileValidator, updateProfile);

export default router;
