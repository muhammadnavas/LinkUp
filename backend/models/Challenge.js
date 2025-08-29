// models/Challenge.js
const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  timeLimit: {
    type: Number, // in minutes
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  resources: [{
    type: String
  }],
  examples: [{
    input: String,
    output: String
  }],
  submissionFormat: {
    type: String,
    default: "Submit your complete solution with documentation."
  },
  evaluation: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
challengeSchema.index({ difficulty: 1 });
challengeSchema.index({ tags: 1 });
challengeSchema.index({ company: 1 });
challengeSchema.index({ deadline: 1 });
challengeSchema.index({ isActive: 1 });

module.exports = mongoose.model('Challenge', challengeSchema);
