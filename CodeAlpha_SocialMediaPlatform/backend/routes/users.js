const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/users - Search users
router.get('/', auth, async (req, res) => {
  try {
    const { q } = req.query;
    const query = q
      ? { $or: [
          { username: { $regex: q, $options: 'i' } },
          { displayName: { $regex: q, $options: 'i' } }
        ], _id: { $ne: req.userId }
        }
      : { _id: { $ne: req.userId } };

    const users = await User.find(query)
      .select('username displayName bio avatar followers following')
      .limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:username
router.get('/:username', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers', 'username displayName avatar')
      .populate('following', 'username displayName avatar');

    if (!user) return res.status(404).json({ error: 'User not found' });

    const posts = await Post.find({ author: user._id })
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: -1 });

    res.json({ user, posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/profile/update
router.put('/profile/update', auth, async (req, res) => {
  try {
    const { displayName, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { displayName, bio, avatar },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/:id/follow
router.post('/:id/follow', auth, async (req, res) => {
  try {
    if (req.params.id === req.userId.toString()) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const currentUser = await User.findById(req.userId);
    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(req.userId, { $pull: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.userId } });
      res.json({ following: false, message: `Unfollowed @${targetUser.username}` });
    } else {
      // Follow
      await User.findByIdAndUpdate(req.userId, { $addToSet: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.userId } });
      res.json({ following: true, message: `Following @${targetUser.username}` });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
