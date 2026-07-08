import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    publishDate: z.date(),
  }),
});

export const collections = {
  blog,
};
