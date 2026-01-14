export const CreateGradeTable = `CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,

    grade_name VARCHAR(50) NOT NULL,

    teacher_count INT DEFAULT 0,
    student_count INT DEFAULT 0,
    guide_teacher_count INT DEFAULT 0,
    grade_manager_count INT DEFAULT 0,

    upcoming_exam_date DATE NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

`;
