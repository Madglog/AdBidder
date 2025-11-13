import { Router } from 'express';
import { prisma } from '@/lib/prisma/client';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all campaigns for current user
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const campaigns = await prisma.campaign.findMany({
    where: { advertiserId: req.userId },
    include: {
      spaces: {
        include: {
          space: {
            include: {
              owner: {
                select: {
                  id: true,
                  name: true,
                  businessName: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: { spaces: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: campaigns,
  });
}));

// Get single campaign
router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: {
      advertiser: {
        select: {
          id: true,
          name: true,
          email: true,
          businessName: true,
        },
      },
      spaces: {
        include: {
          space: {
            include: {
              owner: true,
            },
          },
        },
      },
    },
  });

  if (!campaign) {
    throw new AppError('Campaign not found', 404);
  }

  if (campaign.advertiserId !== req.userId) {
    throw new AppError('Not authorized', 403);
  }

  res.json({
    success: true,
    data: campaign,
  });
}));

// Create campaign
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { title, description, startDate, endDate, spaces, totalBudget } = req.body;

  const campaign = await prisma.campaign.create({
    data: {
      advertiserId: req.userId!,
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalBudget,
      status: 'DRAFT',
    },
  });

  // Add spaces to campaign
  if (spaces && spaces.length > 0) {
    await prisma.campaignSpace.createMany({
      data: spaces.map((space: any) => ({
        campaignId: campaign.id,
        spaceId: space.spaceId,
        creativeUrl: space.creativeUrl,
        price: space.price,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      })),
    });
  }

  res.status(201).json({
    success: true,
    data: campaign,
  });
}));

// Update campaign
router.put('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
  });

  if (!campaign) {
    throw new AppError('Campaign not found', 404);
  }

  if (campaign.advertiserId !== req.userId) {
    throw new AppError('Not authorized', 403);
  }

  const updated = await prisma.campaign.update({
    where: { id: req.params.id },
    data: req.body,
  });

  res.json({
    success: true,
    data: updated,
  });
}));

export { router as campaignRoutes };
