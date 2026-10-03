const time = seconds => {
    const total = Math.floor(seconds || 0);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

const speedKey = "audiolog:speed";
let preferredSpeed = 1;
let activeAudio;
try {
    const saved = Number(localStorage.getItem(speedKey));
    if ([1, 1.5, 2].includes(saved)) preferredSpeed = saved;
} catch {
    // Playback does not depend on browser storage.
}

class AudioLog extends HTMLElement {
    connectedCallback() {
        if (this.enhanced) return;
        this.enhanced = true;
        const audio = this.querySelector("audio");
        const controls = this.querySelector(".audio-controls");
        const button = controls.querySelector("button");
        const seek = controls.querySelector('input[type="range"]');
        const clock = controls.querySelector(".audio-time");
        const skipButtons = controls.querySelectorAll("[data-skip]");
        const session = navigator.mediaSession;
        this.setSpeed = rate => {
            audio.defaultPlaybackRate = audio.playbackRate = rate;
            controls.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.checked = Number(radio.value) === rate;
            });
        };
        this.setSpeed(preferredSpeed);
        const initialClock = clock.textContent;
        const initialDuration = Number(seek.max);
        const positionKey = `audiolog:position:${audio.getAttribute("src")}`;
        let position = 0;
        let lastSaved = 0;
        try {
            const saved = Number(localStorage.getItem(positionKey));
            if (Number.isFinite(saved) && saved > 0 && (!initialDuration || saved < initialDuration)) position = saved;
        } catch {
            // Listening still works when browser storage is unavailable.
        }
        const savePosition = () => {
            if (!audio.readyState) return;
            try {
                if (audio.ended || audio.currentTime === 0) localStorage.removeItem(positionKey);
                else localStorage.setItem(positionKey, String(audio.currentTime));
            } catch {
                // Storage can be blocked or full.
            }
            lastSaved = Date.now();
        };
        audio.addEventListener("loadedmetadata", () => {
            if (position > 0 && position < audio.duration) audio.currentTime = position;
            position = 0;
        }, { once: true });
        audio.addEventListener("timeupdate", () => {
            if (Date.now() - lastSaved >= 5000) savePosition();
        });
        for (const event of ["pause", "seeked", "ended"]) audio.addEventListener(event, savePosition);
        window.addEventListener("pagehide", savePosition);
        const update = () => {
            const duration = Number.isFinite(audio.duration) ? audio.duration : initialDuration;
            const currentTime = audio.readyState ? audio.currentTime : position;
            seek.disabled = !duration || !audio.seekable.length;
            skipButtons.forEach(skip => { skip.disabled = seek.disabled; });
            seek.max = duration;
            seek.value = currentTime;
            seek.setAttribute("aria-valuetext", `${time(currentTime)} of ${time(duration)}`);
            clock.textContent = duration ? `${time(currentTime)} / ${time(duration)}` : initialClock.replace("0:00", time(position));
            button.textContent = audio.paused ? "Play" : "Pause";
            button.setAttribute("aria-label", `${audio.paused ? "Play" : "Pause"} ${audio.getAttribute("aria-label")}`);
            if (session && activeAudio === audio) {
                session.playbackState = audio.ended ? "none" : audio.paused ? "paused" : "playing";
                if (duration > 0) session.setPositionState?.({
                    duration, playbackRate: audio.playbackRate, position: Math.min(currentTime, duration)
                });
            }
        };
        const play = async () => {
            try {
                if (audio.error) audio.load();
                await audio.play();
            } catch {
                // Leave the controls ready for another playback attempt.
                update();
            }
        };
        button.addEventListener("click", () => audio.paused ? play() : audio.pause());
        const seekTo = target => {
            if (!audio.seekable.length) return;
            audio.currentTime = Math.max(0, Math.min(target, audio.duration));
            savePosition();
            update();
        };
        skipButtons.forEach(skip => skip.addEventListener("click", () => {
            seekTo(audio.currentTime + Number(skip.dataset.skip));
        }));
        audio.addEventListener("play", () => {
            activeAudio = audio;
            document.querySelectorAll("audio-log audio").forEach(other => {
                if (other !== audio) other.pause();
            });
            if (session) {
                if (typeof MediaMetadata !== "undefined") session.metadata = new MediaMetadata({
                    title: audio.getAttribute("aria-label"), artist: this.dataset.author, album: "Audiolog"
                });
                const actions = {
                    play,
                    pause: () => audio.pause(),
                    seekbackward: ({ seekOffset = 15 }) => seekTo(audio.currentTime - seekOffset),
                    seekforward: ({ seekOffset = 15 }) => seekTo(audio.currentTime + seekOffset),
                    seekto: ({ seekTime }) => seekTo(seekTime)
                };
                for (const [action, handler] of Object.entries(actions)) {
                    try {
                        session.setActionHandler(action, handler);
                    } catch {
                        // Individual actions are not supported by every browser.
                    }
                }
            }
            update();
        });
        for (const event of ["loadedmetadata", "durationchange", "progress", "timeupdate", "pause", "ended", "ratechange"]) {
            audio.addEventListener(event, update);
        }
        seek.addEventListener("input", () => {
            seekTo(Number(seek.value));
        });
        controls.querySelector(".audio-speed").addEventListener("change", event => {
            preferredSpeed = Number(event.target.value);
            document.querySelectorAll("audio-log").forEach(player => player.setSpeed?.(preferredSpeed));
            try {
                localStorage.setItem(speedKey, String(preferredSpeed));
            } catch {
                // The current speed still applies when storage is blocked.
            }
        });
        audio.controls = false;
        audio.hidden = true;
        update();
        controls.hidden = false;
    }
}

customElements.define("audio-log", AudioLog);
