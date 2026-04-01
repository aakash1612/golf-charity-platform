const mongoose = require('mongoose');

const charitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    logo: { type: String },
    images: [{ type: String }],
    website: { type: String },
    category: {
      type: String,
      enum: ['health', 'education', 'environment', 'sport', 'community', 'other'],
      default: 'other',
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    totalReceived: { type: Number, default: 0 },
    events: [
      {
        title: String,
        date: Date,
        description: String,
        location: String,
      },
    ],
  },
  { timestamps: true }
);

charitySchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Charity', charitySchema);