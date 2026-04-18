import express from 'express';
import { getScores, addScore, updateScore, deleteScore } from '../controllers/scoreController.js';
import { authenticate, requireSubscription } from '../middleware/auth.js';
import { addScoreValidator, updateScoreValidator } from '../validators/scoreValidators.js';

const router = express.Router();

router.get('/', authenticate, requireSubscription, getScores);
router.post('/', authenticate, requireSubscription, addScoreValidator, addScore);
router.put('/:id', authenticate, requireSubscription, updateScoreValidator, updateScore);
router.delete('/:id', authenticate, requireSubscription, deleteScore);

export default router;
