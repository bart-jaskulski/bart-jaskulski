const input = document.querySelector("#writing-search");
const status = document.querySelector("#search-status");
const results = document.querySelector("#search-results");
const fold = text => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const DEBOUNCE_DELAY = 500;
let entries;

function highlight(element, text, query) {
    const folded = fold(text);
    let start = 0;
    let found;
    while ((found = folded.indexOf(query, start)) !== -1) {
        element.append(document.createTextNode(text.slice(start, found)));
        const mark = document.createElement("mark");
        mark.textContent = text.slice(found, found + query.length);
        element.append(mark);
        start = found + query.length;
    }
    element.append(document.createTextNode(text.slice(start)));
}

function search() {
    const query = fold(input.value.trim());
    results.replaceChildren();
    if (!query) {
        status.textContent = "Start typing to search the writing.";
        status.classList.remove("is-visible");
        return;
    }

    const matches = entries.filter(item => fold(item.title).includes(query) || fold(item.text).includes(query))
        .sort((a, b) => Number(fold(b.title).includes(query)) - Number(fold(a.title).includes(query)));
    status.textContent = matches.length ? `${matches.length} ${matches.length === 1 ? "result" : "results"}` : "No matching writing.";
    status.classList.toggle("is-visible", matches.length === 0);

    for (const item of matches) {
        const position = fold(item.title).includes(query) ? -1 : fold(item.text).indexOf(query);
        const start = Math.max(0, position < 0 ? 0 : position - 60);
        const excerpt = item.text.slice(start, start + 180).trim();
        const li = document.createElement("li");
        const link = document.createElement("a");
        const title = document.createElement("span");
        const time = document.createElement("time");
        const summary = document.createElement("p");
        link.href = item.url;
        highlight(title, item.title, query);
        time.dateTime = item.date;
        time.textContent = new Date(`${item.date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
        highlight(summary, `${start ? "…" : ""}${excerpt}${start + 180 < item.text.length ? "…" : ""}`, query);
        link.append(title, time, summary);
        li.append(link);
        results.append(li);
    }
}

if (results) {
    input.value = new URLSearchParams(location.search).get("q") || "";
    if (input.value) input.focus({ preventScroll: true });
    input.addEventListener("input", () => {
        const q = input.value.trim();
        history.replaceState(null, "", q ? `/search/?${new URLSearchParams({ q })}` : "/search/");
        if (entries) search();
    });

    fetch("/search-index.json")
        .then(response => {
            if (!response.ok) throw new Error("Search index unavailable");
            return response.json();
        })
        .then(data => {
            entries = data;
            search();
        })
        .catch(() => {
            status.textContent = "Search couldn't load. Try reloading the page.";
            status.classList.add("is-visible");
        });
} else {
    let timer;
    let composing = false;
    const schedule = () => {
        clearTimeout(timer);
        const q = input.value.trim();
        if (q) timer = setTimeout(() => location.assign(`/search/?${new URLSearchParams({ q })}`), DEBOUNCE_DELAY);
    };
    input.addEventListener("input", () => {
        if (!composing) schedule();
    });
    input.addEventListener("compositionstart", () => {
        composing = true;
        clearTimeout(timer);
    });
    input.addEventListener("compositionend", () => {
        composing = false;
        schedule();
    });
}
