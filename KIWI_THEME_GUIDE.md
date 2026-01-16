# Complete Guide: How to Set the Kiwi Theme

This document provides a comprehensive analysis of how the Kiwi theme system works in this Next.js admin dashboard project.

## 📍 Where to Set the Kiwi Theme

### User Interface Location
The theme selector is located in the **Layout Controls** component, accessible via a Settings icon (⚙️) in the dashboard header.

**File:** `src/app/(main)/dashboard/_components/sidebar/layout-controls.tsx`

**Location in UI:**
1. Look for the Settings icon (⚙️) in the top-right header of the dashboard
2. Click the Settings icon to open the Layout Settings popover
3. Find the "Preset" dropdown in the popover
4. Select "Kiwi" from the dropdown list

The dropdown shows all available themes with a colored dot indicator showing the primary color of each theme.

---

## 🔄 Complete Theme Flow: From Selection to Application

### Step-by-Step Flow Diagram

```
User Action
    ↓
[1] Click Settings Icon → Layout Controls Popover Opens
    ↓
[2] Select "Kiwi" from Preset Dropdown
    ↓
[3] handleValueChange("theme_preset", "kiwi") is called
    ↓
[4] updateThemePreset("kiwi") → Sets data-theme-preset="kiwi" on <html>
    ↓
[5] setThemePreset("kiwi") → Updates Zustand store state
    ↓
[6] setValueToCookie("theme_preset", "kiwi") → Saves to cookie
    ↓
[7] CSS Selector :root[data-theme-preset="kiwi"] matches
    ↓
[8] Kiwi theme CSS variables are applied
    ↓
[9] UI updates with green color scheme
```

---

## 📁 Files Involved in Theme System

### 1. Theme Definition & Types
**File:** `src/types/preferences/theme.ts`

Defines the Kiwi theme configuration:
```typescript
{
  label: "Kiwi",
  value: "kiwi",
  primary: {
    light: "oklch(0.8 0.2 120)",  // Green color
    dark: "oklch(0.8 0.2 120)",   // Green color
  },
}
```

### 2. Theme CSS File
**File:** `src/styles/presets/kiwi.css`

Contains all CSS variables for the Kiwi theme:
- Light mode: `:root[data-theme-preset="kiwi"]`
- Dark mode: `.dark:root[data-theme-preset="kiwi"]`

**Key Variables:**
- `--primary: oklch(0.8 0.2 120)` (green)
- `--ring: oklch(0.8 0.2 120)` (green)
- `--sidebar-primary: oklch(0.8 0.2 120)` (green)
- Plus all other color, shadow, and spacing variables

### 3. CSS Import
**File:** `src/app/globals.css`

Imports the Kiwi theme CSS:
```css
@import "../styles/presets/kiwi.css";
```

### 4. Theme Selector UI Component
**File:** `src/app/(main)/dashboard/_components/sidebar/layout-controls.tsx`

**Key Code:**
```typescript
// Line 64-81: Theme preset selector
<Select value={themePreset} onValueChange={(value) => handleValueChange("theme_preset", value)}>
  <SelectContent>
    {THEME_PRESET_OPTIONS.map((preset) => (
      <SelectItem key={preset.value} value={preset.value}>
        <span style={{ backgroundColor: preset.primary.light }} />
        {preset.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 5. Theme Update Utility
**File:** `src/lib/theme-utils.ts`

**Function:**
```typescript
export function updateThemePreset(value: string) {
  document.documentElement.setAttribute("data-theme-preset", value);
}
```

This function directly sets the `data-theme-preset` attribute on the HTML element, which triggers the CSS selector matching.

### 6. State Management
**File:** `src/stores/preferences/preferences-store.ts`

Zustand store that manages theme state:
```typescript
export type PreferencesState = {
  themePreset: ThemePreset;
  setThemePreset: (preset: ThemePreset) => void;
  // ...
};
```

### 7. State Provider
**File:** `src/stores/preferences/preferences-provider.tsx`

Provides the Zustand store to the React component tree.

### 8. Server Actions (Persistence)
**File:** `src/server/server-actions.ts`

**Functions:**
- `getPreference()` - Reads theme from cookies
- `setValueToCookie()` - Saves theme to cookies (7-day expiration)

### 9. Root Layout (Initialization)
**File:** `src/app/layout.tsx`

**Key Code:**
```typescript
// Server-side: Read theme from cookie
const themePreset = await getPreference<ThemePreset>(
  "theme_preset", 
  THEME_PRESET_VALUES, 
  "default"
);

