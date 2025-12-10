import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  eventType: 'teaching' | 'mentoring' | 'workshop'; 
  date: Date;
  durationHours: number; // To calculate impact later
  location: {
    address: string;
    city: string;
    // Optional: Link to a specific School ID if you have a School Schema
    schoolId?: mongoose.Types.ObjectId; 
  };
  requirements: {
    skills: string[]; // e.g., ["Mathematics", "Tamil Fluency"]
    maxVolunteers: number;
  };
  volunteersRegistered: mongoose.Types.ObjectId[]; // Array of User IDs
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: mongoose.Types.ObjectId; // Admin or School rep who posted it
}

const EventSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  eventType: { 
    type: String, 
    enum: ['teaching', 'mentoring', 'workshop', 'infrastructure_help'],
    required: true 
  },
  date: { type: Date, required: true },
  durationHours: { type: Number, required: true },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School' } // Optional
  },
  requirements: {
    skills: [{ type: String }], 
    maxVolunteers: { type: Number, default: 5 }
  },
  volunteersRegistered: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], 
    default: 'upcoming' 
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Event = mongoose.model<IEvent>('Event', EventSchema);