# Plan — Aaron's Culinary Website

## Vision

A personal culinary website where Aaron can design tasting menus collaboratively, blog about food experiences, and share restaurant reviews — all centered around a passion for cooking and dining.

## Priority: Site Redesign

### Rebrand from K-Drama to Culinary Focus

- [ ] Rework the homepage to be focused on culinary experiences instead of K-Drama content
- [ ] Remove all drama-related elements (K-Drama landing, watched dramas docs, drama-themed branding)
- [ ] Redesign the homepage as a culinary-focused landing page
- [ ] Update site title, tagline, and favicon to reflect the culinary theme
- [ ] Rework the footer — replace "Follow me :)" section with an Instagram link to Aaron's cooking channel
- [ ] Remove MyDramaList, Discord, and Twitter links from the footer
- [ ] Update navbar to reflect the three main sections: Menu Atelier, Blog, Restaurant Reviews

### Menu Atelier — Grocery List Feature

- [ ] Add a "Groceries" section to the menu editor
- [ ] Allow users to add ingredients from any course into the grocery list
- [ ] Show grocery list as a checklist — users can mark items as bought
- [ ] Allow users to delete items once they have been purchased
- [ ] Sync the grocery list across collaborators via Yjs

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

## Planned Enhancements

### Near-term

- [ ] Responsive layout improvements for mobile/tablet
- [ ] Export menu as PDF (printable tasting menu card)
- [ ] Export menu as JSON for saving/loading
- [ ] Drag-and-drop course reordering
- [ ] Course type presets (amuse-bouche, appetizer, intermezzo, main, dessert, mignardise)
- [ ] Dark mode support

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
