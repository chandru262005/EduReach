import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import {User} from '../models/User.model';

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find();
  
  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: users,
  });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findById(id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: user,
  });
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  
  const newUser = await User.create({
    name,
    email,
    password,
    role: role || 'user',
  });
  
  logger.info(`User created: ${email}`);
  
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: newUser,
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
  
  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: updatedUser,
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const deletedUser = await User.findByIdAndDelete(id);
  
  if (!deletedUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }
  
  logger.info(`User deleted: ${deletedUser.email}`);
  
  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: deletedUser,
  });
});
