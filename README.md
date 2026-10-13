# Shape 90 Pro

Aplicação web desenvolvida para apresentar uma experiência digital de acompanhamento e evolução pessoal, com foco em organização, clareza visual e uma interface responsiva.

> Projeto desenvolvido como case de portfólio para demonstrar a construção de uma aplicação moderna com React, TypeScript, Vite e Tailwind CSS.

## Visão geral

O Shape 90 Pro foi estruturado como uma aplicação web com interface moderna, componentes reutilizáveis e uma base preparada para evolução do produto. O projeto também conta com uma área de blog independente, desenvolvida com Astro, ampliando a experiência de conteúdo e aquisição orgânica.

Este repositório demonstra:

- Desenvolvimento de uma interface responsiva e orientada à experiência do usuário;
- Organização de uma aplicação React com TypeScript;
- Criação de componentes reutilizáveis com Radix UI e shadcn/ui;
- Uso de animações e interações com Framer Motion;
- Visualização de dados com Recharts;
- Geração de documentos e exportações no navegador;
- Estruturação de um blog com Astro e sitemap;
- Configuração de ambiente de desenvolvimento, testes, lint e build de produção.

## Tecnologias

### Aplicação principal

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [React Router](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query)
- [Framer Motion](https://motion.dev/)
- [Recharts](https://recharts.org/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

### Blog

- [Astro](https://astro.build/)
- [Astro Sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)

### Qualidade e testes

- ESLint
- Vitest
- Testing Library
- JSDOM

## Estrutura do projeto

```text
.
├── src/          # Aplicação principal em React
├── public/       # Arquivos públicos e assets estáticos
├── blog/         # Blog desenvolvido com Astro
├── package.json  # Scripts e dependências da aplicação
└── vite.config.ts
```

## Como executar localmente

### Pré-requisitos

- Node.js 20 ou superior;
- npm.

Recomenda-se utilizar o [nvm](https://github.com/nvm-sh/nvm) para instalar e alternar entre versões do Node.js.

### Instalação

```bash
git clone https://github.com/mtejota/shape-90-pro.git
cd shape-90-pro
npm install
```

### Desenvolvimento

```bash
npm run dev
```

A aplicação ficará disponível no endereço exibido pelo Vite, normalmente `http://localhost:8080`.

Para executar o blog separadamente:

```bash
npm --prefix blog install
npm --prefix blog run dev
```

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build da aplicação e do blog |
| `npm run build:dev` | Gera o build utilizando o modo de desenvolvimento |
| `npm run preview` | Visualiza o build localmente |
| `npm run lint` | Executa a análise estática do código |
| `npm run test` | Executa os testes automatizados |
| `npm run test:watch` | Executa os testes em modo de observação |
| `npm --prefix blog run build` | Gera o build do blog |

## Build de produção

Para validar a versão de produção localmente:

```bash
npm run build
npm run preview
```

O comando de build principal também instala as dependências do blog e gera sua versão de produção.

## Deploy

A aplicação pode ser publicada em serviços compatíveis com aplicações Vite, como Vercel, Netlify ou Cloudflare Pages. Antes do deploy:

1. Configure as variáveis de ambiente exigidas pela aplicação, caso existam;
2. Utilize `npm run build` como comando de build;
3. Publique o diretório gerado pelo Vite conforme a configuração do provedor;
4. Configure as regras de fallback para SPA quando necessário;
5. Para o blog, configure o processo de build e a publicação conforme o ambiente escolhido.

## Variáveis de ambiente

Não inclua chaves privadas, tokens ou credenciais neste repositório. Caso o projeto utilize variáveis de ambiente, crie um arquivo `.env.local` baseado na configuração esperada pelo código e mantenha os valores sensíveis fora do controle de versão.

## Status do projeto

Projeto apresentado como case de portfólio e base para evolução contínua.

## Autor

Desenvolvido por [mtejota](https://github.com/mtejota).

## Licença

Este projeto é disponibilizado para fins de portfólio. Consulte o autor antes de reutilizar a interface, os conteúdos, os assets ou qualquer parte da implementação em produtos comerciais.
