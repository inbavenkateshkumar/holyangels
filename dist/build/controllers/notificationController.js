const pool = require('../config/database');

// Get notifications for a teacher or user
const getNotifications = async (req, res) => {
    try {
        const { teacherId, userId } = req.query;

        let query = 'SELECT * FROM notifications WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (teacherId) {
            query += ` AND teacher_id = $${paramCount}`;
            params.push(teacherId);
            paramCount++;
        }

        if (userId) {
            query += ` AND user_id = $${paramCount}`;
            params.push(userId);
            paramCount++;
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'UPDATE notifications SET read_status = TRUE WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read', notification: result.rows[0] });
    } catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
};

module.exports = { getNotifications, markAsRead };