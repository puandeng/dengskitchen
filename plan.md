# Plan — Aaron's Culinary Website

## Vision

A personal culinary website where Aaron can design tasting menus collaboratively, blog about food experiences, and share restaurant reviews — all centered around a passion for cooking and dining.

## Priority: Site Redesign

### Rebrand from K-Drama to Culinary Focus

- [x] Rework the homepage to be focused on culinary experiences instead of K-Drama content
- [x] Remove all drama-related elements (K-Drama landing, watched dramas docs, drama-themed branding)
- [x] Redesign the homepage as a culinary-focused landing page
- [x] Update site title, tagline, and favicon to reflect the culinary theme
- [x] Rework the footer — replace "Follow me :)" section with an Instagram link to Aaron's cooking channel
- [x] Remove MyDramaList, Discord, and Twitter links from the footer
- [x] Update navbar to reflect the three main sections: Menu Atelier, Blog, Restaurant Reviews

### Menu Atelier — Grocery List Feature

- [x] Add a "Groceries" section to the menu editor
- [x] Allow users to add ingredients from any course into the grocery list
- [x] Show grocery list as a checklist — users can mark items as bought
- [x] Allow users to delete items once they have been purchased
- [x] Sync the grocery list across collaborators via Yjs

### Color Theme Overhaul

- [x] **Light mode — "Warm Spring"**: Soft pastels, warm greens, gentle florals — think cherry blossoms, fresh herbs, morning farmers market. Cream/linen backgrounds, sage and blush accents, warm gold highlights
- [x] **Dark mode — "Summer Nights"**: Deep navy/indigo sky, warm amber and candlelight tones — think rooftop dining, string lights, twilight. Rich dark blues, soft orange/copper accents, warm star-white text
- [x] Apply theme consistently across all pages (homepage, Menu Atelier, blog, restaurant reviews)
- [x] Update Menu Atelier's inline color palette to inherit from the site-wide theme
- [x] Ensure smooth transition between light and dark modes

## Completed (v1)

- [x] Landing page with Create / Join room flow
- [x] Real-time collaboration via Yjs + WebRTC (peer-to-peer, no backend)
- [x] Shareable room codes (e.g. `crispy-truffle-423`)
- [x] Tasting menu editor: editable menu name and theme
- [x] Course management: add, remove, reorder courses
- [x] Per-course fields: dish name, description, ingredients (tag input), chef's notes
- [x] AI recipe brainstorming via Pollinations.ai text API
- [x] AI dish image generation via Pollinations.ai image API
- [x] Collaborator count indicator
- [x] Navbar integration

## Priority: Next Up

### Bug Fixes

- [x] Fix AI image generation — switched to POST with `model=flux`, added loading state
- [x] Fix AI recipe brainstorming — switched to POST endpoint for reliable long prompts

### Menu Atelier — Save & Load Menus Locally

- [x] Allow the user to save the current menu to localStorage
- [x] Add a "Saved Menus" tab in the Menu Atelier landing page
- [x] Allow users to switch back and forth between saved menus and the live editor
- [x] Show saved menu name, date, and course count in the saved menus list

### Ingredients Database

- [x] Build an ingredients autocomplete database from previously used ingredients
- [x] Store ingredient history in localStorage so it persists across sessions
- [x] Show autocomplete suggestions when typing in the ingredients tag input

### Quick Fixes

- [x] Rename "Aaron's Kitchen" to "Deng's Kitchen" across the site (title, navbar, homepage)
- [x] Change copyright text from "Crafted with love and Docusaurus" to "Crafted with Food and Docusaurus"

### Branding & Copy Updates

- [x] Change the favicon and chef emoji on the main page to a cute pineapple bun (non-copyright image)
- [x] Rename "Food Journal" on main page and "Blog" in sidebar/nav to "Salt & Story"
- [x] Update tagline from "Crafting Culinary Experiences" to "Passion Project of a Home Cook"
- [x] Rename "Menu Atelier" to "Pepper & Palate" across the site
- [x] Change Pepper & Palate icon to reflect menu development instead of a literal pepper
- [x] Change Salt & Story icon to reflect writing/blogging instead of a salt shaker
- [x] Fix pineapple bun icon centering on the homepage so it looks right
- [x] Fix pineapple bun favicon not displaying correctly

### Fire & Feast — Video Recipe Page

- [x] Replace the Restaurant Reviews section with "Fire & Feast" — a new page for embedded YouTube cooking videos
- [x] Build the Fire & Feast page layout: embedded YouTube video on one side, recipe description column next to it
- [x] Add Fire & Feast to the navbar, footer, and homepage feature card (following Pepper & Palate / Salt & Story theming)
- [x] Add a YouTube link to the "Follow My Cooking" footer section alongside Instagram

## Planned Enhancements

### Near-term

- [ ] Responsive layout improvements for mobile/tablet
- [ ] Export menu as PDF (printable tasting menu card)
- [x] Export menu as JSON for saving/loading
- [ ] Drag-and-drop course reordering
- [ ] Course type presets (amuse-bouche, appetizer, intermezzo, main, dessert, mignardise)
- [x] Dark mode support

### Medium-term

- [ ] User avatars / cursor presence (show who is editing what)
- [ ] Version history / undo across collaborators
- [ ] Image gallery per course (save multiple generated images)
- [ ] Wine pairing database integration
- [ ] Ingredient cost estimation
- [ ] Dietary restriction / allergen tagging per course

### Long-term

- [ ] Persistent storage backend (Firebase or Supabase) for saving menus beyond session
- [ ] User accounts and menu library
- [ ] Claude API integration for deeper recipe brainstorming (replacing Pollinations text)
- [ ] Seasonal ingredient suggestions based on location and date
- [ ] Integration with supplier ordering systems
- [ ] Public menu sharing with read-only view links
- [ ] Template library (classic French, omakase, farm-to-table, etc.)

## Architecture Notes

### Current (v1 — serverless)

```
Browser A ←──WebRTC──→ Browser B
    ↕                      ↕
  Yjs Doc (CRDT)      Yjs Doc (CRDT)
    ↕                      ↕
Pollinations.ai      Pollinations.ai
(image + text)       (image + text)
```

- No backend server — all state is in Yjs CRDT documents synced peer-to-peer
- Signaling server (`wss://signaling.yjs.dev`) only handles WebRTC handshake
- Menus exist only while at least one participant is connected
- AI services are free and keyless (Pollinations.ai)

### Future (v2 — persistent)

```
Browser A ←──WebSocket──→ Backend ←──WebSocket──→ Browser B
                            ↕
                        Database
                     (Firebase/Supabase)
                            ↕
                      Claude API
                   (recipe brainstorm)
```

- Persistent menu storage with user accounts
- Server-side Claude API for higher-quality recipe suggestions
- Webhook-triggered notifications when collaborators make changes
