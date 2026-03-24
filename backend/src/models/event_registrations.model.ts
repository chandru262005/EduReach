import mongoose, { Schema, Document } from 'mongoose';

export interface IEventRegistration extends Document {
  volunteer_id: mongoose.Types.ObjectId;
  event_id: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  appliedAt: Date;
}

const EventRegistrationSchema: Schema = new Schema({
  volunteer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  event_id: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'withdrawn'], 
    default: 'pending' 
  },
  appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent duplicate active registrations for the same event
EventRegistrationSchema.index({ volunteer_id: 1, event_id: 1 }, { unique: true });

export const EventRegistration = mongoose.model<IEventRegistration>('EventRegistration', EventRegistrationSchema);
