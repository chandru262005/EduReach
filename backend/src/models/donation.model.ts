import mongoose, { Schema, Document } from 'mongoose';

export interface IDonation extends Document {
  donor: mongoose.Types.ObjectId; // Reference to User
  amount: number;
  currency: string;
  paymentMethod: 'UPI' | 'card' | 'net_banking';
  transactionId: string; // From Razorpay/Stripe
  status: 'pending' | 'completed' | 'failed';
  receiptUrl?: string; // For tax benefits/records
}

const DonationSchema: Schema = new Schema({
  donor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentMethod: { type: String, enum: ['UPI', 'card', 'net_banking'] },
  transactionId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  receiptUrl: { type: String }
}, { timestamps: true });

export const Donation = mongoose.model<IDonation>('Donation', DonationSchema);