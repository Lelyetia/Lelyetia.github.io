import { getCollection } from "astro:content";

const articleFiles = import.meta.glob("../content/articles/**/*.md");

export async function getPublishedArticles() {
  // Keep an empty article column empty, without creating placeholder search hits.
  if (!Object.keys(articleFiles).length) return [];
  const articles = await getCollection("articles", ({ data }) => !data.draft);
  return articles.sort((a, b) => b.data.date.localeCompare(a.data.date));
}
