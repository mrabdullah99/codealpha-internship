const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/posts - Feed (posts from followed users + own)
router.get('/', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const feedUserIds = [...currentUser.following, req.userId];

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const posts = await Post.find({ author: { $in: feedUserIds } })
      .populate('author', 'username displayName avatar')
      .populate('comments.author', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posts/explore - All posts
router.get('/explore', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const posts = await Post.find()
      .populate('author', 'username displayName avatar')
      .populate('comments.author', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts - Create post
router.post('/', auth, async (req, res) => {
  try {
    const { content, image, tags } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Post content is required' });
    }

    const post = new Post({
      author: req.userId,
      content: content.trim(),
      image: image || '',
      tags: tags || []
    });

    await post.save();
    await post.populate('author', 'username displayName avatar');

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posts/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username displayName avatar')
      .populate('comments.author', 'username displayName avatar');

    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts/:id/like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const hasLiked = post.likes.includes(req.userId);

    if (hasLiked) {
      post.likes.pull(req.userId);
    } else {
      post.likes.addToSet(req.userId);
    }

    await post.save();
    res.json({ liked: !hasLiked, likeCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts/:id/comments
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({ author: req.userId, content: content.trim() });
    await post.save();
    await post.populate('comments.author', 'username displayName avatar');

    const newComment = post.comments[post.comments.length - 1];
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/posts/:postId/comments/:commentId
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if (comment.author.toString() !== req.userId.toString() &&
        post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    comment.deleteOne();
    await post.save();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
