const express = require('express');
const router = express.Router();
const Draw = require('../models/Draw');
const { protect, adminOnly } = require('../middleware/auth');
const { runDraw, calculatePrizePool } = require('../services/drawEngine');

// GET /api/draws  — list published draws (public)
router.get('/', async (req, res) => {
  try {
    const draws = await Draw.find({ status: 'published' })
      .populate('winners.user', 'name email')
      .sort({ year: -1, month: -1 })
      .limit(12);
    res.json({ draws });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/draws/current  — current month's draw info (public)
router.get('/current', async (req, res) => {
  try {
    const now = new Date();
    const draw = await Draw.findOne({ month: now.getMonth() + 1, year: now.getFullYear() })
      .populate('winners.user', 'name');
    res.json({ draw });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/draws/pool-estimate  — estimate current prize pool
router.get('/pool-estimate', protect, async (req, res) => {
  try {
    const pool = await calculatePrizePool();
    res.json({ pool });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/draws/my-entries  — draws the user participated in
router.get('/my-entries', protect, async (req, res) => {
  try {
    const draws = await Draw.find({
      status: 'published',
      'winners.user': req.user._id,
    }).sort({ year: -1, month: -1 });
    res.json({ draws });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- ADMIN ROUTES ---

// GET /api/draws/admin/all  — all draws including scheduled/simulated
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const draws = await Draw.find()
      .populate('winners.user', 'name email')
      .sort({ year: -1, month: -1 });
    res.json({ draws });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/draws/admin/simulate  — run simulation (not published)
router.post('/admin/simulate', protect, adminOnly, async (req, res) => {
  try {
    const { month, year, drawType } = req.body;
    const draw = await runDraw({
      month: parseInt(month),
      year: parseInt(year),
      drawType: drawType || 'random',
      simulate: true,
    });
    res.json({ draw });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/draws/admin/publish  — publish draw results
router.post('/admin/publish', protect, adminOnly, async (req, res) => {
  try {
    const { month, year, drawType } = req.body;
    const draw = await runDraw({
      month: parseInt(month),
      year: parseInt(year),
      drawType: drawType || 'random',
      simulate: false,
    });
    res.json({ draw });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;