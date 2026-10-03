import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import footnote from "markdown-it-footnote";

export let markdown;

export function setMarkdown(renderer) {
    markdown = renderer;
}

export function extractDescription(content, md) {
    const blocks = md.parse(content, {});
    const start = blocks.findIndex(token => token.type === "paragraph_open" && token.level === 0);
    if (start < 0) return "";

    const inline = blocks[start + 1];
    let remaining = 50;
    const tokens = [];
    const open = [];
    for (const token of inline.children) {
        if (["footnote_ref", "image", "html_inline"].includes(token.type)) continue;
        if (token.nesting === 1) open.push(token);
        if (token.nesting === -1) open.pop();
        if (token.type === "text" || token.type === "code_inline") {
            const words = [...token.content.matchAll(/\S+/g)];
            if (words.length > remaining) {
                const end = remaining ? words[remaining - 1].index + words[remaining - 1][0].length : 0;
                token.content = token.content.slice(0, end).trimEnd() + "…";
                tokens.push(token);
                for (const opening of open.reverse()) {
                    tokens.push(new opening.constructor(opening.type.replace(/_open$/, "_close"), opening.tag, -1));
                }
                break;
            }
            remaining -= Math.min(words.length, remaining);
        }
        tokens.push(token);
    }
    return md.renderer.renderInline(tokens, md.options, {});
}

export default function (config) {
    config.amendLibrary("md", mdLib => {
        setMarkdown(mdLib);
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
    config.addPreprocessor("drafts", "md", data => {
        if (process.env.ELEVENTY_RUN_MODE === "build" && /^\.\/writings\/_/.test(data.page.inputPath)) {
            return false;
        }
    });

    config.addPreprocessor("extractMetadata", "md", (data, content) => {
        let modified = content;
        const writing = data.page.inputPath.startsWith("./writings/");
        if (writing) {
            // Keep the heading available to computed data after removing it from the body.
            data.page.source = { content, description: data.description };
            if (!data.title) modified = content.replace(/^#\s+.+\r?\n+/, "");
        } else if (!data.title) {
            const match = content.match(/^#\s+(.+)$/m);
            if (match) {
                data.title = match[1].trim();
                modified = content.replace(/^#\s+.+\r?\n+/, "");
            }
        }
        if (!writing) data.description = extractDescription(data.description ?? modified, markdown);
        const env = { hashtags: new Set() };
        markdown.parse(writing ? content : modified, env);
        if (data.title) markdown.parseInline(data.title, env);
        if (env.hashtags.size) data.tags = [...new Set([...(data.tags || []), ...env.hashtags])];
        return modified;
    });

    config.addPreprocessor("renderDescription", "njk", data => {
        if (data.description) data.description = extractDescription(data.description, markdown);
    });

    config.addFilter("taggedTitle", title => markdown.renderInline(title));
}
