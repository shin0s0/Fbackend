const express = require('express');
const router = express.Router();
const { searchUsers, sendFriendRequest, handleFriendRequest, getFriends, getRecommendations } = require('../controllers/friendController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/search', authMiddleware, searchUsers);
router.post('/request', authMiddleware, sendFriendRequest);
router.post('/request/:id', authMiddleware, handleFriendRequest);
router.get('/friends', authMiddleware, getFriends);
router.get('/recommendations', authMiddleware, getRecommendations);

module.exports = router;
