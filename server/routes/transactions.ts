import { Router } from 'express';
import { prisma } from '@/lib/prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all transactions for current user
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId },
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: transactions,
  });
}));

export { router as transactionRoutes };
