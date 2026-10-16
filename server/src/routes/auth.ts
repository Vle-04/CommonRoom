import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import type { Response } from 'express'
import { ArtistRole, Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

export const authRouter = Router()
const registerSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(10).max(128),
  displayName: z.string().trim().min(1).max(80),
  pseudonym: z.string().trim().min(2).max(40).regex(/^[\p{L}\p{N}_.-]+$/u),
  role: z.enum(['PAINTER', 'SINGER', 'POET', 'WRITER', 'DANCER', 'CHRONICLER', 'INSTRUMENTALIST', 'PHOTOGRAPHER', 'OTHER']).default('OTHER'),
  instruments: z.array(z.string().trim().min(1).max(50)).max(12).default([]),
  bio: z.string().max(2000).optional(),
  artStyle: z.string().max(160).optional(),
  backstory: z.string().max(5000).optional(),
  contactInfo: z.string().max(240).optional(),
  avatarUrl: z.string().max(3_000_000).optional(),
  acceptedTerms: z.literal(true),
})
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })

function issueToken(userId: string) {
  return jwt.sign({}, process.env.JWT_SECRET!, { subject: userId, expiresIn: '2h' })
}
const publicUser = (user: { id: string; email: string; displayName: string; pseudonym: string; role: string; avatarUrl: string | null }) => ({
  id: user.id, email: user.email, displayName: user.displayName, pseudonym: user.pseudonym, role: user.role, avatarUrl: user.avatarUrl,
})

function registrationError(error: unknown, next: (error?: unknown) => void, res: Response) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return res.status(409).json({ error: 'That email or artistic pseudonym is already in use.' })
  }
  if (error instanceof Prisma.PrismaClientInitializationError || (error instanceof Prisma.PrismaClientKnownRequestError && ['P1001', 'P1002', 'P1017'].includes(error.code))) {
    return res.status(503).json({ error: 'The database is unavailable. Start PostgreSQL and run npm run db:migrate.' })
  }
  return next(error)
}

authRouter.post('/register', async (req, res, next) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Check your registration details.', details: parsed.error.flatten() })
  try {
    const input = parsed.data
    const { acceptedTerms, password, ...profile } = input
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({ data: { ...profile, role: input.role as ArtistRole, email: input.email.toLowerCase(), pseudonym: input.pseudonym.toLowerCase(), passwordHash, termsAcceptedAt: acceptedTerms ? new Date() : null } })
    return res.status(201).json({ user: publicUser(user), token: issueToken(user.id) })
  } catch (error) { return registrationError(error, next, res) }
})

authRouter.post('/login', async (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Enter a valid email and password.' })
  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } })
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return res.status(401).json({ error: 'Email or password is incorrect.' })
    return res.json({ user: publicUser(user), token: issueToken(user.id) })
  } catch (error) { return next(error) }
})

authRouter.get('/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { id: true, email: true, displayName: true, pseudonym: true, role: true, avatarUrl: true, bio: true, artStyle: true, backstory: true, instruments: true, contactInfo: true, _count: { select: { followers: true, following: true } } } })
    if (!user) return res.status(404).json({ error: 'Artist not found.' })
    return res.json({ user })
  } catch (error) { return next(error) }
})
