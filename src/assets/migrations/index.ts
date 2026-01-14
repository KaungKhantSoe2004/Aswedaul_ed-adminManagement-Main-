import { db } from "./../database/db_connection";
import { CreateGradeTable } from "./createGrade";

import { CreateMarkTable } from "./createMark";
import { CreateNoticeTable } from "./createNotice";
import { CreateSalaryTable } from "./createSalary";
import { createSubjectTable } from "./createSubject";
import { CreateExamTable } from "./createExam";
import { CreateExamResultsTable } from "./createExamResults";

async function createTables() {
  try {
    const tables: string[] = [
      CreateGradeTable,
      CreateMarkTable,
      CreateSalaryTable,
      createSubjectTable,
      CreateNoticeTable,
      CreateExamTable,
      CreateExamResultsTable,
    ];
    for (const query of tables) {
      console.log("creating Table Started");
      await db.query(query);

      console.log("Table created =>", query.split("(")[0]?.trim());
    }
    console.log("All tables created successfully!");
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

createTables();
