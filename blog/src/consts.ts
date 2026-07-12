// Metadados globais do blog e do site. Ponto único de configuração.
export const SITE_URL = 'https://www.projetoshape90.com.br';

// Prefixo de rota do blog (precisa bater com `base` no astro.config.mjs).
export const BASE = '/blog';

// Link do funil de conversão (mesmo CTA do site: começa o quiz).
export const CTA_HREF = '/quiz';

export const SITE = {
  name: 'Projeto Shape 90',
  title: 'Blog Projeto Shape 90 | Treino, Hipertrofia e Ganho de Massa',
  description:
    'Guias práticos e baseados em ciência sobre treino, hipertrofia e ganho de massa muscular. Aprenda a montar seu treino e transformar seu shape em 90 dias.',
  author: 'Equipe Projeto Shape 90',
  locale: 'pt_BR',
  lang: 'pt-BR',
  // Imagem padrão de compartilhamento (1200×630 idealmente). Servida pela raiz do site.
  defaultOgImage: '/og-default.jpg',
};
