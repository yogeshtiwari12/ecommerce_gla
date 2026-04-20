# 🌙 Dark Mode - Quick Start Guide for Developers

## Accessing Dark Mode Features

### 1. Theme Toggle (Already Built)
- Located in navbar, top-right corner
- Sun icon = Light mode active
- Moon icon = Dark mode active
- Click to toggle anytime
- Theme persists across page reloads

### 2. Testing Your Changes
```bash
# Start dev server (if not already running)
npm run dev

# Open http://localhost:3000
# Click theme toggle button to switch modes
# All semantic classes should automatically adapt
```

## Color Replacement Cheat Sheet

Copy-paste these replacements into your components:

### Backgrounds
```tsx
// Light backgrounds
'bg-white'              → 'bg-card'
'bg-gray-50'            → 'bg-background'
'bg-gray-100'           → 'bg-muted'

// Dark backgrounds  
'bg-slate-900'          → 'bg-background'
'bg-slate-800'          → 'bg-card'
'bg-blue-50'            → 'bg-primary/10'
'bg-blue-100'           → 'bg-primary/20'
```

### Text Colors
```tsx
// Primary text
'text-gray-900'         → 'text-foreground'
'text-slate-900'        → 'text-foreground'

// Secondary text
'text-gray-600'         → 'text-foreground/70'
'text-gray-500'         → 'text-muted-foreground'
'text-gray-400'         → 'text-muted-foreground'

// Semantic colors
'text-blue-600'         → 'text-primary'
'text-green-600'        → 'text-success'
'text-red-600'          → 'text-destructive'
'text-orange-600'       → 'text-primary' or 'text-warning'
```

### Borders
```tsx
'border-gray-200'       → 'border-border'
'border-gray-300'       → 'border-border'
'border-blue-200'       → 'border-primary/30'
'border-blue-500'       → 'border-primary'
```

### Hover States
```tsx
// Backgrounds
'hover:bg-gray-50'      → 'hover:bg-accent/5'
'hover:bg-gray-100'     → 'hover:bg-muted'
'hover:bg-blue-50'      → 'hover:bg-primary/10'

// Borders
'hover:border-gray-300' → 'hover:border-primary/50'
'hover:border-blue-500' → 'hover:border-primary'

// Text
'hover:text-gray-900'   → 'hover:text-foreground'
'hover:text-blue-600'   → 'hover:text-primary'
```

### Buttons
```tsx
// Primary button
'bg-blue-600 text-white hover:bg-blue-700'
→ 'bg-primary text-primary-foreground hover:bg-primary/90'

// Outline button
'bg-white border border-gray-300 text-gray-900'
→ 'bg-card border border-border text-foreground'

// Danger button
'bg-red-100 text-red-700 border-red-200'
→ 'bg-destructive/10 text-destructive border-destructive/30'
```

## Common Component Patterns

### Card Component
```tsx
// ❌ Before
<div className="bg-white border border-gray-200 rounded-lg p-6">
  <h2 className="text-gray-900">Title</h2>
  <p className="text-gray-600">Description</p>
</div>

// ✅ After
<div className="bg-card border border-border rounded-lg p-6">
  <h2 className="text-foreground">Title</h2>
  <p className="text-foreground/70">Description</p>
</div>
```

### Form Input
```tsx
// ❌ Before
<input
  className="bg-white border border-gray-300 text-gray-900 placeholder-gray-500 
    focus:border-blue-500 focus:ring-blue-200"
/>

// ✅ After
<input
  className="bg-card border border-border text-foreground placeholder-foreground/50
    focus:border-primary focus:ring-primary/20"
/>
```

### Button Group
```tsx
// ❌ Before
<div className="flex gap-3">
  <button className="bg-blue-600 text-white hover:bg-blue-700">
    Primary
  </button>
  <button className="bg-gray-100 text-gray-900 border border-gray-300">
    Secondary
  </button>
</div>

// ✅ After
<div className="flex gap-3">
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Primary
  </button>
  <button className="bg-muted text-foreground border border-border">
    Secondary
  </button>
</div>
```

