const pool = require('../config/database');

// Get all teachers
const getAllTeachers = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM teachers ORDER BY name'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get teachers error:', error);
        res.status(500).json({ error: 'Failed to fetch teachers' });
    }
};

// Get single teacher
const getTeacherById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM teachers WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get teacher error:', error);
        res.status(500).json({ error: 'Failed to fetch teacher' });
    }
};

// Create new teacher
const createTeacher = async (req, res) => {
    try {
        const { name, subject, phone, email, max_substitution_limit } = req.body;

        if (!name || !subject) {
            return res.status(400).json({ error: 'Name and subject are required' });
        }

        const result = await pool.query(
            'INSERT INTO teachers (name, subject, phone, email, max_substitution_limit) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, subject, phone || null, email || null, max_substitution_limit || 3]
        );

        res.status(201).json({
            message: 'Teacher created successfully',
            teacher: result.rows[0]
        });
    } catch (error) {
        console.error('Create teacher error:', error);
        res.status(500).json({ error: 'Failed to create teacher' });
    }
};

// Update teacher
const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, subject, phone, email, max_substitution_limit } = req.body;

        const result = await pool.query(
            'UPDATE teachers SET name = COALESCE($1, name), subject = COALESCE($2, subject), phone = COALESCE($3, phone), email = COALESCE($4, email), max_substitution_limit = COALESCE($5, max_substitution_limit) WHERE id = $6 RETURNING *',
            [name, subject, phone, email, max_substitution_limit, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        res.json({
            message: 'Teacher updated successfully',
            teacher: result.rows[0]
        });
    } catch (error) {
        console.error('Update teacher error:', error);
        res.status(500).json({ error: 'Failed to update teacher' });
    }
};

// Delete teacher
const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query('DELETE FROM teachers WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        res.json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        console.error('Delete teacher error:', error);
        res.status(500).json({ error: 'Failed to delete teacher' });
    }
};

// Reset substitution count (for new day)
const resetSubstitutionCounts = async (req, res) => {
    try {
        await pool.query('UPDATE teachers SET current_substitution_count = 0');
        res.json({ message: 'Substitution counts reset successfully' });
    } catch (error) {
        console.error('Reset counts error:', error);
        res.status(500).json({ error: 'Failed to reset substitution counts' });
    }
};

module.exports = {
    getAllTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    resetSubstitutionCounts
};