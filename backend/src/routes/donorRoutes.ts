import { Router } from 'express';
import { verifyToken, verifyDonor } from '../middleware/authMiddleware';
import {
  createPaymentOrder,
  verifyPayment,
  getDonationHistory,
  submitBookDonation,
  getBookDonationStatus,
} from '../controllers/donorController';

const router = Router();

router.post('/create-order', verifyToken, verifyDonor, createPaymentOrder);

/**
 * POST /api/donor/verify
 * Webhook to confirm payment success
 * Requires authentication
 */
router.post('/verify', verifyToken, verifyDonor, verifyPayment);

/**
 * GET /api/donor/history
 * View past donation history (for receipts)
 * Requires authentication
 */
router.get('/history', verifyToken, verifyDonor, getDonationHistory);

/**
 * POST /api/donor/books
 * Submit book donation details (Qty, Address)
 * Requires authentication
 */
router.post('/books', verifyToken, verifyDonor, submitBookDonation);

router.get('/books', verifyToken, verifyDonor, getBookDonationStatus);

export default router;
