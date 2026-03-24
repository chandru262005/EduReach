import { Response } from 'express';
import { IRequest } from '../types';
import { asyncHandler } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { Volunteer } from '../models/volunteer.model';
import { Event } from '../models/events.model';
import { User } from '../models/User.model';
import { Auth } from '../models/Auth.model';
import { EventRegistration } from '../models/event_registrations.model';

// Helper to find the actual User ID since JWT might contain Auth _id or User _id
const resolveUserId = async (tokenId: string | undefined) => {
  if (!tokenId) return null;
  // If token has auth ID:
  const authRecord = await Auth.findById(tokenId);
  if (authRecord) return authRecord.user_id;
  return tokenId; // It's already the User ID
};

// GET /profile - View own stats (Hours contributed, Badges)
export const getProfile = asyncHandler(async (req: IRequest, res: Response) => {
  const tokenId = req.user?.id;
  const userId = await resolveUserId(tokenId);

  let profile = await Volunteer.findOne({ user_id: userId }).populate('user_id', 'name email phone');

  if (!profile) {
    // Auto-initialize profile if it doesn't exist
    const newProfile = await Volunteer.create({
      user_id: userId,
      expertise: [],
      skills: [],
      availability: [],
      hoursContributed: 0,
      pastActivities: [],
    });
    
    profile = await Volunteer.findById(newProfile._id).populate('user_id', 'name email phone');
  }

  // Convert to object and ensure user_id contains properly populated details fetched from User or Auth
  const profileObj: any = profile ? profile.toObject() : {};
  const userFallback = await User.findById(userId);
  const authFallback: any = await Auth.findOne({ user_id: userId });

  const finalEmail = userFallback?.email || authFallback?.email || req.user?.email || '';
  const finalName = userFallback?.name || '';
  const finalPhone = userFallback?.phone || '';

  // Overwrite user_id to guarantee it is an object
  profileObj.user_id = {
    _id: userId,
    email: finalEmail,
    name: finalName,
    phone: finalPhone,
  };

  res.status(200).json({
    success: true,
    data: profileObj,
  });
});

// PUT /profile - Update skills or availability, plus basic user details
export const updateProfile = asyncHandler(async (req: IRequest, res: Response) => {
  const tokenId = req.user?.id;
  const userId = await resolveUserId(tokenId);

  const { expertise, skills, availability, name, phone } = req.body;

  if (name || phone) {
    const userUpdate: any = {};
    if (name) userUpdate.name = name;
    if (phone) userUpdate.phone = phone;
    await User.findByIdAndUpdate(userId, userUpdate, { new: true, runValidators: true });
  }

  const profile = await Volunteer.findOneAndUpdate(
    { user_id: userId },
    { expertise, skills, availability },
    { new: true, upsert: true, runValidators: true }
  ).populate('user_id', 'name email phone');

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Failed to update or create profile',
    });
  }

  const profileObj: any = profile.toObject();
  const userFallback = await User.findById(userId);
  const authFallback: any = await Auth.findOne({ user_id: userId });

  const finalEmail = userFallback?.email || authFallback?.email || req.user?.email || '';
  
  profileObj.user_id = {
    _id: userId,
    email: finalEmail,
    name: userFallback?.name || name || '',
    phone: userFallback?.phone || phone || '',
  };

  logger.info(`Volunteer profile updated for user: ${userId}`);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: profileObj,
  });
});

// POST /upload-id - Upload ID proof for Admin verification
export const uploadIdProof = asyncHandler(async (req: IRequest, res: Response) => {
  const tokenId = req.user?.id;
  const userId = await resolveUserId(tokenId);
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  // File path available at req.file.path or we can construct a relative URL
  const fileUrl = `/uploads/id-proofs/${req.file.filename}`;

  const profile = await Volunteer.findOneAndUpdate(
    { user_id: userId },
    { 
      idProofUrl: fileUrl,
      idProofStatus: 'pending'
    },
    { new: true, upsert: true }
  );

  logger.info(`ID proof uploaded for volunteer verification: ${userId}`);

  res.status(200).json({
    success: true,
    message: 'ID proof uploaded successfully. Pending Admin verification.',
    data: {
      idProofUrl: profile.idProofUrl,
      idProofStatus: profile.idProofStatus
    }
  });
});

