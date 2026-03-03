const UserData = require('../models/UserData')

// GET /api/data
exports.getData = async (req, res) => {
    try {
        let data = await UserData.findOne({ userId: req.userId })
        if (!data) {
            data = await UserData.create({ userId: req.userId })
        }
        res.json({ data })
    } catch (err) {
        console.error('Get data error:', err)
        res.status(500).json({ error: 'Gagal memuat data.' })
    }
}

// PUT /api/data
exports.saveData = async (req, res) => {
    try {
        const { transactions, budgets, recurring, settings } = req.body

        const data = await UserData.findOneAndUpdate(
            { userId: req.userId },
            {
                $set: {
                    ...(transactions !== undefined && { transactions }),
                    ...(budgets !== undefined && { budgets }),
                    ...(recurring !== undefined && { recurring }),
                    ...(settings !== undefined && { settings }),
                },
            },
            { new: true, upsert: true }
        )

        res.json({ data, message: 'Data berhasil disimpan.' })
    } catch (err) {
        console.error('Save data error:', err)
        res.status(500).json({ error: 'Gagal menyimpan data.' })
    }
}

// POST /api/data/merge  (merge guest localStorage data into account)
exports.mergeData = async (req, res) => {
    try {
        const { transactions, budgets, recurring, settings } = req.body

        let data = await UserData.findOne({ userId: req.userId })
        if (!data) {
            data = await UserData.create({ userId: req.userId })
        }

        // Merge arrays (concat and deduplicate by id)
        if (transactions && transactions.length > 0) {
            const existingIds = new Set(data.transactions.map(t => t.id))
            const newTxns = transactions.filter(t => !existingIds.has(t.id))
            data.transactions = [...data.transactions, ...newTxns]
        }

        if (budgets && budgets.length > 0) {
            // For budgets, overwrite by category
            const budgetMap = new Map(data.budgets.map(b => [b.category, b]))
            budgets.forEach(b => budgetMap.set(b.category, b))
            data.budgets = Array.from(budgetMap.values())
        }

        if (recurring && recurring.length > 0) {
            const existingIds = new Set(data.recurring.map(r => r.id))
            const newRecurring = recurring.filter(r => !existingIds.has(r.id))
            data.recurring = [...data.recurring, ...newRecurring]
        }

        if (settings && Object.keys(settings).length > 0) {
            data.settings = { ...data.settings, ...settings }
        }

        await data.save()

        res.json({ data, message: 'Data berhasil digabungkan!' })
    } catch (err) {
        console.error('Merge data error:', err)
        res.status(500).json({ error: 'Gagal menggabungkan data.' })
    }
}
