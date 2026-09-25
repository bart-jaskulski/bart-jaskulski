# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

11ty (Eleventy v3) static site generator, vanilla modern CSS baseline (CSS `@layer`, native nesting, logical properties, container queries, native View Transitions API), progressive enhancement vanilla JS (ES modules, zero heavy framework runtime), flat Markdown content files, deployed to GitHub Pages.

## Users

1. **Engineering Directors, Founders & Hiring Leads (EU / US / Global):** Seeking rare, high-leverage product engineers and technical leads who bridge deep backend systems architecture with impeccable product craft, speed, and autonomy.
2. **Peers, Open-Source Collaborators & Systems Engineers:** Visiting to inspect architectural decisions, explore open-source tools (Go TUIs, Symfony libraries, SolidJS/SQLite experiments), and engage with high-signal technical writing.
3. **Bartek Himself:** A permanent, unconstrained digital atelier, laboratory, and publishing ground that unifies commercial systems leadership with independent craft.

## Product Purpose

Create a lasting personal home and living archive for Bartek Jaskulski. Visitors discover how he thinks, what he builds, and what he notices in everyday life. The site supports:
- Publishing fragments, personal observations, technical notes, essays, and substantial work without a minimum length or forced professional relevance.
- Exploring meaningful relationships between entries while retaining direct access to individual pieces and the archive.
- Assessing professional experience through real decisions, artifacts, and outcomes, with clear routes to professional history and contact.
- Experiencing distinctive visual craft, warmth, and computational ease.

## Positioning

**A personal place from a culture where computation is ordinary, and individual expression is exquisitely cultivated.**

The imagined culture is 2044: technology is embraced as an ambient part of life. Historical craft is a source of pleasure and expression. Washi, carbon ink, rare electric blue, typographic density, and deliberate negative space give this personal place its material identity. Quietness leaves room for joy and surprise.

vision.md owns this cultural premise. This document owns product behavior; DESIGN.md owns visual decisions. The new direction is approved intent, not a description of completed implementation.

## Content and Discovery

- **Entries:** Short observations, everyday life, technical notes, essays, and projects have equal editorial dignity. Their length and purpose determine presentation; no invented personal content is needed to balance a layout.
- **Home:** A composed selection mixes a recent fragment and substantial work with a clear identity and brief introduction. Selection scales independently of archive size.
- **Reading:** Essays and notes have stable URLs, factual dates, and dedicated reading space. Returning from a piece should preserve the visitor's place where feasible.
- **Archive:** Provide a dependable index and understandable routes through older material. Older entries retain legibility. A spatial map is not required to find content.
- **Relationships:** Publish author-established associations with normal links. A proposed enhancement reveals related entries through cobalt marks and marginal annotations; prototype it before committing to implementation.
- **Professional discovery:** Work, professional history, and contact are directly reachable without deciphering symbols or exploring the whole composition.
- **Work:** Each project gets a title, three truthful sentences, and a direct link to the work. Do not generate dedicated work-description pages or add invented proof.

## Operating Context

- **Authoring Workflow:** Local markdown files written in Neovim/Vim, committed via git.
- **Reading Environment:** Desktop and mobile viewports across varied ambient light, requiring legibility, stable layouts, comfortable reading, and fast navigation.
- **Bilingual Cadence:** Natural authoring freedom in English and Polish depending on the subject matter, without heavy or obstructive localization toggles.

## Capabilities and Constraints

- **Static-First & Blazing TTFB:** Zero client hydration requirement. Core text, typography, and layout render immediately from raw static HTML/CSS.
- **Zero CSS Framework Bloat:** Pure native CSS layers, CSS variables, and modern web platform features; no Tailwind runtime or build-time churn.
- **Subtractive Interaction:** Interactions behave as inscriptions rather than bouncy widget animations. Ordinary state feedback targets 80–120ms; content stays available immediately.
- **Anti-Costume:** No literal Japanese kanji characters or kitsch sci-fi tropes. East Asian calligraphic balance is applied to typographic layout, spatial rhythm, stroke tension, and custom abstract compound glyphs.

## Brand Commitments

- **Identity:** Bartek Jaskulski. Senior PHP / Go / TypeScript Developer, Symfony 7 Certified Engineer, Tech Lead at WP Desk.
- **Substrate Tone:** Warm, tactile washi paper substrate (light, unbleached, micro-toothed ivory baseline).
- **Ink & Accent:** Deep obsidian sumi-e ink typography, paired with a single, highly disciplined piercing electric/ultramarine blue accent (used sparingly for active states, focus, and meaningful connections).
- **Voice:** Honest, direct, technically precise, warm, and curious. Plain labels make room for expressive composition; avoid grandiose interface terminology.

## Evidence on Hand

Background inventory for case-study development; verify metrics, technical details, and permission to disclose before publication. These notes alone do not substantiate new performance or verification claims.

- **Commercial Systems Leadership (WP Desk):** Architected the EU Omnibus Directive plugin (market leader), AI Workflow Generator for ShopMagic (11k+ users), AI RAG Chatbot with MariaDB Vector + n8n, internal infrastructure orchestration (`gitlab-ci`, `server-infrastructure`, `telemetry-platform`), custom concurrency and tooling (`wp-mutex`, `wp-init`, `wp-migrations`).
- **Flagship Independent Engineering:**
  - `picknext.games`: Boutique mood-driven game recommendation engine using Symfony 8.1, Twig, AssetMapper, 32-dimensional experiential distance vectors, Gemini intent translation.
  - `tildom`: Suite of local-first personal web applications (SolidJS, browser SQLite/OPFS, encrypted sync boundary).
  - Open Source: Contributor to `phpactor` (LSP implementation & PHP_CodeSniffer), Go CLI ecosystem (`commitment`, `ddc`, `em`, `rdr`).
  - Raw Field Notes: 30+ technical notes and project memos preserved in `../me/notes` and `../me/projects`.

## Product Principles

1. **Technological intimacy:** Computation makes the place effortless to use; craft makes it personal. Restraint supports pleasure, focus, and expression.
2. **Text as interface:** Typography, spacing, and relationships establish hierarchy. Familiar navigation and explicit labels remain available where needed.
3. **Truthful authorship:** No invented metrics, testimonials, personal experiences, causal connections, or authentication claims. A personal seal represents authorship only.
4. **Depth by choice:** Short writing can remain short; long writing can remain complete. Dense content retains readable type, structure, and room for annotation.
5. **Durable access:** Semantic HTML, normal links, and meaningful reading order preserve access across devices and assistive technology. Dedicated voice or terminal clients are outside current scope.
6. **Optional intelligence:** AI may assist authoring or suggest relationships for author approval. No chatbot, runtime AI dependency, covert attention tracking, or automatic rearrangement during reading is required.

## Accessibility & Inclusion

- Target WCAG AAA text contrast; verify actual rendered combinations before claiming compliance. Age or inactivity must not make content unreadable.
- Honor `prefers-reduced-motion` with immediate state changes.
- Preserve ordinary keyboard navigation, visible focus, and usable touch targets. Optional Vim shortcuts must not interfere with text entry or standard browser behavior.
- Keep unfamiliar symbols paired with discoverable meanings and accessible names; essential actions must not depend on hover, color alone, or learning a custom alphabet.
- Support readable layouts down to 320px without clipping content. Recompose asymmetry into a meaningful linear order on narrow screens.
