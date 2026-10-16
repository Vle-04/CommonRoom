import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { apiRouter } from './routes/index.js'

const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'] as const
for (const key of requiredEnv) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`)
}
if (process.env.JWT_SECRET!.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters.')

const app = express()
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }))
app.use(express.json({ limit: '4mb' }))
app.use('/api', apiRouter)
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error)
  if (process.env.NODE_ENV !== 'production' && error instanceof Error) {
    return res.status(500).json({ error: error.message, ...(error.stack ? { debug: error.stack.split('\n').slice(0, 5) } : {}) })
  }
  res.status(500).json({ error: 'Something went wrong.' })
})

const port = Number(process.env.PORT ?? 4000)
app.listen(port, () => console.log(`Commonroom API listening on http://localhost:${port}`))
