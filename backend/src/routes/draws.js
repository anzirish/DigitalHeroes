import express from 'express';
import { getDraws, getDraw, getMyResults, uploadProof } from '../controllers/drawController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDraws);
router.get('/my/results', authenticate, getMyResults);
router.get('/:id', getDraw);
router.post('/:id/upload-proof', authenticate, uploadProof);

export default router;
