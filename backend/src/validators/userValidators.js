import { body } from 'express-validator';

export const updateProfileValidator = [
  body('full_name').optional().notEmpty().trim(),
];
