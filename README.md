# Lelyetia的小站

我的个人博客，用来分享文章、记录学习过程，以及整理学习资源。使用 Astro 构建，部署于 GitHub Pages。

[访问博客](https://lelyetia.github.io/) · [知识库](https://lelyetia.github.io/Lelyetia-knowledge/)

## 本地开发

使用 Node.js 22，在项目根目录运行：

```bash
npm ci
npm run dev
```

开发地址默认为 `http://localhost:4321`，以终端实际输出为准。

## 构建与预览

```bash
npm run build
npm run preview
```

构建结果位于 `dist/`。推送到 `main` 分支后，GitHub Actions 会自动构建并部署网站。

## 内容维护

- 文章：`src/content/articles/`
- 学习资源：`src/content/learning/`
- 历史封面：`public/images/covers/`

文章和学习资源使用 Markdown 编写。将封面图片放入封面目录，重新构建后即可在网站中选择。

## 致谢

布局与动画参考了 [Fuwari](https://github.com/saicaca/fuwari)。相关许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
