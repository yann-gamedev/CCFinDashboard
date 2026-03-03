require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const dataRoutes = require('./routes/data')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
}))
app.use(express.json({ limit: '5mb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/data', dataRoutes)

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected')
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`)
        })
    })
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message)
        process.exit(1)
    })
