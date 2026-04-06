# Project Structure

**Root:** `/Users/matheus/shape-90-pro`

## Directory Tree

```
shape-90-pro/
├── api/                        # Vercel Serverless Functions
│   ├── gerar-treino.ts         # POST — gera plano via OpenAI + invalida token
│   ├── validar-token.ts        # GET  — valida order_code no Supabase
│   └── webhook/
│       └── kiwify.ts           # POST — recebe eventos da Kiwify
├── src/
│   ├── main.tsx                # Entrypoint React
│   ├── App.tsx                 # Router principal (2 rotas)
│   ├── index.css               # Estilos globais Tailwind
│   ├── pages/
│   │   ├── Index.tsx           # Landing page
│   │   ├── forms.tsx           # Formulário + resultado do plano
│   │   └── NotFound.tsx        # 404
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components (gerados, não editar)
│   │   ├── HeroSection.tsx     # Seção hero da landing
│   │   ├── PainSection.tsx     # Seção dor
│   │   ├── SolutionSection.tsx # Seção solução
│   │   ├── HowItWorksSection.tsx
│   │   ├── AuthoritySection.tsx
│   │   ├── OfferSection.tsx    # Seção oferta/preço
│   │   ├── FaqSection.tsx
│   │   ├── FooterSection.tsx
│   │   ├── SocialProofToast.tsx # Toast de prova social
│   │   ├── FloatingCTA.tsx     # Botão CTA flutuante
│   │   ├── AnimatedSection.tsx # Wrapper de animação
│   │   └── NavLink.tsx
│   ├── lib/
│   │   ├── gerarPDF.ts         # Geração de PDF com jsPDF (layout premium)
│   │   └── utils.ts            # cn() utilitário Tailwind
│   ├── hooks/
│   │   ├── use-mobile.tsx      # Detecta viewport mobile
│   │   └── use-toast.ts        # Toast notifications
│   ├── assets/
│   │   └── hero-gym.jpg
│   └── test/
│       ├── setup.ts            # Configuração Vitest
│       └── example.test.ts     # Teste exemplo
├── public/                     # Assets estáticos
├── .specs/                     # Documentação spec-driven (este diretório)
├── vercel.json                 # Rewrite SPA para Vercel
├── vite.config.ts              # Config Vite
├── vitest.config.ts            # Config Vitest
├── tailwind.config.ts
├── tsconfig.json
├── components.json             # Config shadcn/ui
└── supabase-setup.sql          # Schema SQL da tabela acessos
```

## Module Organization

### API / Backend

**Purpose:** Serverless functions para validação de acesso, geração de planos e recebimento de webhooks
**Location:** `api/`
**Key files:** `gerar-treino.ts`, `validar-token.ts`, `webhook/kiwify.ts`

### Landing Page

**Purpose:** Página de vendas com seções sequenciais de copywriting
**Location:** `src/pages/Index.tsx` + `src/components/*Section.tsx`
**Key files:** `HeroSection.tsx`, `OfferSection.tsx`, `FaqSection.tsx`

### Fluxo do Formulário

**Purpose:** Validação de token, coleta de dados do aluno, exibição do plano e download do PDF
**Location:** `src/pages/forms.tsx`
**Key files:** `forms.tsx` (tudo em um arquivo), `src/lib/gerarPDF.ts`

### UI Components

**Purpose:** Componentes de UI reutilizáveis gerados pelo shadcn/ui
**Location:** `src/components/ui/`
**Key files:** Não editar manualmente — gerados via CLI shadcn

## Where Things Live

**Validação de acesso:**
- Frontend: `src/pages/forms.tsx` (verificarAcesso, estados de UI)
- Backend: `api/validar-token.ts` (query Supabase)

**Geração do plano:**
- Frontend: `src/pages/forms.tsx` (handleSubmit, barra de progresso, formatarResultado)
- Backend: `api/gerar-treino.ts` (invalidação de token + chamada OpenAI)

**PDF:**
- Client-side: `src/lib/gerarPDF.ts` (toda a lógica de layout e geração)

**Integração de pagamento:**
- Backend: `api/webhook/kiwify.ts`

## Special Directories

**`api/webhook/`:**
**Purpose:** Handlers de webhook de plataformas externas
**Examples:** `kiwify.ts` — recebe `order_approved` e `order_refunded`

**`src/components/ui/`:**
**Purpose:** Componentes shadcn/ui auto-gerados — não modificar manualmente
**Examples:** `button.tsx`, `dialog.tsx`, `form.tsx`, `select.tsx`