// Apply to HTML element
<html data-theme-preset={themePreset}>
  <PreferencesStoreProvider themeMode={themeMode} themePreset={themePreset}>
    {children}
  </PreferencesStoreProvider>
</html>
```

---

## 🔧 How It Works: Technical Details

### 1. **Initial Page Load (Server-Side Rendering)**

When the page first loads:
1. `layout.tsx` (Server Component) calls `getPreference("theme_preset", ...)`
2. Server reads the `theme_preset` cookie
3. If cookie exists and is valid → use that value
4. If cookie doesn't exist → use default "default"
5. HTML is rendered with `data-theme-preset="kiwi"` (if Kiwi was previously selected)
6. CSS selector `:root[data-theme-preset="kiwi"]` matches
7. Kiwi theme CSS variables are applied immediately (no flash)

### 2. **User Selects Kiwi Theme (Client-Side)**

When user clicks "Kiwi" in the dropdown:
1. `handleValueChange("theme_preset", "kiwi")` is called
2. `updateThemePreset("kiwi")` sets `data-theme-preset="kiwi"` on `<html>`
3. `setThemePreset("kiwi")` updates Zustand store (for React re-renders)
4. `setValueToCookie("theme_preset", "kiwi")` saves to cookie
5. CSS selector matches and theme applies instantly

### 3. **CSS Application**

The CSS cascade works like this:
```css
/* Base variables (in globals.css) */
:root {
  --primary: oklch(...);
  /* ... */
}

/* Kiwi theme overrides (in kiwi.css) */
:root[data-theme-preset="kiwi"] {
  --primary: oklch(0.8 0.2 120);  /* Green */
  /* ... */
}

/* Dark mode Kiwi theme */
.dark:root[data-theme-preset="kiwi"] {
  --primary: oklch(0.8 0.2 120);  /* Green */
  /* ... */
}
```

The `data-theme-preset` attribute has higher specificity than `:root`, so it overrides the base variables.

---

## 🎨 Kiwi Theme Characteristics

### Color Scheme
- **Primary Color:** Green (`oklch(0.8 0.2 120)`)
  - Lightness: 0.8 (bright)
  - Chroma: 0.2 (moderate saturation)
  - Hue: 120 (green)

### Visual Elements Affected
- Buttons (primary)
- Links
- Focus rings
- Sidebar primary elements
- Chart colors
- Borders and accents

---

## 🔍 Debugging: How to Verify Kiwi Theme is Active

### 1. **Check HTML Element**
Open browser DevTools and check:
```html
<html data-theme-preset="kiwi" class="dark">  <!-- or no class for light -->
```

### 2. **Check Computed CSS Variables**
In DevTools Console:
```javascript
getComputedStyle(document.documentElement).getPropertyValue('--primary')
// Should return: "oklch(0.8 0.2 120)"
```

### 3. **Check Cookie**
In DevTools → Application → Cookies:
```
Name: theme_preset
Value: kiwi
```

### 4. **Check Zustand Store**
In React DevTools, find `PreferencesStoreProvider`:
```javascript
themePreset: "kiwi"
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Theme Not Applying
**Symptoms:** Selecting Kiwi doesn't change colors

**Possible Causes:**
1. ❌ CSS file not imported in `globals.css`
2. ❌ CSS selector mismatch (e.g., `data-theme-preset="light-emerald-green"` instead of `"kiwi"`)
3. ❌ Cookie not being set
4. ❌ `updateThemePreset()` not being called

**Solution:** Verify:
- `kiwi.css` is imported in `globals.css`
- CSS selectors use `data-theme-preset="kiwi"`
- Check browser console for errors
- Verify cookie is being set

### Issue 2: Theme Resets on Page Reload
**Symptoms:** Theme reverts to default after refresh

**Possible Causes:**
1. ❌ Cookie not persisting
2. ❌ Server-side `getPreference()` not reading cookie correctly
3. ❌ Cookie expiration set too short

