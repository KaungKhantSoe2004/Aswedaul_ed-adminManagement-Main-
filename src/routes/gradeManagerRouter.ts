import express, { Request, Response } from "express"
import { getAdmissionStatus, getManagerDashboard, getMarksByGrade, updateAdmissionStatus } from "../controller/gradeManagerController";
import { authMiddleware } from "../assets/middleware";
export const GradeManagerRouter = express.Router();


GradeManagerRouter.get("/dashboard/:gradeId", authMiddleware, (req: Request, res: Response)=> {
    getManagerDashboard(req, res);
});
GradeManagerRouter.get("/getAdmissionStatus/:grade_id",  (req: Request, res: Response)=> {
   getAdmissionStatus(req, res);
} );
GradeManagerRouter.post("/updateAdmissionStatus", authMiddleware, (req: Request, res: Response)=> {
   updateAdmissionStatus(req, res)
});
GradeManagerRouter.get('/getMarksByGrade/:grade_id', (req: Request, res: Response)=> {
   getMarksByGrade(req, res)
})