### Status Badge
```tsx
// ❌ Before
<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
  Active
</span>

// ✅ After
<span className="bg-success/10 text-success px-3 py-1 rounded-full">
  Active
</span>
```

## Files to Reference

| File | Purpose |
|------|---------|
| `app/globals.css` | CSS variables definition |
| `app/components/product.tsx` | Full example of dark mode |
| `lib/darkModeStyles.ts` | Style constants/patterns |
| `DARK_MODE_GUIDE.md` | Detailed documentation |

## How to Update a Component

### Step 1: Find Hardcoded Colors
```tsx
className="bg-white text-gray-900 border-gray-300"
```

### Step 2: Check Cheat Sheet Above
- `bg-white` → `bg-card`
- `text-gray-900` → `text-foreground`
- `border-gray-300` → `border-border`

### Step 3: Replace
```tsx
className="bg-card text-foreground border-border"
```

### Step 4: Test
1. Click theme toggle in navbar
2. Verify colors adapt correctly
3. Check text contrast
4. Test hover/focus states

### Step 5: Commit
```bash
git add .
git commit -m "feat: add dark mode support to [component name]"
git push
```

## Syntax Tips

### Multiple States
```tsx
// Conditional styling by theme state
className={`px-4 py-2 rounded-lg transition-all
  ${isDark 
    ? 'bg-card border-border' 
    : 'bg-white border-gray-200'
  }`}

// ❌ DON'T - Use this instead:
className="px-4 py-2 rounded-lg transition-all bg-card border-border"
```

### Opacity Variants
```tsx
// Semantic hierarchy using opacity
<p className="text-foreground">Important text</p>           // 100%
<p className="text-foreground/70">Secondary text</p>       // 70%
<p className="text-foreground/50">Tertiary text</p>        // 50%
<p className="text-muted-foreground">Muted text</p>        // ~40%
```

### Dark-Only Overrides (Rarely Needed)
```tsx
// For edge cases where you need different styling
className="bg-gray-100 dark:bg-slate-900"

// Prefer semantic classes instead:
className="bg-muted" // automatically adapts
```

## Debugging

### Colors Not Changing?
1. Check you're using semantic classes (not hardcoded colors)
2. Ensure component is wrapped in ThemeProvider
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Check browser console for errors

### Text Hard to Read?
1. Ensure sufficient contrast
2. Use `text-foreground` for primary text
3. Don't use `text-foreground/80+` for body text
4. Test with contrast checker tool

### Component Not Updating?
1. Remove `dark:` prefixes (they're unnecessary)
2. Use semantic class names consistently
3. Verify CSS variables are defined in `globals.css`
4. Check if component is inside Client boundary

## Common Mistakes ❌

```tsx
// ❌ Hardcoded colors - WRONG
className="bg-white text-gray-900"

// ❌ Repeating colors - WRONG  
className="bg-white dark:bg-gray-800"

// ❌ Inconsistent naming - WRONG
className="bg-white text-slate-900 border-gray-300"

// ✅ Semantic classes - CORRECT
className="bg-card text-foreground border-border"

// ✅ Semantic consistency - CORRECT
className="bg-card text-foreground/70 border-border/50"
```

## Quick Testing

### In Browser Console:
```javascript
// Check current theme
localStorage.getItem('app-theme')  // 'dark' or 'light'

// Set theme programmatically
localStorage.setItem('app-theme', 'dark')
localStorage.setItem('app-theme', 'light')
```

## Getting Help

1. **Reference Files**:
   - `app/components/product.tsx` - Full dark mode example
   - `lib/darkModeStyles.ts` - Style constants

2. **Documentation**:
   - `DARK_MODE_GUIDE.md` - Comprehensive guide
   - `DARK_MODE_IMPLEMENTATION_SUMMARY.md` - Overview

3. **Quick Fixes**:
   - Check color replacement cheat sheet above
   - Look at similar components that are already updated
   - Use browser dev tools to inspect actual colors

---

**Remember**: If you're unsure about a color, default to:
- Backgrounds: `bg-card`
- Text: `text-foreground`
- Borders: `border-border`

These three will work for 90% of cases! 🎨

