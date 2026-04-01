const express = require('express');
const router = express.Router();
const Draw = require('../models/Draw');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/winners/:drawId/submit-proof  — winner uploads proof
router.post('/:drawId/submit-proof', protect, async (req, res) => {
  try {
    const { proofUrl } = req.body;
    const draw = await Draw.findById(req.params.drawId);
    if (!draw) return res.status(404).json({ message: 'Draw not found' });

    const winner = draw.winners.find(
      (w) => w.user.toString() === req.user._id.toString()
    );
    if (!winner) return res.status(403).json({ message: 'You are not a winner in this draw' });

    winner.proofUrl = proofUrl;
    winner.proofSubmittedAt = new Date();
    winner.paymentStatus = 'pending';
    await draw.save();

    res.json({ message: 'Proof submitted successfully', winner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/winners/:drawId/:winnerId/verify  — admin verify/reject
router.put('/:drawId/:winnerId/verify', protect, adminOnly, async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const draw = await Draw.findById(req.params.drawId);
    if (!draw) return res.status(404).json({ message: 'Draw not found' });

    const winner = draw.winners.id(req.params.winnerId);
    if (!winner) return res.status(404).json({ message: 'Winner record not found' });

    if (action === 'approve') {
      winner.paymentStatus = 'verified';
      winner.verifiedAt = new Date();
    } else if (action === 'reject') {
      winner.paymentStatus = 'rejected';
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await draw.save();
    res.json({ message: `Winner ${action}d`, winner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/winners/:drawId/:winnerId/mark-paid  — admin marks as paid
router.put('/:drawId/:winnerId/mark-paid', protect, adminOnly, async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.drawId);
    const winner = draw?.winners.id(req.params.winnerId);
    if (!winner) return res.status(404).json({ message: 'Winner not found' });

    winner.paymentStatus = 'paid';
    winner.paidAt = new Date();
    await draw.save();

    res.json({ message: 'Marked as paid', winner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/winners/pending  — admin: all pending verifications
router.get('/pending', protect, adminOnly, async (req, res) => {
  try {
    const draws = await Draw.find({ 'winners.paymentStatus': 'pending' })
      .populate('winners.user', 'name email')
      .sort({ publishedAt: -1 });

    const pending = [];
    draws.forEach((draw) => {
      draw.winners
        .filter((w) => w.paymentStatus === 'pending' && w.proofUrl)
        .forEach((w) => {
          pending.push({ draw: { _id: draw._id, month: draw.month, year: draw.year }, winner: w });
        });
    });

    res.json({ pending });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;