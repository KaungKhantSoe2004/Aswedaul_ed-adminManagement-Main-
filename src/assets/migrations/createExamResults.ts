export const CreateExamResultsTable = `CREATE TABLE IF NOT EXISTS exam_results (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT UNSIGNED NOT NULL,
    student_id BIGINT UNSIGNED NOT NULL,
    total_got_marks DECIMAL(6,2) NOT NULL,
    full_marks DECIMAL(6,2) NOT NULL,
    grade_id BIGINT UNSIGNED NOT NULL,
    rank_position INT UNSIGNED NULL,
    result_status ENUM('pass', 'fail', 'absent') 
        NOT NULL DEFAULT 'fail',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP
)
`;