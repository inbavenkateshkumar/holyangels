const pool = require('../config/database');

// Set day override for a specific date
const setDayOverride = async (req, res) => {
    try {
        const { date, day_to_follow } = req.body;

        if (!date || !day_to_follow) {
            return res.status(400).json({ error: 'Date and day_to_follow are required' });
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS day_overrides (
                date DATE PRIMARY KEY,
                day_to_follow VARCHAR(20) NOT NULL CHECK (day_to_follow IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const result = await pool.query(
            `INSERT INTO day_overrides (date, day_to_follow) 
             VALUES ($1, $2) 
             ON CONFLICT (date) 
             DO UPDATE SET day_to_follow = $2, created_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [date, day_to_follow]
        );

        res.json({
            message: 'Day override set successfully',
            override: result.rows[0]
        });
    } catch (error) {
        console.error('Set day override error:', error);
        res.status(500).json({ error: 'Failed to set day override' });
    }
};

// Get day override for a specific date
const getDayOverride = async (req, res) => {
    try {
        const { date } = req.params;

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS day_overrides (
                date DATE PRIMARY KEY,
                day_to_follow VARCHAR(20) NOT NULL CHECK (day_to_follow IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const result = await pool.query(
            'SELECT * FROM day_overrides WHERE date = $1',
            [date]
        );

        if (result.rows.length === 0) {
            return res.json({ override: null });
        }

        res.json({ override: result.rows[0] });
    } catch (error) {
        console.error('Get day override error:', error);
        res.status(500).json({ error: 'Failed to fetch day override' });
    }
};

module.exports = {
    setDayOverride,
    getDayOverride
};
