import { defineConfig } from "astro/config";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

const knowledgeResources = "https://lelyetia.github.io/Lelyetia-knowledge/learning-resources";

export default defineConfig({
  site: "https://lelyetia.github.io",
  redirects: {
    "/learning/": `${knowledgeResources}/`,
    "/learning/books/machine-learning-watermelon-pumpkin/": `${knowledgeResources}/machine-learning/machine-learning-watermelon-pumpkin/`,
    "/learning/books/opencv-python-practice/": `${knowledgeResources}/computer-vision/opencv-python-practice/`,
    "/learning/books/deep-learning-from-scratch/": `${knowledgeResources}/deep-learning/deep-learning-from-scratch/`,
    "/learning/books/dive-into-deep-learning/": `${knowledgeResources}/deep-learning/dive-into-deep-learning/`,
    "/learning/videos/d2l-v2/": `${knowledgeResources}/deep-learning/d2l-v2/`,
    "/learning/videos/pytorch-xiaotudui/": `${knowledgeResources}/deep-learning/pytorch-xiaotudui/`,
    "/learning/repos/deep-learning-empirical-studies/": `${knowledgeResources}/computer-vision/deep-learning-empirical-studies/`
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  }
});
