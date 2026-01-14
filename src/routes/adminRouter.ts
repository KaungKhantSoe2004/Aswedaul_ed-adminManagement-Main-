import express, { Request, Response, Router } from 'express';
import { addStudyMaterial, createExam, createNotice, createSubject, deleteExam, deleteNotice, deleteSalary, deleteStudyMaterial, deleteSubject, getAdminDashboard, getEachGrade, getExamsByGrade, getSalaries, makeExamMarked, makeSalaries, saveSalary, updateExam, updateNotice, updateStudyMaterial, updateSubject } from '../controller/adminController';
import { getMarks } from '../controller/teacherController';
export const AdminRouter: Router = express.Router();

AdminRouter.get('/getSalaries', (req: Request, res: Response)=> {
    getSalaries(req, res);
})
AdminRouter.get("/generate", (req: Request, res: Response)=> {
    makeSalaries(req, res);
})
AdminRouter.get("/deleteSalary/:id", ( req: Request<{ id: string }>, res: Response)=> {
    deleteSalary(req, res)
})
AdminRouter.post("/saveSalary", (req: Request, res: Response)=> {
    saveSalary(req, res)
})
AdminRouter.post('/createNotice', (req: Request, res: Response) => {
    createNotice(req, res);
});
AdminRouter.get('/deleteNotice/:id', (req: Request, res: Response) => {
    deleteNotice(req, res);
});
AdminRouter.post('/updateNotice/:id', (req: Request, res: Response) => {
    updateNotice(req, res);
});

AdminRouter.get("/directDashboard", (req: Request, res:Response)=> {
    getAdminDashboard(req, res);
});
AdminRouter.get("/getEachGrade/:grade", (req: Request, res: Response)=> {
    getEachGrade(req, res)
})
AdminRouter.post("/createSubject", (req: Request, res: Response)=> {
    createSubject(req, res);
})
AdminRouter.post("/updateSubject", (req: Request, res:Response)=> {
    updateSubject(req, res)
});
AdminRouter.get("/deleteSubject/:id", (req, res)=> {
    deleteSubject(req, res)
});
AdminRouter.post("/createExam", (req: Request, res:Response)=> {
    createExam(req, res);
})
AdminRouter.get("/getExamsByGrade/:id", (req: Request, res:Response)=> {
    getExamsByGrade(req, res)
})
AdminRouter.post("/makeExamMarked", (req: Request, res: Response)=> {
    makeExamMarked(req, res);
})
AdminRouter.post("/updateExam", (req:Request, res:Response)=> {
    updateExam(req, res)
});
AdminRouter.get("/deleteExam/:id", (req:Request, res:Response)=> {
    deleteExam(req, res);
});
AdminRouter.post('/addStudyMaterial', (req:Request, res:Response)=> {
    addStudyMaterial(req, res);
});
AdminRouter.post("/deleteStudyMaterial", (req: Request, res:Response)=> {
    deleteStudyMaterial(req, res);
});
AdminRouter.post("/updateStudyMaterial", (req:Request, res: Response)=> {
    updateStudyMaterial(req, res);
})