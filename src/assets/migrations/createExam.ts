export const CreateExamTable = `CREATE TABLE IF NOT EXISTS exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_name VARCHAR(255) NOT NULL,
  grade VARCHAR(50) NOT NULL,
  exam_type ENUM('midterm', 'final', 'quiz', 'unit_test') NOT NULL,
  exam_start_date DATE NOT NULL,
  exam_end_date DATE NOT NULL,
  created_by INT NOT NULL,
  status ENUM('scheduled', 'ongoing', 'completed') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;
