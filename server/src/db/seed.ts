// server/src/db/seed.ts
import { db, client } from "./client";
import { usuarios, imoveis } from "./schema";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

async function seed() {
  console.log("Populando banco...");

  const adminHash    = await bcrypt.hash("thome@2024",    10);
  const corretorHash = await bcrypt.hash("corretor@2024", 10);

  await db.insert(usuarios).values([
    {
      nome:       "Administrador Thome",
      email:      "admin@thomeempreendimentos.com.br",
      senha_hash: adminHash,
      role:       "admin",
      ativo:      true,
    },
    {
      nome:       "Joao Corretor",
      email:      "corretor@thomeempreendimentos.com.br",
      senha_hash: corretorHash,
      role:       "corretor",
      creci:      "SC-12345",
      telefone:   "(47) 99999-0001",
      ativo:      true,
    },
  ]).onConflictDoNothing();

  await db.insert(imoveis).values([
    {
      slug:       "torre-di-bueno",
      titulo:     "Residencial Torre Di Bueno",
      descricao:  "27 pavimentos no centro de Balneário Camboriú.",
      categoria:  "pronto",
      tipo:       "apartamento",
      status:     "disponivel",
      endereco:   "Rua 3122, esquina com Rua 3158",
      bairro:     "Centro",
      cidade:     "Balneário Camboriú",
      estado:     "SC",
      pavimentos: 27,
      quartos:    3,
      suites:     2,
      banheiros:  3,
      vagas:      2,
      valor_venda: 1200000,
      destaque:   true,
      publicado:  true,
    },
    {
      slug:           "lancamento-bc-2025",
      titulo:         "Novo Lancamento Centro BC 2025",
      descricao:      "Apartamento de alto padrao em lancamento.",
      categoria:      "lancamento",
      tipo:           "apartamento",
      status:         "disponivel",
      endereco:       "Avenida Brasil, 500",
      bairro:         "Centro",
      cidade:         "Balneário Camboriú",
      estado:         "SC",
      area_privativa: 120,
      quartos:        3,
      suites:         3,
      banheiros:      4,
      vagas:          2,
      valor_venda:    1800000,
      destaque:       true,
      publicado:      true,
    },
    {
      slug:          "casa-locacao-camboriu",
      titulo:        "Casa para Locacao - Camboriú",
      descricao:     "Casa ampla com 4 quartos e piscina.",
      categoria:     "locacao",
      tipo:          "casa",
      status:        "disponivel",
      endereco:      "Rua Figueira, 200",
      bairro:        "Tabuleiro",
      cidade:        "Camboriú",
      estado:        "SC",
      area_total:    350,
      quartos:       4,
      suites:        2,
      banheiros:     3,
      vagas:         3,
      valor_locacao: 8500,
      publicado:     true,
    },
  ]).onConflictDoNothing();

  console.log("Seed concluido!");
  console.log("Admin: admin@thomeempreendimentos.com.br / thome@2024");
  console.log("Corretor: corretor@thomeempreendimentos.com.br / corretor@2024");
  await client.end();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
