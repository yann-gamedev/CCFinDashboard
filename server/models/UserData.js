const mongoose = require('mongoose')

const userDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    transactions: {
        type: Array,
        default: [],
    },
    budgets: {
        type: Array,
        default: [],
    },
    recurring: {
        type: Array,
        default: [],
    },
    settings: {
        type: Object,
        default: {},
    },
}, { timestamps: true })

module.exports = mongoose.model('UserData', userDataSchema)
