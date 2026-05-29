import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "https://thome-client.onrender.com",
  "https://thomeempreencimentos.onrender.com",
  "http://localhost:5173",
  "http://localhost:5174",
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, empresa: "Thome Empreendimentos", env: process.env.NODE_ENV });
});

const { authRouter }             = require("./routes/auth");
const { empreendimentosRouter }  = require("./routes/empreendimentos");
const { leadsRouter, contatosRouter } = require("./routes/leads");
const { usuariosRouter }         = require("./routes/usuarios");

app.use("/api/auth",             formLimiter, authRouter);
app.use("/api/empreendimentos",  empreendimentosRouter);
app.use("/api/imoveis",          empreendimentosRouter);
app.use("/api/leads",            formLimiter, leadsRouter);
app.use("/api/contatos",         formLimiter, contatosRouter);
app.use("/api/usuarios",         usuariosRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Rota nao encontrada" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.message);
  res.status(500).json({ success: false, error: "Erro interno" });
});

app.listen(PORT, () => {
  console.log("Thome API porta " + PORT);
});