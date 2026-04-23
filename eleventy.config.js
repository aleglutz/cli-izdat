export default function(eleventyConfig) {
    const pathPrefix = "/cli-izdat/";
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("archive/**/attachments/**");
    eleventyConfig.addCollection("posts", function (collectionApi) {
        return collectionApi
        .getFilteredByGlob("archive/*/*.md")
        .reverse(); // свежие сверху
});
    eleventyConfig.addFilter("date", function (value, format = "iso") {
        if (!(value instanceof Date)) return value;
        if (format === "iso") {
            return value.toISOString().slice(0, 10);
  }
  // место для будущих форматов — "human", "long" и т.д.
  return value.toISOString().slice(0, 10);
});
eleventyConfig.addTransform("wikilinks", function (content) {
  if (!this.page.outputPath || !this.page.outputPath.endsWith(".html")) {
    return content;
  }
    // this.page.url = "/archive/0001/CityNowhen/" (без pathPrefix)
    // собираем parentUrl без префикса, потом добавляем префикс
  const parentUrl = this.page.url.replace(/[^/]+\/?$/, "");
  const attachmentsUrl = pathPrefix.replace(/\/$/, "") + parentUrl + "attachments/";
  return content.replace(
    /!\[\[([^\]]+)\]\]/g,
    (_match, filename) => `<img src="${attachmentsUrl}${filename}" alt="">`
  );
});
  eleventyConfig.addTransform("slides", function (content) {
  // Работаем только с HTML-страницами
  if (!this.page.outputPath || !this.page.outputPath.endsWith(".html")) {
    return content;
  }
  // Если слайд-маркеров нет — ничего не делаем (fallback для обычных страниц)
  if (!content.includes("<!-- slide:")) {
    return content;
  }
  // Ищем зону слайдов
  const zone = content.match(/<article class="slides">([\s\S]*?)<\/article>/);
  if (!zone) return content;
  const [fullMatch, inner] = zone;
  // Разбиваем по маркерам: split с capture-группой
  // отдаёт массив [префикс, type1, body1, type2, body2, ...]
  const parts = inner.split(/<!--\s*slide:(\w+)\s*-->/);
  let slides = "";
  for (let i = 1; i < parts.length; i += 2) {
    const type = parts[i];
    const body = (parts[i + 1] || "").trim();
    slides += `<section class="slide slide--${type}">\n${body}\n</section>\n`;
  }
  const wrapped = `<article class="slides">\n${slides}</article>`;
  return content.replace(fullMatch, wrapped);
});
  return {
    pathPrefix: pathPrefix,
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
}