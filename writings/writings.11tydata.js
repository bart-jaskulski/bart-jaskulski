import { extractDescription, markdown } from "../_config/markdown.js";

export default {
    layout: "layouts/post.njk",
    date: "git Created",
    permalink: "/writings/{{ page.fileSlug }}/",
    ogType: "article",
    writingNav: true,
    eleventyComputed: {
        date: (data) => data.page.date,
        title: data => data.title || data.page.source.content.match(/^#\s+(.+)$/m)?.[1].trim(),
        description: data => extractDescription(data.page.source.description ?? data.page.source.content, markdown)
    }
};
