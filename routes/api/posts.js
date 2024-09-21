const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

//models
const Post = require('../../models/Post');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Motorcycle = require('../../models/Motorcycle');

// @router    POSt api/posts
// @desc      Test post route
// @access    Private

/* router.post("/", (req, res) => {
  res.json("Test post route")
}) */

// @router    POST api/posts
// @desc      Create a new post
// @access    Private

router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  GET api/posts
// @desc   Get all posts
// @access Private

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  GET api/posts/:id
// @desc   Gets one post by id
// @access Private

router.get('/:id', auth, async (req, res) => {
  try {
    //Get from url
    const post = await Post.findById(req.params.id).sort({ date: -1 });
    //Check if there is a post with id
    if (!post) {
      return res.status(404).json({ msg: 'There is no post found with id' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'There is no post found with id' });
    }
    res.status(500).send('Server Error');
  }
});

// @route  DELETE api/posts/:id
// @desc   Delete a post
// @access Private

router.delete('/:id', auth, async (req, res) => {
  try {
    //Get from url (req.params.id)
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check user matches, use toString() method or it will never match the user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({
        msg: 'User not authorized to delete this post, kindly exit this platform! ',
      });
    }

    await post.deleteOne({ _id: req.params.id });

    res.json({ msg: 'Post has been deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'There is no post found with id' });
    }
    res.status(500).send('Server Error');
  }
});

// @route  PUT api/posts/like/:id
// @desc   Like a post
// @access Private

router.put('/like/:id', auth, async (req, res) => {
  try {
    //included in url
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked by user
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: 'User already liked this post' });
    }
    // User has not liked, add like
    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  PUT api/posts/unlike/:id
// @desc   Unlike a post
// @access Private

router.put('/unlike/:id', auth, async (req, res) => {
  try {
    //included in url
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked by user
    if (
      //This were checking if its equal to 0, which means we not like it yet
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: 'User has not liked post yet' });
    }

    // Get remove index
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);
    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// TODO: Teach this start 9/20/2024
// @router    POST api/posts/comment/:id
// @desc      Comment on a post
// @access    Private

router.post(
  '/comment/:id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Fetch the user (without password)
      const user = await User.findById(req.user.id).select('-password');
      // Fetch the post by its ID (from req.params.id, not req.user.id)
      const post = await Post.findById(req.params.id);

      // Check if the post exists
      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }

      // Create a new comment object
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      //@access posts.comment, Add the new comment to the beginning of the comments array
      post.comments.unshift(newComment);

      // Save the updated post
      await post.save();

      // Return the updated comments
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @router    DELETE api/posts/comment/:id/:comment_id
// @desc      Delete a comment
// @access    Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    // Fetch the post by its ID (from req.params.id, not req.user.id)
    const post = await Post.findById(req.params.id);

    //Pull out the comment
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );

    //Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }

    //Check user
    if (comment.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: 'User not authorized to delete this comment' });
    }

    // Get remove index
    const removeIndex = post.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);
    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// TODO: Teach this end 9/20/2024

module.exports = router;
