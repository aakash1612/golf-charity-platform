const mongoose = require('mongoose');

const scoreEntrySchema = new mongoose.Schema({
  value: { type: Number, required: true, min: 1, max: 45 },
  date: { type: Date, required: true },
  addedAt: { type: Date, default: Date.now },
});

const scoreSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    // Only last 5 scores kept — newest first
    scores: {
      type: [scoreEntrySchema],
      validate: {
        validator: (v) => v.length <= 5,
        message: 'Maximum 5 scores allowed',
      },
    },
  },
  { timestamps: true }
);

// Static method: add a new score (rolling — replaces oldest if 5 already stored)
scoreSchema.statics.addScore = async function (userId, value, date) {
  let scoreDoc = await this.findOne({ user: userId });

  if (!scoreDoc) {
    scoreDoc = new this({ user: userId, scores: [] });
  }

  // Sort newest first, add new score at start
  scoreDoc.scores.unshift({ value, date });

  // Keep only latest 5
  if (scoreDoc.scores.length > 5) {
    scoreDoc.scores = scoreDoc.scores.slice(0, 5);
  }

  await scoreDoc.save();
  return scoreDoc;
};

module.exports = mongoose.model('Score', scoreSchema);