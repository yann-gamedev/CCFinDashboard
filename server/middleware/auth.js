const jwt = require('jsonwebtoken')

module.exports = function auth(req, res, next) {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' })
    }

    try {
        const token = header.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = decoded.userId
        next()
    } catch {
        return res.status(401).json({ error: 'Token tidak valid atau sudah kadaluarsa.' })
    }
}
