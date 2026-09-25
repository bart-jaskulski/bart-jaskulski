import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import footnote from "markdown-it-footnote";
import { transform } from "lightningcss";
import site from "./_data/site.js";

function extractDescription(md) {
    let text = md.replace(/```[\s\S]*?```/g, "");
    text = text.replace(/<[^>]+>/g, "");
    text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    text = text.replace(/\[\^[^\]]+\]/g, "");
    text = text.replace(/`([^`]+)`/g, "$1");
    text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
    text = text.replace(/(^|[^\w])([*_])([^\s*_].*?)\2([^\w]|$)/g, "$1$3$4");

    const paragraphs = text
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0 && !p.startsWith("#"));

    if (paragraphs.length === 0) return null;

    let desc = paragraphs[0]
        .replace(/^[>\-+*]\s+/, "")
        .replace(/^\d+\.\s+/, "")
        .replace(/\s+/g, " ")
        .trim();

    if (desc.length > 160) {
        desc = desc.slice(0, 157).trim() + "…";
    }
    return desc || null;
}

export default function (config) {
    config.amendLibrary("md", mdLib => {
        mdLib.use(footnote);
        mdLib.set({ linkify: true });
        mdLib.renderer.rules.footnote_caption = (tokens, idx) => {
            let n = Number(tokens[idx].meta.id + 1).toString();
            if (tokens[idx].meta.subId > 0) {
                n += ":" + tokens[idx].meta.subId;
            }
            return n;
        };
    });

    config.addPlugin(syntaxHighlight);
    config.addPlugin(feedPlugin, {
        collection: { name: "writingFeed" },
        metadata: {
            language: "en",
            title: site.name,
            subtitle: site.description,
            base: site.url,
            author: site
        }
    });

    config.addTemplateFormats("css");
    config.addExtension("css", {
        outputFileExtension: "css",
        compile: async function (inputContent, inputPath) {
            return async () => {
                if (process.env.ELEVENTY_RUN_MODE === "build") {
                    let { code } = transform({
                        filename: inputPath,
                        code: Buffer.from(inputContent),
                        minify: true,
                        sourceMap: false
                    });
                    return code;
                }
                return inputContent;
            };
        }
    });
    config.addPassthroughCopy("assets");

    config.addPreprocessor("extractMetadata", "md", (data, content) => {
        let modified = content;
        if (!data.title) {
            const match = content.match(/^#\s+(.+)$/m);
            if (match) {
                data.title = match[1].trim();
                modified = content.replace(/^#\s+.+\r?\n+/, "");
            }
        }
        if (!data.description) {
            const desc = extractDescription(modified);
            if (desc) {
                data.description = desc;
            }
        }
        return modified;
    });

    config.addFilter("dateLabel", d => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }));
    config.addFilter("dateShort", d => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" }));
    config.addFilter("dateISO", d => d.toISOString().slice(0, 10));
    config.addFilter("year", d => d.getUTCFullYear());
    config.addFilter("firstParagraph", html => html.match(/<p>[\s\S]*?<\/p>/)?.[0] ?? "");

    config.addCollection("writing", api => api.getFilteredByGlob("writings/*.md").sort((a, b) => b.date - a.date));
    config.addCollection("writingFeed", api => api.getFilteredByGlob("writings/*.md"));
    config.addCollection("work", api => api.getFilteredByGlob("work/*.md").sort((a, b) => a.data.order - b.data.order));
}
