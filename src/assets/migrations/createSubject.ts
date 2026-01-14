export const createSubjectTable = `CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id int,
    subject_name VARCHAR(255) NOT NULL,
    grade_id int,

    study_material_web JSON NULL,
    study_material_file JSON NULL,
    study_material_video JSON NULL,

    schedule JSON NULL,

    academic_year VARCHAR(9) NOT NULL DEFAULT (YEAR(CURRENT_DATE)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

);

`;
