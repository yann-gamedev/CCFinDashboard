const jwt = require('jsonwebtoken')
const User = require('../models/User')
const UserData = require('../models/UserData')

function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Semua field harus diisi.' })
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password minimal 6 karakter.' })
        }

        // Check existing
        const existingEmail = await User.findOne({ email })
        if (existingEmail) {
            return res.status(400).json({ error: 'Email sudah terdaftar.' })
        }

        const existingUsername = await User.findOne({ username })
        if (existingUsername) {
            return res.status(400).json({ error: 'Username sudah digunakan.' })
        }

        // Create user
        const user = await User.create({ username, email, password })

        // Create empty user data
        await UserData.create({ userId: user._id })

        const token = generateToken(user._id)

        res.status(201).json({
            token,
            user: user.toJSON(),
            message: 'Registrasi berhasil!',
        })
    } catch (err) {
        console.error('Register error:', err)
        res.status(500).json({ error: 'Gagal mendaftar. Coba lagi.' })
    }
}

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Email dan password harus diisi.' })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ error: 'Email atau password salah.' })
        }

        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({ error: 'Email atau password salah.' })
        }

        const token = generateToken(user._id)

        // Load user data
        const userData = await UserData.findOne({ userId: user._id })

        res.json({
            token,
            user: user.toJSON(),
            data: userData || {},
            message: 'Login berhasil!',
        })
    } catch (err) {
        console.error('Login error:', err)
        res.status(500).json({ error: 'Gagal login. Coba lagi.' })
    }
}

// GET /api/auth/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(404).json({ error: 'User tidak ditemukan.' })
        }
        res.json({ user: user.toJSON() })
    } catch (err) {
        console.error('Profile error:', err)
        res.status(500).json({ error: 'Gagal memuat profil.' })
    }
}
