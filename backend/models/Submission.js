// models/Submission.js
const mongoose = require('mongoose');
const submissionSchema = new mongoose.Schema({
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'reviewed', 'rejected'],
    default: 'pending'
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  executionResults: {
    passed: Boolean,
    testResults: [{
      testName: String,
      passed: Boolean,
      expected: String,
      actual: String,
      error: String
    }],
    runtime: Number, // in milliseconds
    memoryUsage: Number // in KB
  },
  plagiarismCheck: {
    score: Number, // 0-100, higher means more likely to be plagiarized
    checkedAt: Date,
    similarSubmissions: [{
      submissionId: mongoose.Schema.Types.ObjectId,
      similarity: Number
    }]
  }
}, {
  timestamps: true
});

// Indexes
submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ challenge: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ score: -1 });

module.exports = mongoose.model('Submission', submissionSchema);
