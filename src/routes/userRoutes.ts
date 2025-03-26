import express from 'express';
import { getSortedUsers, saveGitHubUser, searchUsers, softDeleteUser, updateFriends, updateUserInfo } from '../controllers/userController';
import {
    validateSorting,
    validateUsernameParam,
    validateUserUpdate,
  } from '../validators/userValidator';
  import { validateRequest } from '../middleware/validateRequest';
const router = express.Router();

router.post('/:username', validateUsernameParam,
    validateRequest,saveGitHubUser);

router.put('/:username/friends', updateFriends);  

router.get('/search', searchUsers);

router.put('/:username/update',validateUsernameParam,
    validateUserUpdate,
    validateRequest, updateUserInfo);

router.delete('/:username/delete', softDeleteUser);

router.get(
    '/',
    validateSorting,
    validateRequest,
    getSortedUsers
  );export default router;
