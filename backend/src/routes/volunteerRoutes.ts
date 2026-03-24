import { Router } from 'express';
import { verifyToken, verifyVolunteer } from '../middleware/authMiddleware';
import {
  getProfile,
  updateProfile,
  uploadIdProof,
  getEvents,
  getMyEvents,
  applyForEvent,
  withdrawFromEvent,
} from '../controllers/volunteerController';
import { uploadIdProofMiddleware } from '../middleware/uploadMiddleware';

const router = Router();

// Base path: /api/volunteers
// Apply verifyToken and verifyVolunteer middleware to all routes below
router.use(verifyToken, verifyVolunteer);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/upload-id', uploadIdProofMiddleware.single('idProof'), uploadIdProof);

// Events
router.get('/events', getEvents);
router.get('/my-events', getMyEvents);
router.post('/events/:id/apply', applyForEvent);
router.delete('/events/:id/withdraw', withdrawFromEvent);

export default router;
