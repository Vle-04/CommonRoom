import { Router } from 'express'
import { z } from 'zod'
import { ArtworkCategory, ArtworkType, ListingCategory } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

export const artworksRouter = Router()
const artworkSchema = z.object({
  title: z.string().trim().min(1).max(140),
  description: z.string().max(10000).optional(),
  type: z.nativeEnum(ArtworkType),
  category: z.nativeEnum(ArtworkCategory),
  mediaUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  listPriceCents: z.number().int().positive().optional(),
  listingCategory: z.nativeEnum(ListingCategory).optional(),
  isTradeable: z.boolean().default(false),
})

artworksRouter.get('/', async (req, res, next) => {
  try {
    const artworks = await prisma.artwork.findMany({
      where: { isPublished: true, ...(typeof req.query.creatorId === 'string' ? { creatorId: req.query.creatorId } : {}) },
      include: { creator: { select: { id: true, pseudonym: true, avatarUrl: true, role: true } }, listing: true, _count: { select: { likes: true, comments: true } } },
      orderBy: { createdAt: 'desc' }, take: 40,
    })
    return res.json({ artworks })
  } catch (error) { return next(error) }
})

artworksRouter.post('/', requireAuth, async (req: AuthRequest, res, next) => {
  const parsed = artworkSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid artwork details.', details: parsed.error.flatten() })
  const { listPriceCents, listingCategory, isTradeable, ...artworkInput } = parsed.data
  try {
    const artwork = await prisma.artwork.create({
      data: {
        ...artworkInput,
        creatorId: req.userId!,
        ...(listPriceCents || isTradeable ? { listing: { create: { sellerId: req.userId!, category: listingCategory ?? ListingCategory.OTHER, priceCents: listPriceCents ?? null, isTradeable } } } : {}),
      },
      include: { listing: true },
    })
    return res.status(201).json({ artwork })
  } catch (error) { return next(error) }
})
