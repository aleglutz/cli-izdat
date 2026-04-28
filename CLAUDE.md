# CLAUDE.md

Guidance for Claude (claude.ai, Claude Code) when working with this repository.

## Project Overview

**CLI-izdat** is a research and publishing project by Alég Lutohin exploring the aesthetic and conceptual relationship between Eastern Bloc samizdat practices and modern CLI/terminal interfaces. The repository hosts a static website and is being developed into a self-publishing pipeline where Markdown notes written in Obsidian become pages on the site.

This is a hybrid research/publishing project, not a conventional software product. CLI-izdat is both the aesthetic and the operating principle — work with it should prioritize terminal-based interaction (git, npm, Eleventy) over GUI tools.

Live site: https://aleglutz.github.io/cli-izdat/

## Stack

- **Static site generator:** Eleventy 3.1.5 (ES Modules, config uses `export default`)
- **Template language:** Nunjucks (`.njk`) for layouts and pages
- **Content:** Markdown with YAML frontmatter (equivalent to Obsidian Properties)
- **Deployment:** GitHub Actions builds and deploys on push to `main`
- **Hosting:** GitHub Pages, project site at `/cli-izdat/` path prefix
- **Node version:** 20 (set in `.github/workflows/deploy.yml`)

## Development Workflow

### Local preview

```sh
npx @11ty/eleventy --serve --pathprefix=/cli-izdat/
```

Serves on `http://localhost:8080/cli-izdat/` — the pathPrefix mirrors the production URL, so internal links work identically in dev and on Pages.

### Build once (no server)

```sh
npx @11ty/eleventy
```

Output goes to `_site/` (gitignored).

### Publishing a change

1. Edit `.md` or `.njk` in Obsidian / any editor
2. `git add -A && git commit -m "..." && git push`
3. GitHub Actions rebuilds `_site/` and deploys to Pages
4. Verify at https://aleglutz.github.io/cli-izdat/

No manual build or deploy steps — push is the publish action.

## Repository Structure

```
.
├── eleventy.config.js          # ES module, pathPrefix: "/cli-izdat/"
├── .eleventyignore             # README, pipeline docs, templates/, node_modules, .obsidian
├── .github/workflows/deploy.yml
├── .nojekyll                   # Tells Pages to skip Jekyll processing
├── package.json                # "type": "module", devDependency @11ty/eleventy
├── render.js                   # Playwright PNG pipeline (Instagram carousel output)
├── _includes/
│   └── post.njk                # Layout for individual posts
├── index.njk                   # Homepage
├── archive/
│   ├── index.njk               # Archive grid page; has layout: false in frontmatter
│   ├── archive.json            # Directory data: applies layout: post.njk to posts
│   └── {NNNN}/                 # One folder per post, zero-padded number
│       ├── {Name}.md           # Post content with frontmatter
│       └── attachments/        # Post-specific images (optional)
├── bin/
│   └── dither.sh               # Image dithering helper
├── css/
│   └── styles.css
└── assets/
    ├── fonts/
    └── images/
```

## URL Conventions

Disk path and URL are kept parallel for clarity:

| Disk | URL |
|---|---|
| `index.njk` | `/` |
| `archive/index.njk` | `/archive/` |
| `archive/0001/CityNowhen.md` | `/archive/0001/CityNowhen/` |

No custom `permalink` is configured — Eleventy's default path-to-URL mapping is used. The numbered folder pattern (`0001/`, `0002/`) is the canonical way to identify a post on the site.

## Templates and Path Prefix

All internal links use the `url` filter, never hardcoded paths:

```njk
<link rel="stylesheet" href="{{ '/css/styles.css' | url }}">
<a href="{{ '/archive/' | url }}">archive</a>
```

The `url` filter automatically prepends `/cli-izdat/` from `pathPrefix` in `eleventy.config.js`. If the site ever moves to a custom domain, changing the prefix in one place updates every link.

**Important:** `.html` files are passthrough-copied without template processing. To use `{{ ... }}` filters, the file must be `.njk`.

## Data Cascade (how `layout` is resolved)

Eleventy resolves data (including `layout`) in this precedence order, high to low:

1. File's own frontmatter
2. Template-specific data file (`{filename}.json`)
3. Directory data file (`{foldername}.json`)
4. Parent directory data files
5. Global data (`_data/`)

Current layout wiring:
- `archive/archive.json` sets `layout: post.njk` for everything in `archive/`
- `archive/index.njk` overrides with `layout: false` in its own frontmatter — the archive grid page is not a post and must not be wrapped in `post.njk`

When adding new sections (e.g., `essays/`, `journal/`), follow the same pattern: one directory data file per section, one layout per content type.

## Post Frontmatter

```yaml
---
title: City Nowhen
subtitle: Discovering Seoul Memory Places through Dark Tourism with Kids
date: 2026-04-09
location: Seoul, South Korea
tags: [seoul, memory, dark-tourism]
status: ready
---
```

These fields are:
- **Editable in Obsidian as Properties** (UI for YAML frontmatter)
- **Queryable by Dataview** inside the vault
- **Accessible in Nunjucks** as `{{ title }}`, `{{ subtitle }}`, etc.
- **Eleventy-reserved keys:** `title`, `date`, `tags`, `layout`, `permalink`

## Content Model: Slides

Posts are structured as series of slides, separated by `---` with an HTML comment marking the type of each slide:

```markdown
<!-- slide:cover -->
<!-- slide:text -->
<!-- slide:image -->
<!-- slide:combo -->
```

