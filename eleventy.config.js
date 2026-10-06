import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import { transform } from "lightningcss";
import site from "./_data/site.js";
import markdownPlugin from "./_config/markdown.js";

export default function (config) {
    config.addPlugin(markdownPlugin);
    config.addPlugin(eleventyImageTransformPlugin, {
        formats: ["webp"],
        widths: [160, 320, 640],
        htmlOptions: {
            imgAttributes: { decoding: "async" }
        }
    });
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
    config.addPassthroughCopy(process.env.ELEVENTY_RUN_MODE === "build"
        ? "audiolog/[!_]*.[mM][pP]3"
        : "audiolog/*.[mM][pP]3");
    config.addWatchTarget("audiolog");

    config.addFilter("dateLabel", d => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }));
    config.addFilter("dateShort", d => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" }));
    config.addFilter("dateISO", d => d.toISOString().slice(0, 10));
    config.addFilter("year", d => d.getUTCFullYear());

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
