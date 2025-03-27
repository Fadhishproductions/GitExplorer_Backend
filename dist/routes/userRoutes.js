"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const userValidator_1 = require("../validators/userValidator");
const validateRequest_1 = require("../middleware/validateRequest");
const router = express_1.default.Router();
router.post('/:username', userValidator_1.validateUsernameParam, validateRequest_1.validateRequest, userController_1.saveGitHubUser);
router.put('/:username/friends', userController_1.updateFriends);
router.get('/search', userController_1.searchUsers);
router.put('/:username/update', userValidator_1.validateUsernameParam, userValidator_1.validateUserUpdate, validateRequest_1.validateRequest, userController_1.updateUserInfo);
router.delete('/:username/delete', userController_1.softDeleteUser);
router.get('/', userValidator_1.validateSorting, validateRequest_1.validateRequest, userController_1.getSortedUsers);
exports.default = router;
