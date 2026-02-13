const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // which vendor team they belong to
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: String,
  status: {
    type: String,
    enum: ['pending','approved','rejected','cancelled'],
    default: 'pending'
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date
},{ timestamps:true });

module.exports = mongoose.model('LeaveRequest', LeaveSchema);
