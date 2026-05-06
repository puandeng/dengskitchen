import React, { useState, useEffect, useRef, useCallback } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';

// ─── Utilities ────────────────────────────────────────────────────────────────

function genId() {
  return Math.random().toString(36).substring(2, 9);
}

function genRoomCode() {
  const adj = ['crispy', 'silky', 'smoky', 'tangy', 'umami', 'bright', 'rich', 'golden', 'velvety', 'briny'];
  const noun = ['truffle', 'saffron', 'wagyu', 'miso', 'dashi', 'yuzu', 'fennel', 'burrata', 'ramp', 'ponzu'];
  const a = adj[Math.floor(Math.random() * adj.length)];
  const n = noun[Math.floor(Math.random() * noun.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${a}-${n}-${num}`;
}

function makeCourse(number) {
  return {
    id: genId(),
    number,
    courseName: `Course ${number}`,
    dishName: '',
    description: '',
    ingredients: [],
    notes: '',
    imagePrompt: '',
    imageUrl: null,
    imageSeed: genId(),
    brainstormResult: '',
    brainstormLoading: false,
  };
}

// ─── CSS Variable Helper ─────────────────────────────────────────────────────

function v(name) {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function useThemeColors() {
  const [colors, setColors] = useState({});

  useEffect(() => {
    const update = () => setColors({
      bg: v('--site-warm-bg') || '#f7f3ee',
      card: v('--site-card-bg') || '#ffffff',
      border: v('--site-border') || '#e5d9cc',
      accent: v('--site-accent') || '#b85c38',
      accentLight: v('--site-accent-light') || '#fdf0eb',
      green: v('--site-green') || '#6b8f5e',
      greenLight: v('--site-green-light') || '#eaf2e6',
      gold: v('--site-gold') || '#c49b3c',
      goldLight: v('--site-gold-light') || '#fdf6e3',
      text: v('--ifm-font-color-base') || '#2c1810',
      heading: v('--ifm-heading-color') || '#2c1810',
      muted: v('--site-muted') || '#7a6655',
      shadow: v('--site-card-shadow') || '0 2px 12px rgba(0,0,0,0.07)',
    });
    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return colors;
}

// ─── Ingredients Database (localStorage) ─────────────────────────────────────

const INGREDIENTS_DB_KEY = 'menu-atelier-ingredients-db';

function loadIngredientsDb() {
  try {
    return JSON.parse(localStorage.getItem(INGREDIENTS_DB_KEY) || '[]');
  } catch { return []; }
}

function saveIngredientToDb(ingredient) {
  const db = loadIngredientsDb();
  const lower = ingredient.toLowerCase().trim();
  if (!lower) return;
  const existing = db.find(i => i.toLowerCase() === lower);
  if (!existing) {
    db.push(ingredient.trim());
    db.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    localStorage.setItem(INGREDIENTS_DB_KEY, JSON.stringify(db));
  }
}

function saveIngredientsToDb(ingredients) {
  ingredients.forEach(i => saveIngredientToDb(i));
}

// ─── Saved Menus (localStorage) ──────────────────────────────────────────────

const SAVED_MENUS_KEY = 'menu-atelier-saved-menus';

function loadSavedMenus() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_MENUS_KEY) || '[]');
  } catch { return []; }
}

function saveMenuToStorage(menuData) {
  const menus = loadSavedMenus();
  const entry = {
    id: menuData.id || genId(),
    name: menuData.menuName || 'Untitled Menu',
    theme: menuData.menuTheme || '',
    courses: menuData.courses,
    groceries: menuData.groceries || [],
    savedAt: new Date().toISOString(),
    courseCount: menuData.courses.length,
  };
  const idx = menus.findIndex(m => m.id === entry.id);
  if (idx >= 0) menus[idx] = entry;
  else menus.unshift(entry);
  localStorage.setItem(SAVED_MENUS_KEY, JSON.stringify(menus));
  return entry.id;
}

function deleteSavedMenu(id) {
  const menus = loadSavedMenus().filter(m => m.id !== id);
  localStorage.setItem(SAVED_MENUS_KEY, JSON.stringify(menus));
}

// ─── JSON Export / Import ─────────────────────────────────────────────────────

function exportMenuAsJson(menuData) {
  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    menu: {
      name: menuData.menuName || 'Untitled Menu',
      theme: menuData.menuTheme || '',
      courses: (menuData.courses || []).map(c => ({
        courseName: c.courseName,
        dishName: c.dishName,
        description: c.description,
        ingredients: c.ingredients,
        notes: c.notes,
      })),
      groceries: (menuData.groceries || []).map(g => ({
        name: g.name,
        bought: g.bought,
      })),
    },
  };
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(menuData.menuName || 'menu').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importMenuFromJson() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return reject(new Error('No file selected'));
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data.menu) throw new Error('Invalid menu file');
          resolve({
            menuName: data.menu.name || 'Imported Menu',
            menuTheme: data.menu.theme || '',
            courses: (data.menu.courses || []).map((c, i) => ({
              ...makeCourse(i + 1),
              courseName: c.courseName || `Course ${i + 1}`,
              dishName: c.dishName || '',
              description: c.description || '',
              ingredients: c.ingredients || [],
              notes: c.notes || '',
            })),
            groceries: (data.menu.groceries || []).map(g => ({
              id: genId(),
              name: g.name,
              bought: g.bought || false,
            })),
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
}

// ─── Pollinations API (fixed) ────────────────────────────────────────────────

function buildImageUrl(prompt, seed) {
  const full = `Professional fine dining food photography of ${prompt}, michelin star restaurant, artistic plating, shallow depth of field, elegant presentation, studio lighting`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(full)}?width=600&height=450&nologo=true&seed=${seed}&model=flux`;
}

async function fetchBrainstorm(courseName, dishName, description) {
  const userMessage = `You are a creative Michelin-star chef consultant. Brainstorm ideas for this tasting menu course:

Course: ${courseName}
Dish: ${dishName || '(untitled)'}
Description: ${description || '(no description yet)'}

Provide concise, inspiring suggestions for:
- Key ingredients & sourcing
- Cooking techniques
- Flavor pairings & balance
- Plating & garnish
- Wine or beverage pairing

Keep each point brief and exciting.`;

  try {
    // Use POST endpoint for reliability with long prompts
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: userMessage }],
        model: 'openai',
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    console.error('Brainstorm error:', err);
    return 'Could not reach the brainstorm service. Please check your connection and try again.';
  }
}

