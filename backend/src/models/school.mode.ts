import mongoose, { Schema, Document } from 'mongoose';

export interface ISchool extends Document {
  email: string; // Login email
  passwordHash: string;
  schoolDetails: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    udiseCode: string; // Official Govt School ID
    schoolType: 'government' | 'aided' | 'private_non_profit';
  };
  contactPerson: {
    name: string;
    role: string; // e.g., "Principal", "Headmaster"
    phone: string;
  };
  verification: {
    documentUrl: string; // URL to uploaded Registration Certificate/Govt Letter
    isVerified: boolean;
    verifiedAt?: Date;
  };
  // Needs specific to the school (from your report's "Infrastructure" section)
  requirements: {
    infrastructure: string[]; // e.g., ["Desks", "Water Purifier"]
    booksNeeded: boolean;
    volunteerRoles: string[]; // e.g., ["Math Teacher", "Art Mentor"]
  };
}

const SchoolSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  
  schoolDetails: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    udiseCode: { type: String, required: true, unique: true }, 
    schoolType: { 
      type: String, 
      enum: ['government', 'aided', 'private_non_profit'], 
      required: true 
    }
  },

  contactPerson: {
    name: { type: String, required: true },
    role: { type: String, required: true },
    phone: { type: String, required: true }
  },

  verification: {
    documentUrl: { type: String, required: true }, 
    isVerified: { type: Boolean, default: false }, // Default is unverified
    verifiedAt: Date
  },

  requirements: {
    infrastructure: [{ type: String }],
    booksNeeded: { type: Boolean, default: false },
    volunteerRoles: [{ type: String }]
  }
}, { timestamps: true });

export const School = mongoose.model<ISchool>('School', SchoolSchema);