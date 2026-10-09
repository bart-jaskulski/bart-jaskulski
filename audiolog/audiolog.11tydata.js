import fs from "node:fs/promises";
import path from "node:path";
import { parseFile } from "music-metadata";

function audioTime(seconds) {
    const total = Math.floor(seconds || 0);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export default async function () {
    const directory = "audiolog";
    const files = await fs.readdir(directory, { withFileTypes: true });
    const recordings = await Promise.all(files
        .filter(file => file.isFile() && /\.mp3$/i.test(file.name)
            && (process.env.ELEVENTY_RUN_MODE !== "build" || !file.name.startsWith("_")))
        .map(async file => {
            const { common, format, native } = await parseFile(path.join(directory, file.name), {
                duration: true,
                skipCovers: true
            });
            const date = common.date?.trim().slice(0, 10) || String(common.year || "");
            return {
                title: common.title?.trim() || file.name.replace(/\.mp3$/i, "").replace(/[-_]+/g, " "),
                comment: common.comment?.filter(comment => !/^iTun/i.test(comment.descriptor || ""))
                    .map(comment => comment.text?.trim()).find(Boolean)
                    || Object.values(native).flat().find(tag => /^TXXX:comment$/i.test(tag.id))?.value?.trim() || "",
                date,
                dateLabel: /^\d{4}-\d{2}-\d{2}$/.test(date)
                    ? new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
                    : date,
                duration: audioTime(format.duration),
                durationSeconds: format.duration || 0,
                url: `/audiolog/${encodeURIComponent(file.name)}`,
                filename: file.name
            };
        }));
    return { recordings: recordings.sort((a, b) => b.date.localeCompare(a.date) || b.filename.localeCompare(a.filename)) };
}
