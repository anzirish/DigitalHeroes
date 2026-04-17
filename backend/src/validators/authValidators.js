import { body } from 'express-validator';

export const registerValidator = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('full_name').notEmpty().trim(),
  body('charity_id').optional().isUUID(),
  body('charity_percentage').optional().isFloat({ min: 10, max: 100 }),
];

export const loginValidator = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];
