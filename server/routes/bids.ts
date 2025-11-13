import { Router } from 'express';
import { prisma } from '@/lib/prisma/client';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { io } from '../index';

const router = Router();

// Get all bids for current user
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { status } = req.query;

  const where: any = {
    OR: [
      { advertiserId: req.userId },
      {
        space: {
          ownerId: req.userId,
        },
      },
    ],
  };

  if (status) where.status = status;

  const bids = await prisma.bid.findMany({
    where,
    include: {
      advertiser: {
        select: {
          id: true,
          name: true,
          email: true,
          businessName: true,
        },
      },
      space: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              businessName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: bids,
  });
}));

// Create bid
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { spaceId, amount, duration, startDate, endDate, message } = req.body;

  const space = await prisma.adSpace.findUnique({
    where: { id: spaceId },
  });

  if (!space) {
    throw new AppError('Space not found', 404);
  }

  if (space.status !== 'APPROVED') {
    throw new AppError('Space is not available for bidding', 400);
  }

  // Set bid expiry to 7 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const bid = await prisma.bid.create({
    data: {
      advertiserId: req.userId!,
      spaceId,
      amount,
      duration,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      message,
      expiresAt,
    },
    include: {
      advertiser: {
        select: {
          id: true,
          name: true,
          businessName: true,
        },
      },
      space: true,
    },
  });

  // Send real-time notification to space owner
  io.to(`user:${space.ownerId}`).emit('newBid', bid);

  // Create notification
  await prisma.notification.create({
    data: {
      userId: space.ownerId,
      type: 'BID_RECEIVED',
      title: 'New Bid Received',
      content: `You received a bid of $${amount} for ${space.title}`,
      link: `/dashboard/owner/bids/${bid.id}`,
    },
  });

  res.status(201).json({
    success: true,
    data: bid,
  });
}));

// Accept bid
router.post('/:id/accept', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const bid = await prisma.bid.findUnique({
    where: { id: req.params.id },
    include: { space: true },
  });

  if (!bid) {
    throw new AppError('Bid not found', 404);
  }

  if (bid.space.ownerId !== req.userId) {
    throw new AppError('Not authorized', 403);
  }

  const updated = await prisma.bid.update({
    where: { id: req.params.id },
    data: { status: 'ACCEPTED' },
  });

  // Send real-time notification
  io.to(`user:${bid.advertiserId}`).emit('bidAccepted', updated);

  // Create notification
  await prisma.notification.create({
    data: {
      userId: bid.advertiserId,
      type: 'BID_ACCEPTED',
      title: 'Bid Accepted!',
      content: `Your bid for ${bid.space.title} has been accepted`,
      link: `/dashboard/advertiser/bids/${bid.id}`,
    },
  });

  res.json({
    success: true,
    data: updated,
  });
}));

// Reject bid
router.post('/:id/reject', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const bid = await prisma.bid.findUnique({
    where: { id: req.params.id },
    include: { space: true },
  });

  if (!bid) {
    throw new AppError('Bid not found', 404);
  }

  if (bid.space.ownerId !== req.userId) {
    throw new AppError('Not authorized', 403);
  }

  const updated = await prisma.bid.update({
    where: { id: req.params.id },
    data: { status: 'REJECTED' },
  });

  // Send real-time notification
  io.to(`user:${bid.advertiserId}`).emit('bidRejected', updated);

  res.json({
    success: true,
    data: updated,
  });
}));

// Counter bid
router.post('/:id/counter', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { counterAmount, counterMessage } = req.body;

  const bid = await prisma.bid.findUnique({
    where: { id: req.params.id },
    include: { space: true },
  });

  if (!bid) {
    throw new AppError('Bid not found', 404);
  }

  if (bid.space.ownerId !== req.userId) {
    throw new AppError('Not authorized', 403);
  }

  const updated = await prisma.bid.update({
    where: { id: req.params.id },
    data: {
      status: 'COUNTERED',
      counterAmount,
      counterMessage,
    },
  });

  // Send real-time notification
  io.to(`user:${bid.advertiserId}`).emit('bidCountered', updated);

  res.json({
    success: true,
    data: updated,
  });
}));

export { router as bidRoutes };
