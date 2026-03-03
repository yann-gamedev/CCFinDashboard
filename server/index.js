require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const dataRoutes = require('./routes/data')

const app = express()
const PORT = process.env.PORT || 5000

// Validate required env vars
if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not set in .env')
    process.exit(1)
}
if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not set in .env')
    process.exit(1)
}

// CORS — allow client origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.CLIENT_URL,
].filter(Boolean)

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin)) return callback(null, true)
        callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
}))
app.use(express.json({ limit: '5mb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/data', dataRoutes)

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    })
})

// Global error handler
app.use((err, req, res, _next) => {
    console.error('Unhandled error:', err)
    res.status(500).json({ error: 'Internal server error' })
})

// Connect to MongoDB with retry
async function connectDB(retries = 5) {
    for (let i = 1; i <= retries; i++) {
        try {
            console.log(`🔄 Connecting to MongoDB (attempt ${i}/${retries})...`)
            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
            })
            console.log('✅ MongoDB connected')
            return
        } catch (err) {
            console.error(`❌ Attempt ${i} failed: ${err.message}`)
            if (i < retries) {
                const delay = Math.min(1000 * Math.pow(2, i), 10000)
                console.log(`⏳ Retrying in ${delay / 1000}s...`)
                await new Promise(r => setTimeout(r, delay))
            }
        }
    }
    console.error('❌ All MongoDB connection attempts failed.')
    console.error('💡 Tips:')
    console.error('   1. Check your MONGO_URI in .env')
    console.error('   2. Whitelist your IP in MongoDB Atlas → Network Access')
    console.error('   3. Make sure the cluster is not paused')
    console.error('   4. Try using mongodb:// instead of mongodb+srv://')
    process.exit(1)
}

// Start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`)
        console.log(`📡 Accepting requests from: ${allowedOrigins.join(', ')}`)
    })
})
