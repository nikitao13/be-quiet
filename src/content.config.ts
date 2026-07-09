// src/content.config.ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({
    base: "./src/content/blog",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    publishDate: z.coerce.date(),
    description: z.string().optional(),
  }),
});

export const collections = {
  blog,
};
