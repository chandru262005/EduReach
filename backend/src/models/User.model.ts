import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  passwordHash: string; // Store hashed passwords, not plain text
  role: 'donor' | 'volunteer' | 'admin' | 'school'; 
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  phone: { 
    type: String, 
    required: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
    trim: true
  },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['donor', 'volunteer', 'admin', 'school'], 
    default: 'donor' 
  },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);