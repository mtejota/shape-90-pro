# Tech Stack

**Analyzed:** 2026-04-05

## Core

- Framework: React 18.3.1
- Language: TypeScript 5.8.3
- Runtime: Node.js (Vercel Serverless Functions)
- Package manager: npm (bun.lockb presente — possível uso anterior de Bun)
- Build tool: Vite 5.4.19

## Frontend

- UI Framework: React 18 + shadcn/ui (baseado em Radix UI)
- Styling: Tailwind CSS 3.4 + tailwindcss-animate + @tailwindcss/typography
- State Management: useState local + TanStack React Query 5 (para cache/async)
- Form Handling: React Hook Form 7 + Zod 3 (validação de schema)
- Routing: React Router DOM 6
- Animações: Framer Motion 12

## Backend (Serverless)

- API Style: REST — Vercel Serverless Functions (arquivos em `/api/`)
- Database: Supabase REST API direta via `fetch` (sem SDK)
- Authentication: Token single-use (order_code/order_ref via query param)

## AI

- Provider: OpenAI SDK 6.24
- Model: gpt-4o-mini (geração de planos de treino)

## PDF

- Client-side: jsPDF 4.2 (geração direta no navegador)
- Canvas: html2canvas 1.4 (disponível, não em uso direto no fluxo atual)

## Email

- Resend 6.9 (instalado, não em uso ativo no fluxo atual)

## Testing

- Unit/Integration: Vitest 3.2.4
- DOM: jsdom + @testing-library/react 16 + @testing-library/jest-dom 6

## External Services

- Pagamento: Kiwify (webhook + HMAC-SHA256 signature validation)
- Banco de Dados: Supabase (tabela `acessos`)
- IA: OpenAI (chat completions)
- Deploy: Vercel

## Development Tools

- Linter: ESLint 9 + eslint-plugin-react-hooks + eslint-plugin-react-refresh
- TS Check: typescript-eslint 8
- Bundler: Vite com plugin @vitejs/plugin-react-swc
- Tagger: lovable-tagger (integração com Lovable.dev)
