import mongoose, { Schema, Document } from 'mongoose';

export interface IBookDonation extends Document {
  donor: mongoose.Types.ObjectId;
  bookDetails: {
    title: string;
    quantity: number;
    condition: 'new' | 'gently_used' | 'old';
    category: string; // e.g., 'Science', 'Storybook'
    imageUrl?: string; // Image URL of the book
  }[];
  logistics: {
    method: 'pickup' | 'dropoff';
    address: string;
    scheduledDate?: Date;
  };
  status: 'submitted' | 'approved' | 'collected' | 'distributed';
}

const BookDonationSchema: Schema = new Schema({
  donor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bookDetails: [{
    title: String,
    quantity: Number,
    condition: { type: String, enum: ['new', 'gently_used', 'old'] },
    category: String,
    imageUrl: String
  }],
  logistics: {
    method: { type: String, enum: ['pickup', 'dropoff'], required: true },
    address: { type: String, required: true }, // Store pickup address or drop-off center location
    scheduledDate: Date
  },
  status: { 
    type: String, 
    enum: ['submitted', 'approved', 'collected', 'distributed'], 
    default: 'submitted' 
  }
}, { timestamps: true });

export const BookDonation = mongoose.model<IBookDonation>('BookDonation', BookDonationSchema);