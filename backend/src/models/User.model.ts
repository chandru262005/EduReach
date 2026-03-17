import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  role: 'donor' | 'volunteer' | 'admin' | 'school';
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  name: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
    trim: true
  },
  role: { 
    type: String, 
    enum: ['donor', 'volunteer', 'admin', 'school'], 
    default: 'donor',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);