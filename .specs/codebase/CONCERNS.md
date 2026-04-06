# Concerns

**Analyzed:** 2026-04-05

---

## [CRITICAL] Race Condition Parcial no Token Single-Use

**Evidence:** `api/gerar-treino.ts:26-42` — o handler valida o token e depois faz PATCH `usado=true`, mas entre essas duas operações outro request pode passar pela validação.

**Risk:** Usuário mal-intencionado pode realizar dois requests simultâneos e gerar dois planos com uma única compra.

**Fix approach:** Usar upsert com condição (`usado=false` no WHERE do PATCH) e verificar `rowCount` retornado. Ou usar uma transação Supabase via RPC.

---

## [HIGH] Sem Validação de Input no Backend (gerar-treino)

**Evidence:** `api/gerar-treino.ts:8` — `idade`, `peso`, `altura`, `dias`, `objetivo`, `nivel` são inseridos diretamente no prompt sem validação de tipo, faixa ou sanitização.

**Risk:** Prompt injection, geração de conteúdo indesejado, ou crash por NaN no cálculo de IMC (`api/gerar-treino.ts:44`).

**Fix approach:** Validar campos antes de usar: tipos numéricos para `idade`/`peso`/`altura`/`dias`, enum check para `objetivo` e `nivel`. Usar Zod no backend.

---

## [HIGH] Sem Rate Limiting nas API Routes

**Evidence:** Nenhum middleware de rate limiting em `api/`.

**Risk:** Abuso da API OpenAI por enumeration de `order_code` válidos ou brute-force.

**Fix approach:** Adicionar Vercel Edge middleware ou usar Upstash Rate Limit nas rotas críticas (`/api/gerar-treino`, `/api/validar-token`).

---

## [HIGH] Sem Cobertura de Testes nas API Routes

**Evidence:** `src/test/` contém apenas boilerplate. Nenhum teste para `validar-token`, `gerar-treino` ou `webhook/kiwify`.

**Risk:** Regressões silenciosas em lógica crítica de negócio (token invalidation, webhook handling).

**Fix approach:** Adicionar testes de integração com Vitest + MSW (mock service worker) ou mocks diretos para as chamadas Supabase e OpenAI.

---

## [MEDIUM] Tipagem Fraca nos Handlers de API

**Evidence:** `api/*.ts` usam `req: any, res: any` — sem tipagem de request/response do Vercel.

**Risk:** Erros de acesso a propriedades inexistentes silenciosos em runtime.

**Fix approach:** Importar `VercelRequest, VercelResponse` do pacote `@vercel/node` e substituir `any`.

---

## [MEDIUM] html2canvas Instalado Mas Não Usado

**Evidence:** `html2canvas` nas `dependencies`, sem import no código atual.

**Fix approach:** Remover se não há plano de uso.

---

## [LOW] Múltiplas Pastas de Versão no Root

**Evidence:** Diretórios `shape-90-pro/`, `shape-90-pro-1/`, `shape-90-pro-2/` visíveis no git status como untracked.

**Risk:** Confusão sobre qual é o projeto ativo, possível vazamento acidental de código antigo.

**Fix approach:** Adicionar ao `.gitignore` ou remover se não forem necessários.

---

## [LOW] `catch {}` Vazio no Frontend

**Evidence:** `src/pages/forms.tsx:205` — `catch {}` sem logging nem feedback detalhado.

**Risk:** Erros silenciosos difíceis de debugar em produção.

**Fix approach:** Mínimo: `console.error(err)` no catch. Ideal: integrar Sentry ou similar.

---

## [LOW] PDF Gerado com Número Total de Páginas Fixo na Capa

**Evidence:** `src/lib/gerarPDF.ts:270` — `rodape(1, 1)` na capa é sobrescrito depois no loop final, mas se o loop falhar o rodapé fica errado.

**Risk:** Cosmético — rodapé incorreto no PDF em caso de erro.
