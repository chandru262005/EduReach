import mongoose, { Schema, Document } from 'mongoose';

export interface IVolunteerProfile extends Document {
  user_id: mongoose.Types.ObjectId;
  expertise: string[]; // e.g., ['Mathematics', 'Science', 'English']
  skills: string[]; // e.g., ['Teaching', 'Mentoring', 'Art']
  availability: {
    day: string; // e.g., 'Saturday'
    timeSlot: string; // e.g., '10am-12pm'
  }[];
  hoursContributed: number;
  pastActivities: mongoose.Types.ObjectId[]; // References to specific events/tasks
  isVerified: boolean;
  idProofUrl?: string;
  idProofStatus: 'none' | 'pending' | 'approved' | 'rejected';
}

const VolunteerProfileSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  expertise: [{ type: String }],
  skills: [{ type: String }],
  availability: [{
    day: { type: String, required: true },
    timeSlot: { type: String, required: true }
  }],
  hoursContributed: { type: Number, default: 0 },
  pastActivities: [{ type: Schema.Types.ObjectId, ref: 'Activity' }], // Optional: if you build an Activity module
  isVerified: { type: Boolean, default: false },
  idProofUrl: { type: String },
  idProofStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' }
});

export const Volunteer = mongoose.model<IVolunteerProfile>('Volunteer', VolunteerProfileSchema);