**Solution:** Check cookie expiration (default: 7 days) and verify cookie is being read on server.

### Issue 3: Flash of Wrong Theme
**Symptoms:** Brief flash of default theme before Kiwi loads

**Possible Causes:**
1. ❌ Server-side rendering not setting `data-theme-preset` attribute
2. ❌ CSS loading after HTML

**Solution:** Ensure `layout.tsx` sets `data-theme-preset` attribute server-side.

---

## 📝 Code Flow Summary

### Client-Side Selection Flow
```
User clicks "Kiwi"
  → layout-controls.tsx: handleValueChange("theme_preset", "kiwi")
    → theme-utils.ts: updateThemePreset("kiwi")
      → Sets: document.documentElement.setAttribute("data-theme-preset", "kiwi")
    → preferences-store.ts: setThemePreset("kiwi")
      → Updates Zustand store state
    → server-actions.ts: setValueToCookie("theme_preset", "kiwi")
      → Saves to cookie (7-day expiration)
```

### Server-Side Initialization Flow
```
Page request
  → layout.tsx (Server Component)
    → server-actions.ts: getPreference("theme_preset", ...)
      → Reads cookie: theme_preset="kiwi"
    → Renders: <html data-theme-preset="kiwi">
    → preferences-provider.tsx: PreferencesStoreProvider(themePreset="kiwi")
      → Initializes Zustand store with "kiwi"
```

### CSS Application Flow
```
HTML: <html data-theme-preset="kiwi">
  → CSS: :root[data-theme-preset="kiwi"] matches
    → Applies CSS variables from kiwi.css
      → UI components use CSS variables
        → Visual theme applied
```

---

## ✅ Verification Checklist

To ensure Kiwi theme is working correctly:

- [ ] `kiwi.css` exists in `src/styles/presets/`
- [ ] `kiwi.css` is imported in `src/app/globals.css`
- [ ] CSS selectors use `data-theme-preset="kiwi"` (not "light-emerald-green")
- [ ] `theme.ts` includes Kiwi in `THEME_PRESET_OPTIONS`
- [ ] `layout-controls.tsx` shows Kiwi in dropdown
- [ ] Selecting Kiwi sets cookie `theme_preset=kiwi`
- [ ] Selecting Kiwi sets `data-theme-preset="kiwi"` on `<html>`
- [ ] Primary color is green (`oklch(0.8 0.2 120)`)
- [ ] Theme persists after page reload
- [ ] Works in both light and dark modes

---

## 🚀 Quick Start: Setting Kiwi Theme Programmatically

If you need to set the theme programmatically (e.g., for testing):

```typescript
import { updateThemePreset } from "@/lib/theme-utils";
import { setValueToCookie } from "@/server/server-actions";

// Set theme
updateThemePreset("kiwi");
await setValueToCookie("theme_preset", "kiwi");
```

Or via Zustand store:
```typescript
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

const setThemePreset = usePreferencesStore((s) => s.setThemePreset);
setThemePreset("kiwi");
```

---

## 📚 Related Files Reference

| File | Purpose |
|------|---------|
| `src/types/preferences/theme.ts` | Theme type definitions |
| `src/styles/presets/kiwi.css` | Kiwi theme CSS variables |
| `src/app/globals.css` | Imports all theme CSS files |
| `src/app/layout.tsx` | Server-side theme initialization |
| `src/app/(main)/dashboard/_components/sidebar/layout-controls.tsx` | Theme selector UI |
| `src/lib/theme-utils.ts` | Theme update utilities |
| `src/stores/preferences/preferences-store.ts` | Zustand theme state |
| `src/stores/preferences/preferences-provider.tsx` | React context provider |
| `src/server/server-actions.ts` | Cookie persistence functions |

---

## 🎯 Summary

The Kiwi theme system uses a **cookie-based persistence** strategy with **server-side rendering** for optimal performance:

1. **User selects** Kiwi from Settings → Preset dropdown
2. **Client updates** DOM attribute and Zustand state
3. **Cookie saves** preference for 7 days
4. **Server reads** cookie on next page load
5. **CSS applies** theme via attribute selector
6. **No flash** - theme applies immediately on load

The system is designed to be **fast, persistent, and user-friendly** with no theme flash on page load.
