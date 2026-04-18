import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getUsers, getUser, updateUser,
  getDraws, createDraw, simulateDraw, executeDraw, publishDraw,
  createCharity, updateCharity, deleteCharity,
  getWinners, verifyWinner, markPaid,
  getAnalytics,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);

router.get('/draws', getDraws);
router.post('/draws', createDraw);
router.post('/draws/:id/simulate', simulateDraw);
router.post('/draws/:id/run', executeDraw);
router.post('/draws/:id/publish', publishDraw);

router.post('/charities', createCharity);
router.put('/charities/:id', updateCharity);
router.delete('/charities/:id', deleteCharity);

router.get('/winners', getWinners);
router.put('/winners/:id/verify', verifyWinner);
router.put('/winners/:id/mark-paid', markPaid);

router.get('/analytics', getAnalytics);

export default router;
