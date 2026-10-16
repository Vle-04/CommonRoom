import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

export const socialRouter = Router()
socialRouter.put('/follow/:userId', requireAuth, async (req: AuthRequest, res, next) => {
  const targetId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId
  if (targetId === req.userId) return res.status(400).json({ error: 'You cannot follow yourself.' })
  try {
    await prisma.follow.upsert({ where: { followerId_followingId: { followerId: req.userId!, followingId: targetId } }, update: {}, create: { followerId: req.userId!, followingId: targetId } })
    return res.status(204).end()
  } catch (error) { return next(error) }
})
socialRouter.delete('/follow/:userId', requireAuth, async (req: AuthRequest, res, next) => {
  const targetId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId
  try {
    await prisma.follow.deleteMany({ where: { followerId: req.userId, followingId: targetId } })
    return res.status(204).end()
  } catch (error) { return next(error) }
})
