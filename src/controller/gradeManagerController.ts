import axios from "axios";
import { Request, Response } from "express";
import { db } from "../assets/database/db_connection";
import { RowDataPacket } from "mysql2";
import { getUserName, getUserNameWithout } from "./teacherController";


export const getManagerDashboard = async(req: Request, res: Response)=> {
try{
    const backend_domain_name = process.env.BACKEND_DOMAIN_NAME;   
    const token = req.cookies?.aswedaul_ed_jwt;
    const gradeId = req.params.gradeId;

    const noticeBoardQuery = `SELECT * FROM notices WHERE grade = ? ORDER BY created_at DESC LIMIT 5`;
    const response =  await axios.get(`${backend_domain_name}api/admissions/getAdmissionDashboard/${gradeId}`, {
        headers: {
            Cookie: `aswedaul_ed_jwt=${token}`
        }
    });
    const notice =await db.query(noticeBoardQuery, [gradeId]);
    res.status(200).json({notice: notice[0], dashboard: response.data})
}catch(err){
    console.log("enter cach")
    console.log(err, 'is err');
    res.status(500).json({message: "Internal Server error"});
}
    // console.log(response.data, 'is response data');
    

}
export const getAdmissionStatus = async (req: Request, res: Response)=> {
    try{
        const {grade_id} = req.params;
        const query = `SELECT * FROM grades WHERE id = ?`;
        const [rows] = await db.execute<RowDataPacket[]>(query ,[grade_id]);
        if(rows.length !== 0){
         res.status(200).json({
            message: "Success", 
            data: rows[0].admission_status
        })
        }

    }catch(err){
        res.status(500).json({
            message: "Internal Server Error Occureds"
        })
    }
}
export const updateAdmissionStatus = async(req: Request, res: Response)=> {
    try{
          const {grade_id, status}= req.body;
          const query = `UPDATE grades SET admission_status = ? WHERE id = ?`;
          const updated = db.execute<RowDataPacket[]>(query, [status, grade_id]);
          res.status(200).json({
            message: "Success"
          })
    }catch(error){
        res.status(500).json({
            message: "Internal Server Error Occured"
        })
    }
}

export const getMarksByGrade = async (req: Request, res: Response) => {
  try {
    const { grade_id } = req.params;

    const examQuery = `
      SELECT * FROM exams 
      WHERE grade = ? AND status = 'marked' 
      ORDER BY exam_end_date ASC 
      LIMIT 1
    `;

    const [examRows] = await db.execute<RowDataPacket[]>(examQuery, [grade_id]);
    if (!examRows.length) {
      return res.status(404).json({ message: "No marked exam found" });
    }

    const prevExam = examRows[0];

    const markQuery = `
      SELECT 
        er.student_id,
        er.total_got_marks,
        er.result_status,
        s.subject_name,
        m.get_mark
      FROM exam_results er
      JOIN marks m ON m.student_id = er.student_id
      JOIN subjects s ON m.subject_id = s.id
      WHERE er.exam_id = ?
        AND m.exam_id = ?
        AND m.grade_id = ?
    `;

    const [rows] = await db.execute<RowDataPacket[]>(
      markQuery,
      [prevExam.id, prevExam.id, grade_id]
    );

    const studentMap: Record<number, any> = {};

    for (const row of rows) {
      if (!studentMap[row.student_id]) {
        studentMap[row.student_id] = {
          student_id: row.student_id,
          total_got_marks: row.total_got_marks,
          result: row.result_status,
          subjects: {},
        };
      }

      studentMap[row.student_id].subjects[row.subject_name] = row.get_mark;
    }

    const data = await Promise.all(
      Object.values(studentMap).map(async (student: any) => {
        const student_name = await getUserNameWithout(student.student_id);

        return {
          student_id: student.student_id,
          student_name,
          total_got_marks: student.total_got_marks,
          result: student.result,
          ...student.subjects,
        };
      })
    );

    res.status(200).json({
      message: "Success",
      exam: prevExam,
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
