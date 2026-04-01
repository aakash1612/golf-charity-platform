const mongoose = require('mongoose');

const winnerEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  matchType: { type: String, enum: ['5-match', '4-match', '3-match'] },
  matchedNumbers: [Number],
  prizeAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'verified', 'paid', 'rejected'], default: 'pending' },
  proofUrl: { type: String },
  proofSubmittedAt: { type: Date },
  verifiedAt: { type: Date },
  paidAt: { type: Date },
});

const drawSchema = new mongoose.Schema(
  {
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },
    drawType: { type: String, enum: ['random', 'algorithmic'], default: 'random' },
    status: {
      type: String,
      enum: ['scheduled', 'simulated', 'published'],
      default: 'scheduled',
    },

    // The 5 drawn numbers (1-45 Stableford range)
    drawnNumbers: { type: [Number], default: [] },

    // Prize pool breakdown
    prizePool: {
      total: { type: Number, default: 0 },
      fiveMatch: { type: Number, default: 0 }, // 40% — jackpot, rolls over
      fourMatch: { type: Number, default: 0 }, // 35%
      threeMatch: { type: Number, default: 0 }, // 25%
    },

    // Rolled-over jackpot from previous month
    jackpotCarryOver: { type: Number, default: 0 },

    // Subscriber count snapshot at draw time
    subscriberCount: { type: Number, default: 0 },

    // Per-subscription pool contribution amount
    poolContributionPerSub: { type: Number, default: 0 },

    winners: [winnerEntrySchema],

    publishedAt: { type: Date },
    simulatedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

drawSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Draw', drawSchema);