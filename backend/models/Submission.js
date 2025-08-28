const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  solutionLink: { type: String }, // URL or file reference
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Submission", submissionSchema);
