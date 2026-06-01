// server/src/db/migrate.ts
import { client } from "./client";
import dotenv from "dotenv";
dotenv.config();

async function migrate() {
  console.log("Executando migrations PostgreSQL...");

  await client`
    DO $$ BEGIN
      CREATE TYPE role          AS ENUM ('admin', 'corretor');
      CREATE TYPE categoria     AS ENUM ('lancamento', 'pronto', 'terceiros', 'locacao');
      CREATE TYPE tipo_imovel   AS ENUM ('apartamento', 'casa', 'cobertura', 'sala_comercial', 'terreno', 'galpao');
      CREATE TYPE status_imovel AS ENUM ('disponivel', 'reservado', 'vendido', 'locado');
      CREATE TYPE status_lead   AS ENUM ('novo', 'contatado', 'qualificado', 'convertido', 'perdido');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$
  `;

  await client`
    CREATE TABLE IF NOT EXISTS usuarios (
      id          SERIAL PRIMARY KEY,
      nome        TEXT    NOT NULL,
      email       TEXT    NOT NULL UNIQUE,
      senha_hash  TEXT,
      google_id   TEXT,
      avatar_url  TEXT,
      role        role    NOT NULL DEFAULT 'corretor',
      ativo       BOOLEAN DEFAULT false,
      creci       TEXT,
      telefone    TEXT,
      created_at  TIMESTAMP DEFAULT NOW(),
      updated_at  TIMESTAMP DEFAULT NOW()
    )
  `;

  await client`
    CREATE TABLE IF NOT EXISTS imoveis (
      id                   SERIAL PRIMARY KEY,
      slug                 TEXT          NOT NULL UNIQUE,
      titulo               TEXT          NOT NULL,
      descricao            TEXT          NOT NULL,
      categoria            categoria     NOT NULL,
      tipo                 tipo_imovel   NOT NULL,
      status               status_imovel NOT NULL DEFAULT 'disponivel',
      endereco             TEXT          NOT NULL,
      bairro               TEXT,
      cidade               TEXT          NOT NULL DEFAULT 'Balneário Camboriú',
      estado               TEXT          NOT NULL DEFAULT 'SC',
      cep                  TEXT,
      latitude             REAL,
      longitude            REAL,
      area_total           REAL,
      area_privativa       REAL,
      quartos              INTEGER,
      suites               INTEGER,
      banheiros            INTEGER,
      vagas                INTEGER,
      pavimentos           INTEGER,
      andar                INTEGER,
      valor_venda          REAL,
      valor_locacao        REAL,
      valor_condominio     REAL,
      valor_iptu           REAL,
      construtora_parceira TEXT,
      contato_parceiro     TEXT,
      imagem_capa          TEXT,
      tabela_precos_url    TEXT,
      corretor_id          INTEGER REFERENCES usuarios(id),
      destaque             BOOLEAN DEFAULT false,
      publicado            BOOLEAN DEFAULT false,
      created_at           TIMESTAMP DEFAULT NOW(),
      updated_at           TIMESTAMP DEFAULT NOW()
    )
  `;

  await client`
    ALTER TABLE imoveis
    ADD COLUMN IF NOT EXISTS tabela_precos_url TEXT
  `;

  await client`
    CREATE TABLE IF NOT EXISTS galeria_imoveis (
      id        SERIAL PRIMARY KEY,
      imovel_id INTEGER NOT NULL REFERENCES imoveis(id) ON DELETE CASCADE,
      url       TEXT    NOT NULL,
      alt       TEXT,
      ordem     INTEGER DEFAULT 0,
      capa      BOOLEAN DEFAULT false
    )
  `;

  await client`
    CREATE TABLE IF NOT EXISTS leads (
      id          SERIAL PRIMARY KEY,
      nome        TEXT        NOT NULL,
      email       TEXT        NOT NULL,
      telefone    TEXT        NOT NULL,
      imovel_id   INTEGER     REFERENCES imoveis(id),
      corretor_id INTEGER     REFERENCES usuarios(id),
      mensagem    TEXT,
      origem      TEXT        DEFAULT 'site',
      status      status_lead DEFAULT 'novo',
      created_at  TIMESTAMP   DEFAULT NOW()
    )
  `;

  await client`
    CREATE TABLE IF NOT EXISTS contatos (
      id         SERIAL PRIMARY KEY,
      nome       TEXT      NOT NULL,
      email      TEXT      NOT NULL,
      telefone   TEXT,
      assunto    TEXT      NOT NULL,
      mensagem   TEXT      NOT NULL,
      lido       BOOLEAN   DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  console.log("Migrations concluidas!");
  await client.end();
  process.exit(0);
}

migrate().catch(e => { console.error(e); process.exit(1); });
