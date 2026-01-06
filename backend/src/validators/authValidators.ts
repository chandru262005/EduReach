import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Auth validators grouped by route
export const authValidators = {
  register: [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').notEmpty().withMessage('Phone is required'),
  ],

  login: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],

  schoolRegister: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('schoolDetails.name').notEmpty().withMessage('School name is required'),
    body('contactPerson.name').notEmpty().withMessage('Contact person name is required'),
    body('contactPerson.phone').notEmpty().withMessage('Contact person phone is required'),
    body('schoolDetails.udiseCode').notEmpty().withMessage('UDISE code is required'),
  ],

  volunteerRegister: [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('skills').optional().isArray().withMessage('Skills must be an array'),
    body('availability').optional().isObject().withMessage('Availability must be an object'),
  ],

  forgotPassword: [
    body('email').isEmail().withMessage('Valid email is required'),
  ]
};

// User validators for CRUD operations
export const userValidators = {
  createUser: [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
  ],
  updateUser: [
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  ],
};

