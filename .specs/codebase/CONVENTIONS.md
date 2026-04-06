# Code Conventions

## Naming Conventions

**Files:**
- Componentes React: PascalCase — `HeroSection.tsx`, `FormularioContent`
- Pages: camelCase — `forms.tsx`, `Index.tsx`
- API handlers: kebab-case — `gerar-treino.ts`, `validar-token.ts`
- Libs/utils: camelCase — `gerarPDF.ts`, `utils.ts`
- Hooks: kebab-case com prefixo `use-` — `use-mobile.tsx`, `use-toast.ts`

**Functions/Components:**
- Componentes: PascalCase — `export default function Formulario()`
- Handlers: camelCase — `handler`, `handleSubmit`, `handleChange`
- Helpers internos: camelCase — `verificarAcesso`, `baixarPDF`, `formatarResultado`
- API handlers Vercel: sempre `export default async function handler(req, res)`

**Variables:**
- camelCase — `statusAcesso`, `motivoBloqueio`, `order_code`
- Exceção: `order_code`, `order_ref`, `order_id` usam snake_case para espelhar os campos da API Kiwify/Supabase

**Constants/Enums:**
- UPPER_SNAKE_CASE para mapas de mensagens — `MENSAGENS_BLOQUEIO`
- camelCase para objetos de constantes — `const C = { preto: [...], vermelho: [...] }` (paleta de cores)

## Code Organization

**Import Order (observado em forms.tsx e gerarPDF.ts):**
1. React e hooks do React
2. Utilitários de routing
3. Libs locais (`@/lib/...`)
4. Sem separação explícita com comentários — imports agrupados sem linha em branco entre eles

**File Structure (componentes de página):**
1. Types/interfaces locais
2. Constantes (mapas de mensagens, configurações)
3. Componente default (export default)
4. Sub-componentes auxiliares no mesmo arquivo (ex: `FormularioContent`)

## Type Safety

**Approach:** TypeScript com `any` explícito nos handlers de API serverless
- Handlers usam `req: any, res: any` — sem tipagem forte de request/response
- Frontend usa tipagem explícita onde relevante: `type StatusAcesso = "verificando" | "liberado" | "bloqueado"`
- Tipos de tupla para cores jsPDF: `[number, number, number]`
- `JSX.Element[]` como tipo de retorno explícito em `formatarResultado`

**Example (forms.tsx:4-8):**
```typescript
type StatusAcesso = "verificando" | "liberado" | "bloqueado";
type MotivosBloqueio = {
  [key: string]: { titulo: string; descricao: string };
};
```

## Error Handling

**Pattern:** try/catch com fallback visual ao usuário
- API handlers: retornam JSON com status HTTP apropriado (`400`, `401`, `403`, `500`)
- Frontend: `catch {}` vazio com `alert()` como fallback de UX — sem logging no cliente
- Supabase: verifica `res.ok` antes de processar resposta
- Motivos de bloqueio tipados como strings constantes: `"token_invalido"`, `"token_ja_usado"`, `"token_ausente"`, `"erro_servidor"`

## Styling

**Approach:** Tailwind CSS utility classes inline, sem CSS modules
- Tema: dark (bg-black, bg-zinc-900) com accent vermelho (red-600, red-700)
- Classes condicionais com template literals: `` `text-${x ? 'red' : 'gray'}-400` ``
- Sem uso de `cn()` utilitário nas páginas de negócio (somente em componentes shadcn/ui)

## Comments/Documentation

**Style:** Comentários de seção com `// ── Título ─────` em API handlers (estilo visual de separação)
- Frontend: poucos comentários; código auto-explicativo por nomes
- Sem JSDoc em nenhum arquivo
