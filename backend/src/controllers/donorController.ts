import { Response } from 'express';
import { asyncHandler } from '../utils/errorHandler';
import { IRequest } from '../types';
import { Donation } from '../models/donation.model';
import { BookDonation } from '../models/book_donation.model';
import { logger } from '../utils/logger';
import crypto from 'crypto';
import config from '../config/env';

/**
 * POST /api/donor/create-order
 * Initialize donation record and return UPI details for QR code payment
 */
export const createPaymentOrder = asyncHandler(async (req: IRequest, res: Response) => {
  const { amount, currency = 'INR', donorNotes } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid amount. Amount must be greater than 0',
    });
  }

  if (!config.UPI_ID) {
    return res.status(500).json({
      success: false,
      message: 'UPI configuration not set up. Please contact administrator.',
    });
  }

  try {
    // Create a pending donation record
    const donation = await Donation.create({
      donor_id: userId,
      amount,
      currency,
      paymentMethod: 'UPI',
      upiId: config.UPI_ID,
      status: 'pending',
      donorNotes: donorNotes || undefined,
    });

    logger.info(`Donation order created for user ${userId}, amount: ${amount}, ID: ${donation._id}`);

    // UPI payment string format: upi://pay?pa=<UPI_ID>&pn=<UPI_NAME>&am=<amount>&cu=<currency>&tn=<note>
    const upiPaymentString = `upi://pay?pa=${config.UPI_ID}&pn=${config.UPI_NAME || 'EduReach'}&am=${amount}&cu=${currency}&tn=Donation-${donation._id}`;

    res.status(201).json({
      success: true,
      message: 'Donation order created. Please scan QR code and complete payment.',
      data: {
        donationId: donation._id,
        amount: donation.amount,
        currency: donation.currency,
        upiId: config.UPI_ID,
        upiName: config.UPI_NAME || 'EduReach',
        upiPaymentString, // Frontend should generate QR from this string
      },
    });
  } catch (error: any) {
    logger.error(`Error creating payment order: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message,
    });
  }
});

/**
 * POST /api/donor/verify
 * Submit UPI transaction ID (UTR) after completing payment via QR code
 */
export const verifyPayment = asyncHandler(async (req: IRequest, res: Response) => {
  const { donationId, upiTransactionId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  if (!donationId || !upiTransactionId) {
    return res.status(400).json({
      success: false,
      message: 'Donation ID and UPI Transaction ID (UTR) are required',
    });
  }

  // Basic validation for UTR format (12 digits typically)
  if (!/^\d{12,16}$/.test(upiTransactionId.toString())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid UPI Transaction ID format. UTR should be 12-16 digits.',
    });
  }

  try {
    // Find the donation record by donation ID
    const donation = await Donation.findById(donationId);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found',
      });
    }

    // Verify the donation belongs to the authenticated user
    if (donation.donor_id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this donation',
      });
    }

    // Check if already submitted UTR
    if (donation.upiTransactionId) {
      return res.status(400).json({
        success: false,
        message: 'UTR already submitted for this donation',
      });
    }

    // Check if donation is in failed state
    if (donation.status === 'failed') {
      return res.status(400).json({
        success: false,
        message: 'This donation has been marked as failed. Please create a new donation.',
      });
    }

    // Store the UPI transaction ID - status remains pending until admin verifies
    donation.upiTransactionId = upiTransactionId;
    
    await donation.save();

    logger.info(`UTR submitted for donation ${donationId}, UPI Transaction ID: ${upiTransactionId}`);

    res.status(200).json({
      success: true,
      message: 'UPI Transaction ID submitted successfully. Your donation is pending admin verification.',
      data: {
        donationId: donation._id,
        status: donation.status,
        upiTransactionId: upiTransactionId,
      },
    });
  } catch (error: any) {
    logger.error(`Error submitting UPI Transaction ID: ${error.message}`);

    return res.status(500).json({
      success: false,
      message: 'Failed to submit UPI Transaction ID',
      error: error.message,
    });
  }
});

/**
 * GET /api/donor/history
 * View past donation history (for receipts and records)
 */
export const getDonationHistory = asyncHandler(async (req: IRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  try {
    // Get all donations by the user
    const donations = await Donation.find({ donor_id: userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    // Calculate total donated amount
    const totalDonated = donations
      .filter(d => d.status === 'completed')
      .reduce((sum, d) => sum + d.amount, 0);

    logger.info(`Fetched donation history for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Donation history retrieved successfully',
      data: {
        donations,
        summary: {
          totalDonations: donations.length,
          completedDonations: donations.filter(d => d.status === 'completed').length,
          totalAmount: totalDonated,
        },
      },
    });
  } catch (error: any) {
    logger.error(`Error fetching donation history: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve donation history',
      error: error.message,
    });
  }
});

/**
 * POST /api/donor/books
 * Submit book donation details (Quantity, Address, logistics)
 */
export const submitBookDonation = asyncHandler(async (req: IRequest, res: Response) => {
  const userId = req.user?.id;
  const { bookDetails, logistics } = req.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  // Validate required fields
  if (!bookDetails || !Array.isArray(bookDetails) || bookDetails.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Book details are required and must be a non-empty array',
    });
  }

  if (!logistics || !logistics.method || !logistics.address) {
    return res.status(400).json({
      success: false,
      message: 'Logistics information (method and address) is required',
    });
  }

  // Validate book details
  for (const book of bookDetails) {
    if (!book.title || !book.quantity || book.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Each book must have a title and valid quantity',
      });
    }
  }

  try {
    const bookDonation = await BookDonation.create({
      donor_id: userId,
      bookDetails,
      logistics: {
        method: logistics.method,
        address: logistics.address,
        scheduledDate: logistics.scheduledDate || undefined,
      },
      status: 'submitted',
    });

    logger.info(`Book donation submitted by user ${userId}, donation ID: ${bookDonation._id}`);

    res.status(201).json({
      success: true,
      message: 'Book donation submitted successfully',
      data: {
        donationId: bookDonation._id,
        bookDetails: bookDonation.bookDetails,
        logistics: bookDonation.logistics,
        status: bookDonation.status,
      },
    });
  } catch (error: any) {
    logger.error(`Error submitting book donation: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit book donation',
      error: error.message,
    });
  }
});

/**
 * GET /api/donor/books
 * Track status of book pickup/drop-off
 */
export const getBookDonationStatus = asyncHandler(async (req: IRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  try {
    // Get all book donations by the user
    const bookDonations = await BookDonation.find({ donor_id: userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    // Calculate statistics
    const stats = {
      total: bookDonations.length,
      submitted: bookDonations.filter(d => d.status === 'submitted').length,
      approved: bookDonations.filter(d => d.status === 'approved').length,
      collected: bookDonations.filter(d => d.status === 'collected').length,
    };

    // Calculate total books donated
    const totalBooks = bookDonations.reduce((sum, donation) => {
      return sum + donation.bookDetails.reduce((bookSum, book) => bookSum + book.quantity, 0);
    }, 0);

    logger.info(`Fetched book donation status for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Book donation status retrieved successfully',
      data: {
        bookDonations,
        statistics: {
          ...stats,
          totalBooksContributed: totalBooks,
        },
      },
    });
  } catch (error: any) {
    logger.error(`Error fetching book donation status: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve book donation status',
      error: error.message,
    });
  }
});
