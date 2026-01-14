export const CreateMarkTable = `CREATE TABLE IF NOT EXISTS marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    student_id INT NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    grade_id INT NULL,
    max_mark INT NOT NULL,
    min_mark INT NOT NULL,
    get_mark INT NOT NULL,
    exam_id INT NOT NULL,
    teacher_id INT NOT NULL,
    academic_year VARCHAR(9) NOT NULL DEFAULT (YEAR(CURRENT_DATE)),
    note TEXT NULL,
    is_passed BOOLEAN GENERATED ALWAYS AS (get_mark >= min_mark) STORED,
    status ENUM('completed', 'in_process', "marked"),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  
);
`;
