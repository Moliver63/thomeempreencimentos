// server/src/index.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { empreendimentosRouter } from "./routes/empreendimentos";
import { leadsRouter, contatosRouter } from "./routes/leads";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── MIDDLEWARES ──────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting para formulários
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { success: false, error: "Muitas tentativas. Aguarde alguns minutos." },
});

// ─── ROTAS ────────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ success: true, status: "ok", empresa: "Thomé Empreendimentos", version: "1.0.0" });
});

app.use("/api/empreendimentos", empreendimentosRouter);
app.use("/api/leads",    formLimiter, leadsRouter);
app.use("/api/contatos", formLimiter, contatosRouter);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Rota não encontrada" });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("❌ Erro:", err.message);
  res.status(500).json({ success: false, error: "Erro interno do servidor" });
});

app.listen(PORT, () => {
  console.log(`🏢 Thomé Server rodando em http://localhost:${PORT}`);
  console.log(`📋 API: http://localhost:${PORT}/api/health`);
});

export default app;
