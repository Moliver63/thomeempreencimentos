// server/src/db/migrate.ts
import { sqlite } from "./client";

console.log("🏗️  Executando migrations Thomé Empreendimentos...");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS empreendimentos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT    NOT NULL UNIQUE,
    nome        TEXT    NOT NULL,
    tipo        TEXT    NOT NULL CHECK(tipo IN ('residencial','comercial','obra_publica')),
    status      TEXT    NOT NULL CHECK(status IN ('concluido','em_andamento','lancamento')),
    descricao   TEXT    NOT NULL,
    endereco    TEXT    NOT NULL,
    cidade      TEXT    NOT NULL DEFAULT 'Balneário Camboriú',
    estado      TEXT    NOT NULL DEFAULT 'SC',
    pavimentos  INTEGER,
    area_total  REAL,
    ano_entrega INTEGER,
    destaque    INTEGER DEFAULT 0,
    created_at  TEXT    DEFAULT (datetime('now')),
    updated_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS galeria (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    empreendimento_id INTEGER REFERENCES empreendimentos(id) ON DELETE CASCADE,
    url               TEXT    NOT NULL,
    alt               TEXT,
    ordem             INTEGER DEFAULT 0,
    capa              INTEGER DEFAULT 0,
    created_at        TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS leads (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    nome              TEXT    NOT NULL,
    email             TEXT    NOT NULL,
    telefone          TEXT    NOT NULL,
    empreendimento_id INTEGER REFERENCES empreendimentos(id),
    mensagem          TEXT,
    origem            TEXT    DEFAULT 'site',
    status            TEXT    DEFAULT 'novo' CHECK(status IN ('novo','contatado','qualificado','convertido','perdido')),
    created_at        TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contatos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT    NOT NULL,
    email      TEXT    NOT NULL,
    telefone   TEXT,
    assunto    TEXT    NOT NULL,
    mensagem   TEXT    NOT NULL,
    lido       INTEGER DEFAULT 0,
    created_at TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS depoimentos (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    nome              TEXT    NOT NULL,
    cargo             TEXT,
    empreendimento_id INTEGER REFERENCES empreendimentos(id),
    texto             TEXT    NOT NULL,
    nota              INTEGER DEFAULT 5,
    ativo             INTEGER DEFAULT 1,
    created_at        TEXT    DEFAULT (datetime('now'))
  );
`);

console.log("✅ Migrations concluídas com sucesso!");
process.exit(0);
