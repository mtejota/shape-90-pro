import OpenAI from "openai";
import { z } from "zod";

const normalizePtBrNumber = (value: unknown) => {
  if (typeof value === "string") {
    return value.replace(",", ".").trim();
  }
  return value;
};

const coercePtBrInt = z.preprocess(normalizePtBrNumber, z.coerce.number().int());
const coercePtBrFloat = z.preprocess(normalizePtBrNumber, z.coerce.number());

const schema = z.object({
  order_code: z.string().min(1),
  idade: coercePtBrInt.min(14).max(100),
  peso: coercePtBrFloat.min(30).max(300),
  altura: coercePtBrFloat.min(100).max(250),
  dias: coercePtBrInt.min(2).max(7),
  objetivo: z.enum(["hipertrofia", "definicao", "emagrecimento"]),
  nivel: z.enum(["iniciante", "intermediario", "avancado"]),
  local: z.enum(["academia", "casa", "sem_equipamento"]),
  limitacoes: z.string().max(500).optional().default(""),
});

const OBJETIVO_LABEL: Record<string, string> = {
  hipertrofia: "Hipertrofia (ganho de massa muscular)",
  definicao: "Definição muscular (manutenção de massa com redução de gordura)",
  emagrecimento: "Emagrecimento (perda de peso e redução de gordura corporal)",
};

