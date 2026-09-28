import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
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
    let md;
    config.amendLibrary("md", mdLib => {
        md = mdLib;
        mdLib.use(footnote);
        mdLib.set({ linkify: true });
        mdLib.core.ruler.after("linkify", "hashtags", state => {
            for (const block of state.tokens) {
                if (block.type !== "inline") continue;
                const children = [];
                let inLink = false;
                for (const token of block.children) {
                    if (token.type === "link_open") inLink = true;
                    if (token.type === "link_close") inLink = false;
                    if (token.type !== "text" || inLink) {
                        children.push(token);
                        continue;
                    }
                    let last = 0;
                    for (const match of token.content.matchAll(/(^|[^\p{L}\p{N}_])#([\p{L}\p{N}_-]+)/gu)) {
                        const start = match.index + match[1].length;
                        if (start > last) {
                            const plain = new token.constructor("text", "", 0);
                            plain.content = token.content.slice(last, start);
                            children.push(plain);
                        }
                        const tag = match[2].toLowerCase();
                        state.env.hashtags?.add(tag);
                        const open = new token.constructor("link_open", "a", 1);
                        open.attrSet("href", `/tags/${encodeURIComponent(tag)}/`);
                        const label = new token.constructor("text", "", 0);
                        label.content = `#${match[2]}`;
                        children.push(open, label, new token.constructor("link_close", "a", -1));
                        last = start + match[0].length - match[1].length;
                    }
                    if (last < token.content.length) {
                        const plain = new token.constructor("text", "", 0);
                        plain.content = token.content.slice(last);
                        children.push(plain);
                    }
                }
                block.children = children;
            }
        });
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
        const env = { hashtags: new Set() };
        md.parse(modified, env);
        if (data.title) md.parseInline(data.title, env);
        if (env.hashtags.size) data.tags = [...new Set([...(data.tags || []), ...env.hashtags])];
        return modified;
    });

    config.addFilter("dateLabel", d => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }));
    config.addFilter("dateShort", d => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" }));
    config.addFilter("dateISO", d => d.toISOString().slice(0, 10));
    config.addFilter("year", d => d.getUTCFullYear());
    config.addFilter("firstParagraph", html => html.match(/<p>[\s\S]*?<\/p>/)?.[0] ?? "");
    config.addFilter("taggedTitle", title => md.renderInline(title));

    const hashMap = new Map();
    config.addFilter("hash", url => {
        if (process.env.ELEVENTY_RUN_MODE === "build" && hashMap.has(url)) {
            return `${url}?v=${hashMap.get(url)}`;
        }
        try {
            const filePath = path.join(".", url);
            const content = fs.readFileSync(filePath);
            const hash = crypto.createHash("sha256").update(content).digest("hex").slice(0, 8);
            hashMap.set(url, hash);
            return `${url}?v=${hash}`;
        } catch {
            return url;
        }
    });

    config.addCollection("writing", api => api.getFilteredByGlob("writings/*.md").sort((a, b) => b.date - a.date));
    config.addCollection("writingFeed", api => api.getFilteredByGlob("writings/*.md"));
    config.addCollection("work", api => api.getFilteredByGlob("work/*.md").sort((a, b) => a.data.order - b.data.order));
    config.addCollection("taggedWriting", api => {
        const groups = {};
        for (const item of api.getFilteredByGlob("writings/*.md")) {
            for (const tag of item.data.tags || []) {
                (groups[tag] ||= []).push(item);
            }
        }
        for (const entries of Object.values(groups)) entries.sort((a, b) => b.date - a.date);
        return groups;
    });
}
