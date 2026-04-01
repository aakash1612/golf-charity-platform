const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// POST /api/subscriptions/create-checkout  — create Stripe checkout session
router.post('/create-checkout', protect, async (req, res) => {
  try {
    const { plan } = req.body; // 'monthly' or 'yearly'

    const priceId =
      plan === 'yearly'
        ? process.env.STRIPE_YEARLY_PRICE_ID
        : process.env.STRIPE_MONTHLY_PRICE_ID;

    if (!priceId) return res.status(400).json({ message: 'Invalid plan' });

    // Create or retrieve Stripe customer
    let customerId = req.user.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: { userId: req.user._id.toString() },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(req.user._id, {
        'subscription.stripeCustomerId': customerId,
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard?sub=success`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?sub=cancelled`,
      metadata: { userId: req.user._id.toString(), plan },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/subscriptions/cancel  — cancel at period end
router.post('/cancel', protect, async (req, res) => {
  try {
    const subId = req.user.subscription?.stripeSubscriptionId;
    if (!subId) return res.status(400).json({ message: 'No active subscription found' });

    await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
    await User.findByIdAndUpdate(req.user._id, {
      'subscription.cancelAtPeriodEnd': true,
    });

    res.json({ message: 'Subscription will cancel at end of current period' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/subscriptions/reactivate  — undo cancellation
router.post('/reactivate', protect, async (req, res) => {
  try {
    const subId = req.user.subscription?.stripeSubscriptionId;
    if (!subId) return res.status(400).json({ message: 'No subscription found' });

    await stripe.subscriptions.update(subId, { cancel_at_period_end: false });
    await User.findByIdAndUpdate(req.user._id, {
      'subscription.cancelAtPeriodEnd': false,
    });

    res.json({ message: 'Subscription reactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/subscriptions/portal  — Stripe customer portal
router.get('/portal', protect, async (req, res) => {
  try {
    const customerId = req.user.subscription?.stripeCustomerId;
    if (!customerId) return res.status(400).json({ message: 'No customer found' });

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;