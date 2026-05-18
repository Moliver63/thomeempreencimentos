// server/src/db/seed.ts
import { db } from "./client";
import { empreendimentos, depoimentos } from "./schema";

console.log("🌱 Populando banco com dados da Thomé...");

async function seed() {
  // Empreendimentos reais do portfólio
  await db.insert(empreendimentos).values([
    {
      slug: "torre-di-bueno",
      nome: "Residencial Torre Di Bueno",
      tipo: "residencial",
      status: "concluido",
      descricao: "Localizado na Rua 3122, esquina com a Rua 3158, no centro de Balneário Camboriú. Edifício de alto padrão com 27 pavimentos, sendo 19 apartamentos tipos, cobertura duplex, 4 pavimentos de garagem e 1 pavimento lazer.",
      endereco: "Rua 3122, esquina com Rua 3158",
      cidade: "Balneário Camboriú",
      estado: "SC",
      pavimentos: 27,
      ano_entrega: 2021,
      destaque: true,
    },
    {
      slug: "residencial-dona-lica",
      nome: "Residencial Dona Lica",
      tipo: "residencial",
      status: "concluido",
      descricao: "Localizado na Rua 1922, no centro de Balneário Camboriú. Edificação com 8 pavimentos, sendo 6 pavimentos tipos e 1 pavimento de garagem.",
      endereco: "Rua 1922, Centro",
      cidade: "Balneário Camboriú",
      estado: "SC",
      pavimentos: 8,
      ano_entrega: 2010,
      destaque: false,
    },
    {
      slug: "residencial-amanda-carolina",
      nome: "Residencial Amanda Carolina",
      tipo: "residencial",
      status: "concluido",
      descricao: "Localizada na Rua Figueira, Bairro Tabuleiro, Camboriú - SC. Possui 8 pavimentos, sendo 5 pavimentos tipos e 2 pavimentos garagem.",
      endereco: "Rua Figueira, Bairro Tabuleiro",
      cidade: "Camboriú",
      estado: "SC",
      pavimentos: 8,
      ano_entrega: 2014,
      destaque: false,
    },
    {
      slug: "ampliacao-corpo-bombeiros-itajai",
      nome: "Ampliação Corpo de Bombeiros de Itajaí",
      tipo: "obra_publica",
      status: "concluido",
      descricao: "Novo edifício em anexo à sede do Corpo de Bombeiros, localizado na Avenida Sete de Setembro, Bairro Fazenda, Itajaí. Consiste em 3 pavimentos com área total de 870,90 m², incorporando cozinha, dormitórios, administração e academia.",
      endereco: "Avenida Sete de Setembro, Bairro Fazenda",
      cidade: "Itajaí",
      estado: "SC",
      pavimentos: 3,
      area_total: 870.90,
      ano_entrega: 2020,
      destaque: true,
    },
    {
      slug: "reforma-sede-crea",
      nome: "Reforma da Sede do CREA",
      tipo: "obra_publica",
      status: "concluido",
      descricao: "Reforma da sede do CREA em Florianópolis. Trabalho incluiu alteração de pisos, pintura, equipamentos, recuperação estrutural, reparo de fachada, melhorias na rede elétrica e de telecomunicações, além da instalação de rede fotovoltaica (energia solar).",
      endereco: "Rodovia Admar Gonzaga, Bairro Itacorubi",
      cidade: "Florianópolis",
      estado: "SC",
      destaque: false,
    },
  ]).onConflictDoNothing();

  await db.insert(depoimentos).values([
    {
      nome: "Carlos Eduardo Bueno",
      cargo: "Proprietário - Torre Di Bueno",
      texto: "A Thomé entregou um empreendimento de altíssima qualidade. O prazo foi cumprido e o acabamento superou todas as expectativas. Recomendo sem hesitar.",
      nota: 5,
      ativo: true,
    },
    {
      nome: "Ana Paula Rodrigues",
      cargo: "Moradora - Residencial Dona Lica",
      texto: "Desde 2010 morando no Dona Lica e nunca tive problemas. Construção sólida, empresa séria. A Thomé realmente sabe o que faz.",
      nota: 5,
      ativo: true,
    },
  ]).onConflictDoNothing();

  console.log("✅ Seed concluído!");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
