# Plan — Menu Atelier: Collaborative Tasting Menu Designer

## Vision

A web-based tool where chefs, food enthusiasts, and culinary teams can collaboratively design tasting menus in real time — brainstorm recipes, manage courses, and generate AI-powered dish images.

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
