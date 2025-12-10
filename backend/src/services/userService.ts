import {User, IUser } from '../models/User.model';
import { AppError } from '../utils/errorHandler';

export class UserService {
  async getUserById(id: string): Promise<IUser> {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async getAllUsers(): Promise<IUser[]> {
    return await User.find();
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError(400, 'User with this email already exists');
    }
    return await User.create(userData);
  }

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser> {
    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return user;
  }

  async deleteUser(id: string): Promise<IUser> {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return user;
  }
}

export default new UserService();
