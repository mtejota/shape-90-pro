# Shape 90 Pro — Projeto 90D

**Vision:** Plataforma SaaS de infoproduto que gera planos de treino personalizados de 90 dias via IA, entregues como PDF premium ao cliente logo após a compra.
**For:** Pessoas que compram o produto digital na Kiwify e desejam um plano de treino personalizado.
**Solves:** Elimina a necessidade de personal trainer presencial para quem quer um plano estratégico e personalizado de forma rápida, acessível e com entrega imediata pós-compra.

## Goals

- Converter compradores da Kiwify em usuários ativos que completam a geração do plano (métrica: taxa de acesso ao formulário após compra).
- Gerar planos de treino de qualidade percebida alta via GPT-4o-mini com PDF visual de marca forte (métrica: avaliações/feedbacks positivos, taxa de download do PDF).

## Tech Stack

**Core:**

- Framework: Vite 5 + React 18
- Language: TypeScript 5
- Runtime: Node.js (Vercel Serverless Functions)
- Package manager: npm

**Key dependencies:**
- shadcn/ui + Radix UI — componentes acessíveis
- Tailwind CSS 3 — estilização utility-first
- OpenAI SDK 6 — geração do plano via GPT-4o-mini
- jsPDF 4 — geração de PDF no cliente
- Supabase REST API — banco de dados de acessos (sem SDK, chamadas diretas via fetch)

## Scope

**v1 inclui:**

- Landing page de vendas (seções: Hero, Dor, Solução, Como Funciona, Autoridade, Oferta, FAQ, Footer)
- Fluxo de acesso via token único (order_code da Kiwify)
- Formulário de dados do aluno com validação de acesso
- Geração de plano personalizado via OpenAI GPT-4o-mini
- Exportação de PDF com layout premium (dark/vermelho)
- Webhook Kiwify para registro automático de compras e revogação por reembolso

**Explicitamente fora do escopo:**

- Área de membros / login/senha do usuário
- Histórico de planos gerados
- Painel administrativo
- Suporte a múltiplos idiomas
- App mobile nativo

## Constraints

- Timeline: produto em produção
- Technical: token de acesso é single-use (use-once por compra); Supabase acessado via REST direto sem SDK
- Resources: projeto solo / pequena equipe
