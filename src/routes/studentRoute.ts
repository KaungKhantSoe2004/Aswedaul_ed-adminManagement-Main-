import express, { Request, Response } from "express";
import {  getDashboard, getGradeEnv, getMarksByStudent } from "../controller/studentController";
export const StudentRouter = express.Router();
StudentRouter.get("/getDashboard/:grade_id", (req: Request, res: Response)=> {
    getDashboard(req, res);
});
StudentRouter.get("/gradeGradeEnv/:grade_id", (req: Request, res: Response)=> {
  getGradeEnv(req, res);
});
StudentRouter.get("/marks/:grade_id/:student_id", (req: Request, res: Response)=> {
 getMarksByStudent(req, res);
});



