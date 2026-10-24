import { defineCollection, z } from "astro:content";

const learning = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    type: z.enum(["book", "video", "repo"]),
    typeLabel: z.string(),
    author: z.string(),
    cover: z.string(),
    status: z.string(),
    depth: z.string(),
    date: z.string(),
    tags: z.array(z.string()).default([]),
    source: z.string().optional(),
    sourceHref: z.string().url().optional(),
    videoHref: z.string().url().optional()
  })
});

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
  learning,
  articles,
  awards,
  notes
};
