import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import site from "./_data/site.js";

export default function (config) {
    config.addPlugin(syntaxHighlight);
    config.addPlugin(feedPlugin, {
        type: "atom",
        outputPath: "/feed.xml",
        collection: {
            name: "writingFeed",
            limit: 0,
        },
        metadata: {
            language: "en",
            title: site.name,
            subtitle: site.description,
            base: site.url,
            author: {
                name: site.name,
                email: site.email,
            }
        }
    });

    config.addPassthroughCopy({"css": "css"});
    config.addPassthroughCopy({"assets": "assets"});

    config.addPreprocessor("extractTitle", "md", (data, content) => {
        if (!data.title) {
            const match = content.match(/^#\s+(.+)$/m);
            if (match) {
                data.title = match[1].trim();
                return content.replace(/^#\s+.+\r?\n+/, "");
            }
        }
    });

    config.addFilter("dateLabel", date => new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
    }).format(date));
    config.addFilter("dateShort", date => new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC"
    }).format(date));
    config.addFilter("dateISO", date => new Date(date).toISOString().slice(0, 10));
    config.addFilter("year", date => new Date(date).getUTCFullYear());
    config.addFilter("firstParagraph", html => html.match(/<p>[\s\S]*?<\/p>/)?.[0] ?? "");

    config.addCollection("writing", api => api.getFilteredByGlob("writings/*.md").sort((a, b) => b.date - a.date));
    config.addCollection("writingFeed", api => api.getFilteredByGlob("writings/*.md").sort((a, b) => a.date - b.date));
    config.addCollection("work", api => api.getFilteredByGlob("work/*.md").sort((a, b) => a.data.order - b.data.order));

    return {
        dir: {
            input: ".",
            includes: "_includes",
            data: "_data",
            output: "_site"
        }
    };
}
