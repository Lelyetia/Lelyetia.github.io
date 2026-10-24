import { getCollection } from "astro:content";
import { getPublishedArticles } from "../utils/articles";

export async function GET() {
  const resources = await getCollection("learning");
  const articles = await getPublishedArticles();
  const items = [
    ...resources.map((item) => ({
      title: item.data.title, href: `/learning/${item.slug}/`, category: "学习资源",
      keywords: item.data.tags.join(" ")
    })),
    ...articles.map((item) => ({
      title: item.data.title, href: `/articles/${item.slug}/`, category: "文章",
      keywords: [item.data.description, ...item.data.tags].join(" ")
    }))
  ];
  return new Response(JSON.stringify(items), { headers: { "Content-Type": "application/json; charset=utf-8" } });
}
