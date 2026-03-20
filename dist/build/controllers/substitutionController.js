const pool = require('../config/database');

/**
 * SUBSTITUTION LOGIC EXPLANATION:
 * 
 * For each absent teacher on a given date:
 * 1. Find their periods for that day (from timetables)
 * 2. For each period:
 *    a. Find available substitute teachers who:
 *       - Are marked as Present
 *       - Have a free period at that time (not in timetables for that day/period)
 *       - Have not exceeded their substitution limit
 *    b. Select the teacher with:
 *       - Lowest current substitution count (fair distribution)
 *       - Lowest substitution count as tiebreaker
 *    c. Assign substitution and increment their count
 * 3. Create notification for substitute teacher
 */

// Main substitution assignment function
const assignSubstitutions = async (req, res) => {
    try {
        const { date, day } = req.body;

        if (!date || !day) {
            return res.status(400).json({ error: 'Date and day are required' });
        }

        // Start transaction
        await pool.query('BEGIN');

        try {
            // Step 1: Get all absent teachers for the date
            const absentTeachersResult = await pool.query(
                `SELECT t.* FROM teachers t
                 WHERE t.id IN (
                    SELECT teacher_id FROM attendance 
                    WHERE date = $1 AND status = 'Absent'
                 )`,
                [date]
            );

            const absentTeachers = absentTeachersResult.rows;

            if (absentTeachers.length === 0) {
                await pool.query('COMMIT');
                return res.json({ message: 'No absent teachers found', substitutions: [] });
            }

            const substitutions = [];

            // Step 2: Process each absent teacher
            for (const absentTeacher of absentTeachers) {
                // Get all periods for this teacher on this day
                const periodsResult = await pool.query(
                    'SELECT * FROM timetables WHERE teacher_id = $1 AND day = $2 ORDER BY period_number',
                    [absentTeacher.id, day]
                );

                const periods = periodsResult.rows;

                // Step 3: Assign substitute for each period
                for (const period of periods) {
                    // Find available substitute teachers
                    const substitutesResult = await pool.query(
                        `SELECT 
                            te.*,
                            COUNT(s.id) as current_sub_count,
                            (
                                (SELECT COUNT(*) FROM timetables t2 WHERE t2.teacher_id = te.id AND t2.day = $3 AND t2.period_number IN ($4 - 1, $4 + 1)) +
                                (SELECT COUNT(*) FROM substitutions s2 WHERE s2.substitute_teacher_id = te.id AND s2.date = $1 AND s2.period_number IN ($4 - 1, $4 + 1))
                            ) as adjacent_load
                         FROM teachers te
                         LEFT JOIN substitutions s ON s.substitute_teacher_id = te.id AND s.date = $1
                         WHERE 
                            te.id != $2 -- Not the absent teacher
                            AND te.id != 29 -- Exclude Sr. Maggie (Principal)
                            AND te.id NOT IN (
                                SELECT teacher_id FROM timetables 
                                WHERE day = $3 AND period_number = $4
                            ) -- Has free period
                            AND te.id NOT IN (
                                SELECT substitute_teacher_id FROM substitutions 
                                WHERE date = $1 AND period_number = $4
                            ) -- Not already substituting in this period
                            AND te.id IN (
                                SELECT teacher_id FROM attendance 
                                WHERE date = $1 AND status = 'Present'
                            ) -- Is present
                            AND (
                                SELECT COUNT(*) FROM substitutions 
                                WHERE substitute_teacher_id = te.id AND date = $1
                            ) < te.max_substitution_limit -- Within limit
                         GROUP BY te.id
                         ORDER BY adjacent_load ASC, current_sub_count ASC, te.current_substitution_count ASC
                         LIMIT 1`,
                        [date, absentTeacher.id, day, period.period_number]
                    );

                    if (substitutesResult.rows.length === 0) {
                        // No substitute available
                        substitutions.push({
                            absent_teacher: absentTeacher.name,
                            period: period.period_number,
                            class: period.class_name,
                            status: 'No substitute available'
                        });
                        continue;
                    }

                    const substitute = substitutesResult.rows[0];

                    // Create substitution record
                    const subResult = await pool.query(
                        `INSERT INTO substitutions 
                         (absent_teacher_id, substitute_teacher_id, class_name, subject, period_number, day, date)
                         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                        [
                            absentTeacher.id,
                            substitute.id,
                            period.class_name,
                            period.subject,
                            period.period_number,
                            day,
                            date
                        ]
                    );

                    // Increment substitution count for the substitute teacher
                    await pool.query(
                        'UPDATE teachers SET current_substitution_count = current_substitution_count + 1 WHERE id = $1',
                        [substitute.id]
                    );

                    // Create notification
                    const notificationMessage = `You have been assigned to substitute for ${absentTeacher.name} in ${period.class_name} (${period.subject}) during Period ${period.period_number} on ${day}`;
                    
                    await pool.query(
                        `INSERT INTO notifications (teacher_id, substitution_id, message, type)
                         VALUES ($1, $2, $3, $4)`,
                        [substitute.id, subResult.rows[0].id, notificationMessage, 'substitution_assignment']
                    );

                    substitutions.push({
                        id: subResult.rows[0].id,
                        absent_teacher: absentTeacher.name,
                        substitute_teacher: substitute.name,
                        class: period.class_name,
                        subject: period.subject,
                        period: period.period_number,
                        day: day,
                        status: 'Assigned'
                    });
                }
            }

            await pool.query('COMMIT');

            res.json({
                message: 'Substitutions assigned successfully',
                substitutions: substitutions
            });
        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Assign substitutions error:', error);
        res.status(500).json({ error: 'Failed to assign substitutions', details: error.message });
    }
};

// Get substitutions for a date
const getSubstitutionsByDate = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        const result = await pool.query(
            `SELECT 
                s.*,
                at.name as absent_teacher_name,
                st.name as substitute_teacher_name
             FROM substitutions s
             JOIN teachers at ON s.absent_teacher_id = at.id
             JOIN teachers st ON s.substitute_teacher_id = st.id
             WHERE s.date = $1
             ORDER BY s.period_number`,
            [date]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get substitutions error:', error);
        res.status(500).json({ error: 'Failed to fetch substitutions' });
    }
};

// Get all substitutions
const getAllSubstitutions = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                s.*,
                at.name as absent_teacher_name,
                st.name as substitute_teacher_name
             FROM substitutions s
             JOIN teachers at ON s.absent_teacher_id = at.id
             JOIN teachers st ON s.substitute_teacher_id = st.id
             ORDER BY s.date DESC, s.period_number`
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get all substitutions error:', error);
        res.status(500).json({ error: 'Failed to fetch substitutions' });
    }
};

// Delete substitution
const deleteSubstitution = async (req, res) => {
    try {
        const { id } = req.params;

        // Get substitution details before deletion
        const subResult = await pool.query('SELECT * FROM substitutions WHERE id = $1', [id]);

        if (subResult.rows.length === 0) {
            return res.status(404).json({ error: 'Substitution not found' });
        }

        const substitution = subResult.rows[0];

        await pool.query('BEGIN');

        try {
            // Decrement substitution count
            await pool.query(
                'UPDATE teachers SET current_substitution_count = GREATEST(0, current_substitution_count - 1) WHERE id = $1',
                [substitution.substitute_teacher_id]
            );

            // Delete substitution
            await pool.query('DELETE FROM substitutions WHERE id = $1', [id]);

            await pool.query('COMMIT');

            res.json({ message: 'Substitution deleted successfully' });
        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Delete substitution error:', error);
        res.status(500).json({ error: 'Failed to delete substitution' });
    }
};

module.exports = {
    assignSubstitutions,
    getSubstitutionsByDate,
    getAllSubstitutions,
    deleteSubstitution
};