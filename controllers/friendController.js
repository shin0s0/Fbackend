const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

const searchUsers = async (req, res) => {
  try {
    const { username } = req.query;
    const users = await User.find({ username: new RegExp(username, 'i') }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
    });
    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already sent' });
    }

    // Create new friend request
    const request = new FriendRequest({ sender: senderId, receiver: receiverId });
    await request.save();

    res.status(201).json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const handleFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    const receiverId = req.user.id;

    const request = await FriendRequest.findOne({ _id: id, receiver: receiverId });
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (action === 'accept') {
      const sender = await User.findById(request.sender);
      const receiver = await User.findById(receiverId);

      sender.friends.push(receiver._id);
      receiver.friends.push(sender._id);

      await sender.save();
      await receiver.save();
    }

    await FriendRequest.deleteOne({ _id: id });

    res.json({ message: `Friend request ${action}ed` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', '-password');
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends');
    const friends = user.friends.map(friend => friend._id);
    
    const recommendations = await User.find({
      _id: { $nin: [...friends, user._id] },
      'friends': { $in: friends }
    }).limit(10); // Limit the number of recommendations

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { searchUsers, sendFriendRequest, handleFriendRequest, getFriends, getRecommendations };
