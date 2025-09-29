import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { generateToken } from '../utils/jwt';
import { registerSchema, loginSchema, RegisterInput, LoginInput } from '../utils/validation';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(req.body);
    const validatedData: RegisterInput = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }
    const existingAdmin = await User.findOne({ role: validatedData.role });
    if (existingAdmin) {
      res.status(400).json({ message: 'Admin already exists.' });
      return;
    }

    // Create new user
    const user = new User({
      name: validatedData.name,
      email: validatedData.email,
      passwordHash: validatedData.password, // Will be hashed by pre-save middleware
      role: validatedData.role || 'user'
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData: LoginInput = loginSchema.parse(req.body);
    
    // Find user by email
    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
