const express = require('express');
const router = express.Router();
const Charity = require('../models/Charity');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/charities  — list all active charities (public)
router.get('/', async (req, res) => {
  try {
    const { search, category, featured } = req.query;
    const query = { isActive: true };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;

    const charities = await Charity.find(query).sort({ isFeatured: -1, name: 1 });
    res.json({ charities });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/charities/:id
router.get('/:id', async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) return res.status(404).json({ message: 'Charity not found' });
    res.json({ charity });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/charities  — admin create
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const charity = await Charity.create(req.body);
    res.status(201).json({ charity });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/charities/:id  — admin update
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!charity) return res.status(404).json({ message: 'Charity not found' });
    res.json({ charity });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/charities/:id  — admin delete (soft: sets isActive=false)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Charity.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Charity deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;