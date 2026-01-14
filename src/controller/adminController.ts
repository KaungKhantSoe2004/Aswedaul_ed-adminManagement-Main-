import { RowDataPacket } from 'mysql2';
import { db } from './../assets/database/db_connection';
import { Request, response, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import { Exam, User } from '../assets/typescript/types';
import { validateSchedule } from '../assets/validation/validation';
import { getUserName } from './teacherController';
dotenv.config();
const backend_domain_name = process.env.BACKEND_DOMAIN_NAME;
console.log(backend_domain_name);
export async function dashboard(req: Request, res: Response){

}
export async function name(req: Request, res: Response) {
    console.log("ok bro heheh");
}

// Salary
export async function deleteSalary( req: Request<{ id: string }>, res: Response){
  try{
     const {id} = req.params;

     const [rows] = await db.query<(User & RowDataPacket)[]>(
      "SELECT * FROM salary_payments WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Salary not found" });
    }

    await db.query("DELETE FROM salary_payments WHERE id = ?", [id]);

    res.status(200).json({ message: "Salary deleted successfully" });    
  }catch(err){
    res.status(500).json({
      message: "Internal Server Error"
    })
  }
}

export async function getSalaries(req: Request, res: Response) {
  try {
    const now = new Date();
    const current_month = now.toLocaleString('en-US', { month: 'long' });
    const [rows] = await db.query<any[]>(
      "SELECT * FROM salary_payments WHERE pay_month = ?", [current_month]
    );

    const salariesWithUsers = await Promise.all(
      rows.map(async (salary) => {
        try {
          const userResponse = await axios.get(`${backend_domain_name}api/user/getUserById/${salary.user_id}`);
      

          return {
            ...salary,
            user: userResponse.data, 
          };
        } catch (err) {
        

          return {
            ...salary,
            user: null, 
          };
        }
      })
    );


    res.status(200).json(salariesWithUsers);
  } catch (err) {
    console.error("Error getting salaries:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function saveSalary(req: Request, res: Response) {
  try {
    const { id, bonus, deductions, net_salary, remarks } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Salary entry ID is required" });
    }
    const sql = `
      UPDATE salary_payments
      SET bonus = ?, deductions = ?, net_salary = ?, remarks = ?
      WHERE id = ?
    `;

    const values = [bonus, deductions, net_salary, remarks, id];

    await db.query(sql, values);

    const [rows] = await db.query("SELECT * FROM salary_payments ORDER BY pay_month DESC");

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error updating salary:", err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
export async function makeSalaries(req: Request, res: Response) {
  try {
    const token = req.cookies?.aswedaul_ed_jwt;
    const response = await axios.get(`${backend_domain_name}api/user/getEmployees`, {
     headers: {
      Cookie: `aswedaul_ed_jwt=${token}`
       }
    });
    const employees = response.data.data;
    console.log(employees, 'is employees bro')
    const now = new Date();
    const pay_month = now.toLocaleString('en-US', { month: 'long' });
    const currentYear = now.getFullYear();

    const checkQuery = `
      SELECT * FROM salary_payments 
      WHERE pay_month = ? AND YEAR(created_at) = ?
    `;
    const checkValues = [pay_month, currentYear];
    const [existingRows] = await db.query<RowDataPacket[]>(checkQuery, checkValues);

    if (existingRows.length > 0) {
      return res.status(400).json({
        message: `Salaries for ${pay_month} ${currentYear} have already been processed.`,
        data: existingRows
      });
    }
    console.log(pay_month, 'is pay_month')
    for (const each of employees) {
      const insertQuery = `
        INSERT INTO salary_payments (user_id, userType, monthly_salary, pay_month, username) 
        VALUES (?, ?, ?, ?, ?)
      `;
      const insertValues = [each.id, each.role, each.monthly_pay, pay_month, each.name];
      await db.query(insertQuery, insertValues);
    }

    const [rows] = await db.query(checkQuery, checkValues);

    res.status(200).json({
      message: "Salaries successfully created",
      data: rows
    });

  } catch (err) {
    console.log(err, 'is error');
    res.status(500).json({
      message: "Internal Server Error Occurred"
    });
  }
}


export const getAdminDashboard  = async(req: Request, res: Response)=> {
  try{
    const sql = `SELECT * FROM notices`;
    const [rows] = await  db.query(sql);
    res.status(200).json({
      message: "Success",
      data: rows
     })
  }catch(err){
     console.log(err);
     res.status(500).json({message: "Internal Server Error", data: err})
  }
}


export const createNotice = async (req: Request, res: Response) => {
  try {
    const { user_id, message, user_role, authorization ,  grade } = req.body;

    if (!user_id || !message || !user_role || !authorization) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const query = `
      INSERT INTO notices (user_id, message, user_role, authorization, grade)
      VALUES (?, ?, ?, ? , ?)
    `;

    const values = [user_id, message, user_role, authorization, grade];
    const [result]: any = await db.query(query, values);

    res.status(201).json({
      message: "Notice created successfully",
      notice_id: result.insertId
    });
  } catch (err) {
    console.error("Error creating notice:", err);
    res.status(500).json({
      message: "Internal Server Error occurred"
    });
  }
};

export const deleteNotice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM notices WHERE id = ?`;
    const [result]: any = await db.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Notice not found"
      });
    }

    res.status(200).json({
      message: "Notice deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting notice:", err);
    res.status(500).json({
      message: "Internal Server Error occurred"
    });
  }
};

export const updateNotice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
     console.log(message, 'is message')
    if ( !message) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const query = `
      UPDATE notices
      SET message = ?
      WHERE id = ?
    `;

    const values = [ message, id];
    const [result]: any = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Notice not found"
      });
    }

    res.status(200).json({
      message: "Notice updated successfully"
    });
  } catch (err) {
    console.error("Error updating notice:", err);
    res.status(500).json({
      message: "Internal Server Error occurred"
    });
  }
};

export const getNotices = async(req: Request, res: Response)=> {
  try{
    const {authorization, grade_id} = req.params;
    let sql;
    let values;
    let data;


    if(authorization == "all"){
        sql = `SELECT * FROM notices`;
        data = await  db.query(sql);

    }else if(authorization == "students"){
      sql = `SELECT * FROM notices WHERE authorization = ? AND grade_id = ?`;
      values = [authorization, grade_id];
      data = await db.query(sql ,values)
    }else if(authorization == "teachers" && grade_id != undefined){
      sql = `SELECT * FROM notices WHERE authorization = ? AND grade_ID = ?`;
      values = [authorization, grade_id];
      data = await db.query(sql, values)
    }else if(authorization == "teachers" && grade_id == undefined){
        sql = `SELECT * FROM notices WHERE authorization = ?`;
        values = [authorization];
        data = await  db.query(sql, values);
    }else if(authorization == "managers" && grade_id != undefined){
      sql = `SELECT * FROM notices WHERE authorization = ? AND grade_ID = ?`;
      values = [authorization, grade_id];
      data = await db.query(sql, values)
    }else if(authorization == "managers" && grade_id == undefined){
        sql = `SELECT * FROM notices WHERE authorization = ?`;
        values = [authorization];
        data = await  db.query(sql, values);
    }else{
      res.status(400).json({
        "message" : "No Authorization added"
      });
    }


    res.status(200).json({
          message: "Success",
          data: data
        })
  }catch(err){
    console.log(err)
    res.status(500).json({
      message: "Internal Server Error"
    })
  }
}

// Grades
export const getEachGrade =async (req: Request, res:Response)=> {
 
  try{
     const {grade} = req.params;
     const token = req.cookies?.aswedaul_ed_jwt;
     console.log(backend_domain_name, 'is backend domain name');
     const usersResponse  = await axios.get(`${backend_domain_name}api/user/getUsersWithGrade/${grade}`,  {
    headers: {
       Cookie: `aswedaul_ed_jwt=${token}`
    }
     });
     console.log(usersResponse, 'is usersResponse')
     const usersData  :User[] = usersResponse?.data.data
     console.log(usersResponse, 'is usersResponse')
     const teachers : User[] = [];
     const admins : User[] = [];
     const students : User[] = [];
     const managers : User[] = [];
     const upcomingExamsQuery = `SELECT * FROM exams WHERE status != 'completed'`;
     const [upcomingRows] = await db.query(upcomingExamsQuery);
     console.log(upcomingRows);

     usersData.forEach(user => {
       switch (user.role) {
        case 'teacher':
         teachers.push(user);
        break;
        case 'admin':
          admins.push(user);
        break;
        case 'student':
          students.push(user);
        break;
        case 'manager':
          managers.push(user);
        break;
       }
     
     });
     const subjectQuery = `SELECT * FROM subjects WHERE grade_id = ?`;
     const values  = [grade]  ;
     const [subjectRows] = await db.query(subjectQuery, values);
     console.log(subjectRows, 'is subjects Rows bro dude')
     const data = {
       "subjects": subjectRows,
       "teachers": teachers,
       "students": students,
       "admins": admins,
       "managers": managers,
       "exams": upcomingRows,       
     }


    res.status(200).json({
      message: "Success",
      data

    })

  }catch(err){
    console.log(err, 'is error');
    res.status(500).json({
      message: "Internal Server Error Occured",
      data: err
    })
  }
}



export const createSubject = async (req: Request, res: Response) => {
  try {
    const { teacher_id, subject_name, grade_id, schedule } = req.body;
    if (!teacher_id || !subject_name || !grade_id || !schedule) {
      return res.status(400).json({
        message: 'teacher_id, subject_name, grade_id and schedule are required'
      });
    }

    if (isNaN(Number(teacher_id)) || isNaN(Number(grade_id))) {
      return res.status(400).json({
        message: 'teacher_id and grade_id must be numbers'
      });
    }


    const scheduleValidation = validateSchedule(schedule);
    if (!scheduleValidation.valid) {
      return res.status(400).json({
        message: scheduleValidation.message
      });
    }

    const createSubjectQuery = `
      INSERT INTO subjects (teacher_id, subject_name, grade_id, schedule)
      VALUES (?, ?, ?, ?)
    `;

    await db.query(createSubjectQuery, [
      teacher_id,
      subject_name.trim(),
      grade_id,
      schedule
    ]);
    const subjectsQuery = `SELECT * FROM subjects WHERE grade_id = ?`;
    const [ subjects] = await db.query(subjectsQuery, [grade_id]);


    return res.status(200).json({
      message: 'Subject created successfully',
      data: subjects
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
};


export const updateSubject = async (req: Request, res: Response) => {
  try {
    console.log("in updating subject")
    const { id : subjectId, teacher_id, subject_name, grade_id, schedule } = req.body;

    if (!subjectId) {
      return res.status(400).json({
        message: 'Subject ID is required'
      });
    }
    if (!teacher_id || !subject_name || !grade_id || !schedule) {
      return res.status(400).json({
        message: 'teacher_id, subject_name, grade_id and schedule are required'
      });
    }

    if (isNaN(Number(teacher_id)) || isNaN(Number(grade_id))) {
      return res.status(400).json({
        message: 'teacher_id and grade_id must be numbers'
      });
    }

    // 🔍 Schedule validation
    const scheduleValidation = validateSchedule(schedule);
    if (!scheduleValidation.valid) {
      return res.status(400).json({
        message: scheduleValidation.message
      });
    }

    const updateQuery = `
      UPDATE subjects
      SET teacher_id = ?, subject_name = ?, grade_id = ?, schedule = ?
      WHERE id = ?
    `;

    const [result]: any = await db.query(updateQuery, [
      teacher_id,
      subject_name.trim(),
      grade_id,
      schedule,
      subjectId
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Subject not found'
      });
    }
    const subjectsQuery = `SELECT * FROM subjects WHERE grade_id = ?`;
    const [ subjects] = await db.query(subjectsQuery, [grade_id]);
    return res.status(200).json({
      message: 'Subject updated successfully',
      data: subjects
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
};



export const deleteSubject = async(req: Request, res:Response)=> {
  try{
   const {id} = req.params;
   const query = `DELETE FROM subjects WHERE id = ?`;
   await db.query(query, [id]);
   res.status(200).json({
    message: "Deleting Subject Success"
   })
  }catch(err){
    console.log(err);
    res.status(500).json({
      message: "Internal Server Error Occured",
      data: err
    })
  }
}


export const createExam = async (req: Request, res: Response) => {
  try {
    const {
      exam_name,
      exam_type,
      status,
      exam_start_date,
      exam_end_date,
      grade: grade_id,
    } = req.body;
    if (
      !exam_name ||
      !exam_type ||
      !status ||
      !exam_start_date ||
      !exam_end_date ||
      !grade_id
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (exam_end_date < exam_start_date) {
      return res
        .status(400)
        .json({ message: "End date cannot be before start date" });
    }

    // Prepare query
    const query = `
      INSERT INTO exams 
        (exam_name, grade, exam_type, exam_start_date, exam_end_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      exam_name,
      grade_id,
      exam_type,
      exam_start_date,
      exam_end_date,
      status,
    ];

    await db.query(query, values);
    const getQuery = `SELECT * FROM exams WHERE grade= ?`;
    const [rows] = await db.query(getQuery, [grade_id]);


    return res.status(200).json({
        message: "Exam created successfully",
         data: rows
      });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal Server Error Occurred",
      data: err,
    });
  }
};

export const getExamsByGrade = async(req: Request, res: Response)=> {
  try{
    console.log("in exam nby grade")
    const {id: gradeId} = req.params;
     const query = `SELECT * FROM exams WHERE grade = ?`;
     const [rows] = await db.query(query, [gradeId]);
     res.status(200).json({
       message: "Success",
       data: rows
     })
  }catch(err){
    console.log(err, 'is error');
    res.status(500).json({
      message: "Internal Server Error Occured",
      data: err
    })
  }
}
export const makeExamMarked = async(req: Request, res: Response)=> {
  try{
    const {exam_id, grade_id} = req.body;
    const token =  req.cookies?.aswedaul_ed_jwt;
    const query = `UPDATE exams SET status = 'marked' WHERE id = ?`;
    const  response  = await axios.get(`${backend_domain_name}api/user/getGradeUsers/${grade_id}`, {
         headers: {
      Cookie: `aswedaul_ed_jwt=${token}`
       }
    })
    if(response.status == 200){
       const students = response.data.data;
       await Promise.all(
          students.map(async (student: User) => {
             const getMarksQuery = `SELECT get_mark, max_mark, is_passed FROM marks WHERE exam_id = ? AND student_id = ?`;
             const [marks] = await db.execute<RowDataPacket[]>(getMarksQuery, [exam_id, student.id]);

             if (marks.length > 0) {
                 let total_got_marks = 0;
                 let full_marks = 0;
                 let is_all_passed = true;

                 marks.forEach(row => {
                     total_got_marks += row.get_mark;
                     full_marks += row.max_mark;
                     if (!row.is_passed) {
                           is_all_passed = false;
                      }
                    });

                const result_status = is_all_passed ? 'Pass' : 'Fail';
                const grade_id = 1; 

                const insertQuery = `INSERT INTO exam_results (exam_id, student_id, total_got_marks, full_marks, grade_id, result_status) VALUES (?, ?, ?, ?, ?, ?)`;
    
                await db.execute(insertQuery, [
                     exam_id, 
                     student.id, 
                     total_got_marks, 
                     full_marks, 
                     grade_id, 
                     result_status
                     ]);

  
}
          })
        );
    }else{
      res.status(500).json({
        message: "Internal Server Error Occured"
      })
    }

    const marked = await db.execute(query, [exam_id]);
    const updateRankQuery = `
    UPDATE exam_results r
    JOIN (
        SELECT id, RANK() OVER (PARTITION BY exam_id, grade_id ORDER BY total_got_marks DESC) as calculated_rank
        FROM exam_results
        WHERE exam_id = ? AND grade_id = ?
    ) ranked ON r.id = ranked.id
    SET r.rank_position = ranked.calculated_rank;
                `;
    await db.execute(updateRankQuery, [exam_id, grade_id]);    
    res.status(200).json({
      message: "Success"
    })
  }catch(err){
    res.status(500).json({
      message: "Internal Server Error Occured"
    })
  }
}

export const getEachGraade =(req: Request, res:Response)=> {
  try{
   
  }catch(err){
    console.log(err);
    res.status(500).json({
      message: "Internal Server Error Occured",
      data: err
    })
  }
}

export const updateExam = async (req: Request, res: Response) => {
  try {
    const {
      id,
      exam_name,
      exam_type,
      status,
      exam_start_date,
      exam_end_date,
      grade: grade_id,
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Exam ID is required" });
    }

    if (
      !exam_name ||
      !exam_type ||
      !status ||
      !exam_start_date ||
      !exam_end_date ||
      !grade_id
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (exam_end_date < exam_start_date) {
      return res
        .status(400)
        .json({ message: "End date cannot be before start date" });
    }

    const updateQuery = `
      UPDATE exams
      SET exam_name = ?, grade = ?, exam_type = ?, exam_start_date = ?, exam_end_date = ?, status = ?
      WHERE id = ?
    `;

    const values = [
      exam_name,
      grade_id,
      exam_type,
      exam_start_date,
      exam_end_date,
      status,
      id,
    ];

    const [result] = await db.query(updateQuery, values);


    const affectedRows = (result as any).affectedRows;
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Exam not found" });
    }


    const getQuery = `SELECT * FROM exams WHERE grade = ?`;
    const [rows] = await db.query(getQuery, [grade_id]);

    return res.status(200).json({
      message: "Exam updated successfully",
      data: rows,
    });
  } catch (err) {
    console.error("Update Exam Error:", err);
    return res.status(500).json({
      message: "Internal Server Error Occurred",
      data: err,
    });
  }
};

