import { body, param } from 'express-validator';

export const validateUsernameParam = [
  param('username')
    .notEmpty()
    .withMessage('Username is required')
    .isAlphanumeric()
    .withMessage('Username must be alphanumeric'),
];

export const validateUserUpdate = [
  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string'),
  body('blog')
    .optional()
    .isURL()
    .withMessage('Blog must be a valid URL'),
  body('bio')
    .optional()
    .isString()
    .isLength({ max: 160 })
    .withMessage('Bio must be under 160 characters'),
];

import { query } from 'express-validator';

export const validateSorting = [
  query('sortBy')
    .optional()
    .isIn(['public_repos', 'public_gists', 'followers', 'following', 'created_at'])
    .withMessage('Invalid sortBy field'),
];

