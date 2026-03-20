const pool = require('../config/database');

// Get attendance for a specific date
const getAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        // Get all teachers with their attendance status for the date
        const result = await pool.query(
            `SELECT 
                t.id,
                t.name,
                t.subject,
                COALESCE(a.status, 'Absent') as status,
                a.marked_by,
                a.created_at as marked_at
             FROM teachers t
             LEFT JOIN attendance a ON t.id = a.teacher_id AND a.date = $1
             ORDER BY t.name`,
            [date]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
};

// Mark attendance
const markAttendance = async (req, res) => {
    try {
        const { date, attendance_data } = req.body; // attendance_data: [{teacher_id, status}]

        if (!date || !attendance_data || !Array.isArray(attendance_data)) {
            return res.status(400).json({ error: 'Date and attendance_data array are required' });
        }

        const markedBy = req.user.id;

        // Use transaction for consistency
        await pool.query('BEGIN');

        try {
            // Delete existing attendance for this date
            await pool.query('DELETE FROM attendance WHERE date = $1', [date]);

            // Insert new attendance records for all entries
            for (const entry of attendance_data) {
                await pool.query(
                    'INSERT INTO attendance (teacher_id, date, status, marked_by) VALUES ($1, $2, $3, $4)',
                    [entry.teacher_id, date, entry.status, markedBy]
                );
            }

            await pool.query('COMMIT');

            res.json({ message: 'Attendance marked successfully' });
        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
};

// Update single teacher attendance
const updateTeacherAttendance = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { date, status } = req.body;

        if (!date || !status) {
            return res.status(400).json({ error: 'Date and status are required' });
        }

        // Delete existing record
        await pool.query('DELETE FROM attendance WHERE teacher_id = $1 AND date = $2', [teacherId, date]);

        // Insert new record (for both Present and Absent)
        await pool.query(
            'INSERT INTO attendance (teacher_id, date, status, marked_by) VALUES ($1, $2, $3, $4)',
            [teacherId, date, status, req.user.id]
        );

        res.json({ message: 'Attendance updated successfully' });
    } catch (error) {
        console.error('Update attendance error:', error);
        res.status(500).json({ error: 'Failed to update attendance' });
    }
};

module.exports = {
    getAttendanceByDate,
    markAttendance,
    updateTeacherAttendance
};