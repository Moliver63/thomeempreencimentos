import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "thome_secret_2024_change_in_production";

export interface JWTPayload { id: number; email: string; role: "admin" | "corretor"; nome: string; }

declare global { namespace Express { interface Request { user?: JWTPayload; } } }

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ success: false, error: "Token nÃ£o fornecido" });
  try { req.user = verifyToken(header.slice(7)); next(); }
  catch { res.status(401).json({ success: false, error: "Token invÃ¡lido ou expirado" }); }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== "admin") return res.status(403).json({ success: false, error: "Acesso restrito ao administrador" });
    next();
  });
}
