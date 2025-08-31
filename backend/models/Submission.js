// models/Submission.js (Updated)
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  solution: {
    type: String,
    required: true,
    maxLength: 10000
  },
  repoLink: {
    type: String,
    trim: true,
    match: [/^https:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+$/, "Invalid GitHub repository URL"]
  },
  codeSubmission: {
    type: String,
    maxLength: 20000
  },
  fileAttachments: [{
    name: String,
    url: String,
    size: Number
  }],
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'approved', 'rejected'],
    default: 'pending'
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  feedback: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes
submissionSchema.index({ user: 1, challenge: 1 }, { unique: true });
submissionSchema.index({ challenge: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);
