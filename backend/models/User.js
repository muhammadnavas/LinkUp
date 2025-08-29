const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['student', 'company'],
    lowercase: true
  },
  
  // Student-specific fields
  university: {
    type: String,
    required: function() {
      return this.role === 'student';
    },
    trim: true
  },
  major: {
    type: String,
    required: function() {
      return this.role === 'student';
    },
    trim: true
  },
  graduationYear: {
    type: Number,
    required: function() {
      return this.role === 'student';
    },
    min: [2024, 'Graduation year must be 2024 or later'],
    max: [2030, 'Graduation year cannot exceed 2030']
  },
  skills: [{
    type: String,
    trim: true
  }],
  
  // Company-specific fields
  companyName: {
    type: String,
    required: function() {
      return this.role === 'company';
    },
    trim: true
  },
  industry: {
    type: String,
    required: function() {
      return this.role === 'company';
    },
    trim: true
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+']
  },
  
  // Common fields
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxLength: [500, 'Bio cannot exceed 500 characters']
  },
  
  // Timestamps
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full profile based on role
userSchema.virtual('profile').get(function() {
  const baseProfile = {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isVerified: this.isVerified,
    profilePicture: this.profilePicture,
    bio: this.bio,
    createdAt: this.createdAt
  };

  if (this.role === 'student') {
    return {
      ...baseProfile,
      university: this.university,
      major: this.major,
      graduationYear: this.graduationYear,
      skills: this.skills
    };
  } else {
    return {
      ...baseProfile,
      companyName: this.companyName,
      industry: this.industry,
      website: this.website,
      companySize: this.companySize
    };
  }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Instance method to get public profile
userSchema.methods.getPublicProfile = function() {
  return this.profile;
};

// Instance method to update last login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to get users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

const User = mongoose.model('User', userSchema);

module.exports = User;