import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { parseFile } from "music-metadata";

const execFileAsync = promisify(execFile);

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
            const { common, format } = await parseFile(path.join(directory, file.name), {
                duration: true,
                skipCovers: true
            });
            const { stdout } = await execFileAsync("git", [
                "log", "--diff-filter=A", "--follow", "-1", "--format=%at", "--", file.name
            ], { cwd: directory });
            const date = stdout.trim() ? new Date(Number(stdout.trim()) * 1000).toISOString().slice(0, 10) : "";
            return {
                title: common.title?.trim() || file.name.replace(/\.mp3$/i, "").replace(/[-_]+/g, " "),
                comment: common.comment?.filter(comment => !/^iTun/i.test(comment.descriptor || ""))
                    .map(comment => comment.text?.trim()).find(Boolean) || "",
                date,
                duration: audioTime(format.duration),
                durationSeconds: format.duration || 0,
                url: `/audiolog/${encodeURIComponent(file.name)}`,
                filename: file.name
            };
        }));
    return { recordings: recordings.sort((a, b) => b.date.localeCompare(a.date) || b.filename.localeCompare(a.filename)) };
}
