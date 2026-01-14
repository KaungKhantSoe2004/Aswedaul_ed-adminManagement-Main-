import { GradeManagerRouter } from './routes/gradeManagerRouter';
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import { db } from "./assets/database/db_connection";
import { AdminRouter } from "./routes/adminRouter";
import { TeacherRouter } from "./routes/teacherRoute";
import { authMiddleware, chatAuthMiddleware } from './assets/middleware';
import axios from 'axios';
import { StudentRouter } from './routes/studentRoute';
const app = express();
const backend_domain_name = process.env.BACKEND_DOMAIN_NAME;
const PORT = 2000;
const allowedOrigins = ["http://localhost:1500", "http://localhost:5173","http://localhost:5174", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
  })
);
console.log("in index. first")
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.status(200).send("<h1>OK Desu</h1>");
});
console.log("in index.ts")
app.use("/api/admin", authMiddleware, AdminRouter);
app.use("/api/student", authMiddleware, StudentRouter);
app.use("/api/teacher", authMiddleware, TeacherRouter);
app.use("/api/gradeManager", GradeManagerRouter);
app.get("/api/me", authMiddleware, async(req, res) => {
  const user = (req as any).user;
  const response = await axios.get(`${backend_domain_name}api/user/getUserById/${user.id}`);
  res.status(200).json({ message: "Success", user : response.data});
});

app.get("/api/chat/me", chatAuthMiddleware, async(req, res) => {
  const user = (req as any).user;
  const response = await axios.get(`${backend_domain_name}api/user/getUserById/${user.id}`);
  res.status(200).json({ message: "Success", user : response.data});
});

(async () => {
  try {
    await db.getConnection();
    console.log("MySQL Connected ✔");

    app.listen(PORT, () => {
      console.log("Server running on PORT:", PORT);
    });
  } catch (err) {
    console.log(`Error Occured ${err}`);
  }
})();