const LOCAL_LABEL: Record<string, string> = {
  academia: "Academia (acesso a equipamentos completos: barras, máquinas, halteres, cabos)",
  casa: "Treino em casa (halteres, elásticos, banco, barra de porta)",
  sem_equipamento: "Sem equipamento (apenas peso corporal e superfícies domésticas)",
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ erro: "dados_invalidos", detalhes: parsed.error.flatten().fieldErrors });
    }

    const { order_code, idade, peso, altura, dias, objetivo, nivel, local, limitacoes } = parsed.data;

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!url || !key || !openaiKey) {
      console.error("[gerar-treino] Variáveis de ambiente ausentes");
      return res.status(500).json({ erro: "erro_servidor" });
    }

    const buscaRes = await fetch(
      `${url}/rest/v1/acessos?order_ref=eq.${encodeURIComponent(order_code)}&select=*&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!buscaRes.ok) {
      console.error("[Supabase] Erro na consulta:", await buscaRes.text());
      return res.status(500).json({ erro: "erro_servidor" });
    }

    const lista = await buscaRes.json();
    const registro = lista?.[0];

    if (!registro || registro.usado) {
      return res.status(403).json({ erro: "token_invalido" });
    }

    const imc = peso / ((altura / 100) ** 2);
    const imcClassificacao =
      imc < 18.5 ? "abaixo do peso" :
      imc < 25   ? "peso adequado" :
      imc < 30   ? "sobrepeso" :
                  "obesidade grau I ou superior";

    const openai = new OpenAI({ apiKey: openaiKey });

    const prompt = `Você é um Professor de Educação Física com CREF ativo, especializado em prescrição de exercícios, fisiologia do esforço e periodização do treinamento. Seu papel é elaborar um plano de treinamento completo, seguro e individualizado, como faria em uma avaliação física presencial.

FICHA DE AVALIAÇÃO DO ALUNO:
- Idade: ${idade} anos
- Peso corporal: ${peso} kg
- Estatura: ${altura} cm
- IMC: ${imc.toFixed(1)} kg/m² (${imcClassificacao})
- Frequência semanal disponível: ${dias} dias
- Objetivo principal: ${OBJETIVO_LABEL[objetivo]}
- Nível de treinamento: ${nivel}
- Local de treino: ${LOCAL_LABEL[local]}
- Limitações físicas / lesões relatadas: ${limitacoes || "Nenhuma relatada"}

ORIENTAÇÕES DE PRESCRIÇÃO:
- Adapte todos os exercícios ao local de treino informado. Não prescreva equipamentos que o aluno não tem acesso.
- Caso o aluno tenha limitações relatadas, substitua ou adapte os exercícios que possam agravar a condição.
- Use linguagem clara e acessível — este aluno não tem personal trainer presencial e seguirá o plano de forma autônoma.
- Justifique brevemente as escolhas de exercícios, volumes e intensidades com base nos dados do aluno.
- Seja realista nas projeções. Não prometa resultados impossíveis.

Estruture o plano EXATAMENTE na seguinte ordem:

# PLANO DE TREINAMENTO PERSONALIZADO – 90 DIAS

## Avaliação Inicial e Parecer Técnico
- Interprete o IMC de forma contextualizada (não use o IMC isolado como diagnóstico)
- Identifique o potencial de resposta ao treinamento considerando idade, nível atual e objetivo
- Aponte pontos de atenção com base nas limitações relatadas (se houver)
- Defina a estratégia geral de treinamento e o porquê dela para este aluno especificamente

## Periodização — Divisão em 3 Fases (90 dias)

### FASE 1 — Semanas 1 a 4: Adaptação e Base
- Objetivo fisiológico desta fase
- Volume e intensidade recomendados (series x repetições, %1RM estimado ou escala RIR/RPE)
- Foco nos padrões de movimento e técnica de execução
- Carga de treino semanal recomendada

### FASE 2 — Semanas 5 a 8: Desenvolvimento e Sobrecarga Progressiva
- Mudança de estímulo em relação à Fase 1
- Aumento de volume ou intensidade (explique qual variável será manipulada e por quê)
- Estratégia de progressão de carga

### FASE 3 — Semanas 9 a 12: Pico e Consolidação
- Objetivo final desta fase considerando o objetivo do aluno
- Estratégia de manutenção ou intensificação
- Semana de deload: quando aplicar e como estruturar

## Divisão Semanal de Treinos
Monte a divisão ideal para ${dias} dias por semana, considerando o objetivo (${OBJETIVO_LABEL[objetivo]}), o nível (${nivel}) e os equipamentos disponíveis.

Para cada sessão de treino, informe:
- Nome do treino e grupamentos musculares trabalhados
- Aquecimento específico (5 a 10 minutos)
- Lista de exercícios usando EXATAMENTE este formato para cada um:

**1. Nome do Exercício**
---
Séries: X | Repetições: X-X | Descanso: X segundos
Execução: instrução técnica de execução segura em 1-2 frases diretas.

- Volta à calma / alongamento final

## Progressão de Carga e Controle de Volume
- Como o aluno deve aumentar a carga ao longo das semanas (regra prática e simples)
- Como identificar que está na intensidade correta (escala de esforço percebido)
- Sinais de que precisa reduzir a carga ou descansar mais

## Estratégia Cardiovascular
Prescreva conforme o objetivo (${OBJETIVO_LABEL[objetivo]}) e o local de treino disponível:
- Modalidade recomendada e alternativas acessíveis
- Frequência, duração e intensidade por semana
- Quando fazer em relação ao treino de força (antes, depois, ou em dia separado)
- Progressão ao longo dos 90 dias

## Direcionamento Nutricional
Orientações gerais baseadas no peso corporal e objetivo — deixe claro que não substitui avaliação nutricional profissional:
- Estimativa de calorias diárias de manutenção e ajuste recomendado para o objetivo
- Ingestão proteica diária recomendada (g/kg de peso corporal)
- Distribuição de macronutrientes: orientação prática para dias de treino e descanso
- Hidratação e timing de refeições em relação ao treino

## Projeção Realista de Resultados em 90 Dias
Com base nos dados fornecidos, estime de forma honesta e realista:
- Ganho esperado de massa magra (intervalo mínimo e máximo)
- Redução de gordura corporal esperada
- Mudança visual aproximada
- Ajuste esperado no IMC ao final do programa

## Sistema de Monitoramento
Crie um protocolo simples para o aluno acompanhar sua evolução:
- O que medir/registrar semanalmente (peso, medidas, desempenho nos exercícios)
- Como interpretar esses dados sem precisar de equipamentos avançados
- Quando e como ajustar o treino se não estiver evoluindo
- Critérios para considerar o programa bem-sucedido ao final dos 90 dias
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 4000,
      messages: [
        {
          role: "system",
          content:
            "Você é um Professor de Educação Física com CREF ativo, especializado em prescrição de exercícios e periodização científica. Elabore planos de treinamento completos, seguros e individualizados. Use linguagem técnica mas acessível — seus alunos não têm acompanhamento presencial e dependem da clareza das suas instruções para treinar com segurança e eficiência.",
        },
        { role: "user", content: prompt },
      ],
    });

    const resultado = response.choices?.[0]?.message?.content?.trim();
    if (!resultado) {
      return res.status(502).json({ erro: "falha_geracao" });
    }

    // Marca como usado apenas após gerar o treino com sucesso.
    const patchRes = await fetch(
      `${url}/rest/v1/acessos?order_ref=eq.${encodeURIComponent(order_code)}&usado=eq.false`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Prefer": "return=representation",
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({ usado: true }),
      }
    );
    if (!patchRes.ok) {
      console.error("[Supabase] Erro ao marcar usado:", await patchRes.text());
      return res.status(500).json({ erro: "erro_servidor" });
    }

    const patchData = await patchRes.json();
    if (!Array.isArray(patchData) || patchData.length === 0) {
      return res.status(403).json({ erro: "token_invalido" });
    }

    return res.status(200).json({ resultado });
  } catch (err) {
    console.error("[gerar-treino] Erro inesperado:", err);
    return res.status(500).json({ erro: "erro_servidor" });
  }
}
