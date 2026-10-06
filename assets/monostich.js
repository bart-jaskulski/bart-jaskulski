import { lettering } from './monostich-lettering.js';

// |> starts the second line. Credits and pauses belong to the passage, not the glyphs.
const passages = [
    { text: 'Break things. |> Reassemble.' },
    { text: 'Follow questions |> like wiki links.' },
    {
        text: 'Delete, until |> only perfect remains',
        credit: 'after Saint-Exupéry',
        href: 'https://www.goodreads.com/quotes/19905-perfection-is-achieved-not-when-there-is-nothing-more-to'
    },
    { text: 'Burn up. |> Cool down.' },
    { text: "Work from home. |> It's convenient." },
    { text: 'Breathe in. Hold. |> Breathe out.', pause: 2600 },
    {
        text: "Don't get mad. |> Get busy.",
        credit: 'stolen from rwxrob',
        href: 'https://github.com/rwxrob/faq/blob/88ced2612f09b4213e9cd31b27cad34535512d5f/docs/why-another-go-book.adoc#:~:text=don%E2%80%99t%20get%20mad%2C%20get%20busy'
    }
];
const timing = { rest: 5000, linePause: 288, strokeSpeed: .16, penLift: 18, wordPause: 96 };
const INITIAL_DELAY = 250;

const gallery = document.querySelector('.monostich');
const heading = gallery.querySelector('h1');
const credit = gallery.querySelector('.monostich-credit');
let svg = gallery.querySelector('svg');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let recent = [];
let remaining = passages.map((_, index) => index);
let visible = false;
let timer;

function settle() {
    svg.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
}

function write(pause) {
    settle();
    if (reduced.matches) return 0;
    let delay = recent.length === 1 ? INITIAL_DELAY : 96;
    let end = 0;
    const strokes = [...svg.querySelectorAll('.pen-stroke')];
    for (const row of ['0', '1']) {
        const rowStrokes = strokes.filter(path => path.dataset.row === row);
        for (const word of new Set(rowStrokes.map(path => path.dataset.word))) {
            const group = rowStrokes.filter(path => path.dataset.word === word);
            for (const path of group) {
                const length = path.getTotalLength();
                const duration = Math.max(36, length * timing.strokeSpeed);
                path.animate([
                    { strokeDasharray: `${length} ${length}`, strokeDashoffset: length },
                    { strokeDasharray: `${length} ${length}`, strokeDashoffset: length * .72, offset: .2 },
                    { strokeDasharray: `${length} ${length}`, strokeDashoffset: length * .12, offset: .8 },
                    { strokeDasharray: `${length} ${length}`, strokeDashoffset: 0 }
                ], { duration, delay, easing: 'linear', fill: 'both' });
                end = delay + duration;
                delay = end + timing.penLift;
            }
            delay += timing.wordPause;
        }
        if (row === '0') delay += pause;
    }
    return end;
}

function schedule(writingTime = 0) {
    clearTimeout(timer);
    if (recent.length && visible && !document.hidden && !gallery.matches(':focus-within')) {
        timer = setTimeout(next, timing.rest + writingTime);
    }
}

function next() {
    if (!remaining.length) remaining = passages.map((_, index) => index);
    const candidates = remaining.filter(index => !recent.includes(index));
    const index = candidates[Math.floor(Math.random() * candidates.length)];
    remaining = remaining.filter(item => item !== index);
    recent = [...recent, index].slice(-3);
    const passage = passages[index];
    settle();
    const lines = passage.text.split('|>').map(line => line.trim());
    const markup = lettering(lines);
    const template = document.createElement('template');
    if (markup) template.innerHTML = markup;
    const artwork = markup ? template.content.firstElementChild : svg.cloneNode(false);
    gallery.classList.toggle('monostich-text', !markup);
    heading.replaceChildren(...lines.map(line => {
        const span = document.createElement('span');
        span.setAttribute('aria-hidden', 'true');
        span.textContent = line;
        return span;
    }));
    svg.replaceWith(artwork);
    svg = artwork;
    heading.setAttribute('aria-label', lines.join(' '));
    credit.replaceChildren();
    if (passage.credit) {
        const note = document.createElement(passage.href ? 'a' : 'span');
        note.textContent = passage.credit;
        if (passage.href) note.href = passage.href;
        credit.append(note);
    }
    const writingTime = markup ? write(passage.pause ?? timing.linePause) : 0;
    schedule(writingTime);
    return writingTime;
}

let initialWritingTime = 0;
const start = () => { initialWritingTime = next(); };
if (document.readyState === 'complete') start();
else window.addEventListener('load', start, { once: true });
let firstObservation = true;
reduced.addEventListener('change', settle);
document.addEventListener('visibilitychange', () => {
    if (document.hidden) settle();
    schedule();
});
gallery.addEventListener('focusin', () => schedule());
gallery.addEventListener('focusout', () => schedule());
new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) settle();
    schedule(firstObservation ? initialWritingTime : 0);
    firstObservation = false;
}).observe(gallery);