// ─── Shared button style ─────────────────────────────────────────────────────

const btn = (bg, color) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 16px',
  background: bg,
  color,
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
  transition: 'all 0.15s',
  textDecoration: 'none',
  lineHeight: 1.4,
});

// ─── Tag Input with Autocomplete ─────────────────────────────────────────────

function TagInput({ tags, onChange, C }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (val) => {
    const tag = val.trim();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
      saveIngredientToDb(tag);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (val.trim().length > 0) {
      const db = loadIngredientsDb();
      const lower = val.toLowerCase();
      const matches = db
        .filter(i => i.toLowerCase().includes(lower) && !tags.includes(i))
        .slice(0, 8);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
      setInput('');
      setShowSuggestions(false);
    } else if (e.key === 'Backspace' && !input && tags.length) {
      onChange(tags.slice(0, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (s) => {
    addTag(s);
    setInput('');
    setShowSuggestions(false);
  };

  const removeTag = (i) => onChange(tags.filter((_, idx) => idx !== i));

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.bg, minHeight: 42, cursor: 'text' }}>
        {tags.map((t, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: C.accentLight, color: C.accent, borderRadius: 20, padding: '3px 10px', fontSize: 13, fontWeight: 500 }}>
            {t}
            <button onClick={() => removeTag(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accent, padding: 0, lineHeight: 1, fontSize: 15 }}>x</button>
          </span>
        ))}
        <input
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
          onBlur={() => { setTimeout(() => { if (input.trim()) { addTag(input); setInput(''); } }, 150); }}
          placeholder={tags.length ? '' : 'Type ingredient, press Enter...'}
          style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: C.text, flexGrow: 1, minWidth: 120 }}
        />
      </div>
      {showSuggestions && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 10, maxHeight: 180, overflow: 'auto', marginTop: 4 }}>
          {suggestions.map((s, i) => (
            <div
              key={i}
              onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(s); }}
              style={{ padding: '8px 12px', fontSize: 13, color: C.text, cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? `1px solid ${C.border}44` : 'none' }}
              onMouseEnter={e => e.target.style.background = C.accentLight}
              onMouseLeave={e => e.target.style.background = 'transparent'}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Grocery List ─────────────────────────────────────────────────────────────

function GroceryList({ groceries, onToggle, onRemove, onAddFromCourses, C, courses }) {
  const [manualInput, setManualInput] = useState('');

  const handleAddManual = () => {
    const item = manualInput.trim();
    if (item) {
      onAddFromCourses([item]);
      setManualInput('');
    }
  };

  const allIngredients = courses.flatMap(c =>
    c.ingredients.filter(ing => !groceries.some(g => g.name.toLowerCase() === ing.toLowerCase()))
  );
  const uniqueAvailable = [...new Set(allIngredients.map(i => i.toLowerCase()))].map(
    lower => allIngredients.find(i => i.toLowerCase() === lower)
  );

  const pending = groceries.filter(g => !g.bought);
  const bought = groceries.filter(g => g.bought);

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadow, overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ padding: '14px 20px', background: C.goldLight, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22 }}>🛒</span>
        <h3 style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: C.heading }}>Grocery List</h3>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: C.muted }}>{pending.length} to buy</span>
      </div>

      <div style={{ padding: 20 }}>
        {uniqueAvailable.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Add from courses</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {uniqueAvailable.map((ing, i) => (
                <button
                  key={i}
                  onClick={() => onAddFromCourses([ing])}
                  style={{ ...btn(C.greenLight, C.green), padding: '4px 12px', fontSize: 12, border: `1px solid ${C.green}33` }}
                >
                  + {ing}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddManual()}
            placeholder="Add a custom item..."
            style={{ flex: 1, padding: '9px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.text, background: C.bg, outline: 'none' }}
          />
          <button onClick={handleAddManual} disabled={!manualInput.trim()} style={{ ...btn(C.gold, '#fff'), opacity: manualInput.trim() ? 1 : 0.5 }}>
            Add
          </button>
        </div>

        {pending.length === 0 && bought.length === 0 && (
          <p style={{ color: C.muted, fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
            No items yet. Add ingredients from your courses or type a custom item above.
          </p>
        )}
        {pending.map(g => (
          <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.border}22` }}>
            <input type="checkbox" checked={false} onChange={() => onToggle(g.id)} style={{ width: 18, height: 18, accentColor: C.green, cursor: 'pointer' }} />
            <span style={{ flex: 1, fontSize: 14, color: C.text }}>{g.name}</span>
            <button onClick={() => onRemove(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 16, padding: '2px 6px', lineHeight: 1 }}>x</button>
          </div>
        ))}

        {bought.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Purchased</label>
            {bought.map(g => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', opacity: 0.55 }}>
                <input type="checkbox" checked={true} onChange={() => onToggle(g.id)} style={{ width: 18, height: 18, accentColor: C.green, cursor: 'pointer' }} />
                <span style={{ flex: 1, fontSize: 14, color: C.muted, textDecoration: 'line-through' }}>{g.name}</span>
                <button onClick={() => onRemove(g.id)} title="Remove" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', fontSize: 14, padding: '2px 6px', lineHeight: 1, fontWeight: 600 }}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({ course, onUpdate, onRemove, onMoveUp, onMoveDown, isFirst, isLast, C }) {
  const [showBrainstorm, setShowBrainstorm] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);

  const update = (key, val) => onUpdate(course.id, { [key]: val });

  const handleGenerateImage = () => {
    if (!course.imagePrompt.trim()) return;
    const newSeed = genId();
    setImgError(false);
    setImgLoading(true);
    const url = buildImageUrl(course.imagePrompt, newSeed);
    onUpdate(course.id, { imageSeed: newSeed, imageUrl: url });
  };

  const handleBrainstorm = async () => {
    setShowBrainstorm(true);
    update('brainstormLoading', true);
    update('brainstormResult', '');
    const result = await fetchBrainstorm(course.courseName, course.dishName, course.description);
    update('brainstormResult', result);
    update('brainstormLoading', false);
  };

  // Save ingredients to DB whenever they change
  useEffect(() => {
    if (course.ingredients.length > 0) {
      saveIngredientsToDb(course.ingredients);
    }
  }, [course.ingredients]);

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadow, overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: C.accentLight, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
          {course.number}
        </div>
        <input
          value={course.courseName}
          onChange={e => update('courseName', e.target.value)}
          style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 17, fontWeight: 700, color: C.heading, outline: 'none', fontFamily: 'Georgia, serif' }}
          placeholder="Course name..."
        />
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={onMoveUp} disabled={isFirst} title="Move up" style={{ ...btn(C.card, C.muted), padding: '5px 9px', opacity: isFirst ? 0.3 : 1, border: `1px solid ${C.border}` }}>up</button>
          <button onClick={onMoveDown} disabled={isLast} title="Move down" style={{ ...btn(C.card, C.muted), padding: '5px 9px', opacity: isLast ? 0.3 : 1, border: `1px solid ${C.border}` }}>dn</button>
          <button onClick={() => onRemove(course.id)} title="Remove course" style={{ ...btn(C.card, '#c0392b'), padding: '5px 9px', border: `1px solid ${C.border}` }}>x</button>
        </div>
      </div>

      <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 }}>Dish Name</label>
            <input
              value={course.dishName}
              onChange={e => update('dishName', e.target.value)}
              placeholder="e.g. Hokkaido Scallop, Cauliflower Veloute..."
              style={{ width: '100%', padding: '9px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.text, background: C.bg, boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 }}>Description</label>
            <textarea
              value={course.description}
              onChange={e => update('description', e.target.value)}
              placeholder="Describe the dish, its flavors, inspiration..."
              rows={4}
              style={{ width: '100%', padding: '9px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.text, background: C.bg, resize: 'vertical', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 }}>Ingredients</label>
            <TagInput tags={course.ingredients} onChange={tags => update('ingredients', tags)} C={C} />
            <p style={{ margin: '4px 0 0', fontSize: 11, color: C.muted }}>Press Enter or comma to add. Suggestions appear from your history.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 }}>Chef's Notes</label>
            <textarea
              value={course.notes}
              onChange={e => update('notes', e.target.value)}
              placeholder="Technique notes, service tips, variations to try..."
              rows={4}
              style={{ width: '100%', padding: '9px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.text, background: C.bg, resize: 'vertical', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 }}>Generate Dish Image</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={course.imagePrompt}
                onChange={e => update('imagePrompt', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerateImage()}
                placeholder="Describe visual: colours, garnish, plating..."
                style={{ flex: 1, padding: '9px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.text, background: C.bg, outline: 'none' }}
              />
              <button
                onClick={handleGenerateImage}
                disabled={!course.imagePrompt.trim()}
                style={{ ...btn(C.green, '#fff'), opacity: course.imagePrompt.trim() ? 1 : 0.5, whiteSpace: 'nowrap' }}
              >
                Generate
              </button>
            </div>
            {course.imageUrl && (
              <div style={{ marginTop: 10 }}>
                {imgLoading && !imgError && (
                  <div style={{ padding: 20, textAlign: 'center', color: C.muted, fontSize: 13 }}>Generating image...</div>
                )}
                <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}`, display: imgError ? 'none' : 'block' }}>
                  <img
                    src={course.imageUrl}
                    alt={course.dishName || 'Dish'}
                    onLoad={() => setImgLoading(false)}
                    onError={() => { setImgError(true); setImgLoading(false); }}
                    style={{ width: '100%', display: 'block', maxHeight: 220, objectFit: 'cover' }}
                  />
                </div>
                {imgError && (
                  <p style={{ marginTop: 8, fontSize: 12, color: '#c0392b' }}>Image failed to load. Try a different description or generate again.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <button
          onClick={handleBrainstorm}
          disabled={course.brainstormLoading}
          style={{ ...btn(showBrainstorm ? C.greenLight : C.green, showBrainstorm ? C.green : '#fff'), border: `1px solid ${C.green}44` }}
        >
          {course.brainstormLoading ? 'Thinking...' : 'AI Recipe Brainstorm'}
        </button>

        {showBrainstorm && (
          <div style={{ marginTop: 12, padding: 14, background: C.greenLight, border: `1px solid ${C.green}22`, borderRadius: 10 }}>
            {course.brainstormLoading ? (
              <div style={{ color: C.green, fontSize: 13 }}>Consulting the chef...</div>
            ) : (
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 13, color: C.text, fontFamily: 'inherit', lineHeight: 1.7 }}>
                {course.brainstormResult}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Menu Editor ──────────────────────────────────────────────────────────────

function MenuEditor({ roomId, menuName, menuTheme, courses, groceries, peers, saveId, onUpdateMenuName, onUpdateMenuTheme, onAddCourse, onUpdateCourse, onRemoveCourse, onMoveCourse, onAddGroceries, onToggleGrocery, onRemoveGrocery, onSaveMenu, onImportMenu, C }) {
  const [copied, setCopied] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const copyRoom = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSave = () => {
    onSaveMenu();
    setSaveMsg('Saved!');
    setTimeout(() => setSaveMsg(''), 2000);
  };

  const handleExport = () => {
    exportMenuAsJson({ menuName, menuTheme, courses, groceries });
  };

  const handleImport = () => {
    importMenuFromJson()
      .then(data => onImportMenu(data))
      .catch(() => {});
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '28px 20px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: peers > 1 ? '#27ae60' : C.muted }} />
            <span style={{ fontSize: 13, color: C.muted }}>{peers} collaborator{peers !== 1 ? 's' : ''} online</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={handleSave} style={{ ...btn(C.gold, '#fff'), padding: '5px 14px' }}>
              {saveMsg || 'Save Menu'}
            </button>
            <button onClick={handleExport} style={{ ...btn(C.green, '#fff'), padding: '5px 14px' }}>
              Export JSON
            </button>
            <button onClick={handleImport} style={{ ...btn(C.accent, '#fff'), padding: '5px 14px' }}>
              Import JSON
            </button>
            <span style={{ fontSize: 12, color: C.muted }}>Room:</span>
            <code style={{ fontSize: 13, background: C.accentLight, color: C.accent, padding: '4px 10px', borderRadius: 6, fontWeight: 600 }}>{roomId}</code>
            <button onClick={copyRoom} style={{ ...btn(copied ? C.green : C.accent, '#fff'), padding: '5px 12px' }}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Menu header */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: C.shadow, padding: '28px 32px', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <input
              value={menuName}
              onChange={e => onUpdateMenuName(e.target.value)}
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 28, fontWeight: 700, color: C.heading, outline: 'none', fontFamily: 'Georgia, serif' }}
              placeholder="Tasting Menu Name..."
            />
          </div>
          <input
            value={menuTheme}
            onChange={e => onUpdateMenuTheme(e.target.value)}
            placeholder="Theme or concept (e.g. Spring Foraging, Coastal Japan, Nose-to-Tail...)"
            style={{ width: '100%', border: 'none', borderTop: `1px solid ${C.border}`, paddingTop: 12, paddingBottom: 0, background: 'transparent', fontSize: 15, color: C.muted, outline: 'none', boxSizing: 'border-box', fontStyle: 'italic' }}
          />
        </div>

        {/* Courses */}
        {courses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: C.muted, fontSize: 15 }}>
            No courses yet. Add your first course below.
          </div>
        )}
        {courses.map((course, i) => (
          <CourseCard
            key={course.id}
            course={course}
            onUpdate={onUpdateCourse}
            onRemove={onRemoveCourse}
            onMoveUp={() => onMoveCourse(course.id, 'up')}
            onMoveDown={() => onMoveCourse(course.id, 'down')}
            isFirst={i === 0}
            isLast={i === courses.length - 1}
            C={C}
          />
        ))}

        <button
          onClick={onAddCourse}
          style={{ ...btn(C.accent, '#fff'), width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, borderRadius: 12, boxShadow: C.shadow, marginBottom: 28 }}
        >
          + Add Course
        </button>

        <GroceryList
          groceries={groceries}
          courses={courses}
          onToggle={onToggleGrocery}
          onRemove={onRemoveGrocery}
          onAddFromCourses={onAddGroceries}
          C={C}
        />
      </div>
    </div>
  );
}

// ─── Saved Menus Tab ─────────────────────────────────────────────────────────

function SavedMenusTab({ onLoadMenu, onBack, C }) {
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    setMenus(loadSavedMenus());
  }, []);

  const handleDelete = (id) => {
    deleteSavedMenu(id);
    setMenus(loadSavedMenus());
  };

  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  };

  return (
    <div style={{ minHeight: '80vh', background: C.bg, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 24, paddingTop: 60 }}>
      <div style={{ maxWidth: 600, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button onClick={onBack} style={{ ...btn(C.card, C.text), border: `1px solid ${C.border}`, padding: '6px 14px' }}>Back</button>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: C.heading, margin: 0 }}>Saved Menus</h2>
        </div>

        {menus.length === 0 ? (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 40, textAlign: 'center' }}>
            <p style={{ color: C.muted, fontSize: 15 }}>No saved menus yet.</p>
            <p style={{ color: C.muted, fontSize: 13 }}>Create a menu and click "Save Menu" to store it locally.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {menus.map(m => (
              <div key={m.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadow, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 17, color: C.heading, margin: '0 0 4px' }}>{m.name}</h3>
                  {m.theme && <p style={{ fontSize: 13, color: C.muted, margin: '0 0 6px', fontStyle: 'italic' }}>{m.theme}</p>}
                  <div style={{ fontSize: 12, color: C.muted }}>
                    {m.courseCount} course{m.courseCount !== 1 ? 's' : ''} &middot; Saved {formatDate(m.savedAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => onLoadMenu(m)} style={{ ...btn(C.green, '#fff'), padding: '6px 14px', fontSize: 13 }}>Open</button>
                  <button onClick={() => handleDelete(m.id)} style={{ ...btn(C.card, '#c0392b'), padding: '6px 14px', fontSize: 13, border: `1px solid ${C.border}` }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Landing Screen ───────────────────────────────────────────────────────────

function LandingScreen({ onCreateRoom, onJoinRoom, onOpenSaved, savedCount, C }) {
  const [joinInput, setJoinInput] = useState('');
  const [error, setError] = useState('');

  const handleJoin = () => {
    const code = joinInput.trim().toLowerCase();
    if (!code) { setError('Please enter a room code.'); return; }
    setError('');
    onJoinRoom(code);
  };

  return (
    <div style={{ minHeight: '80vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🍴</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, color: C.heading, margin: '0 0 10px' }}>Pepper & Palate</h1>
          <p style={{ color: C.muted, fontSize: 16, margin: 0, lineHeight: 1.6 }}>
            Collaborate in real time to design tasting menus,<br />
            brainstorm recipes, and visualise every dish.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: C.shadow, padding: 28 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: C.heading, margin: '0 0 8px' }}>Create a new menu</h2>
            <p style={{ color: C.muted, fontSize: 14, margin: '0 0 18px', lineHeight: 1.5 }}>
              Start fresh. You'll get a shareable room code to invite your team.
            </p>
            <button onClick={onCreateRoom} style={{ ...btn(C.accent, '#fff'), width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, borderRadius: 10 }}>
              Create New Menu
            </button>
          </div>

          {/* Saved Menus */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: C.shadow, padding: 28 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: C.heading, margin: '0 0 8px' }}>Saved Menus</h2>
            <p style={{ color: C.muted, fontSize: 14, margin: '0 0 18px', lineHeight: 1.5 }}>
              {savedCount > 0
                ? `You have ${savedCount} saved menu${savedCount !== 1 ? 's' : ''}. Pick up where you left off.`
                : 'No saved menus yet. Create a menu and save it to come back later.'}
            </p>
            <button onClick={onOpenSaved} style={{ ...btn(C.gold, '#fff'), width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, borderRadius: 10 }}>
              {savedCount > 0 ? 'View Saved Menus' : 'Saved Menus'}
            </button>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: C.shadow, padding: 28 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: C.heading, margin: '0 0 8px' }}>Join a session</h2>
            <p style={{ color: C.muted, fontSize: 14, margin: '0 0 14px', lineHeight: 1.5 }}>
              Enter the room code shared by your collaborator.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                value={joinInput}
                onChange={e => { setJoinInput(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="crispy-truffle-423"
                style={{ flex: 1, padding: '11px 14px', border: `1px solid ${error ? '#e74c3c' : C.border}`, borderRadius: 10, fontSize: 14, color: C.text, outline: 'none', background: C.bg }}
              />
              <button onClick={handleJoin} style={{ ...btn(C.green, '#fff'), borderRadius: 10, padding: '11px 18px' }}>
                Join
              </button>
            </div>
            {error && <p style={{ color: '#e74c3c', fontSize: 12, margin: '6px 0 0' }}>{error}</p>}
          </div>
        </div>

        <p style={{ textAlign: 'center', color: C.muted, fontSize: 12, marginTop: 24, lineHeight: 1.5 }}>
          Collaboration powered by WebRTC — no account needed.<br />
          AI features use <a href="https://pollinations.ai" target="_blank" rel="noopener" style={{ color: C.accent }}>Pollinations.ai</a> (free, no key required).
        </p>
      </div>
    </div>
  );
}

// ─── Main App (browser-only) ──────────────────────────────────────────────────

function TastingMenuApp() {
  const C = useThemeColors();
  const [screen, setScreen] = useState('landing'); // landing | saved | editor
  const [roomId, setRoomId] = useState('');
  const [peers, setPeers] = useState(1);
  const [menuName, setMenuName] = useState('Untitled Tasting Menu');
  const [menuTheme, setMenuTheme] = useState('');
  const [courses, setCourses] = useState([makeCourse(1)]);
  const [groceries, setGroceries] = useState([]);
  const [saveId, setSaveId] = useState(null);
  const [savedCount, setSavedCount] = useState(0);

  const yStateRef = useRef(null);
  const initDone = useRef(false);

  // Count saved menus on mount
  useEffect(() => {
    setSavedCount(loadSavedMenus().length);
  }, [screen]);

  const syncKey = useCallback((key, val) => {
    if (yStateRef.current) {
      yStateRef.current.set(key, typeof val === 'string' ? val : JSON.stringify(val));
    }
  }, []);

  const initRoom = useCallback(async (id) => {
    const Y = await import('yjs');
    const { WebrtcProvider } = await import('y-webrtc');

    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider(`menu-atelier-${id}`, ydoc, {
      signaling: ['wss://signaling.yjs.dev'],
    });

    const yState = ydoc.getMap('state');
    yStateRef.current = yState;

    provider.awareness.on('change', () => {
      setPeers(provider.awareness.getStates().size);
    });

    yState.observe(() => {
      const n = yState.get('menuName');
      const t = yState.get('menuTheme');
      const c = yState.get('courses');
      const g = yState.get('groceries');
      if (n !== undefined) setMenuName(n);
      if (t !== undefined) setMenuTheme(t);
      if (c) { try { setCourses(JSON.parse(c)); } catch {} }
      if (g) { try { setGroceries(JSON.parse(g)); } catch {} }
    });

    setTimeout(() => {
      if (!initDone.current && !yState.get('menuName')) {
        initDone.current = true;
        ydoc.transact(() => {
          yState.set('menuName', 'Untitled Tasting Menu');
          yState.set('menuTheme', '');
          yState.set('courses', JSON.stringify([makeCourse(1)]));
          yState.set('groceries', JSON.stringify([]));
        });
      } else {
        initDone.current = true;
      }
    }, 1200);

    setRoomId(id);
    setScreen('editor');
  }, []);

  const loadSavedIntoEditor = useCallback((menu) => {
    setSaveId(menu.id);
    setMenuName(menu.name);
    setMenuTheme(menu.theme || '');
    setCourses(menu.courses || [makeCourse(1)]);
    setGroceries(menu.groceries || []);
    // Create a room for collaboration but pre-fill with saved data
    const id = genRoomCode();
    initRoom(id).then(() => {
      // After room is ready, sync saved data
      setTimeout(() => {
        if (yStateRef.current) {
          const ydoc = yStateRef.current.doc;
          ydoc.transact(() => {
            yStateRef.current.set('menuName', menu.name);
            yStateRef.current.set('menuTheme', menu.theme || '');
            yStateRef.current.set('courses', JSON.stringify(menu.courses || [makeCourse(1)]));
            yStateRef.current.set('groceries', JSON.stringify(menu.groceries || []));
          });
        }
      }, 1500);
    });
  }, [initRoom]);

  const handleSaveMenu = useCallback(() => {
    const id = saveMenuToStorage({
      id: saveId,
      menuName,
      menuTheme,
      courses,
      groceries,
    });
    setSaveId(id);
  }, [saveId, menuName, menuTheme, courses, groceries]);

  const handleImportMenu = useCallback((data) => {
    setMenuName(data.menuName);
    setMenuTheme(data.menuTheme);
    setCourses(data.courses);
    setGroceries(data.groceries);
    setSaveId(null);
    syncKey('menuName', data.menuName);
    syncKey('menuTheme', data.menuTheme);
    syncKey('courses', data.courses);
    syncKey('groceries', data.groceries);
  }, [syncKey]);

  const updateMenuName = (v) => { setMenuName(v); syncKey('menuName', v); };
  const updateMenuTheme = (v) => { setMenuTheme(v); syncKey('menuTheme', v); };

  const addCourse = useCallback(() => {
    setCourses(prev => {
      const next = [...prev, makeCourse(prev.length + 1)];
      syncKey('courses', next);
      return next;
    });
  }, [syncKey]);

  const updateCourse = useCallback((id, updates) => {
    setCourses(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      const skipSync = ['brainstormLoading'];
      if (!Object.keys(updates).every(k => skipSync.includes(k))) {
        syncKey('courses', next);
      }
      return next;
    });
  }, [syncKey]);

  const removeCourse = useCallback((id) => {
    setCourses(prev => {
      const next = prev.filter(c => c.id !== id).map((c, i) => ({ ...c, number: i + 1 }));
      syncKey('courses', next);
      return next;
    });
  }, [syncKey]);

  const moveCourse = useCallback((id, dir) => {
    setCourses(prev => {
      const idx = prev.findIndex(c => c.id === id);
      if (idx < 0) return prev;
      if (dir === 'up' && idx === 0) return prev;
      if (dir === 'down' && idx === prev.length - 1) return prev;
      const next = [...prev];
      const ti = dir === 'up' ? idx - 1 : idx + 1;
      [next[idx], next[ti]] = [next[ti], next[idx]];
      next.forEach((c, i) => { c.number = i + 1; });
      syncKey('courses', next);
      return next;
    });
  }, [syncKey]);

  const addGroceries = useCallback((names) => {
    setGroceries(prev => {
      const newItems = names
        .filter(name => !prev.some(g => g.name.toLowerCase() === name.toLowerCase()))
        .map(name => ({ id: genId(), name, bought: false }));
      const next = [...prev, ...newItems];
      syncKey('groceries', next);
      return next;
    });
  }, [syncKey]);

  const toggleGrocery = useCallback((id) => {
    setGroceries(prev => {
      const next = prev.map(g => g.id === id ? { ...g, bought: !g.bought } : g);
      syncKey('groceries', next);
      return next;
    });
  }, [syncKey]);

  const removeGrocery = useCallback((id) => {
    setGroceries(prev => {
      const next = prev.filter(g => g.id !== id);
      syncKey('groceries', next);
      return next;
    });
  }, [syncKey]);

  if (!C.bg) return null;

  if (screen === 'saved') {
    return (
      <SavedMenusTab
        onLoadMenu={loadSavedIntoEditor}
        onBack={() => setScreen('landing')}
        C={C}
      />
    );
  }

  if (screen === 'landing') {
    return (
      <LandingScreen
        onCreateRoom={() => { setSaveId(null); initRoom(genRoomCode()); }}
        onJoinRoom={(id) => { setSaveId(null); initRoom(id); }}
        onOpenSaved={() => setScreen('saved')}
        savedCount={savedCount}
        C={C}
      />
    );
  }

  return (
    <MenuEditor
      roomId={roomId}
      menuName={menuName}
      menuTheme={menuTheme}
      courses={courses}
      groceries={groceries}
      peers={peers}
      saveId={saveId}
      onUpdateMenuName={updateMenuName}
      onUpdateMenuTheme={updateMenuTheme}
      onAddCourse={addCourse}
      onUpdateCourse={updateCourse}
      onRemoveCourse={removeCourse}
      onMoveCourse={moveCourse}
      onAddGroceries={addGroceries}
      onToggleGrocery={toggleGrocery}
      onRemoveGrocery={removeGrocery}
      onSaveMenu={handleSaveMenu}
      onImportMenu={handleImportMenu}
      C={C}
    />
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────

export default function TastingMenuPage() {
  return (
    <Layout
      title="Pepper & Palate - Collaborative Tasting Menu Designer"
      description="Design tasting menus collaboratively in real time. Brainstorm recipes and generate dish images with AI."
    >
      <BrowserOnly fallback={<div style={{ padding: '60px 20px', textAlign: 'center' }}>Loading Pepper & Palate...</div>}>
        {() => <TastingMenuApp />}
      </BrowserOnly>
    </Layout>
  );
}
