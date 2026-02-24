import OpenAI from "openai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { idade, peso, altura, dias, objetivo, nivel } = req.body;

  const imc = peso / ((altura / 100) ** 2);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `
Você é um personal trainer especialista em transformação corporal, periodização científica e hipertrofia baseada em evidência.

Crie um PLANO PREMIUM de transformação corporal em 90 dias.

Use linguagem estratégica, técnica e personalizada.

DADOS DO ALUNO:
- Idade: ${idade}
- Peso: ${peso}kg
- Altura: ${altura}cm
- IMC: ${imc.toFixed(1)}
- Frequência semanal: ${dias} dias
- Objetivo: ${objetivo}
- Nível de treino: ${nivel}

⚠️ IMPORTANTE:
Não gere um treino genérico.
Explique decisões estratégicas com base nos dados.
Adapte volume, intensidade e estrutura ao nível e objetivo.

Estruture EXATAMENTE na seguinte ordem:

# PROJETO 90D – PLANO ESTRATÉGICO PERSONALIZADO

##  Diagnóstico Corporal Estratégico
- Interprete IMC de forma contextualizada
- Analise potencial de recomposição corporal
- Explique como idade e nível impactam resposta muscular
- Gere um SCORE de Potencial de Evolução (0 a 10) com justificativa

##  Estratégia Macro de Periodização (90 Dias)
Divida em 3 Fases:

### 🔹 FASE 1 (Semanas 1–4) – Adaptação Neural e Base Estrutural
Explique foco fisiológico

### 🔹 FASE 2 (Semanas 5–8) – Intensificação e Sobrecarga Progressiva
Explique mudança estratégica

### 🔹 FASE 3 (Semanas 9–12) – Pico de Performance e Consolidação
Explique objetivo final da fase

##  Estrutura Semanal Personalizada
Monte divisão ideal para ${dias} dias respeitando objetivo ${objetivo} e nível ${nivel}.

Para cada dia, inclua:
- Exercícios
- Séries
- Repetições
- Tempo de descanso
- Justificativa técnica breve

## Estratégia Avançada de Progressão
Explique:
- Progressão de carga
- Progressão de volume
- Estratégia de deload se necessário
- Como evitar platô

##  Projeção Realista de Evolução em 90 Dias
- Estimativa de ganho de massa magra
- Possível redução de gordura
- Mudança visual esperada
- Ajuste provável de IMC

##  Estratégia Cardiovascular Personalizada
Defina frequência, intensidade e objetivo metabólico conforme perfil.

##  Direcionamento Nutricional Estratégico
- Estimativa de calorias
- Faixa de proteína ideal baseada no peso
- Estratégia de distribuição de macros
- Estratégia para dias de treino vs descanso

##  Sistema de Acompanhamento
Crie:
- Métricas semanais de acompanhamento
- Indicadores de progresso
- Quando ajustar o plano

Linguagem:
Profissional, estratégica, motivadora e altamente personalizada.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "Você é um personal trainer de elite especializado em periodização científica, hipertrofia e recomposição corporal baseada em evidências.",
      },
      { role: "user", content: prompt },
    ],
  });

  res.status(200).json({
    resultado: response.choices[0].message.content,
  });
}