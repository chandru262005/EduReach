import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env';
import { IRequest } from '../types';

interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Middleware to verify JWT token from Authorization header
 */
export const verifyToken = (req: IRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided',
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET as string) as JWTPayload;

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    // Store full decoded payload if needed
    req.id = decoded.id;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
    });
  }
};

/**
 * Middleware to verify user is a donor
 * Must be used AFTER verifyToken middleware
 */
export const verifyDonor = (req: IRequest, res: Response, next: NextFunction) => {
  try {
    // Re-decode token to check role (verifyToken already validated it)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.JWT_SECRET as string) as JWTPayload;

    if (decoded.role !== 'donor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only donors can access this resource',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during role verification',
    });
  }
};
