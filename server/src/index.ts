import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const envOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  ...envOrigins,
  "https://thome-client.onrender.com",
  "https://thomeempreencimentos.onrender.com",
  "http://localhost:5173",
  "http://localhost:5174",
]);

const previewOriginRegex = /^https:\/\/thome-client(-[a-z0-9-]+)?\.onrender\.com$/i;

function isAllowedOrigin(origin?: string) {
  if (!origin) return true;
  return allowedOrigins.has(origin) || previewOriginRegex.test(origin);
}

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, empresa: "Thomé Empreendimentos", env: process.env.NODE_ENV });
});

const { authRouter } = require("./routes/auth");
const { empreendimentosRouter } = require("./routes/empreendimentos");
const { leadsRouter, contatosRouter } = require("./routes/leads");
const { uploadRouter } = require("./routes/upload");
const { usuariosRouter } = require("./routes/usuarios");

app.use("/api/auth", formLimiter, authRouter);
app.use("/api/empreendimentos", empreendimentosRouter);
app.use("/api/imoveis", empreendimentosRouter);
app.use("/api/leads", formLimiter, leadsRouter);
app.use("/api/contatos", formLimiter, contatosRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/usuarios", usuariosRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Rota não encontrada" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.message);
  res.status(500).json({ success: false, error: "Erro interno" });
});

app.listen(PORT, () => {
  console.log(`Thomé API na porta ${PORT}`);
});
