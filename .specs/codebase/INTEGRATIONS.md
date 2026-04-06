# External Integrations

## Pagamento

**Service:** Kiwify
**Purpose:** Plataforma de vendas de infoproduto — dispara webhook após aprovação/reembolso de compra
**Implementation:** `api/webhook/kiwify.ts`
**Configuration:** `KIWIFY_WEBHOOK_SECRET` (env var) para validação HMAC
**Authentication:** HMAC-SHA256 sobre `JSON.stringify(req.body)`, header `x-kiwify-signature`

### Webhooks

**Source:** Kiwify
**Purpose:** Registrar acessos aprovados e revogar acessos reembolsados
**Location:** `api/webhook/kiwify.ts`
**Events:**
- `order_approved` → INSERT em `acessos` com `{email, nome, order_id, order_ref, usado: false}`
- `order_refunded` → PATCH em `acessos` WHERE `email=X` SET `usado=true`

**Payload quirk (importante):** A Kiwify às vezes envia dados na raiz do body, às vezes dentro de `body.order`. O handler resolve com: `const order = req.body?.order ?? req.body`.

**Campos usados do payload:**
```
order.webhook_event_type  — tipo do evento
order.Customer.email      — email do cliente
order.Customer.full_name  — nome do cliente
order.order_id            — ID interno Kiwify
order.order_ref           — referência única usada como token de acesso
```

---

## Banco de Dados

**Service:** Supabase
**Purpose:** Armazenar registros de acessos autorizados (compras aprovadas)
**Implementation:** Calls REST diretas via `fetch` (sem SDK `@supabase/supabase-js`)
**Configuration:** `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` (env vars)
**Authentication:** Service role key no header `apikey` + `Authorization: Bearer`

### API Endpoints Usados

| Operação | Endpoint | Quem chama |
|---|---|---|
| SELECT acesso por order_ref | `GET /rest/v1/acessos?order_ref=eq.{X}&select=*&limit=1` | `validar-token.ts`, `gerar-treino.ts` |
| INSERT novo acesso | `POST /rest/v1/acessos` | `webhook/kiwify.ts` |
| PATCH marcar como usado | `PATCH /rest/v1/acessos?order_ref=eq.{X}` | `gerar-treino.ts` |
| PATCH revogar por email | `PATCH /rest/v1/acessos?email=eq.{X}` | `webhook/kiwify.ts` |

### Schema: tabela `acessos`

```sql
-- ver supabase-setup.sql na raiz do projeto
-- campos observados no código:
email       text
nome        text
order_id    text
order_ref   text  -- chave de busca principal (= order_code na URL)
usado       boolean
criado_em   timestamptz
```

---

## Inteligência Artificial

**Service:** OpenAI
**Purpose:** Gerar plano de treino personalizado de 90 dias em markdown
**Implementation:** `api/gerar-treino.ts` via OpenAI SDK
**Configuration:** `OPENAI_API_KEY` (env var)
**Authentication:** API Key no SDK

### API Endpoints Usados

| Endpoint | Modelo | Parâmetros |
|---|---|---|
| `chat.completions.create` | `gpt-4o-mini` | `temperature: 0.7`, mensagens system + user |

**Prompt:** Estruturado com seções fixas (diagnóstico, periodização, treino semanal, progressão, projeção, cardio, nutrição, acompanhamento). Inclui dados do aluno e cálculo de IMC.

---

## Deploy

**Service:** Vercel
**Purpose:** Hosting da SPA React + Serverless Functions
**Configuration:** `vercel.json` — rewrite de todas as rotas não-API para `index.html`
**Environment Variables necessárias:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `OPENAI_API_KEY`
- `KIWIFY_WEBHOOK_SECRET`

---

## Email (Instalado, não ativo)

**Service:** Resend
**Purpose:** Envio de emails transacionais (não implementado no fluxo atual)
**Implementation:** Pacote `resend` instalado nas deps, sem uso em código
**Configuration:** `RESEND_API_KEY` seria necessário (não confirmado nas env vars)
