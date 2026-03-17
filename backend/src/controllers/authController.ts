import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { asyncHandler } from '../utils/errorHandler';
import { User } from '../models/User.model';
import { Auth } from '../models/Auth.model';
import { School } from '../models/school.model';
import { Volunteer } from '../models/volunteer.model';
import config from '../config/env';
import { logger } from '../utils/logger';

// POST /api/auth/register - Register a new user (Donor)
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    logger.warn(`Registration attempt with existing email: ${email}`);
    return res.status(400).json({ success: false, message: 'Email already in use' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Create user for identity
  const newUser = await User.create({
    name,
    email,
    phone,
    role: role || 'donor',
  });

  // Create auth record for security
  console.log('Creating auth record for:', email);
  await Auth.create({
    user_id: newUser._id,
    passwordHash,
    role: newUser.role,
  });
  console.log('Auth record created successfully');

  logger.info(`User registered: ${email} (role: ${newUser.role})`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { id: newUser._id, email: newUser.email, role: newUser.role },
  });
});

// POST /api/auth/volunteer/register - Register a new volunteer with profile
export const volunteerRegister = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, expertise, skills, availability } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    logger.warn(`Volunteer registration attempt with existing email: ${email}`);
    return res.status(400).json({ success: false, message: 'Email already in use' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Create user for identity
  const newUser = await User.create({
    name,
    email,
    phone,
    role: 'volunteer',
  });

  // Create auth record for security
  await Auth.create({
    user_id: newUser._id,
    passwordHash,
    role: 'volunteer',
  });

  // Create volunteer profile linked to user
  const volunteerProfile = await Volunteer.create({
    user_id: newUser._id,
    expertise: expertise || [],
    skills: skills || [],
    availability: availability || [],
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

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    logger.warn(`Login attempt with non-existent email: ${email}`);
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  // Find auth record for the user
  const authRecord = await Auth.findOne({ user_id: user._id });

  if (!authRecord) {
    logger.error(`Auth record missing for user: ${email}`);
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, authRecord.passwordHash);
  if (!match) {
    logger.warn(`Failed login attempt for: ${email}`);
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const payload = { id: user._id, email: user.email, role: user.role };
  const signOptions: jwt.SignOptions = {
    expiresIn: config.JWT_EXPIRY as unknown as jwt.SignOptions['expiresIn'],
  };
  const token = jwt.sign(payload as Record<string, unknown>, config.JWT_SECRET as jwt.Secret, signOptions);

  logger.info(`User logged in: ${email} (role: ${user.role})`);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    name: user.name,
    role: user.role,
    expiresIn: config.JWT_EXPIRY,
  });
});

// POST /api/auth/school/register - Specific registration for Schools (creates User + School)
export const schoolRegister = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, schoolDetails, contactPerson, verification, requirements } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    logger.warn(`School registration attempt with existing email: ${email}`);
    return res.status(400).json({ success: false, message: 'Account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Create user for identity
  const newUser = await User.create({
    name: schoolDetails.name,
    email,
    phone: contactPerson.phone,
    role: 'school',
  });

  // Create auth record for security
  await Auth.create({
    user_id: newUser._id,
    passwordHash,
    role: 'school',
  });

  // Create school profile linked to user
  const newSchool = await School.create({
    user_id: newUser._id,
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

  const user = await User.findOne({ email });

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
