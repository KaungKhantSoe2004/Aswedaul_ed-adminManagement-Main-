import { MarkRequest, User } from './../assets/typescript/types';
import axios from 'axios';
import { Request, Response } from "express";
import { db } from "../assets/database/db_connection";
import { QueryResult, RowDataPacket } from "mysql2";

const backend_domain_name = process.env.BACKEND_DOMAIN_NAME;

export const DirectTeacherDashboard = async(req: Request, res:Response)=> {
try{
    const {teacher_id , grade_id} = req.params;

    const subjectsCountQuery = `SELECT * FROM subjects WHERE teacher_id = ?`;
    const [rows] = await db.execute<RowDataPacket[]>(subjectsCountQuery , [teacher_id]);
    const subjects = rows;

    const noticeBoardQuery = `SELECT * FROM notices WHERE grade = ? ORDER BY created_at DESC LIMIT 5`;
    const [ noticesRows] = await db.execute<RowDataPacket[]>(noticeBoardQuery, [grade_id]);
    const notices = noticesRows;
    res.status(200).json({
        message: "Success",
        data: {
           subjects, 
           notices
        }
    })

}catch(err){
    console.log(err, 'is err');
    res.status(200).json({
        message: "Internal Server Error occured",
        data: err
    })
}
}

export const DirectSubjectList = async(req: Request, res:Response)=> {
try{
    const {teacher_id , grade_id} = req.params;

    const subjectsCountQuery = `SELECT * FROM subjects WHERE teacher_id = ?`;
    const [rows] = await db.execute<RowDataPacket[]>(subjectsCountQuery , [teacher_id]);
    const subjects = rows;
    const lastExamQuery = `SELECT * FROM exams WHERE grade = ? AND exam_start_date >= CURDATE() ORDER BY exam_start_date ASC LIMIT 1 `;
    const [upcomingExamRows] = await db.execute<RowDataPacket[]>(lastExamQuery, [grade_id]); 
    const upcomingExam = upcomingExamRows;
    res.status(200).json({
        message: "Success",
        data: {
            subjects, upcomingExam, 
        }
    })

}catch(err){
    console.log(err, 'is err');
    res.status(200).json({
        message: "Internal Server Error occured",
        data: err
    })
}
}

export const DirectSubjectInfo = async(req: Request, res:Response)=> {
try{
    const { grade_id, subject_id} = req.params;
    const materialsCountQuery = `SELECT study_material_web , study_material_video, study_material_file FROM subjects WHERE id =?`;
    const [materialsCountRows] =await db.execute<RowDataPacket[]>(materialsCountQuery, [subject_id]);
    const study_material_web_count = materialsCountRows[0].study_material_web 
      ? JSON.parse(materialsCountRows[0].study_material_web).length 
      : 0;
    const study_material_file_count = materialsCountRows[0].study_material_file 
          ? JSON.parse(materialsCountRows[0].study_material_file).length 
         : 0;
    const study_material_video_count = materialsCountRows[0].study_material_video 
           ? JSON.parse(materialsCountRows[0].study_material_video).length 
           : 0;
    const TotalCount = Number(study_material_file_count) + Number(study_material_video_count) + Number(study_material_web_count);
    const allExamsQuery = `SELECT * FROM exams WHERE grade = ? AND YEAR(exam_start_date)  = YEAR(CURDATE()) ORDER BY exam_start_date ASC`;
    const [ allExamsRows] = await db.execute<RowDataPacket[]>(allExamsQuery, [grade_id]);
    const allExams = allExamsRows;
    const noticeBoardQuery = `SELECT * FROM notices WHERE grade = ? ORDER BY created_at DESC LIMIT 5`;
    const [ noticesRows] = await db.execute<RowDataPacket[]>(noticeBoardQuery, [grade_id]);
    const notices = noticesRows;
    res.status(200).json({
         materialCount: TotalCount, allExams, notices
    })    



}catch(err){
    console.log(err, 'is err');
    res.status(200).json({
        message: "Internal Server Error occured",
        data: err
    })
}
}
export const getUserName = async(id: string, token: string)=> {
          const studentResponse = await axios.get(`${backend_domain_name}api/user/getUserById/${id}`, {
             headers: {
              Cookie: `aswedaul_ed_jwt=${token}`
                   }
          })
        
          if(studentResponse.status == 200){
              const name = studentResponse.data.name;
              return name
          }else{
            return ""
          }
}

export const getUserNameWithout = async(id: string)=> {
          const my_backend_domain_name  = process.env.BACKEND_DOMAIN_NAME;
          const studentResponse = await axios.get(`${my_backend_domain_name}api/user/getUserById/${id}`)
 
          if(studentResponse.status == 200){
              const name = studentResponse.data.name;
              return name
          }else{
            return ""
          }
}

export async function getMarks(req: Request, res: Response) {
  try {
    const { exam_id, subject_id } = req.params;
    const token = req.cookies?.aswedaul_ed_jwt;

    // Fetch marks from database
    const getQuery = `SELECT marks.* FROM marks WHERE exam_id = ? AND subject_id = ?`;
    const [rows] = await db.execute<RowDataPacket[]>(getQuery, [exam_id, subject_id]);

    if (!rows || rows.length === 0) {
      return res.status(200).json({
              message: "Success",
      data: [],
      });
    }

    // Fetch student names concurrently
    const updatedRows = await Promise.all(
      rows.map(async (mark) => {
        const name = await getUserName(mark.student_id, token);
        return { ...mark, student_name: name }; // add the name to the object
      })
    );

  

    res.status(200).json({
      message: "Success",
      data: updatedRows,
    });
  } catch (err) {
    console.log(err, "is err");
    res.status(500).json({
      message: "Internal Server Error Occurred",
    });
  }
}


export const saveMarks = async (req: Request, res: Response) => {
  try {
    const { teacher_id, grade_id, marks } = req.body;
 
    const academicYear = new Date().getFullYear();

    if (!marks || marks.length === 0) {
      return res.status(400).json({ message: "No marks provided" });
    }

    for (const mark of marks) {
      const [existing] = await db.execute(
        `SELECT id FROM marks WHERE student_id = ? AND exam_id = ? AND grade_id = ? AND subject_id = ?`,
        [mark.student_id, mark.exam_id, grade_id, mark.subject_id]
      );

      if ((existing as any[]).length > 0) continue;


      await db.execute(
        `INSERT INTO marks
        (exam_id, subject_id, student_id, max_mark, min_mark, grade_id, get_mark, academic_year, note, status, teacher_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          mark.exam_id,
          mark.subject_id,
          mark.student_id,
          100,          
          40,           
          grade_id,
          mark.get_mark,
          academicYear,
          mark.note || "",
          "marked",
          teacher_id
        ]
      );
    }

    return res.status(200).json({ message: "Marks saved successfully" });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


export const getSubjectById = async(req: Request<{id: string}>, res:Response)=> {
try{
  const {id} = req.params;
  const query = `SELECT * FROM subjects WHERE id = ?`;
  const [rows] = await db.execute<RowDataPacket[]>(query, [id]);
  res.status(200).json({
    message: "Success", 
    data: rows[0]
  });

}catch(err){
    res.status(500).json({
        message: "Internal Server Error occured",
    })
}
}
