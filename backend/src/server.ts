import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import dashboardRoutes from './routes/dashboardRoutes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// Enable CORS restricted to configured frontend origin
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ['GET'],
  })
)

app.use(express.json())

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'success',
    message: 'Movie Genre Evolution API is running',
  })
})

// Dashboard API routes
app.use('/api', dashboardRoutes)

// 404 Fallback Handler
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  })
})

// Global Error Handler (Sanitizes stack traces)
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Unhandled server error:', err.message)
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    })
  }
)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})