// GET /events - List all upcoming/approved events (Search/Filter)
export const getEvents = asyncHandler(async (req: IRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Optional filters
  const eventType = req.query.eventType as string;
  const city = req.query.city as string;

  const filter: any = { status: 'upcoming' };

  if (eventType) {
    filter.eventType = eventType;
  }

  if (city) {
    filter['location.city'] = { $regex: new RegExp(city, 'i') };
  }

  const events = await Event.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ date: 1 })
    .populate('createdBy', 'name');

  const total = await Event.countDocuments(filter);

  // Check registrations for the current user
  const tokenId = req.user?.id;
  const userId = await resolveUserId(tokenId);
  
  let regEventIds: string[] = [];
  if (userId) {
    const userRegs = await EventRegistration.find({ 
      volunteer_id: userId, 
      event_id: { $in: events.map(e => e._id) } 
    });
    regEventIds = userRegs.map(r => r.event_id.toString());
  }

  const eventsWithStatus = events.map(ev => {
    const isApplied = regEventIds.includes(ev._id.toString());
    return { ...ev.toObject(), isApplied };
  });

  res.status(200).json({
    success: true,
    message: 'Events retrieved successfully',
    data: eventsWithStatus,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalEvents: total,
    },
  });
});

// POST /events/:id/apply - Register for a specific event
export const applyForEvent = asyncHandler(async (req: IRequest, res: Response) => {
  const tokenId = req.user?.id;
  const userId = await resolveUserId(tokenId);
  const eventId = req.params.id;

  const event = await Event.findById(eventId);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found',
    });
  }

  if (event.status !== 'upcoming') {
    return res.status(400).json({
      success: false,
      message: 'Can only apply for upcoming events',
    });
  }

  const existingReg = await EventRegistration.findOne({ 
    volunteer_id: userId, 
    event_id: eventId,
    status: { $ne: 'withdrawn' }
  });

  if (existingReg) {
    return res.status(400).json({
      success: false,
      message: 'Already applied for this event',
    });
  }

  // Check max volunteers logic (optional here since we wait for admin approval, 
  // but if you want to strictly limit pending requests, you can keep checking
  // const approvedCount = await EventRegistration.countDocuments({ event_id: eventId, status: 'approved' });
  // if (approvedCount >= event.requirements.maxVolunteers) { ... }

  await EventRegistration.create({
    volunteer_id: userId,
    event_id: eventId,
    status: 'pending'
  });

  logger.info(`Volunteer ${userId} registered for event ${eventId}`);

  res.status(200).json({
    success: true,
    message: 'Successfully registered for the event',
  });
});

// DELETE /events/:id/withdraw - Cancel registration for an event
export const withdrawFromEvent = asyncHandler(async (req: IRequest, res: Response) => {
  const tokenId = req.user?.id;
  const userId = await resolveUserId(tokenId);
  const eventId = req.params.id;

  const event = await Event.findById(eventId);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found',
    });
  }

  const reg = await EventRegistration.findOne({ 
    volunteer_id: userId, 
    event_id: eventId 
  });

  if (!reg || reg.status === 'withdrawn') {
    return res.status(400).json({
      success: false,
      message: 'Not currently registered/applied for this event',
    });
  }

  // Delete registration or mark withdrawn
  await EventRegistration.findByIdAndDelete(reg._id);

  logger.info(`Volunteer ${userId} withdrew from event ${eventId}`);

  res.status(200).json({
    success: true,
    message: 'Successfully withdrew from the event',
  });
});

// GET /my-events - List all events the current user is applied/registered for
export const getMyEvents = asyncHandler(async (req: IRequest, res: Response) => {
  const tokenId = req.user?.id;
  const userId = await resolveUserId(tokenId);

  const registrations = await EventRegistration.find({ volunteer_id: userId })
    .populate({
      path: 'event_id',
      populate: {
        path: 'createdBy',
        select: 'name'
      }
    })
    .sort({ appliedAt: -1 });

  res.status(200).json({
    success: true,
    message: 'My events retrieved successfully',
    data: registrations
  });
});
