import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Domínio de produção — usado em canonical, Open Graph e sitemap.
// Se o domínio mudar, altere APENAS esta constante.
export const SITE_URL = 'https://www.projetoshape90.com.br';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  base: '/blog',
  // Gera os arquivos estáticos DENTRO do dist/ do app Vite, sob /blog.
  // IMPORTANTE: o `vite build` roda ANTES (limpa dist/), o `astro build` DEPOIS.
  outDir: '../dist/blog',
  build: {
    format: 'directory', // /blog/<slug>/index.html
  },
  integrations: [sitemap()],
});
