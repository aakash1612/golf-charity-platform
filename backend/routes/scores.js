const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const { protect, subscriberOnly } = require('../middleware/auth');

// GET /api/scores/mine  — get my scores
router.get('/mine', protect, subscriberOnly, async (req, res) => {
  try {
    const scoreDoc = await Score.findOne({ user: req.user._id });
    res.json({ scores: scoreDoc?.scores || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/scores  — add a new score (auto-rolls out oldest if 5 exist)
router.post('/', protect, subscriberOnly, async (req, res) => {
  try {
    const { value, date } = req.body;

    if (!value || value < 1 || value > 45)
      return res.status(400).json({ message: 'Score must be between 1 and 45 (Stableford)' });

    if (!date) return res.status(400).json({ message: 'Date is required' });

    const scoreDoc = await Score.addScore(req.user._id, value, new Date(date));
    res.status(201).json({ scores: scoreDoc.scores });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/scores/:index  — edit a score by its position (0=newest)
router.put('/:index', protect, subscriberOnly, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const { value, date } = req.body;

    if (isNaN(index) || index < 0 || index > 4)
      return res.status(400).json({ message: 'Invalid score index (0-4)' });

    if (value && (value < 1 || value > 45))
      return res.status(400).json({ message: 'Score must be between 1 and 45' });

    const scoreDoc = await Score.findOne({ user: req.user._id });
    if (!scoreDoc || !scoreDoc.scores[index])
      return res.status(404).json({ message: 'Score not found' });

    if (value) scoreDoc.scores[index].value = value;
    if (date) scoreDoc.scores[index].date = new Date(date);

    await scoreDoc.save();
    res.json({ scores: scoreDoc.scores });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/scores/:index  — remove a score by position
router.delete('/:index', protect, subscriberOnly, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const scoreDoc = await Score.findOne({ user: req.user._id });
    if (!scoreDoc || !scoreDoc.scores[index])
      return res.status(404).json({ message: 'Score not found' });

    scoreDoc.scores.splice(index, 1);
    await scoreDoc.save();
    res.json({ scores: scoreDoc.scores });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;