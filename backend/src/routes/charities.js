import express from 'express';
import { getCharities, getCharity, selectCharity } from '../controllers/charityController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCharities);
router.get('/:id', getCharity);
router.put('/select', authenticate, selectCharity);

export default router;
