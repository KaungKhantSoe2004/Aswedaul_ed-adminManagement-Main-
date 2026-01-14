import { User } from './../assets/typescript/types';
import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import { db } from "../assets/database/db_connection";
import { getUserName } from "./teacherController";
import axios from "axios";

export const getDashboard = async(req: Request, res: Response)=> {
    try {
     const {grade_id} = req.params;   
     const token = req.cookies?.aswedaul_ed_jwt;
     console.log(grade_id,'is grade_id');
     const lastExamQuery = `SELECT * FROM exams WHERE grade = ? AND exam_start_date >= CURDATE() ORDER BY exam_start_date ASC`;
     const [upcomingExamRows] = await db.execute<RowDataPacket[]>(lastExamQuery, [grade_id]); 
     const upcomingExams = upcomingExamRows;
     const noticeBoardQuery = `SELECT * FROM notices WHERE grade = ? ORDER BY created_at DESC LIMIT 10`;
     const [ noticesRows] = await db.execute<RowDataPacket[]>(noticeBoardQuery, [grade_id]);
     const updatedNoticeRows = await Promise.all(
      noticesRows.map(async (notice) => {
        const name = await getUserName(notice.user_id, token);
        return { ...notice , author: name }; // add the name to the object
      })
    );
     const notices = noticesRows;
     res.status(200).json({
        message: "Success",
        data: {
            upcomingExams, notices: updatedNoticeRows,
        }
     })
    }catch(err){
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}


export const getMarksByStudent = async(req: Request, res:Response)=> {
    try{
      const  {grade_id, student_id} = req.params;
      const examQuery = `SELECT * FROM exams WHERE grade = ? AND status = 'marked'`;
      const [examRows] = await db.execute<RowDataPacket[]>(examQuery, [grade_id]);
      if(examRows){
          await Promise.all(
            examRows.map(async(exam) => {
                 const examResulQuery = `SELECT * FROM exam_results WHERE exam_id = ? `;
                 const markQuery = `SELECT m.* , s.subject_name as subject_name FROM marks m JOIN subjects s ON m.subject_id = s.id WHERE m.grade_id = ? AND exam_id = ?`;
                 const [ examResultRows] = await db.execute<RowDataPacket[]>(examResulQuery, [exam.id]);
                 const [markRows] = await db.execute<RowDataPacket[]>(markQuery, [grade_id, exam.id]);
                 exam.result = examResultRows || null;
                 exam.marks = markRows || [];
                })
          )
      }
      console.log(examRows, 'is examRows')
      res.status(200).json({
        message: "Success",
        data: examRows
      })
    }catch(err){
        console.log(err, 'is error in getMarks')
        res.status(500).json({
            message: "Internal Server Error "
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
        st.name AS student_name,
        er.total_marks,
        er.status,
        s.subject_name,
        m.mark
      FROM exam_results er
      JOIN students st ON er.student_id = st.id
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

    const results = Object.values(
      rows.reduce((acc: any, row: any) => {
        if (!acc[row.student_id]) {
          acc[row.student_id] = {
            student_id: row.student_id,
            student_name: row.student_name,
            total_marks: row.total_marks,
            result: row.status,
          };
        }

        acc[row.student_id][row.subject_name] = row.mark;
        return acc;
      }, {})
    );

    res.status(200).json({
      message: "Success",
      exam: prevExam,
      data: results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const RequestAbsence = async(req: Request, res: Response)=> {
  try{
    const {grade_id} = req.params;
    
  }catch(err){
    res.status(500).json({
      message: "Internal Server Error"
    })
  }
}

export const getGradeEnv = async(req: Request, res: Response)=> {
  try{
    const backend_domain_name = process.env.BACKEND_DOMAIN_NAME;
     const {grade_id} = req.params;


     const response = await axios.get(`${backend_domain_name}api/user/getGradeUsers/${grade_id}`);
     if(response.status == 200){
       const userRows = response.data.data;
       const studentRows = (userRows as User[]).filter((eachUser : User) => eachUser.role == "student");
       const teacherRows = (userRows as User[]).filter((eachUser: User) => eachUser.role == "teacher");
       const managerRows = (userRows as User[]).filter((eachUser: User) => eachUser.role == "manager");  
       const subjectQuery = `SELECT * FROM subjects WHERE grade_id = ?`;
       const [subjectRows] = await db.query(subjectQuery, [grade_id]);
       res.status(200).json({
        message: "Success", 
        data: {
          students: studentRows,
          teachers: teacherRows,
          managers: managerRows,
          subjects: subjectRows
        }
       })
       
     }

  }catch(err){
       console.log(err, 'is error')
       res.status(500).json(
        {
          message: "Internal Server Error Occured"
        }
       )
  }
}