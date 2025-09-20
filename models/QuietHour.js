import mongoose from 'mongoose';

const QuietHourSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
QuietHourSchema.index({ userId: 1, startTime: 1, endTime: 1 });
QuietHourSchema.index({ startTime: 1, emailSent: 1 });

// Pre-save middleware to update updatedAt
QuietHourSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.QuietHour || mongoose.model('QuietHour', QuietHourSchema);

