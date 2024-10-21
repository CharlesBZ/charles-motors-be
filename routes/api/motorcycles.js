const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

//models
const Post = require('../../models/Post');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Motorcycle = require('../../models/Motorcycle');

// Endpoints:

// POST /api/motorcycles - Create or update a motorcycle.

// GET /api/motorcycles - Get all motorcycles.

// GET /api/motorcycles/:id - Get a motorcycle by its ID.

// DELETE /api/motorcycles/:id - Delete a motorcycle.

// PUT /api/motorcycles/maintenance/:id - Add a maintenance record to a motorcycle.

// @router    GET api/motorcycles
// @desc      Test route
// router.get('/', (req, res) => res.send('Motorcycles route'));

// @router POST api/motorcycles
// @desc  Create or update a new motorcycle
// @access Private

router.post(
  '/',
  [
    auth,
    check('make', 'Make is required').not().isEmpty(),
    check('model', 'Model is required').not().isEmpty(),
    check('year', 'Year is required').not().isEmpty(),
    check('price', 'Price is required').not().isEmpty(),
    check('type', 'Type is required').not().isEmpty(),
    check('status', 'Status is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newMotorcycle = new Motorcycle({
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
        make: req.body.make,
        model: req.body.model,
        year: req.body.year,
        price: req.body.price,
        engineCapacity: req.body.engineCapacity,
        type: req.body.type,
        status: req.body.status,
      });

      const motorcycle = await newMotorcycle.save();
      res.status(201).json(motorcycle);
    } catch (err) {
      res.status(500).send('Server Error');
    }
  }
);

// @router GET /api/motorcycles
// @desc GET all motorcycles
// @access Private

router.get('/', auth, async (req, res) => {
  try {
    const motorcycles = await Motorcycle.find().sort({ date: -1 });
    res.json(motorcycles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route GET api/motorcycles/:id
// @desc  GET a single motorcycle by ID
// @access Private

router.get('/:id', auth, async (req, res) => {
  try {
    //Get from url
    const motorcycle = await Motorcycle.findById(req.params.id);
    if (!motorcycle)
      return res.status(404).json({ message: 'Motorcycle not found' });
    res.json(motorcycle);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res
        .status(404)
        .json({ msg: 'There is no motorcycle found with id' });
    }
  }
});

// @router DELETE api/motorcycles/:id
// @desc DELETE a motorcycle by ID
// @access Private

router.delete('/:id', auth, async (req, res) => {
  try {
    const motorcycle = await Motorcycle.findById(req.params.id);
    if (!motorcycle)
      return res.status(404).json({ message: 'Motorcycle is not found' });

    // Check user matches, use toString() method or it will never match the user
    if (motorcycle.user.toString() !== req.user.id) {
      return res.status(401).json({
        msg: 'User not authorized to delete this motorcycle posting, kindly exit this platform! ',
      });
    }

    await motorcycle.deleteOne({ _id: req.params.id });

    res.json({ message: 'Motorcycle deleted successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res
        .status(404)
        .json({ msg: 'There is no motorcycle found with id' });
    }
    res.status(500).send('Server Error');
  }
});

// @router PUT api/motorcycles/love/:id
// @desc update a motorcycle by ID
// @access Private

router.put('/love/:id', auth, async (req, res) => {
  try {
    //included in url
    const motorcycle = await Motorcycle.findById(req.params.id);

    // Check if the post has already been loved by user
    if (
      motorcycle.loves.filter(love => love.user.toString() === req.user.id)
        .length > 0
    ) {
      return res.status(400).json({ msg: 'User already loved this post' });
    }
    // User has not loved, add love
    motorcycle.loves.unshift({ user: req.user.id });

    await motorcycle.save();

    res.json(motorcycle.loves);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  PUT api/posts/unlove/:id
// @desc   Unlove a motorcycle
// @access Private

router.put('/unlove/:id', auth, async (req, res) => {
  try {
    //included in url
    const motorcycle = await Motorcycle.findById(req.params.id);

    // Check if the post has already been liked by user
    if (
      //This were checking if its equal to 0, which means we not like it yet
      motorcycle.loves.filter(love => love.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: 'User has not loved motorcycle yet' });
    }

    // Get remove index
    const removeIndex = motorcycle.loves
      .map(love => love.user.toString())
      .indexOf(req.user.id);

    motorcycle.loves.splice(removeIndex, 1);
    await motorcycle.save();

    res.json(motorcycle.loves);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
