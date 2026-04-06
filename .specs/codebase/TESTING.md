# Testing Infrastructure

## Test Frameworks

**Unit/Integration:** Vitest 3.2.4
**DOM:** jsdom 20 + @testing-library/react 16 + @testing-library/jest-dom 6
**E2E:** Não configurado
**Coverage:** Não configurado

## Test Organization

**Location:** `src/test/`
**Naming:** `*.test.ts` / `*.test.tsx`
**Structure:** Pasta centralizada (não colocada ao lado dos arquivos fonte)

## Testing Patterns

### Unit Tests

**Approach:** Exemplo mínimo disponível (boilerplate Lovable)
**Location:** `src/test/example.test.ts`
**Setup:** `src/test/setup.ts` importa `@testing-library/jest-dom`

### Integration Tests

**Approach:** Não há testes de integração implementados
**Location:** N/A

### E2E Tests

**Approach:** Não configurado
**Location:** N/A

## Test Execution

**Commands:**
- `npm test` — executa todos os testes uma vez (`vitest run`)
- `npm run test:watch` — modo watch (`vitest`)

**Configuration:** `vitest.config.ts` na raiz

## Coverage Targets

**Current:** Não medido — sem configuração de coverage
**Goals:** Não documentado
**Enforcement:** Não automatizado

## Test Coverage Matrix

| Code Layer | Required Test Type | Location Pattern | Run Command |
|---|---|---|---|
| `src/lib/gerarPDF.ts` | unit | `src/test/gerarPDF.test.ts` | `npm test` |
| `src/pages/forms.tsx` | unit (component) | `src/test/forms.test.tsx` | `npm test` |
| `api/validar-token.ts` | integration | N/A (não implementado) | — |
| `api/gerar-treino.ts` | integration | N/A (não implementado) | — |
| `api/webhook/kiwify.ts` | integration | N/A (não implementado) | — |
| `src/components/ui/` | none | — | — |

> Note: Camada de API serverless sem nenhum teste. Ver CONCERNS.md.

## Parallelism Assessment

| Test Type | Parallel-Safe? | Isolation Model | Evidence |
|---|---|---|---|
| Unit (Vitest) | Yes | Sem estado compartilhado entre arquivos de teste | Todos os módulos são imports puros |

## Gate Check Commands

| Gate Level | When to Use | Command |
|---|---|---|
| Quick | Após mudanças em `src/lib/` ou `src/components/` | `npm test` |
| Build | Antes de deploy ou PR | `npm run lint && npm run build && npm test` |
