const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scores', require('./routes/scores'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/draws', require('./routes/draws'));
app.use('/api/charities', require('./routes/charities'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/winners', require('./routes/winners'));

// Stripe webhook (raw body needed)
app.use('/webhook', express.raw({ type: 'application/json' }), require('./routes/webhook'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Connect DB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
    // Start cron jobs
    require('./services/cronJobs');
  })
  .catch((err) => console.error('DB connection error:', err));