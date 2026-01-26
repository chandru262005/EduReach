import mongoose, { Schema, Document } from 'mongoose';

export interface IDonation extends Document {
  donor_id: mongoose.Types.ObjectId; // Reference to User
  amount: number;
  currency: string;
  paymentMethod: 'UPI';
  upiId: string; // UPI ID used for payment (organization's UPI)
  upiTransactionId?: string; // UTR/Transaction ID entered by donor after payment
  status: 'pending' | 'completed' | 'failed';
  receiptUrl?: string; // For tax benefits/records
  donorNotes?: string; // Optional notes from donor
}

const DonationSchema: Schema = new Schema({
  donor_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, default: 'INR' },
  paymentMethod: { type: String, enum: ['UPI'], default: 'UPI' },
  upiId: { type: String, required: true }, // Organization's UPI ID
  upiTransactionId: { type: String }, // UTR number from donor (optional initially)
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  receiptUrl: { type: String },
  donorNotes: { type: String }
}, { timestamps: true });

export const Donation = mongoose.model<IDonation>('Donation', DonationSchema);