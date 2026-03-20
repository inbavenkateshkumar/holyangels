/**
 * Import Timetables from JSON to Database
 * 
 * This script reads the timetable JSON data and populates the timetables table
 * with proper mapping:
 * - Days: Mon→Monday, Tue→Tuesday, Wed→Wednesday, Thu→Thursday, Fri→Friday
 * - Period indices: 0→1, 1→2, 2→3, 3→4, 4→5, 5→6, 6→7, 7→8
 * - null values indicate free periods (skipped)
 */

const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

// Day mapping
const dayMapping = {
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday'
};

async function importTimetables() {
    try {
        console.log('📚 Starting timetable import...\n');

        // Read the timetable JSON file
        const filePath = path.join(__dirname, 'data', 'teachers.json');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const timetableData = JSON.parse(fileContent);

        console.log(`✓ Loaded ${timetableData.length} teachers from JSON\n`);

        // Clear existing timetables (optional - comment out to preserve existing data)
        // await pool.query('DELETE FROM timetables');
        // console.log('✓ Cleared existing timetables\n');

        let totalInserted = 0;
        let totalSkipped = 0;

        // Process each teacher
        for (const teacher of timetableData) {
            const teacherId = teacher.id;
            const teacherName = teacher.name;
            const schedule = teacher.schedule;

            console.log(`Processing: ${teacherName} (ID: ${teacherId})`);

            // Ensure teacher exists in database
            const teacherExists = await pool.query(
                'SELECT id FROM teachers WHERE id = $1',
                [teacherId]
            );

            if (teacherExists.rows.length === 0) {
                console.log(`  ⚠ Teacher not found in database. Creating...`);
                // Insert teacher with minimal info (subject required by schema)
                await pool.query(
                    'INSERT INTO teachers (id, name, subject) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
                    [teacherId, teacherName, 'General']
                );
            }

            // Process each day's schedule
            for (const [dayShort, periods] of Object.entries(schedule)) {
                const dayFull = dayMapping[dayShort];

                // Process each period
                for (let periodIndex = 0; periodIndex < periods.length; periodIndex++) {
                    const className = periods[periodIndex];

                    // Skip free periods (null values)
                    if (className === null) {
                        totalSkipped++;
                        continue;
                    }

                    const periodNumber = periodIndex + 1; // Convert 0-based index to 1-based period

                    try {
                        // Insert or update timetable entry
                        await pool.query(
                            `INSERT INTO timetables (teacher_id, day, period_number, class_name, subject)
                             VALUES ($1, $2, $3, $4, $5)
                             ON CONFLICT (teacher_id, day, period_number) 
                             DO UPDATE SET class_name = $4, subject = $5`,
                            [teacherId, dayFull, periodNumber, className, 'General']
                        );

                        totalInserted++;
                    } catch (err) {
                        console.error(`  ✗ Error inserting ${dayFull} Period ${periodNumber}: ${err.message}`);
                    }
                }
            }

            console.log(`  ✓ Processed ${teacherName}`);
        }

        console.log(`\n✅ Import Complete!`);
        console.log(`   Total entries inserted: ${totalInserted}`);
        console.log(`   Free periods skipped: ${totalSkipped}`);

        // Verify the import
        const verification = await pool.query(`
            SELECT COUNT(*) as total_entries, 
                   COUNT(DISTINCT teacher_id) as total_teachers,
                   COUNT(DISTINCT day) as total_days
            FROM timetables
        `);

        const stats = verification.rows[0];
        console.log(`\n📊 Database Verification:`);
        console.log(`   Total timetable entries: ${stats.total_entries}`);
        console.log(`   Total teachers with schedules: ${stats.total_teachers}`);
        console.log(`   Total days covered: ${stats.total_days}`);

        // Sample data display
        console.log(`\n📋 Sample Timetable (First 10 entries):`);
        const sample = await pool.query(`
            SELECT t.teacher_id, te.name, t.day, t.period_number, t.class_name
            FROM timetables t
            JOIN teachers te ON t.teacher_id = te.id
            ORDER BY t.teacher_id, 
                     CASE t.day 
                        WHEN 'Monday' THEN 1 
                        WHEN 'Tuesday' THEN 2 
                        WHEN 'Wednesday' THEN 3 
                        WHEN 'Thursday' THEN 4 
                        WHEN 'Friday' THEN 5 
                     END,
                     t.period_number
            LIMIT 10
        `);

        sample.rows.forEach(row => {
            console.log(`   ${row.name} → ${row.day} Period ${row.period_number}: Class ${row.class_name}`);
        });

        console.log(`\n✨ Free period analysis:`);
        const freePeriods = await pool.query(`
            SELECT te.name, COUNT(*) as free_periods_per_week
            FROM teachers te
            CROSS JOIN (
                SELECT DISTINCT day FROM (VALUES 
                    ('Monday'), ('Tuesday'), ('Wednesday'), ('Thursday'), ('Friday')
                ) AS days(day)
            ) days
            CROSS JOIN (
                SELECT generate_series(1, 8) as period_number
            ) periods
            LEFT JOIN timetables t ON te.id = t.teacher_id 
                AND t.day = days.day 
                AND t.period_number = periods.period_number
            WHERE t.id IS NULL
            GROUP BY te.id, te.name
            ORDER BY free_periods_per_week DESC
            LIMIT 5
        `);

        console.log(`   Teachers with most free periods:`);
        freePeriods.rows.forEach(row => {
            console.log(`   ${row.name}: ${row.free_periods_per_week} free periods/week`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error during import:', error);
        process.exit(1);
    }
}

// Run the import
importTimetables();
