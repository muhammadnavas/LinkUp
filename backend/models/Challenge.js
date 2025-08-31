// models/Challenge.js
const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  output: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    default: ''
  }
});

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    maxLength: 5000
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  points: {
    type: Number,
    required: true,
    min: 10,
    max: 1000
  },
  tags: [{
    type: String,
    trim: true
  }],
  examples: [exampleSchema],
  deadline: {
    type: Date,
    required: true
  },
  requirements: {
    type: String,
    maxLength: 2000
  },
  submissionFormat: {
    type: String,
    enum: ['code', 'text', 'file', 'github'],
    default: 'github'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxSubmissions: {
    type: Number,
    default: 1
  },
  submissionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
challengeSchema.index({ companyId: 1 });
challengeSchema.index({ difficulty: 1 });
challengeSchema.index({ deadline: 1 });
challengeSchema.index({ isActive: 1 });
challengeSchema.index({ tags: 1 });

module.exports = mongoose.model('Challenge', challengeSchema);
