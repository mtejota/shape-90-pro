# 🔒 Guia de Configuração — Proteção de Acesso por Token

## O que foi alterado no projeto

| Arquivo | O que faz |
|---|---|
| `src/pages/forms.tsx` | Verifica token antes de mostrar o formulário |
| `api/webhook/kiwify.ts` | Recebe pagamento → gera token → envia email |
| `api/validar-token.ts` | Valida se o token é legítimo no Supabase |
| `vercel.json` | **Corrigido** — estava bloqueando as rotas `/api/*` |
| `supabase-setup.sql` | SQL para criar a tabela no banco |
| `.env.example` | Modelo de variáveis de ambiente |

---

## Como configurar (passo a passo)

### Passo 1 — Criar o banco no Supabase (5 min)

1. Acesse **https://app.supabase.com** e crie uma conta gratuita
2. Clique em **New Project** e crie um projeto
3. Vá em **SQL Editor** (menu lateral)
4. Cole o conteúdo do arquivo `supabase-setup.sql` e clique em **Run**
5. Vá em **Settings → API** e copie:
   - **Project URL** → vai para `SUPABASE_URL`
   - **service_role** secret → vai para `SUPABASE_SERVICE_KEY`
   > ⚠️ A chave `service_role` é secreta. Nunca coloque no frontend.

---

### Passo 2 — Criar conta no Resend para emails (3 min)

1. Acesse **https://resend.com** e crie uma conta (grátis: 3.000 emails/mês)
2. Vá em **API Keys → Create API Key** e copie a chave → `RESEND_API_KEY`
3. Vá em **Domains → Add Domain** e verifique seu domínio
4. No arquivo `api/webhook/kiwify.ts`, a linha `from:` já usa `EMAIL_DOMAIN`

---

### Passo 3 — Configurar variáveis no Vercel

No painel do Vercel → seu projeto → **Settings → Environment Variables**:

```
OPENAI_API_KEY        →  sk-...
SUPABASE_URL          →  https://xxxx.supabase.co
SUPABASE_SERVICE_KEY  →  eyJ... (service_role)
KIWIFY_WEBHOOK_SECRET →  (veja passo 4)
RESEND_API_KEY        →  re_...
EMAIL_DOMAIN          →  seudominio.com
SITE_URL              →  https://seusite.vercel.app
```

Após salvar, faça um **redeploy** do projeto.

---

### Passo 4 — Configurar webhook na Kiwify (2 min)

1. No painel Kiwify → seu produto → **Configurações → Webhooks**
2. Clique em **Adicionar Webhook**
3. **URL:** `https://seusite.vercel.app/api/webhook/kiwify`
4. **Eventos:** marque `order.paid` e `order.refunded`
5. Salve e copie o **Secret** gerado → coloque em `KIWIFY_WEBHOOK_SECRET` no Vercel
6. Faça outro redeploy após salvar o secret

---

## Como o fluxo funciona

```
 Cliente compra na Kiwify
         ↓
 Kiwify envia webhook → /api/webhook/kiwify
         ↓
 Servidor gera token único + salva no Supabase
         ↓
 Resend envia email com link:
 https://seusite.com/formulario?token=abc123...
         ↓
 Cliente clica no link → React verifica em /api/validar-token
         ↓
 Token válido  →  Formulário aparece ✅
 Token inválido → Tela de bloqueio  🔒
```

---

## Testando localmente antes do deploy

Simule um pagamento da Kiwify com este comando (substitua a URL pela sua local):

```bash
curl -X POST http://localhost:3000/api/webhook/kiwify \
  -H "Content-Type: application/json" \
  -d '{
    "event": "order.paid",
    "order_id": "TESTE-001",
    "Customer": {
      "email": "teste@gmail.com",
      "full_name": "João Teste"
    }
  }'
```

Vai aparecer um token no banco. Acesse:
```
http://localhost:3000/formulario?token=TOKEN_DO_BANCO
```

---

## Perguntas frequentes

**Cliente perdeu o email — como reenvio o link?**
Vá no Supabase → Table Editor → tabela `acessos` → encontre pelo email → copie o valor do campo `token` e monte o link manualmente:
`https://seusite.com/formulario?token=TOKEN_AQUI`

**Quero que o cliente use o link mais de uma vez?**
O token só é marcado como `usado` quando o treino é gerado. Se o cliente abre o formulário mas não clica em gerar, o link continua válido.

**O link expirou e o cliente não usou. O que fazer?**
No Supabase, edite o campo `expira_em` da linha do cliente para uma data futura.

**Como ver todos os clientes que compraram?**
Supabase → Table Editor → tabela `acessos`. Você vê email, data da compra, se o token foi usado etc.
