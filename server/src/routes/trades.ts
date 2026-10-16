import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

export const tradesRouter = Router()
const offerSchema = z.object({ recipientId: z.string().min(1), offeredArtworkId: z.string().min(1), requestedArtworkId: z.string().min(1), message: z.string().max(2000).optional() })

tradesRouter.post('/', requireAuth, async (req: AuthRequest, res, next) => {
  const parsed = offerSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid trade proposal.', details: parsed.error.flatten() })
  const { recipientId, offeredArtworkId, requestedArtworkId, message } = parsed.data
  if (recipientId === req.userId) return res.status(400).json({ error: 'You cannot propose a trade to yourself.' })
  try {
    const [offered, requested] = await Promise.all([
      prisma.artwork.findFirst({ where: { id: offeredArtworkId, creatorId: req.userId, isPublished: true } }),
      prisma.artwork.findFirst({ where: { id: requestedArtworkId, creatorId: recipientId, isPublished: true } }),
    ])
    if (!offered || !requested) return res.status(400).json({ error: 'Choose a published work you own and a published work from the recipient.' })
    const trade = await prisma.trade.create({ data: { offererId: req.userId!, recipientId, offeredArtworkId, requestedArtworkId, message } })
    return res.status(201).json({ trade })
  } catch (error) { return next(error) }
})

tradesRouter.get('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const trades = await prisma.trade.findMany({
      where: { OR: [{ offererId: req.userId }, { recipientId: req.userId }] },
      include: { offerer: { select: { id: true, pseudonym: true } }, recipient: { select: { id: true, pseudonym: true } }, offeredArtwork: true, requestedArtwork: true },
      orderBy: { createdAt: 'desc' },
    })
    return res.json({ trades })
  } catch (error) { return next(error) }
})
