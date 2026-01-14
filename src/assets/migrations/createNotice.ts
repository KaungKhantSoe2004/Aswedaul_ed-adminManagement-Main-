export const CreateNoticeTable = `CREATE TABLE IF NOT EXISTS notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50),
    message LONGTEXT NOT NULL,
    user_role VARCHAR(50),
    grade_id VARCHAR(20),
    authorization ENUM(
        'all_users',
        'students',
        'teachers',
        'managers',
        'guideTeachers'
    ) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
)`;
