const express = require('express')
const router = express.Router()
const { getData, saveData, mergeData } = require('../controllers/dataController')
const auth = require('../middleware/auth')

// All data routes are protected
router.get('/', auth, getData)
router.put('/', auth, saveData)
router.post('/merge', auth, mergeData)

module.exports = router
