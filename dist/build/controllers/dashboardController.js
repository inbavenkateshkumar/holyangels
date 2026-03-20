const pool = require('../config/database');

// Get dashboard data
const getDashboard = async (req, res) => {
    try {
        const { date } = req.query;
        const today = date || new Date().toISOString().split('T')[0];

        // Get day name from date
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayIndex = new Date(today).getDay();
        const day = dayNames[dayIndex];

        // Get absent teachers
        const absentTeachersResult = await pool.query(
            `SELECT t.* FROM teachers t
             LEFT JOIN attendance a ON t.id = a.teacher_id AND a.date = $1
             WHERE a.status IS NULL OR a.status = 'Absent'`,
            [today]
        );

        // Get present teachers
        const presentTeachersResult = await pool.query(
            `SELECT t.* FROM teachers t
             JOIN attendance a ON t.id = a.teacher_id AND a.date = $1
             WHERE a.status = 'Present'`,
            [today]
        );

        // Get today's substitutions
        const substitutionsResult = await pool.query(
            `SELECT 
                s.*,
                at.name as absent_teacher_name,
                st.name as substitute_teacher_name
             FROM substitutions s
             JOIN teachers at ON s.absent_teacher_id = at.id
             JOIN teachers st ON s.substitute_teacher_id = st.id
             WHERE s.date = $1
             ORDER BY s.period_number`,
            [today]
        );

        // Get teacher workload summary
        const workloadResult = await pool.query(
            `SELECT 
                t.id,
                t.name,
                t.max_substitution_limit,
                COALESCE(COUNT(s.id), 0) as today_substitutions,
                t.current_substitution_count
             FROM teachers t
             LEFT JOIN substitutions s ON t.id = s.substitute_teacher_id AND s.date = $1
             GROUP BY t.id, t.name, t.max_substitution_limit, t.current_substitution_count
             ORDER BY today_substitutions DESC`,
            [today]
        );

        // Get statistics
        const stats = {
            total_teachers: await pool.query('SELECT COUNT(*) as count FROM teachers').then(r => parseInt(r.rows[0].count)),
            present_count: presentTeachersResult.rows.length,
            absent_count: absentTeachersResult.rows.length,
            substitutions_count: substitutionsResult.rows.length
        };

        res.json({
            date: today,
            day: day,
            stats: stats,
            absent_teachers: absentTeachersResult.rows,
            present_teachers: presentTeachersResult.rows,
            substitutions: substitutionsResult.rows,
            workload: workloadResult.rows
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};

module.exports = { getDashboard };