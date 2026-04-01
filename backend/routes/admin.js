const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Draw = require('../models/Draw');
const Charity = require('../models/Charity');
const Score = require('../models/Score');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// GET /api/admin/stats  — dashboard overview
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, activeSubscribers, totalDraws, charities] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ 'subscription.status': 'active' }),
      Draw.countDocuments({ status: 'published' }),
      Charity.find({ isActive: true }).select('name totalReceived'),
    ]);

    const totalCharityContributions = charities.reduce((s, c) => s + c.totalReceived, 0);

    const latestDraw = await Draw.findOne({ status: 'published' }).sort({ year: -1, month: -1 });
    const totalPrizePool = latestDraw?.prizePool?.total || 0;

    const revenueThisMonth = await User.aggregate([
      { $match: { 'subscription.status': 'active' } },
      {
        $group: {
          _id: null,
          monthly: {
            $sum: {
              $cond: [
                { $eq: ['$subscription.plan', 'monthly'] },
                parseFloat(process.env.MONTHLY_PRICE || '9.99'),
                parseFloat(process.env.YEARLY_PRICE || '99.99') / 12,
              ],
            },
          },
        },
      },
    ]);

    res.json({
      totalUsers,
      activeSubscribers,
      totalDraws,
      totalCharityContributions: parseFloat(totalCharityContributions.toFixed(2)),
      totalPrizePool,
      estimatedMonthlyRevenue: revenueThisMonth[0]?.monthly?.toFixed(2) || 0,
      charities,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users  — paginated user list
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const query = { role: 'user' };
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (status) query['subscription.status'] = status;

    const [users, total] = await Promise.all([
      User.find(query)
        .populate('selectedCharity', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users/:id  — single user detail
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('selectedCharity');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const scores = await Score.findOne({ user: user._id });
    res.json({ user, scores: scores?.scores || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id  — edit user
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role, subscriptionStatus } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (subscriptionStatus) updates['subscription.status'] = subscriptionStatus;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id/scores  — admin edit user's scores
router.put('/users/:id/scores', async (req, res) => {
  try {
    const { scores } = req.body; // array of { value, date }
    if (!Array.isArray(scores) || scores.length > 5)
      return res.status(400).json({ message: 'Must provide 1-5 scores' });

    for (const s of scores) {
      if (s.value < 1 || s.value > 45)
        return res.status(400).json({ message: `Invalid score value: ${s.value}` });
    }

    const scoreDoc = await Score.findOneAndUpdate(
      { user: req.params.id },
      { user: req.params.id, scores: scores.map((s) => ({ value: s.value, date: new Date(s.date) })) },
      { upsert: true, new: true }
    );
    res.json({ scores: scoreDoc.scores });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/users/:id  — delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Score.findOneAndDelete({ user: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;