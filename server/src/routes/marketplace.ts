import { Router } from 'express'
import { ListingCategory } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export const marketplaceRouter = Router()
marketplaceRouter.get('/', async (req, res, next) => {
  try {
    const category = z.nativeEnum(ListingCategory).safeParse(req.query.category)
    const listings = await prisma.listing.findMany({
      where: { isActive: true, priceCents: { not: null }, ...(category.success ? { category: category.data } : {}) },
      include: { artwork: { include: { creator: { select: { id: true, pseudonym: true, avatarUrl: true } } } } },
      orderBy: { createdAt: 'desc' }, take: 40,
    })
    return res.json({ listings })
  } catch (error) { return next(error) }
})
