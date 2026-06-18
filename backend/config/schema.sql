CREATE DATABASE IF NOT EXISTS entitysys CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE entitysys;

-- ============================================================
-- CORE USER TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','faculty','student') NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  phone         VARCHAR(20),
  is_active     BOOLEAN DEFAULT TRUE,
  otp_code      VARCHAR(6),
  otp_expires_at TIMESTAMP NULL,
  otp_attempts   INT DEFAULT 0,
  reset_token    VARCHAR(255),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role  (role)
);


-- ============================================================
-- STUDENT PROFILE (extends users WHERE role='student')
-- ============================================================
CREATE TABLE IF NOT EXISTS student_profiles (
  id               INT PRIMARY KEY AUTO_INCREMENT,
  user_id          INT UNIQUE NOT NULL,
  enrollment_id    VARCHAR(50) UNIQUE NOT NULL,
  department       ENUM('CSE','EE','EC','Mechanical','Civil') NOT NULL,
  current_semester INT DEFAULT 1 CHECK (current_semester BETWEEN 1 AND 8),
  parent_phone     VARCHAR(20),
  address          TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- FACULTY PROFILE (extends users WHERE role='faculty')
-- ============================================================
CREATE TABLE IF NOT EXISTS faculty_profiles (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  user_id        INT UNIQUE NOT NULL,
  employee_id    VARCHAR(50) UNIQUE NOT NULL,
  department     ENUM('CSE','EE','EC','Mechanical','Civil') NOT NULL,
  sub_role       ENUM('Lecturer','Supervisor','Librarian','Other') NOT NULL DEFAULT 'Lecturer',
  sub_role_custom VARCHAR(100),  -- used when sub_role = 'Other'
  qualification  VARCHAR(255),
  joining_date   DATE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  course_code VARCHAR(20) UNIQUE NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  department  ENUM('CSE','EE','EC','Mechanical','Civil') NOT NULL,
  semester    INT CHECK (semester BETWEEN 1 AND 8),
  credits     INT DEFAULT 3,
  description TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_department (department)
);

-- ============================================================
-- STUDENT ENROLLMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  student_id      INT NOT NULL,
  course_id       INT NOT NULL,
  enrollment_date DATE DEFAULT (CURRENT_DATE),
  status          ENUM('active','dropped','completed') DEFAULT 'active',
  UNIQUE KEY unique_enrollment (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id)  REFERENCES courses(id) ON DELETE CASCADE
);

-- ============================================================
-- FACULTY COURSE ASSIGNMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS course_assignments (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  faculty_id    INT NOT NULL,
  course_id     INT NOT NULL,
  section       VARCHAR(10) DEFAULT 'A',
  academic_year VARCHAR(9) NOT NULL,  -- e.g. '2024-2025'
  UNIQUE KEY unique_assignment (faculty_id, course_id, academic_year),
  FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id)  REFERENCES courses(id) ON DELETE CASCADE
);

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
  id                  INT PRIMARY KEY AUTO_INCREMENT,
  student_id          INT NOT NULL,
  course_id           INT NOT NULL,
  date                DATE NOT NULL,
  status              ENUM('present','absent','late') NOT NULL,
  marked_by_faculty_id INT NOT NULL,
  remarks             VARCHAR(255),
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_attendance (student_id, course_id, date),
  FOREIGN KEY (student_id)           REFERENCES users(id),
  FOREIGN KEY (course_id)            REFERENCES courses(id),
  FOREIGN KEY (marked_by_faculty_id) REFERENCES users(id),
  INDEX idx_date       (date),
  INDEX idx_student    (student_id),
  INDEX idx_course_date (course_id, date)
);

-- ============================================================
-- EXAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS exams (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  course_id   INT NOT NULL,
  exam_name   VARCHAR(255) NOT NULL,
  exam_date   DATE NOT NULL,
  total_marks INT NOT NULL DEFAULT 100,
  exam_type   ENUM('midterm','final','quiz','assignment') DEFAULT 'midterm',
  created_by  INT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id)  REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================================
