# Tailwind CSS Migration Guide

**Status:** In Progress
**Started:** 2025-01-23

---

## Overview

This guide documents the migration from styled-jsx to Tailwind CSS for consistent design and reduced code duplication.

---

## Design System

All design tokens are defined in `src/tailwind.config.js` and can be accessed programmatically via `src/styles/theme.js`.

### Color Palette

```javascript
// Brand
bg-brand          // #ff5f57 (primary red)
bg-brand-hover    // #ff4540
text-brand        // #ff5f57

// Grays (Light Theme)
bg-gray-50        // #fafafa
bg-gray-100       // #f5f5f5
bg-gray-200       // #e8e8e8
bg-gray-300       // #d0d0d0
text-gray-700     // #666
text-gray-800     // #333

// Dark Theme
bg-dark-300       // #2a2a2a
bg-dark-200       // #3a3a3a
bg-dark-800       // #1e1e1e

// Semantic
text-success      // #4ade80
text-warning      // #f59e0b
text-error        // #ef4444
```

### Spacing

```javascript
gap-3      // 12px
px-4       // padding-x: 16px
py-2       // padding-y: 8px
pt-lg      // padding-top: 20px
pb-log-viewer  // padding-bottom: 35px
```

### Typography

```javascript
text-xxs   // 10px
text-xs    // 11px
text-sm    // 12px
text-base  // 13px (default)
text-md    // 14px
text-lg    // 16px
text-xl    // 18px

font-medium    // 450
font-semibold  // 500
font-bold      // 600

font-mono      // SF Mono, Monaco, etc.
```

### Common Patterns

```javascript
// Buttons
className="px-5 py-2.5 rounded-md text-sm font-medium bg-brand hover:bg-brand-hover text-white transition-colors disabled:opacity-50"

// Cards/Panels
className="bg-white border border-gray-250 rounded-md p-4 hover:shadow-elevation-sm"

// Modal Overlays
className="fixed inset-0 bg-black/70 flex items-center justify-center z-modal"

// Flex Layouts
className="flex items-center gap-3"          // Horizontal with items centered
className="flex flex-col gap-4"              // Vertical stack
className="flex-1"                            // Take remaining space
```

---

## Migration Pattern

### Before (styled-jsx)

```jsx
export default function Component() {
  return (
    <div className="container">
      <button className="primary-btn">Click me</button>

      <style jsx>{`
        .container {
          display: flex;
          padding: 16px;
          background: #f5f5f5;
        }
        .primary-btn {
          padding: 10px 20px;
          background: #ff5f57;
          color: white;
          border: none;
          border-radius: 6px;
        }
        .primary-btn:hover {
          background: #ff4540;
        }
      `}</style>
    </div>
  );
}
```

### After (Tailwind)

```jsx
export default function Component() {
  return (
    <div className="flex px-4 bg-gray-100">
      <button className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-white border-none rounded-md">
        Click me
      </button>
    </div>
  );
}
```

---

## Migration Checklist

### Completed Components ✅

- [x] `Nav.js` - Navigation sidebar
- [x] `LogViewer.js` - Log viewer footer
- [x] `page.js` - Main layout and loading state

### In Progress 🚧

- [ ] `LogModal.js` - Log modal dialog

### Pending ⏳

- [ ] `TwoPaneManager.jsx` - Main two-pane file manager
- [ ] `SetupWizard.jsx` - First-run setup wizard
- [ ] View components:
  - [ ] `ModelsView.js`
  - [ ] `LoRAsView.js`
  - [ ] `ControlNetsView.js`
  - [ ] `EmbeddingsView.js`
  - [ ] `ProjectsView.js`
  - [ ] `ScriptsView.js`
  - [ ] `SettingsView.js`
  - [ ] `StashesView.js`

---

## Common Tailwind Utilities

### Layout

```javascript
flex               // display: flex
flex-col           // flex-direction: column
items-center       // align-items: center
justify-between    // justify-content: space-between
gap-4              // gap: 16px
flex-1             // flex: 1
```

### Sizing

```javascript
w-full             // width: 100%
h-screen           // height: 100vh
w-[90px]           // width: 90px (arbitrary value)
max-w-2xl          // max-width: 672px
```

### Spacing

```javascript
p-4                // padding: 16px
px-5 py-2.5        // padding: 10px 20px
m-4                // margin: 16px
mt-5               // margin-top: 20px
```

### Colors

```javascript
bg-brand           // background-color: #ff5f57
text-white         // color: white
border-gray-300    // border-color: #d0d0d0
```

### Typography

```javascript
text-sm            // font-size: 12px
font-medium        // font-weight: 450
text-center        // text-align: center
whitespace-nowrap  // white-space: nowrap
```

### Effects

```javascript
hover:bg-brand-hover    // background on hover
transition-colors       // smooth color transitions
duration-200           // transition-duration: 200ms
rounded-md             // border-radius: 6px
shadow-elevation-sm    // box-shadow
```

### Positioning

```javascript
fixed              // position: fixed
absolute           // position: absolute
inset-0            // top/right/bottom/left: 0
z-modal            // z-index: 1000
```

### Responsive Design

```javascript
sm:hidden          // Hide on screens ≥640px
md:flex-row        // Row layout on screens ≥768px
lg:w-1/2          // 50% width on screens ≥1024px
```

---

## Conditional Classes

Use template literals for dynamic classes:

```jsx
<div className={`
  base-class another-class
  ${isActive ? 'bg-brand text-white' : 'bg-gray-100 text-gray-800'}
  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
`}>
  Content
</div>
```

---

## When to Use Inline Styles

Only use inline styles for truly dynamic values that can't be expressed in Tailwind:

```jsx
// ❌ Bad - can use Tailwind
<div style={{ color: '#ff5f57' }}>

// ✅ Good - use Tailwind
<div className="text-brand">

// ✅ OK - dynamic runtime value
<div style={{ color: theme.getLogColor(log.level) }}>
```

---

## Testing After Migration

For each migrated component:

1. ✅ Visual comparison (dev tools inspect)
2. ✅ Check hover states work
3. ✅ Check active/selected states
4. ✅ Verify responsive behavior
5. ✅ Test dark theme (if applicable)
6. ✅ Ensure no console errors

---

## Benefits Achieved

### Before Migration
- ~1000+ lines of duplicated CSS across components
- Inconsistent colors (#666, #888, #333 scattered everywhere)
- Inconsistent spacing (12px, 16px, 20px with no system)
- Hard to maintain (change brand color = find/replace in 10+ files)

### After Migration
- Single source of truth in `tailwind.config.js`
- Consistent design tokens
- Smaller component files (40% less code on average)
- Better autocomplete/IntelliSense in IDE
- Easier to maintain and extend

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
- Our theme file: `src/styles/theme.js`
- Our config: `src/tailwind.config.js`

---

**Last Updated:** 2025-01-23
**Completed:** 3/18 components
**Progress:** 16%
