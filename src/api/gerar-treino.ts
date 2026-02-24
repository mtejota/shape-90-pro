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
Você é um personal trainer especialista em transformação física.

Dados do aluno:
Idade: ${idade}
Peso: ${peso}kg
Altura: ${altura}cm
IMC: ${imc.toFixed(1)}
Dias por semana: ${dias}
Objetivo: ${objetivo}
Nível: ${nivel}

Gere um RELATÓRIO COMPLETO E PROFISSIONAL contendo:

### 1. Análise Corporal
Interprete o IMC e explique a situação atual.

### 2. Estratégia Geral de Treino
Explique como o plano será estruturado.

### 3. Divisão Semanal Organizada
Monte o treino detalhado por dia com:
- Exercícios
- Séries
- Repetições
- Descanso

### 4. Estratégia de Progressão (8–12 semanas)
Explique como aumentar carga ou intensidade.

### 5. Projeção de Evolução em 90 dias
Explique possíveis resultados realistas.

### 6. Estratégia de Cardio
Personalizada conforme perfil.

### 7. Recomendações Alimentares Básicas
Direcionamento estratégico (sem prescrição clínica).

### 8. Alertas Baseados na Idade
Cuidados e recomendações.

Responda de forma organizada, profissional e clara.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  res.status(200).json({ resultado: response.choices[0].message.content });
}