import { db } from './../database/db_connection.js';
import dotenv from "dotenv";

dotenv.config();

async function seedSubjects() {
  try {
    const subjectsSeedQuery = `
      INSERT INTO subjects (
        teacher_id,
        subject_name,
        grade_id,
        study_material_web,
        study_material_file,
        study_material_video,
        schedule
      ) VALUES
      (
        1,
        'Mathematics',
        2,
        ?,
        ?,
        ?,
        ?
      ),
      (
        2,
        'Science',
        2,
        ?,
        ?,
        ?,
        ?
      );
    `;

    const mathWeb = JSON.stringify([
      {
        title: "Basic Algebra",
        url: "https://example.com/algebra",
        description: "Introduction to algebra",
        type: "web"
      }
    ]);

    const mathFile = JSON.stringify([
      {
        title: "Algebra PDF",
        url: "/uploads/algebra.pdf",
        description: "Algebra study notes",
        type: "pdf"
      }
    ]);

    const mathVideo = JSON.stringify([
      {
        title: "Algebra Video Lesson",
        url: "https://youtube.com/watch?v=xxxx",
        description: "Video explanation of algebra",
        type: "video"
      }
    ]);

    const mathSchedule = JSON.stringify({
      day: "Monday",
      start_time: "09:00",
      end_time: "10:00"
    });

    const scienceWeb = JSON.stringify([
      {
        title: "Physics Basics",
        url: "https://example.com/physics",
        description: "Basic physics concepts",
        type: "web"
      }
    ]);

    const scienceFile = JSON.stringify([]);
    const scienceVideo = JSON.stringify([]);
    const scienceSchedule = JSON.stringify({
      day: "Wednesday",
      start_time: "11:00",
      end_time: "12:00"
    });

    await db.query(subjectsSeedQuery, [
      mathWeb,
      mathFile,
      mathVideo,
      mathSchedule,
      scienceWeb,
      scienceFile,
      scienceVideo,
      scienceSchedule
    ]);

    console.log("Subjects table seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding subjects:", err);
    process.exit(1);
  }
}

seedSubjects();
