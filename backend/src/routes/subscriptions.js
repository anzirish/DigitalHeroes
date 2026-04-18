import express from 'express';
import { createOrder, verifyPayment, cancelSubscription, getStatus } from '../controllers/subscriptionController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-order', authenticate, createOrder);
router.post('/verify', authenticate, verifyPayment);
router.post('/cancel', authenticate, cancelSubscription);
router.get('/status', authenticate, getStatus);

export default router;
