import { Router } from 'express';
import { prisma } from '@/lib/prisma/client';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all spaces with filters
router.get('/', asyncHandler(async (req, res) => {
  const {
    type,
    city,
    state,
    minPrice,
    maxPrice,
    page = 1,
    pageSize = 20,
  } = req.query;

  const where: any = {
    status: 'APPROVED',
  };

  if (type) where.type = type;
  if (city) where.city = city;
  if (state) where.state = state;
  if (minPrice || maxPrice) {
    where.basePrice = {};
    if (minPrice) where.basePrice.gte = parseFloat(minPrice as string);
    if (maxPrice) where.basePrice.lte = parseFloat(maxPrice as string);
  }

  const [spaces, total] = await Promise.all([
    prisma.adSpace.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            businessName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
            bids: true,
          },
        },
      },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.adSpace.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      spaces,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / Number(pageSize)),
      },
    },
  });
}));

// Get single space
router.get('/:id', asyncHandler(async (req, res) => {
  const space = await prisma.adSpace.findUnique({
    where: { id: req.params.id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          businessName: true,
          avatar: true,
          email: true,
        },
      },
      reviews: {
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: {
          reviews: true,
          favorites: true,
          bids: true,
        },
      },
    },
  });

  if (!space) {
    throw new AppError('Space not found', 404);
  }

  // Increment view count
  await prisma.adSpace.update({
    where: { id: req.params.id },
    data: { viewCount: { increment: 1 } },
  });

  res.json({
    success: true,
    data: space,
  });
}));

// Create space (Owner only)
router.post('/', authenticate, authorize('OWNER', 'ADMIN'), asyncHandler(async (req: AuthRequest, res) => {
  const space = await prisma.adSpace.create({
    data: {
      ...req.body,
      ownerId: req.userId!,
      status: 'PENDING',
    },
  });

  res.status(201).json({
    success: true,
    data: space,
  });
}));

// Update space
router.put('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const space = await prisma.adSpace.findUnique({
    where: { id: req.params.id },
  });

  if (!space) {
    throw new AppError('Space not found', 404);
  }

  if (space.ownerId !== req.userId && req.userRole !== 'ADMIN') {
    throw new AppError('Not authorized', 403);
  }

  const updated = await prisma.adSpace.update({
    where: { id: req.params.id },
    data: req.body,
  });

  res.json({
    success: true,
    data: updated,
  });
}));

// Delete space
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const space = await prisma.adSpace.findUnique({
    where: { id: req.params.id },
  });

  if (!space) {
    throw new AppError('Space not found', 404);
  }

  if (space.ownerId !== req.userId && req.userRole !== 'ADMIN') {
    throw new AppError('Not authorized', 403);
  }

  await prisma.adSpace.delete({
    where: { id: req.params.id },
  });

  res.json({
    success: true,
    message: 'Space deleted successfully',
  });
}));

export { router as spaceRoutes };
