import { Router } from 'express';
import { prisma } from '@/lib/prisma/client';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { io } from '../index';

const router = Router();

// Get all messages for current user
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: req.userId },
        { receiverId: req.userId },
      ],
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: messages,
  });
}));

// Send message
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { receiverId, subject, content } = req.body;

  const message = await prisma.message.create({
    data: {
      senderId: req.userId!,
      receiverId,
      subject,
      content,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  // Send real-time notification
  io.to(`user:${receiverId}`).emit('newMessage', message);

  res.status(201).json({
    success: true,
    data: message,
  });
}));

// Mark message as read
router.put('/:id/read', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const message = await prisma.message.findUnique({
    where: { id: req.params.id },
  });

  if (!message) {
    throw new AppError('Message not found', 404);
  }

  if (message.receiverId !== req.userId) {
    throw new AppError('Not authorized', 403);
  }

  const updated = await prisma.message.update({
    where: { id: req.params.id },
    data: { read: true },
  });

  res.json({
    success: true,
    data: updated,
  });
}));

export { router as messageRoutes };
