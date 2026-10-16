import { Router } from 'express'
import { authRouter } from './auth.js'
import { artworksRouter } from './artworks.js'
import { marketplaceRouter } from './marketplace.js'
import { socialRouter } from './social.js'
import { tradesRouter } from './trades.js'

export const apiRouter = Router()
apiRouter.get('/health', (_req, res) => res.json({ status: 'ok', service: 'commonroom-api' }))
apiRouter.use('/auth', authRouter)
apiRouter.use('/artworks', artworksRouter)
apiRouter.use('/marketplace', marketplaceRouter)
apiRouter.use('/social', socialRouter)
apiRouter.use('/trades', tradesRouter)
