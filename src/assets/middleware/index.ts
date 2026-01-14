import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import dotenv from "dotenv";
dotenv.config()
interface JwtPayload {
  id: number;
  role: string;
}

export const authMiddleware = (
  req:Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.aswedaul_ed_jwt;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    (req as any).user = {
      id: decoded.id,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const chatAuthMiddleware = (req:Request, res:Response, next:NextFunction)=> {
  const token = req.cookies?.aswedaul_edchat_jwt;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.CHAT_JWT_SECRET as string
    ) as JwtPayload;
    (req as any).user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.log(error, 'is error dudd')
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}