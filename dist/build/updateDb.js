const pool = require('./config/database');
require('dotenv').config();

async function updateTeachers() {
    try {
        console.log('🔄 Updating teacher information...\n');

        // New teacher data
        const teachers = [
            { id: 1, name: 'Baby', subject: 'Tamil', phone: '9876543210', email: 'baby@school.com' },
            { id: 2, name: 'Subathra Devi', subject: 'English', phone: '9876543211', email: 'subathra@school.com' },
            { id: 3, name: 'Meenachi', subject: 'Mathematics', phone: '9876543212', email: 'meenachi@school.com' },
            { id: 4, name: 'Partha', subject: 'Physics', phone: '9876543213', email: 'partha@school.com' },
            { id: 5, name: 'Venkatachalam', subject: 'Chemistry', phone: '9876543214', email: 'venkat@school.com' },
            { id: 6, name: 'Gokul', subject: 'English', phone: '9876543215', email: 'gokul@school.com' },
            { id: 7, name: 'Bhuvaneshwari', subject: 'Tamil', phone: '9876543216', email: 'bhuvana@school.com' }
        ];

        // Clear existing teachers and related data
        console.log('🗑️  Clearing existing teacher data...');
        await pool.query('DELETE FROM notifications');
        await pool.query('DELETE FROM substitutions');
        await pool.query('DELETE FROM attendance');
        await pool.query('DELETE FROM timetables');
        await pool.query('DELETE FROM teachers');
        console.log('✅ Cleared all teacher related data\n');

        // Insert new teachers
        console.log('➕ Inserting new teachers:');
        for (const teacher of teachers) {
            await pool.query(
                'INSERT INTO teachers (id, name, subject, phone, email, max_substitution_limit) VALUES ($1, $2, $3, $4, $5, $6)',
                [teacher.id, teacher.name, teacher.subject, teacher.phone, teacher.email, 3]
            );
            console.log(`  ✅ ${teacher.name} - ${teacher.subject}`);
        }

        console.log('\n✅ All teachers updated successfully!\n');
        console.log('Updated Teachers:');
        console.log('─────────────────────────────────────────');
        console.log('1. Baby                - Tamil');
        console.log('2. Subathra Devi       - English');
        console.log('3. Meenachi            - Mathematics');
        console.log('4. Partha              - Physics');
        console.log('5. Venkatachalam       - Chemistry');
        console.log('6. Gokul               - English');
        console.log('7. Bhuvaneshwari       - Tamil');
        console.log('─────────────────────────────────────────\n');

        console.log('📋 Now loading timetables for all days...');
    } catch (error) {
        console.error('❌ Database update failed:', error.message);
        process.exit(1);
    }
}

updateDatabase();
