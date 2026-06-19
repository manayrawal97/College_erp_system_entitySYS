const pool = require('./backend/config/db.config');
async function run() {
  try {
    console.log('Clearing old assignments and enrollments...');
    await pool.query('DELETE FROM course_assignments');
    await pool.query('DELETE FROM enrollments');

    console.log('Inserting course assignments for Faculty ID 2 (Dr. Rajesh Kumar)...');
    await pool.query(`
      INSERT INTO course_assignments (faculty_id, course_id, section, academic_year) VALUES
      (2, 1, 'A', '2024-2025'),
      (2, 2, 'A', '2024-2025'),
      (2, 3, 'A', '2024-2025')
    `);

    console.log('Inserting course assignments for Faculty ID 10 (Dr. V. Narayanan)...');
    await pool.query(`
      INSERT INTO course_assignments (faculty_id, course_id, section, academic_year) VALUES
      (10, 4, 'A', '2024-2025'),
      (10, 5, 'A', '2024-2025')
    `);

    console.log('Enrolling students in courses...');
    // CS301, CS302, CS303 (for students 3, 5, 6)
    // CS501, CS502 (for students 6, 8, 12, 13)
    await pool.query(`
      INSERT INTO enrollments (student_id, course_id, status) VALUES
      (3, 1, 'active'), (3, 2, 'active'), (3, 3, 'active'),
      (5, 1, 'active'), (5, 2, 'active'), (5, 3, 'active'),
      (6, 1, 'active'), (6, 2, 'active'), (6, 3, 'active'),
      (6, 4, 'active'), (6, 5, 'active'),
      (8, 4, 'active'), (8, 5, 'active'),
      (12, 4, 'active'), (12, 5, 'active'),
      (13, 4, 'active'), (13, 5, 'active')
    `);

    console.log('✅ Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    pool.end();
  }
}
run();
