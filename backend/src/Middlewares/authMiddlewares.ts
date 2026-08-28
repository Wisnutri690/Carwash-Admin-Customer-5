import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: number;
  email: string;
  role: "ADMIN" | "CUSTOMER";
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
  admin?: JwtPayload;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Akses ditolak, token tidak ditemukan",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    req.user = decoded;
    req.admin = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token tidak valid atau sudah kadaluarsa",
    });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "ADMIN") {
    res.status(403).json({
      success: false,
      message: "Akses terlarang: Hanya Admin yang diizinkan",
    });
    return;
  }
  next();
};

export const requireCustomer = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "CUSTOMER") {
    res.status(403).json({
      success: false,
      message: "Akses terlarang: Hanya Customer yang diizinkan",
    });
    return;
  }
  next();
};
