import { Router } from 'express';
import { prisma } from '@/lib/prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all notifications for current user
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json({
    success: true,
    data: notifications,
  });
}));

// Mark notification as read
router.put('/:id/read', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  await prisma.notification.update({
    where: { id: req.params.id },
    data: { read: true },
  });

  res.json({
    success: true,
  });
}));

// Mark all notifications as read
router.put('/read-all', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  await prisma.notification.updateMany({
    where: {
      userId: req.userId,
      read: false,
    },
    data: { read: true },
  });

  res.json({
    success: true,
  });
}));

export { router as notificationRoutes };
