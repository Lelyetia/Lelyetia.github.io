import { getPublishedArticles } from "../utils/articles";

export async function GET() {
  const articles = await getPublishedArticles();
  const items = [
    ...articles.map((item) => ({
      title: item.data.title, href: `/articles/${item.slug}/`, category: "文章",
      keywords: [item.data.description, ...item.data.tags].join(" ")
    }))
  ];
  return new Response(JSON.stringify(items), { headers: { "Content-Type": "application/json; charset=utf-8" } });
}
