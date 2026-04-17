import { body } from 'express-validator';

export const addScoreValidator = [
  body('score').isInt({ min: 1, max: 45 }),
  body('score_date').isISO8601().toDate(),
];

export const updateScoreValidator = [
  body('score').isInt({ min: 1, max: 45 }),
];
