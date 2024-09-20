const express = require("express")
const router = express.Router()
const { check, validationResult } = require("express-validator")
const Motorcycle = require("../../models/Motorcycle")

// Endpoints:

// POST /api/motorcycles - Create or update a motorcycle.

// GET /api/motorcycles - Get all motorcycles.

// GET /api/motorcycles/:id - Get a motorcycle by its ID.

// DELETE /api/motorcycles/:id - Delete a motorcycle.

// PUT /api/motorcycles/maintenance/:id - Add a maintenance record to a motorcycle.

// @router    GET api/motorcycles
// @desc      Test route
// router.get('/', (req, res) => res.send('Motorcycles route'));

// @router GET /api/motorcycles
// @desc GET all motorcycles
router.get("/", async (req, res) => {
  try {
    const motorcycles = await Motorcycle.find()
    res.json(motorcycles)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// @route GET api/motorcycles/123
// @desc  GET a single motorcycle by ID
router.get("/:id", async (req, res) => {
  try {
    const motorcycle = await Motorcycle.findById(req.params.id)
    if (!motorcycle)
      return res.status(404).json({ message: "Motorcycle not found" })
    res.json(motorcycle)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// @router POST api/motorcycles
// @desc  Create or update a new motorcycle

router.post("/", async (req, res) => {
  const motorcycle = new Motorcycle({
    make: req.body.make,
    model: req.body.model,
    year: req.body.year,
    price: req.body.price,
    engineCapacity: req.body.engineCapacity, // Add engineCapacity
    type: req.body.type, // Add type
    status: req.body.status,
  })

  try {
    const newMotorcycle = await motorcycle.save()
    res.status(201).json(newMotorcycle)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// @router PUT api/motorcycles
// @desc update a motorcycle by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedMotorcycle = await Motorcycle.findByIdAndUpdate(
      req.params.id,
      {
        make: req.body.make,
        model: req.body.model,
        year: req.body.year,
        price: req.body.price,
      },
      { new: true },
    )
    if (!updatedMotorcycle)
      return res.status(404).json({ message: "Motorcycle not found" })
    res.json(updatedMotorcycle)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// @router DELETE api/motorcycles/123
// @desc DELETE a motorcycle by ID
router.delete("/:id", async (req, res) => {
  try {
    const motorcycle = await Motorcycle.findByIdAndDelete(req.params.id)
    if (!motorcycle)
      return res.status(404).json({ message: "Motorcycle not found" })
    res.json({ message: "Motorcycle deleted successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
