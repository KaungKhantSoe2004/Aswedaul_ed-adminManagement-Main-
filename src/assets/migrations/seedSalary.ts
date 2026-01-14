import { db } from './../database/db_connection';
import dotenv from "dotenv";


dotenv.config();

interface SalarySeed {
  user_id: number;
  userType: string;
  monthly_salary: number;
  bonus: number;
  deductions: number;
  net_salary: number;
  pay_month: string; // YYYY-MM-DD
  remarks?: string;
}

const salaryData: SalarySeed[] = [];

// User types rotation
const userTypes = ["teacher", "guideTeacher", "gradeManager"];

// Three months to generate
const months = ["2025-01-01", "2025-02-01", "2025-03-01"];

// Generate 30 rows
for (let i = 0; i < months.length; i++) {
  for (let userId = 1; userId <= 9; userId++) {
    const userType = userTypes[(userId - 1) % userTypes.length];

    const monthly_salary =
      userType === "teacher"
        ? 1200
        : userType === "guideTeacher"
        ? 1300
        : 1500;

    const bonus = 50 + Math.floor(Math.random() * 30); // 50–80
    const deductions = 10 + Math.floor(Math.random() * 20); // 10–30
    const net_salary = monthly_salary + bonus - deductions;

    salaryData.push({
      user_id: userId,
      userType,
      monthly_salary,
      bonus,
      deductions,
      net_salary,
      pay_month: months[i],
      remarks: `${months[i]} salary`,
    });
  }
}

async function seedSalaryPayments() {
  try {
    for (const row of salaryData) {
      const query = `
        INSERT INTO salary_payments 
        (user_id, userType, monthly_salary, bonus, deductions, net_salary, pay_month, remarks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        row.user_id,
        row.userType,
        row.monthly_salary,
        row.bonus,
        row.deductions,
        row.net_salary,
        row.pay_month,
        row.remarks,
      ];

      await db.query(query, values);

      console.log(
        `Inserted salary row for user_id=${row.user_id}, month=${row.pay_month}`
      );
    }

    console.log("Salary table seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding salary data:", err);
    process.exit(1);
  }
}

seedSalaryPayments();
