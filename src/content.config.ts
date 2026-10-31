import { defineCollection, z } from "astro:content";

const awards = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional()
  })
});

const articles = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().default(""),
    date: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false)
  })
});

const notes = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    category: z.enum(["paper-note"]),
    authors: z.array(z.string()).default([]),
    venue: z.string(),
    date: z.string(),
    status: z.string(),
    tags: z.array(z.string()).default([]),
    paperHref: z.string().url().optional(),
    codeHref: z.string().url().optional(),
    summary: z.string().optional()
  })
});

export const collections = {
  articles,
  awards,
  notes
};