Slide parsing is implemented as an Eleventy transform (`"slides"` in `eleventy.config.js`). It runs on every HTML output page, finds `<article class="slides">`, splits on `<!-- slide:type -->` markers, and wraps each chunk in `<section class="slide slide--{type}">`. `post.njk` wraps `{{ content }}` in `<article class="slides">`, so the selector is always present for post pages.

Per-slide CSS styling (cover, text, image, combo) is still open.

## Dual Output (planned)

The same Markdown source is intended to produce two representations:

1. **Web page** — vertical slide stream, scrolled (current site work is here)
2. **Instagram carousel** — PNG 1080×1350, rendered by Playwright against the same HTML templates

`render.js` is implemented. Usage: `node render.js /cli-izdat/archive/0001/CityNowhen/` — requires the dev server running on port 8080. It opens the page at 1080×1350 (@2x), locates `.slide` elements, and screenshots each to `slides/{NNNN}-{Name}/slide-01.png` etc.

**render-mode (open):** Instagram render needs larger font sizes than the web view. Planned approach: `--font-base` CSS custom property + a `.render-mode` class on `<body>` that overrides it, toggled by Playwright before screenshotting. Do not hardcode font sizes for this — use the CSS var override pattern.

## Visual System (`css/styles.css`)

Two coexisting themes:

- **Paper mode** (default): warm off-white `#f5f0e6`, dark ink `#1a1a18`, red accent `#cc3333` — samizdat printed matter
- **Terminal mode** (`.cli-izdat` class on `<body>`): background `#0d1117`, text `#8b949e` — CRT terminal

Design tokens as CSS custom properties on `:root`. Spacing scale `--space-xs` (8px) through `--space-xl` (96px). Typography: Cascadia Code (body), Syne Mono (`h2`), IBM VGA 8x16 (`h3` subheadings), Erika Type (loaded but currently unused in layout).

### Image Scatter Principle

Images in `.row-media` cells must never appear visually aligned or stacked. Each image in its grid cell should feel casually placed, not composed.

Rules:
- Every `.row-with-media:nth-child(N) .row-media img` must have distinctly different `margin-top`, `margin-left`, and `width`
- `margin-top` range: 8px–80px (vary by ≥30px between sections)
- `margin-left` range: 0px–40px
- `width` range: 55%–80% (never 100%, never identical between sections)
- No two consecutive sections may share the same `margin-top`
- On mobile (`@media max-width: 640px`), all scatter resets: `margin: 0`, `width: 100%`

Goal: the right column reads as a loose collection, not a grid.

## Current Roadmap

Completed:
- Eleventy + Actions + Pages pipeline
- pathPrefix-aware internal linking
- Post layout (`post.njk`) with frontmatter-driven header
- Directory-based URL structure (`archive/NNNN/`)
- Slide parsing (`<!-- slide:type -->` → `<section class="slide slide--{type}>`)
- Wikilink handling (`![[image.png]]` → `<img>` via Eleventy transform)
- `render.js` Playwright PNG pipeline for Instagram

Active (next up):
- **figlet h1 on post pages** — render `{{ title | figlet(cover_font) }}` as ASCII art header; filter already exists in `eleventy.config.js`, needs wiring into `post.njk`
- **render-mode font override** — `--font-base` CSS var + `.render-mode` body class for Instagram-size fonts, toggled by Playwright
- **archive grid** — populate `<div class="cards">` in `archive/index.njk` via loop over `collections.posts`; each card = cover slide + clickable title + date

Backlog:
- Per-slide CSS styling (cover, text, image, combo types)
- `slide:video` type — parser + template support
- `slide:combo` with background image — `<!-- bg: filename.png -->` syntax (not yet in `eleventy.config.js`)
- Auto-dithering pipeline for `attachments/` (ImageMagick, Floyd-Steinberg/Atkinson/Bayer, triggered per-post via `dither: true` frontmatter flag)
- Mini-essay translation for Instagram captions
- Phone sync for published PNGs (Syncthing/AirDrop)
- Instagram Graph API integration (long-term)

## Working Principles

- **CLI-first.** Prefer `git`, `npm`, `npx eleventy`, file editing, over GUI tools. CLI-izdat is both subject and method.
- **Pure terminal aesthetic.** Decorative layers (noise textures, scanlines, fade animations, hover overlays) have been deliberately stripped in prior sessions. Terminal purity is the concept — do not reintroduce effects without explicit request.
- **Inline styles in HTML are avoided in site files.** Styles belong in `css/styles.css`. Exception: historical witness-page prototypes use inline styles for Claude-preview environment constraints; those files are separate from the main site.
- **Valid shell semantics.** CLI prompts in content (e.g., `n_euromancer@typedeck:~$`) should use plausible command structures, not decorative fake syntax.
- **One source, multiple outputs.** The `.md` file is canonical. Web and Instagram are views of the same content.

## Known Gotchas

- Eleventy's `--dryrun` reports "Wrote 0 files" even on successful runs because nothing is physically written. For diagnostics, run without `--dryrun` and inspect `_site/`.
- Pages aggressively caches. After deploy, use Cmd+Shift+R or an incognito window to see changes.
- `package.json` must have `"type": "module"` at the top level. A duplicated `"type": "commonjs"` key caused ES module loading to fail earlier — JSON takes the last value for duplicate keys.
- Both `.gitignore` and `.eleventyignore` should exclude `node_modules/`. When `.eleventyignore` exists, Eleventy's behavior around `.gitignore` can shift between versions; duplicating is safer.
## render-mode (active task)
CSS var `--font-base` + `.render-mode` class on `<body>`.
Playwright adds the class before screenshotting.
URL param `?render=1` adds it in browser (for preview).
Do NOT hardcode font sizes — always use the var override pattern.
