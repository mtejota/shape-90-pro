# State

**Última atualização:** 2026-04-05

## Decisões Técnicas

| Data | Decisão | Motivo |
|------|---------|--------|
| 2026-04 | Supabase acessado via fetch REST direto (sem SDK) | Simplicidade em serverless functions — sem dependência extra |
| 2026-04 | Token single-use baseado em `order_ref` da Kiwify | Evitar acesso múltiplo ao mesmo plano por compra única |
| 2026-04 | PDF gerado no cliente (jsPDF) | Evita processamento server-side pesado; mantém dados do aluno privados |
| 2026-04 | GPT-4o-mini como modelo de geração | Custo-benefício para geração de texto longo (plano de 90 dias) |
| 2026-04 | Deploy na Vercel com rewrite SPA | Serverless functions na `/api/` com SPA React no resto |

## Decisões Recentes

| Data | Decisão |
|------|---------|
| 2026-04 | `resend` removido — email descartado, Kiwify redireciona o cliente diretamente |
| 2026-04 | Campos `local` e `limitacoes` adicionados ao formulário e validados no backend |
| 2026-04 | `objetivo` corrigido: value `"recomposicao"` substituído por `"emagrecimento"` para consistência |
| 2026-04 | Race condition do token resolvida via PATCH condicional `usado=eq.false` com `Prefer: return=representation` |
| 2026-04 | Validação com Zod adicionada ao `api/gerar-treino.ts` (antes IMC era calculado sem checar tipos) |
| 2026-04 | Prompt reescrito com linguagem de Prof. de Ed. Física — inclui RIR/RPE, aquecimento, instrução de execução, projeção realista |
| 2026-04 | `temperature` reduzido de 0.7 → 0.4 e `max_tokens: 4000` adicionado |

## Blockers Ativos

Nenhum blocker no momento.

## Lições Aprendidas

- A Kiwify pode enviar o body do webhook com dados na raiz OU dentro de um objeto `order` — o handler precisa tratar ambos os casos (`req.body?.order ?? req.body`).
- A validação de assinatura Kiwify usa HMAC-SHA256 sobre `JSON.stringify(req.body)`.
- O `order_ref` (não `order_id`) é o identificador usado como `?order_code=` na URL do formulário.

## TODOs / Ideias Adiadas

- ~~Adicionar email de entrega automática do link após compra~~ — descartado: Kiwify redireciona o cliente diretamente para o formulário após a compra.
- [ ] Adicionar página de agradecimento pós-geração de plano
- [ ] Considerar rate limiting nas API routes para evitar abuso
- [ ] Considerar validar campos do formulário no backend antes de chamar OpenAI

## Preferências

- Modelos leves (haiku/flash) são suficientes para tarefas de estado e sessão.
