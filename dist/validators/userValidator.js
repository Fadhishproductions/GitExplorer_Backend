"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSorting = exports.validateUserUpdate = exports.validateUsernameParam = void 0;
const express_validator_1 = require("express-validator");
exports.validateUsernameParam = [
    (0, express_validator_1.param)('username')
        .notEmpty()
        .withMessage('Username is required')
        .isAlphanumeric()
        .withMessage('Username must be alphanumeric'),
];
exports.validateUserUpdate = [
    (0, express_validator_1.body)('location')
        .optional()
        .isString()
        .withMessage('Location must be a string'),
    (0, express_validator_1.body)('blog')
        .optional()
        .isURL()
        .withMessage('Blog must be a valid URL'),
    (0, express_validator_1.body)('bio')
        .optional()
        .isString()
        .isLength({ max: 160 })
        .withMessage('Bio must be under 160 characters'),
];
const express_validator_2 = require("express-validator");
exports.validateSorting = [
    (0, express_validator_2.query)('sortBy')
        .optional()
        .isIn(['public_repos', 'public_gists', 'followers', 'following', 'created_at'])
        .withMessage('Invalid sortBy field'),
];
