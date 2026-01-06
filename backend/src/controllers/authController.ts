import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { asyncHandler } from '../utils/errorHandler';
import { User } from '../models/User.model';
import { School } from '../models/school.mode';
import { VolunteerProfile } from '../models/volunteer.model';
import config from '../config/env';
import { logger } from '../utils/logger';

// POST /api/auth/register - Register a new user (Donor or Volunteer)
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    logger.warn(`Registration attempt with existing email: ${email}`);
    return res.status(400).json({ success: false, message: 'Email already in use' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    phone,
    passwordHash,
    role: role || 'donor',
  });

  logger.info(`User registered: ${email} (role: ${newUser.role})`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { id: newUser._id, email: newUser.email, role: newUser.role },
  });
});

// POST /api/auth/volunteer/register - Register a new volunteer with profile
export const volunteerRegister = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, skills, availability } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    logger.warn(`Volunteer registration attempt with existing email: ${email}`);
    return res.status(400).json({ success: false, message: 'Email already in use' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Create user with volunteer role
  const newUser = await User.create({
    name,
    email,
    phone,
    passwordHash,
    role: 'volunteer',
  });

  // Create volunteer profile linked to user
  const volunteerProfile = await VolunteerProfile.create({
    user: newUser._id,
    skills: skills || [],
    availability: availability || { days: [], timeSlots: [] },
    hoursContributed: 0,
    pastActivities: [],
  });

  logger.info(`Volunteer registered: ${email} with profile ID: ${volunteerProfile._id}`);

  res.status(201).json({
    success: true,
    message: 'Volunteer registered successfully',
    data: {
      userId: newUser._id,
      profileId: volunteerProfile._id,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

// POST /api/auth/login - Login for all users (returns JWT)
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Try User collection first
  let user: any = await User.findOne({ email });
  let source: 'user' | 'school' = 'user';

  if (!user) {
    // Try schools
    user = await School.findOne({ email });
    source = 'school';
  }

  if (!user) {
    logger.warn(`Login attempt with non-existent email: ${email}`);
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const storedHash = user.passwordHash;
  const match = await bcrypt.compare(password, storedHash);
  if (!match) {
    logger.warn(`Failed login attempt for: ${email}`);
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const payload = { id: user._id, email: user.email, role: user.role || 'school', source };
  const signOptions: jwt.SignOptions = {
    expiresIn: config.JWT_EXPIRY as unknown as jwt.SignOptions['expiresIn'],
  };
  const token = jwt.sign(payload as Record<string, unknown>, config.JWT_SECRET as jwt.Secret, signOptions);

  logger.info(`User logged in: ${email} (source: ${source})`);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    expiresIn: config.JWT_EXPIRY,
  });
});

// POST /api/auth/school/register - Specific registration for Schools (creates User + School)
export const schoolRegister = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, schoolDetails, contactPerson, verification, requirements } = req.body;

  const existingUser = await User.findOne({ email });
  const existingSchool = await School.findOne({ email });
  if (existingUser || existingSchool) {
    logger.warn(`School registration attempt with existing email: ${email}`);
    return res.status(400).json({ success: false, message: 'Account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name: schoolDetails.name,
    email,
    phone: contactPerson.phone,
    passwordHash,
    role: 'school',
  });

  const newSchool = await School.create({
    email,
    passwordHash,
    schoolDetails,
    contactPerson,
    verification: verification || { documentUrl: '', isVerified: false },
    requirements: requirements || { infrastructure: [], booksNeeded: false, volunteerRoles: [] },
  });

  logger.info(`School registered: ${schoolDetails.name} (${email})`);

  res.status(201).json({
    success: true,
    message: 'School registered successfully',
    data: { userId: newUser._id, schoolId: newSchool._id, schoolName: schoolDetails.name },
  });
});

// POST /api/auth/forgot-password - Initiate password reset
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  // Try both User and School
  const user = (await User.findOne({ email })) || (await School.findOne({ email }));

  // Always return success response to avoid leaking which emails exist
  if (!user) {
    logger.warn(`Forgot password attempt with non-existent email: ${email}`);
    return res.status(200).json({ success: true, message: 'If an account exists, a reset link will be sent' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  // In a full implementation we'd store the token + expiry and email the user a reset link.
  logger.info(`Password reset token generated for: ${email}`);
  console.log(`Password reset token for ${email}: ${token}`);

  res.status(200).json({
    success: true,
    message: 'If an account exists, a reset link will be sent',
  });
});
