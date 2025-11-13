import { Router } from 'express';
import { prisma } from '@/lib/prisma/client';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get current user profile
router.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      verified: true,
      businessName: true,
      businessDetails: true,
      phone: true,
      avatar: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: user,
  });
}));

// Update profile
router.put('/me', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { name, businessName, businessDetails, phone, avatar } = req.body;

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      name,
      businessName,
      businessDetails,
      phone,
      avatar,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      businessName: true,
      businessDetails: true,
      phone: true,
      avatar: true,
    },
  });

  res.json({
    success: true,
    data: user,
  });
}));

// Get dashboard stats
router.get('/stats', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  let stats: any = {};

  if (user.role === 'OWNER') {
    const [totalSpaces, activeSpaces, totalBids, transactions] = await Promise.all([
      prisma.adSpace.count({ where: { ownerId: req.userId } }),
      prisma.adSpace.count({ where: { ownerId: req.userId, status: 'APPROVED' } }),
      prisma.bid.count({
        where: {
          space: { ownerId: req.userId },
          status: 'PENDING',
        },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: req.userId,
          type: 'PAYOUT',
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
    ]);

    stats = {
      totalSpaces,
      activeSpaces,
      pendingBids: totalBids,
      totalEarnings: transactions._sum.amount || 0,
    };
  } else if (user.role === 'ADVERTISER') {
    const [totalCampaigns, activeCampaigns, totalBids, activeBids] = await Promise.all([
      prisma.campaign.count({ where: { advertiserId: req.userId } }),
      prisma.campaign.count({ where: { advertiserId: req.userId, status: 'ACTIVE' } }),
      prisma.bid.count({ where: { advertiserId: req.userId } }),
      prisma.bid.count({ where: { advertiserId: req.userId, status: 'ACCEPTED' } }),
    ]);

    stats = {
      totalCampaigns,
      activeCampaigns,
      totalBids,
      activeBids,
    };
  }

  res.json({
    success: true,
    data: stats,
  });
}));

export { router as userRoutes };
