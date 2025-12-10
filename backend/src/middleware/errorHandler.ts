import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof AppError) {
    logger.error(error.message);
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  logger.error('Unexpected error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

export default errorHandler;
