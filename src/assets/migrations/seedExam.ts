import { db } from './../database/db_connection';
import dotenv from "dotenv";
dotenv.config();






async function seedExams() {
  try {

    const SeedExams = `
     INSERT INTO exams 
(exam_name, grade, exam_type, exam_start_date, exam_end_date, created_by, status)
VALUES
('Mid Term Examination', '2', 'midterm', '2025-03-10', '2025-03-20', 1, 'scheduled'),
('Final Examination', '2', 'final', '2025-10-05', '2025-10-15', 1, 'scheduled');
`;


      await db.query(SeedExams);


    console.log("Exam table seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding salary data:", err);
    process.exit(1);
  }
}

seedExams();
