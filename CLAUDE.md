# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CLI-IZDAT is a hand-crafted static website by Alég Lutohin exploring the aesthetic and conceptual relationship between Eastern Bloc samizdat practices and modern CLI/terminal interfaces. It is a research and publishing platform, not a conventional software project.

## Development

No build system — all files are hand-written and deployed as-is to GitHub Pages.

- **Local preview:** Open `index.html` directly in a browser, or use any static server (e.g., `python3 -m http.server`)
- **Deploy:** Push to `main` branch → GitHub Pages auto-publishes (`.nojekyll` bypasses Jekyll)
- **No linting, testing, or compilation step**

The `.gitignore` excludes `.obsidian/`, `slides/`, and `output/` — Obsidian is used for note-taking; `slides/` and `output/` are reserved for a future build pipeline that doesn't yet exist.

## Architecture

### Visual System (`css/styles.css`)

Two distinct visual themes coexist:
- **Light/paper mode** (default): warm off-white `#f5f0e6`, dark ink `#1a1a18`, red accent `#cc3333` — evokes samizdat printed matter
- **Dark/terminal mode** (`.cli-izdat` class on `<body>`): `#0d1117` background, `#8b949e` text — evokes CRT terminals

Core design tokens are CSS custom properties on `:root`. Spacing scale: `--space-xs` (8px) through `--space-xl` (96px). Typography: Cascadia Code (body), Syne Mono (headings), Erika Type (h1, via CDN).

Special effects: `.scanlines::after` pseudo-element for CRT overlay; wolf-rehfeldt divider patterns using typed characters.

### Content Model

Posts live in `posts/<YYYYMMDD_slug>/` directories as Markdown files. Slides within a post are annotated with HTML comments:

```markdown
<!-- slide:cover -->
<!-- slide:text -->
<!-- slide:image -->
<!-- slide:combo -->
```

There is currently no Markdown-to-HTML parser or static site generator — post content is either rendered manually or this pipeline is planned. The `archive.html` `.cards` container is a placeholder for post cards that have not yet been wired up.

### Page Structure

- `index.html` — homepage with terminal-style login display and ASCII logo
- `archive.html` — post index with CSS Grid card layout (`auto-fill, minmax(280px, 1fr)`)
- `templates/` — empty, reserved for future reusable HTML templates
- `assets/` — shared fonts and images
