const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

// POST /webhook  — Stripe sends events here
router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;

  const updateSub = async (customerId, updates) => {
    await User.findOneAndUpdate({ 'subscription.stripeCustomerId': customerId }, { $set: updates });
  };

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = data;
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      await User.findOneAndUpdate(
        { 'subscription.stripeCustomerId': session.customer },
        {
          $set: {
            'subscription.status': 'active',
            'subscription.plan': session.metadata.plan,
            'subscription.stripeSubscriptionId': session.subscription,
            'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
            'subscription.cancelAtPeriodEnd': false,
          },
        }
      );
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = data;
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        await updateSub(invoice.customer, {
          'subscription.status': 'active',
          'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        });
      }
      break;
    }

    case 'invoice.payment_failed': {
      await updateSub(data.customer, { 'subscription.status': 'lapsed' });
      break;
    }

    case 'customer.subscription.deleted': {
      await updateSub(data.customer, {
        'subscription.status': 'cancelled',
        'subscription.stripeSubscriptionId': null,
        'subscription.currentPeriodEnd': null,
      });
      break;
    }

    case 'customer.subscription.updated': {
      await updateSub(data.customer, {
        'subscription.cancelAtPeriodEnd': data.cancel_at_period_end,
        'subscription.currentPeriodEnd': new Date(data.current_period_end * 1000),
        'subscription.status': data.status === 'active' ? 'active' : 'lapsed',
      });
      break;
    }
  }

  res.json({ received: true });
});

module.exports = router;