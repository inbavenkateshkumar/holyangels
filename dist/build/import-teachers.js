const pool = require('./config/database');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'teachers.json');
let teachersData = [];
try {
  const raw = fs.readFileSync(dataPath, 'utf8');
  teachersData = JSON.parse(raw);
  if (!Array.isArray(teachersData)) {
    throw new Error('Invalid data format: expected an array');
  }
} catch (err) {
  console.error('Error reading old dataset from data/teachers.json:', err.message);
  process.exit(1);
}

// Day mapping
const dayMap = {
  'Mon': 'Monday',
  'Tue': 'Tuesday',
  'Wed': 'Wednesday',
  'Thu': 'Thursday',
  'Fri': 'Friday'
};

async function importTeachers() {
  try {
    console.log('🔄 Starting import process...\n');

    // Start transaction
    await pool.query('BEGIN');

    // Step 1: Delete all existing timetables
    console.log('📋 Step 1: Clearing old timetables...');
    await pool.query('DELETE FROM timetables');
    console.log('✅ Old timetables deleted\n');

    // Step 2: Delete all existing teachers and reset sequence
    console.log('👥 Step 2: Clearing old teachers...');
    await pool.query('DELETE FROM teachers');
    await pool.query('ALTER SEQUENCE teachers_id_seq RESTART WITH 1');
    console.log('✅ Old teachers deleted\n');

    // Step 3: Insert new teachers and timetables
    console.log('➕ Step 3: Inserting new teachers and timetables...');
    
    for (const teacherData of teachersData) {
      // Insert teacher with specific ID
      await pool.query(
        `INSERT INTO teachers (id, name, subject, max_substitution_limit, current_substitution_count)
         VALUES ($1, $2, $3, $4, $5)`,
        [teacherData.id, teacherData.name, 'General', 3, 0]
      );

      // Insert timetable entries
      const schedule = teacherData.schedule;
      for (const [dayAbbr, periods] of Object.entries(schedule)) {
        const day = dayMap[dayAbbr];
        if (!day) continue;

        for (let periodNum = 0; periodNum < periods.length; periodNum++) {
          const className = periods[periodNum];
          if (className && className !== null) {
            // Period numbers are 1-indexed in database
            await pool.query(
              `INSERT INTO timetables (teacher_id, day, period_number, class_name, subject)
               VALUES ($1, $2, $3, $4, $5)`,
              [teacherData.id, day, periodNum + 1, className, 'General']
            );
          }
        }
      }

      console.log(`✅ Imported: ${teacherData.name} (ID: ${teacherData.id})`);
    }

    // Commit transaction
    await pool.query('COMMIT');

    console.log('\n🎉 Import completed successfully!');
    console.log(`📊 Total teachers imported: ${teachersData.length}`);
    
    // Count timetable entries
    const timetableCount = await pool.query('SELECT COUNT(*) as count FROM timetables');
    console.log(`📅 Total timetable entries: ${timetableCount.rows[0].count}`);

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Error during import:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run import
importTeachers()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });
