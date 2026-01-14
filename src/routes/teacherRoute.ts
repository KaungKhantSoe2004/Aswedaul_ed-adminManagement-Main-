import express, { Request, Response } from 'express';
import { DirectSubjectInfo, DirectSubjectList, DirectTeacherDashboard, getMarks, getSubjectById, saveMarks } from '../controller/teacherController';
export const TeacherRouter = express.Router();


TeacherRouter.get('/getDashboard/:teacher_id/:grade_id', (req: Request, res: Response)=> {
      DirectTeacherDashboard(req, res);
});
TeacherRouter.get("/getSubjects/:teacher_id/:grade_id", (req:Request, res:Response)=> {
  DirectSubjectList(req, res);
});
TeacherRouter.get("/getEachSubject/:grade_id/:subject_id", (req:Request, res: Response)=> {
    DirectSubjectInfo(req, res);
});
TeacherRouter.get("/getSubject/:id", (req: Request<{id: string}>, res: Response)=> {
  getSubjectById(req, res);
})
TeacherRouter.post('/saveMarks', (req: Request, res: Response)=> {
  saveMarks(req, res);
})
TeacherRouter.get('/getMarks/:exam_id/:subject_id', (req: Request, res: Response)=> {
    getMarks(req, res);
})