import express from 'express';
import { getSortedUsers, saveGitHubUser, searchUsers, softDeleteUser, updateFriends, updateUserInfo } from '../controllers/userController';

const router = express.Router();

router.post('/:username', saveGitHubUser);
router.put('/:username/friends', updateFriends);  
router.get('/search', searchUsers);
router.put('/:username/update', updateUserInfo);
router.delete('/:username/delete', softDeleteUser);
router.get('/', getSortedUsers);
export default router;
