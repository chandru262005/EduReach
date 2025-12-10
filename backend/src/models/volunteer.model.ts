import mongoose, { Schema, Document } from 'mongoose';

export interface IVolunteerProfile extends Document {
  user: mongoose.Types.ObjectId;
  skills: string[]; // e.g., ['Teaching', 'Mentoring', 'Art']
  availability: {
    days: string[]; // e.g., ['Saturday', 'Sunday']
    timeSlots: string[]; // e.g., ['10am-12pm']
  };
  hoursContributed: number;
  pastActivities: mongoose.Types.ObjectId[]; // References to specific events/tasks
}

const VolunteerProfileSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  skills: [{ type: String }],
  availability: {
    days: [{ type: String }],
    timeSlots: [{ type: String }]
  },
  hoursContributed: { type: Number, default: 0 },
  pastActivities: [{ type: Schema.Types.ObjectId, ref: 'Activity' }] // Optional: if you build an Activity module
});

export const VolunteerProfile = mongoose.model<IVolunteerProfile>('VolunteerProfile', VolunteerProfileSchema);