import { Router, Request, Response } from "express";
import { db } from "../db/client";
import { usuarios } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signToken, requireAuth } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ success: false, error: "Email e senha obrigatorios" });
    const [user] = await db.select().from(usuarios).where(eq(usuarios.email, email));
    if (!user || !user.senha_hash) return res.status(401).json({ success: false, error: "Email ou senha incorretos" });
    if (!user.ativo) return res.status(403).json({ success: false, error: "Usuario inativo. Contate o administrador." });
    const ok = await bcrypt.compare(senha, user.senha_hash);
    if (!ok) return res.status(401).json({ success: false, error: "Email ou senha incorretos" });
    const token = signToken({ id: user.id, email: user.email, role: user.role, nome: user.nome });
    res.json({ success: true, token, user: { id: user.id, nome: user.nome, email: user.email, role: user.role, avatar_url: user.avatar_url } });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: "Erro interno" });
  }
});

authRouter.post("/google", async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ success: false, error: "Token Google nao fornecido" });
    const { OAuth2Client } = require("google-auth-library");
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.email) throw new Error("Payload invalido");
    const { email, name, picture, sub: google_id } = payload;
    let [user] = await db.select().from(usuarios).where(eq(usuarios.email, email));
    if (!user) {
      await db.insert(usuarios).values({ nome: name || email, email, google_id, avatar_url: picture, role: "corretor", ativo: false });
      return res.status(202).json({ success: false, pendente: true, error: "Cadastro recebido! Aguarde ativacao pelo administrador." });
    }
    if (!user.ativo) return res.status(403).json({ success: false, error: "Conta nao ativada. Aguarde o administrador." });
    const token = signToken({ id: user.id, email: user.email, role: user.role, nome: user.nome });
    res.json({ success: true, token, user: { id: user.id, nome: user.nome, email: user.email, role: user.role, avatar_url: picture || user.avatar_url } });
  } catch (err: any) {
    console.error(err);
    res.status(401).json({ success: false, error: "Token Google invalido" });
  }
});

authRouter.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const [user] = await db.select().from(usuarios).where(eq(usuarios.id, req.user!.id));
    if (!user) return res.status(404).json({ success: false, error: "Usuario nao encontrado" });
    const { senha_hash: _, ...safe } = user;
    res.json({ success: true, user: safe });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro interno" });
  }
});

authRouter.post("/registro", async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, creci, telefone } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ success: false, error: "Nome, email e senha obrigatorios" });
    const senha_hash = await bcrypt.hash(senha, 10);
    await db.insert(usuarios).values({ nome: String(nome), email: String(email), senha_hash, role: "corretor", ativo: false, creci: creci || null, telefone: telefone || null });
    res.status(201).json({ success: true, message: "Cadastro realizado! Aguarde ativacao pelo administrador." });
  } catch (err: any) {
    if (err.message?.includes("unique") || err.message?.includes("duplicate")) {
      return res.status(409).json({ success: false, error: "Email ja cadastrado" });
    }
    res.status(500).json({ success: false, error: "Erro ao cadastrar" });
  }
});