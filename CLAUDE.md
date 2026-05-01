# CLAUDE.md

## Project Overview

Aaron Deng's personal website — a multi-purpose Docusaurus site hosted on GitHub Pages. The site has three main sections:

1. **Menu Atelier** (`/tasting-menu`) — Collaborative tasting menu designer with real-time sync, AI recipe brainstorming, and dish image generation
2. **Blog** (`/blog`) — Personal blogging space for posting thoughts throughout the year
3. **Restaurant Reviews** — (Planned) A dedicated page for sharing restaurant reviews and dining experiences

## Branch Rules

- **`main` is protected** — no direct pushes allowed
- **All changes go through pull requests** — squash-and-merge only
- Always create feature branches from `main`, never commit directly to `main`
- Keep PR scope focused — one feature or fix per PR

## Tech Stack

- **Framework**: Docusaurus 2.2.0 (React 17)
- **Hosting**: GitHub Pages (`gh-pages` branch)
- **Collaboration**: Yjs + y-webrtc (peer-to-peer, WebRTC-based)
- **AI Services**: Pollinations.ai (free, no API key) for image generation and recipe brainstorming

## Commands

- `npm start` — Start dev server (default port 3000)
- `npm run build` — Production build to `build/`
- `npm run serve` — Serve production build locally
- `npm run deploy` — Deploy to GitHub Pages

## Project Structure

```
src/
  pages/
    index.js              — Homepage / landing page
    tasting-menu.js       — Menu Atelier (collaborative tasting menu designer)
  components/
    HomepageFeatures/     — Homepage feature cards
  css/
    custom.css            — Global theme overrides
blog/                     — Blog posts (markdown files)
docs/                     — Docusaurus docs section
static/                   — Static assets (images, favicon)
docusaurus.config.js      — Site config, navbar, footer
```

## Key Architectural Decisions

- **Menu Atelier** is a single-file React page (`src/pages/tasting-menu.js`) using `BrowserOnly` to avoid SSR issues with Yjs/WebRTC
- Yjs modules are loaded via dynamic `import()` inside the component, not at top-level, to prevent build failures
- `yjs` has no default export — always import as `const Y = await import('yjs')`, not `{ default: Y }`
- Collaboration uses a public WebRTC signaling server (`wss://signaling.yjs.dev`) — no backend required
- Image generation uses Pollinations.ai URL pattern: `https://image.pollinations.ai/prompt/{encoded_prompt}`
- Recipe brainstorming uses Pollinations.ai text endpoint: `https://text.pollinations.ai/{encoded_prompt}`

## Conventions

- Inline styles are used in Menu Atelier rather than CSS modules for self-containment
- Room codes follow the pattern `{adjective}-{ingredient}-{3-digit-number}` (e.g. `crispy-truffle-423`)
- Color palette for Menu Atelier: warm cream background (#f7f3ee), terracotta accent (#b85c38), sage green (#3d6b4f)
- Blog posts go in `blog/` as markdown files with frontmatter (date, title, tags)
