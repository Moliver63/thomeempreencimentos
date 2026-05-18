// server/src/index.ts
import express, { Request, Response, NextFunction } from "express";
import cors    from "cors";
import helmet  from "helmet";
import rateLimit from "express-rate-limit";
import dotenv  from "dotenv";
import path    from "path";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// Health check — não importa rotas ainda para testar o build
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, empresa: "Thomé Empreendimentos", env: process.env.NODE_ENV });
});

// Rotas — importadas de forma lazy para não quebrar o build se algum módulo faltar
try {
  const { authRouter }              = require("./routes/auth");
  const { imoveisRouter }           = require("./routes/imoveis");
  const { usuariosRouter, leadsRouter } = require("./routes/usuarios");

  app.use("/api/auth",     formLimiter, authRouter);
  app.use("/api/imoveis",  imoveisRouter);
  app.use("/api/usuarios", usuariosRouter);
  app.use("/api/leads",    formLimiter, leadsRouter);
} catch (err: any) {
  console.warn("⚠️  Algumas rotas não carregaram:", err.message);
}

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Rota não encontrada" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌", err.message);
  res.status(500).json({ success: false, error: "Erro interno" });
});

app.listen(PORT, () => {
  console.log(`🏢 Thomé API rodando na porta ${PORT}`);
  console.log(`📋 Health: /api/health`);
});

export default app;
