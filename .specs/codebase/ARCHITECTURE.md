# Architecture

**Pattern:** Monolito fullstack em monorepo — SPA React + Serverless Functions colocadas no mesmo repositório, deployadas na Vercel.

## High-Level Structure

```
Browser (React SPA)
    │
    ├── GET  /                → Landing page (Index.tsx)
    └── GET  /formulario?order_code=XXX
                │
                ├── POST /api/validar-token?order_code=XXX
                │       └── Supabase: SELECT acessos WHERE order_ref=XXX
                │
                └── POST /api/gerar-treino
                        ├── Supabase: PATCH acessos SET usado=true
                        └── OpenAI: chat.completions.create (gpt-4o-mini)
                                └── → resultado (markdown) → jsPDF (client-side)

POST /api/webhook/kiwify
    ├── Verifica HMAC-SHA256 (x-kiwify-signature)
    ├── order_approved → Supabase: INSERT acessos
    └── order_refunded → Supabase: PATCH acessos SET usado=true (revogação)
```

## Identified Patterns

### Serverless Handler Pattern

**Location:** `api/*.ts`, `api/webhook/*.ts`
**Purpose:** API routes independentes deployadas como Vercel Functions
**Implementation:** `export default async function handler(req, res)` — sem framework, sem tipagem forte (usa `any`)
**Example:** `api/validar-token.ts`, `api/gerar-treino.ts`

### Token Single-Use Pattern

**Location:** `api/validar-token.ts` + `api/gerar-treino.ts`
**Purpose:** Garante que cada compra gera apenas um plano
**Implementation:** `acessos.usado` é verificado na validação e marcado `true` antes de chamar OpenAI (evita race condition por ordem de operação)
**Example:** `api/gerar-treino.ts:26-43`

### Section Component Pattern (Landing Page)

**Location:** `src/components/*Section.tsx`
**Purpose:** Cada seção da landing page é um componente isolado
**Implementation:** Componente funcional simples, importados em ordem em `src/pages/Index.tsx`
**Example:** `HeroSection`, `PainSection`, `SolutionSection`, etc.

### Client-side PDF Generation Pattern

**Location:** `src/lib/gerarPDF.ts`
**Purpose:** Gera PDF com layout premium sem custo de servidor
**Implementation:** Parser de markdown linha a linha com renderizadores especializados (`renderSecao`, `renderSubsecao`, `renderBullet`, `renderParagrafo`, `renderDestaque`) usando jsPDF
**Example:** `src/lib/gerarPDF.ts`

### Progress Simulation Pattern

**Location:** `src/pages/forms.tsx:143-173`
**Purpose:** Feedback visual ao usuário durante chamada longa à OpenAI
**Implementation:** Loop com setTimeout que simula progresso por etapas (0→99%) enquanto await real acontece

## Data Flow

### Fluxo Pós-Compra (Webhook)

```
Kiwify → POST /api/webhook/kiwify
  → Valida HMAC-SHA256
  → Extrai: email, nome, order_id, order_ref
  → INSERT Supabase.acessos {email, nome, order_id, order_ref, usado: false}
  → Kiwify envia email ao cliente com link: /formulario?order_code={order_ref}
```

### Fluxo de Geração do Plano

```
Cliente acessa /formulario?order_code=XXX
  → GET /api/validar-token?order_code=XXX
      → SELECT Supabase.acessos WHERE order_ref=XXX
      → Se !registro → {valido: false, motivo: "token_invalido"}
      → Se registro.usado → {valido: false, motivo: "token_ja_usado"}
      → Senão → {valido: true, email}
  → Cliente preenche formulário (idade, peso, altura, dias, objetivo, nivel)
  → POST /api/gerar-treino {dados, order_code}
      → Valida token (novamente, server-side)
      → PATCH Supabase.acessos SET usado=true
      → Calcula IMC
      → OpenAI chat.completions (gpt-4o-mini, prompt longo estruturado)
      → Retorna {resultado: markdown}
  → Cliente renderiza markdown → botão "Baixar PDF"
  → jsPDF gera PDF no browser → download automático
```

## Code Organization

**Approach:** Feature-slice + layer

**Structure:**
```
src/
  pages/     — rotas (Index, forms, NotFound)
  components/ — componentes (ui/ shadcn + components de negócio)
  lib/       — utilitários (gerarPDF, utils)
  hooks/     — hooks reutilizáveis (use-mobile, use-toast)
api/
  webhook/   — handlers de webhook
  *.ts       — handlers de API REST
```

**Module boundaries:**
- Frontend (`src/`) e Backend (`api/`) são separados fisicamente
- Sem código compartilhado (types, utils) entre frontend e backend — duplicação intencional para simplicidade
