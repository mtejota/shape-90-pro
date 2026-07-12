import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Content Layer API (Astro 5+). Cada .md em src/content/blog vira um post,
// e o nome do arquivo (sem extensão) vira o slug da URL: /blog/<slug>.
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    // Meta description: idealmente 120–160 caracteres.
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    // Perguntas frequentes → renderizadas na página + JSON-LD FAQPage.
    faq: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .default([]),
    // Slugs de posts relacionados (linkagem interna / autoridade tópica).
    related: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