-- GRADES
-- ============================================================
CREATE TABLE IF NOT EXISTS grades (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  student_id     INT NOT NULL,
  exam_id        INT NOT NULL,
  marks_obtained DECIMAL(5,2),
  grade          VARCHAR(5),   -- e.g. 'A', 'B+', 'F'
  entered_by     INT NOT NULL,
  entered_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_grade (student_id, exam_id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (exam_id)    REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (entered_by) REFERENCES users(id)
);

-- ============================================================
-- FEE TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS fee_transactions (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  student_id   INT NOT NULL,
  amount       DECIMAL(10,2) NOT NULL,
  fee_type     ENUM('exam','tuition','library','other') NOT NULL,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status       ENUM('pending','paid','failed') DEFAULT 'pending',
  receipt_no   VARCHAR(50) UNIQUE,
  reference_id VARCHAR(100),  -- for payment gateway reference
  exam_id      INT NULL,      -- which exam this fee is for
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (exam_id)    REFERENCES exams(id) ON DELETE SET NULL,
  INDEX idx_student_fees (student_id)
);

-- ============================================================
-- NOTICES (real-time via Socket.io)
-- ============================================================
CREATE TABLE IF NOT EXISTS notices (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  title             VARCHAR(255) NOT NULL,
  content           TEXT NOT NULL,
  posted_by_user_id INT NOT NULL,
  target_role       ENUM('all','student','faculty') DEFAULT 'all',
  target_course_id  INT NULL,   -- NULL = college-wide
  is_archived       BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by_user_id) REFERENCES users(id),
  FOREIGN KEY (target_course_id)  REFERENCES courses(id) ON DELETE SET NULL,
  INDEX idx_archived   (is_archived),
  INDEX idx_created_at (created_at)
);

-- ============================================================
-- COURSE MATERIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS course_materials (
  id                  INT PRIMARY KEY AUTO_INCREMENT,
  course_id           INT NOT NULL,
  uploaded_by_faculty_id INT NOT NULL,
  title               VARCHAR(255) NOT NULL,
  file_url            VARCHAR(500) NOT NULL,
  file_type           ENUM('syllabus','notes','assignment','other') DEFAULT 'other',
  description         TEXT,
  uploaded_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id)             REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by_faculty_id) REFERENCES users(id)
);

-- ============================================================
-- SAMPLE DATA (3 students, 2 faculty, 5 courses)
-- ============================================================

-- Admin user (password: Admin@123)
-- INSERT INTO users (email, password_hash, role, full_name, phone) VALUES
-- ('admin@entitysys.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'System Administrator', '9876543210');
-- NOTE: Replace the hash above by running: node -e "const b=require('bcryptjs');console.log(b.hashSync('Admin@123',10))"

-- Faculty (password: Faculty@123)
-- INSERT INTO users (email, password_hash, role, full_name, phone) VALUES
-- ('prof.sharma@entitysys.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'faculty', 'Prof. Rajesh Sharma', '9876543211'),
-- ('prof.mehta@entitysys.com',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'faculty', 'Prof. Priya Mehta',   '9876543212');

-- INSERT INTO faculty_profiles (user_id, employee_id, department, sub_role, qualification, joining_date) VALUES
-- (2, 'FAC001', 'CSE', 'Lecturer',   'M.Tech CSE', '2020-07-01'),
-- (3, 'FAC002', 'CSE', 'Supervisor', 'Ph.D CS',    '2018-01-15');

-- Students (password: Student@123)
-- INSERT INTO users (email, password_hash, role, full_name, phone) VALUES
-- ('alice@student.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Alice Johnson', '9876543213'),
-- ('bob@student.com',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Bob Williams',  '9876543214'),
-- ('carol@student.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Carol Davis',   '9876543215');

-- INSERT INTO student_profiles (user_id, enrollment_id, department, current_semester) VALUES
-- (4, 'STU2024001', 'CSE', 3),
-- (5, 'STU2024002', 'CSE', 3),
-- (6, 'STU2024003', 'CSE', 5);

-- 5 Courses
-- INSERT INTO courses (course_code, course_name, department, semester, credits) VALUES
-- ('CS301', 'Data Structures & Algorithms', 'CSE', 3, 4),
-- ('CS302', 'Database Management Systems',  'CSE', 3, 4),
-- ('CS303', 'Operating Systems',            'CSE', 3, 3),
-- ('CS501', 'Machine Learning',             'CSE', 5, 4),
-- ('CS502', 'Computer Networks',            'CSE', 5, 3);

-- Assign faculty to courses
-- INSERT INTO course_assignments (faculty_id, course_id, section, academic_year) VALUES
-- (2, 1, 'A', '2024-2025'),
-- (2, 2, 'A', '2024-2025'),
-- (3, 3, 'A', '2024-2025'),
-- (3, 4, 'A', '2024-2025');

-- Enroll students
-- INSERT INTO enrollments (student_id, course_id) VALUES
-- (4, 1),(4, 2),(4, 3),
-- (5, 1),(5, 2),(5, 3),
-- (6, 4),(6, 5);