export const deleteExam = async(req:Request, res:Response)=> {
  try{
       const id = req.params;
       const query = `DELETE FROM exams WHERE id = ?`;
       await db.query(query, [id]);
       res.status(200).json({
        message: "Success"
       })
  }catch(err){
    console.log(err, 'is err');
    res.status(500).json({
      message: "Internal Server Error",
      data: err
    })
  }
}

export const addStudyMaterial = async (req: Request, res: Response) => {
  try {
    const { subjectId, type, title, url, description } = req.body;
    console.log(req.body);
    if (!subjectId || !type || !title || !url) {
      return res.status(400).json({
        message: "subjectId, type, title, and url are required",
      });
    }
    let columnName: string;
    switch (type) {
      case "web":
        columnName = "study_material_web";
        break;
      case "file":
        columnName = "study_material_file";
        break;
      case "video":
        columnName = "study_material_video";
        break;
      default:
        return res.status(400).json({ message: "Invalid type" });
    }
    const [rows]: any = await db.query(
      `SELECT ${columnName} FROM subjects WHERE id = ?`,
      [subjectId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Subject not found" });
    }

    let currentMaterials = rows[0][columnName];
    if (!currentMaterials) currentMaterials = [];
    if (!Array.isArray(currentMaterials)) {
      currentMaterials = [];
    }

    // Add new material
    currentMaterials.push({ id: currentMaterials.length +1, title, url, description, type });
    await db.query(
      `UPDATE subjects SET ${columnName} = ? WHERE id = ?`,
      [JSON.stringify(currentMaterials), subjectId]
    );

    return res.status(200).json({
      message: "Study material added successfully",
      data: { title, url, description, type },
    });
  } catch (err) {
    console.error(err, "is error brother");
    return res.status(500).json({
      message: "Internal Server Error",
      data: err,
    });
  }
};
export const deleteStudyMaterial = async(req:Request, res:Response)=> {
  try{
      const {id, type, subjectId} = req.body;
      console.log(id, type, subjectId)
      let columnName = "";
      switch (type) {
        case "video": columnName = "study_material_video"; break;
        case "file": columnName = "study_material_file"; break;
        case "web": columnName = "study_material_web"; break;
        default: return res.status(400).json({ message: "Invalid type" });
      }
      let query = ''  
      if(columnName == 'study_material_web'){
             query = `SELECT study_material_web FROM subjects WHERE id = ?`;
      }else if(columnName == 'study_material_video'){
        query = `SELECT study_material_vide0 FROM subjects WHERE id = ?`;

      }else{
        query = `SELECT study_material_file FROM subjects WHERE id = ?`;
      }
      
      const [rows] = await db.execute<RowDataPacket[]>(query, [subjectId]);
      const existedMaterial = JSON.parse(rows[0][columnName]);
      const updatedMaterial = existedMaterial.filter((m: any)=> m.id != id )
      if (updatedMaterial.length === existedMaterial.length) {
        return res.status(404).json({ message: "Material not found" });
      }
      let updateQuery = '';
      if(columnName == 'study_material_web'){
             updateQuery = `UPDATE subjects SET study_material_web = ? WHERE id = ?`;
      }else if(columnName == 'study_material_video'){
         updateQuery = `UPDATE subjects SET study_material_video = ? WHERE id = ?`;

      }else{
         updateQuery = `UPDATE subjects SET study_material_file = ? WHERE id = ?`;
      }
    
      await db.execute(updateQuery, [JSON.stringify(updatedMaterial), subjectId]);

      return res.status(200).json({
        message: "Material deleted successfully",
        data: updatedMaterial
      });  


  }catch(err){
    console.log(err, 'is error');
    res.status(500).json({
      message: "Internal Server error",
      data: err
    })
  }
}
export const updateStudyMaterial = async (req: Request, res: Response) => {
  try {
    const { id, subjectId, type, title, url, description } = req.body;

    if (!id || !subjectId || !type) {
      return res.status(400).json({ message: "id, subjectId, and type are required" });
    }

    // Determine the column name based on type
    let columnName = "";
    switch (type) {
      case "video": columnName = "study_material_video"; break;
      case "file": columnName = "study_material_file"; break;
      case "web": columnName = "study_material_web"; break;
      default: return res.status(400).json({ message: "Invalid type" });
    }

    // Conditional SELECT query
    const selectQuery = `SELECT \`${columnName}\` FROM subjects WHERE id = ?`;
    const [rows]: any = await db.execute(selectQuery, [subjectId]);

    if (!rows.length || !rows[0][columnName]) {
      return res.status(404).json({ message: "Subject or material not found" });
    }

    // Parse existing materials
    const materials = typeof rows[0][columnName] === "string" 
      ? JSON.parse(rows[0][columnName])
      : rows[0][columnName];

    let isFound = false;
    const updatedMaterials = materials.map((m: any) => {
      if (m.id == id) {
        isFound = true;
        return {
          ...m,
          title: title || m.title,
          url: url || m.url,
          description: description || m.description
        };
      }
      return m;
    });

    if (!isFound) {
      return res.status(404).json({ message: "Material with given ID not found" });
    }

    // Conditional UPDATE query
    const updateQuery = `UPDATE subjects SET \`${columnName}\` = ? WHERE id = ?`;
    await db.execute(updateQuery, [JSON.stringify(updatedMaterials), subjectId]);

    return res.status(200).json({
      message: "Material updated successfully",
      data: updatedMaterials.find((m: any) => m.id == id)
    });

  } catch (err) {
    console.log(err, "is error");
    return res.status(500).json({
      message: "Internal Server Error",
      data: err
    });
  }
};


