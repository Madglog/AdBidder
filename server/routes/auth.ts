import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma/client';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { sendVerificationEmail } from '@/lib/email/sender';
import crypto from 'crypto';

const router = Router();

// Register
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, name, role, businessName, phone } = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: role || 'GUEST',
      businessName,
      phone,
      verificationToken,
    },
  });

  // Send verification email
  await sendVerificationEmail(email, verificationToken);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email to verify your account.',
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}));

// Verify email
router.get('/verify/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  if (!user) {
    throw new AppError('Invalid verification token', 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verified: true,
      verificationToken: null,
    },
  });

  res.json({
    success: true,
    message: 'Email verified successfully',
  });
}));

export { router as authRoutes };
