const pool = require('../config/database');

// Get all timetables
const getAllTimetables = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.*, te.name as teacher_name, te.subject as teacher_subject 
             FROM timetables t 
             JOIN teachers te ON t.teacher_id = te.id 
             ORDER BY t.day, t.period_number`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get timetables error:', error);
        res.status(500).json({ error: 'Failed to fetch timetables' });
    }
};

// Get timetable by teacher
const getTimetableByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const result = await pool.query(
            'SELECT * FROM timetables WHERE teacher_id = $1 ORDER BY day, period_number',
            [teacherId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get teacher timetable error:', error);
        res.status(500).json({ error: 'Failed to fetch timetable' });
    }
};

// Get free periods for a specific day and period
const getFreeTeachers = async (req, res) => {
    try {
        const { day, periodNumber } = req.query;

        // Get all teachers who don't have a class at this day/period
        const result = await pool.query(
            `SELECT te.* FROM teachers te 
             WHERE te.id NOT IN (
                 SELECT teacher_id FROM timetables 
                 WHERE day = $1 AND period_number = $2
             )
             ORDER BY te.name`,
            [day, periodNumber]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get free teachers error:', error);
        res.status(500).json({ error: 'Failed to fetch free teachers' });
    }
};

// Create timetable entry
const createTimetable = async (req, res) => {
    try {
        const { teacher_id, day, period_number, class_name, subject } = req.body;

        if (!teacher_id || !day || !period_number || !class_name || !subject) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const result = await pool.query(
            'INSERT INTO timetables (teacher_id, day, period_number, class_name, subject) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [teacher_id, day, period_number, class_name, subject]
        );

        res.status(201).json({
            message: 'Timetable entry created successfully',
            timetable: result.rows[0]
        });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ error: 'Timetable entry already exists for this teacher, day, and period' });
        }
        console.error('Create timetable error:', error);
        res.status(500).json({ error: 'Failed to create timetable entry' });
    }
};

// Update timetable entry
const updateTimetable = async (req, res) => {
    try {
        const { id } = req.params;
        const { teacher_id, day, period_number, class_name, subject } = req.body;

        const result = await pool.query(
            'UPDATE timetables SET teacher_id = COALESCE($1, teacher_id), day = COALESCE($2, day), period_number = COALESCE($3, period_number), class_name = COALESCE($4, class_name), subject = COALESCE($5, subject) WHERE id = $6 RETURNING *',
            [teacher_id, day, period_number, class_name, subject, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Timetable entry not found' });
        }

        res.json({
            message: 'Timetable entry updated successfully',
            timetable: result.rows[0]
        });
    } catch (error) {
        console.error('Update timetable error:', error);
        res.status(500).json({ error: 'Failed to update timetable entry' });
    }
};

// Delete timetable entry
const deleteTimetable = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query('DELETE FROM timetables WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Timetable entry not found' });
        }

        res.json({ message: 'Timetable entry deleted successfully' });
    } catch (error) {
        console.error('Delete timetable error:', error);
        res.status(500).json({ error: 'Failed to delete timetable entry' });
    }
};

module.exports = {
    getAllTimetables,
    getTimetableByTeacher,
    getFreeTeachers,
    createTimetable,
    updateTimetable,
    deleteTimetable
};