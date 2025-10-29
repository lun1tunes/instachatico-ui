# Instachatico UI Kit Documentation

> Complete design system and component library for the Instachatico UI project

**Version:** 1.0.0
**Last Updated:** October 2025
**Framework:** Vue 3 + TypeScript + Vite

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Spacing System](#spacing-system)
3. [Typography](#typography)
4. [Border Radius](#border-radius)
5. [Shadows (Elevation)](#shadows-elevation)
6. [Transitions & Animations](#transitions--animations)
7. [UI Components](#ui-components)
8. [Layout Components](#layout-components)
9. [Design Patterns](#design-patterns)
10. [Responsive Breakpoints](#responsive-breakpoints)
11. [Custom Features](#custom-features)

---

## Color Palette

### Primary Navy Colors

Used for text, headers, and primary UI elements.

| Variable | Hex | Usage |
|----------|-----|-------|
| `--navy-900` | `#0f172a` | Darkest - Headers, Strong Text |
| `--navy-800` | `#1e293b` | Body Text |
| `--navy-700` | `#334155` | Labels |
| `--navy-600` | `#475569` | Secondary Text |
| `--navy-500` | `#64748b` | Muted Text |

### Soft Blue Accent

Primary action colors and interactive elements.

| Variable | Hex | Usage |
|----------|-----|-------|
| `--blue-500` | `#3b82f6` | Primary Action Color |
| `--blue-400` | `#60a5fa` | Hover State |
| `--blue-300` | `#93c5fd` | Light Accent |
| `--blue-200` | `#bfdbfe` | Very Light Accent |
| `--blue-100` | `#dbeafe` | Light Background |
| `--blue-50` | `#eff6ff` | Very Light Background |

### Neutral Colors

Backgrounds, borders, and neutral UI elements.

| Variable | Hex | Usage |
|----------|-----|-------|
| `--slate-50` | `#f8fafc` | Page Background |
| `--slate-100` | `#f1f5f9` | Card Background |
| `--slate-200` | `#e2e8f0` | Borders, Dividers |
| `--slate-300` | `#cbd5e1` | Input Borders |
| `--slate-400` | `#94a3b8` | Disabled State |

### Semantic Colors

Feedback and status indicators.

| Variable | Hex | Usage |
|----------|-----|-------|
| `--success` | `#10b981` | Success states, confirmations |
| `--warning` | `#f59e0b` | Warnings, important notices |
| `--error` | `#ef4444` | Errors, destructive actions |
| `--info` | `#3b82f6` | Informational messages |

### Classification Colors

AI comment classification system.

| Variable | Hex | Classification Type |
|----------|-----|-------------------|
| `--positive` | `#10b981` | Positive Feedback |
| `--critical` | `#f59e0b` | Critical Feedback |
| `--urgent` | `#ef4444` | Urgent Issue/Complaint |
| `--question` | `#3b82f6` | Question/Inquiry |
| `--partnership` | `#8b5cf6` | Partnership Proposal |
| `--toxic` | `#dc2626` | Toxic/Abusive |
| `--spam` | `#6b7280` | Spam/Irrelevant |

---

## Spacing System

Consistent spacing scale based on 4px base unit (0.25rem).

| Variable | Value | Pixels | Usage |
|----------|-------|--------|-------|
| `--spacing-xs` | `0.25rem` | 4px | Minimal spacing |
| `--spacing-sm` | `0.5rem` | 8px | Small gaps |
| `--spacing-md` | `1rem` | 16px | Base unit ⭐ |
| `--spacing-lg` | `1.5rem` | 24px | Section spacing |
| `--spacing-xl` | `2rem` | 32px | Large sections |
| `--spacing-2xl` | `3rem` | 48px | Hero spacing |

### Usage Examples

```css
.card {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.button {
  padding: var(--spacing-sm) var(--spacing-md);
}
```

---

## Typography

### Font Families

**Sans Serif (Default)**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
             'Helvetica Neue', Arial, sans-serif;
```

**Monospace (Code)**
```css
font-family: ui-monospace, SFMono-Regular, 'SF Mono', Monaco,
             'Cascadia Code', 'Roboto Mono', Consolas, monospace;
```

### Font Sizes & Hierarchy

| Element | Size | Pixels | Weight | Usage |
|---------|------|--------|--------|-------|
| H1 | `2.25rem` | 36px | 600 | Page titles |
| H2 | `1.875rem` | 30px | 600 | Section titles |
| H3 | `1.5rem` | 24px | 600 | Subsections |
| H4 | `1.25rem` | 20px | 600 | Card titles |
| Body | `1rem` | 16px | 400 | Default text |
| Small | `0.875rem` | 14px | 400-500 | Labels, metadata |
| XSmall | `0.75rem` | 12px | 400 | Captions |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | Emphasis, labels |
| Semibold | 600 | Headers, buttons |
| Bold | 700 | Strong emphasis |

### Line Heights

| Context | Value | Usage |
|---------|-------|-------|
| Headers | 1.2 | Tight, impactful |
| Body | 1.6 | Readable paragraphs |

---

## Border Radius

Consistent rounding for different element sizes.

| Variable | Value | Pixels | Usage |
|----------|-------|--------|-------|
| `--radius-sm` | `0.375rem` | 6px | Small elements, badges |
| `--radius-md` | `0.5rem` | 8px | Buttons, inputs |
| `--radius-lg` | `0.75rem` | 12px | Cards |
| `--radius-xl` | `1rem` | 16px | Large cards, modals |

---

## Shadows (Elevation)

Layered shadow system for depth perception.

| Variable | Usage | Example |
|----------|-------|---------|
| `--shadow-sm` | Subtle hover effect | Button hover |
| `--shadow-md` | Default card shadow | Cards at rest |
| `--shadow-lg` | Elevated cards, dropdowns | Dropdown menus |
| `--shadow-xl` | Modals, overlays | Dialog boxes |
| `--shadow-2xl` | Hero elements | Featured cards |

### Shadow Values

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

---

## Transitions & Animations

Smooth, consistent motion across the UI.

| Variable | Duration | Usage |
|----------|----------|-------|
| `--transition-fast` | 150ms | Hover effects, quick feedback |
| `--transition-base` | 300ms | Standard animations |
| `--transition-slow` | 500ms | Complex transitions |

**Easing Function:** `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design)

### Example Usage

```css
.button {
  transition: all var(--transition-fast);
}

.modal {
  transition: opacity var(--transition-base);
}
```

---

## UI Components

Complete library of reusable components located in `/src/components/ui/`.

### BaseButton

Primary interactive element for user actions.

#### Variants

| Variant | Appearance | Usage |
|---------|------------|-------|
| `primary` | Blue gradient, white text | Main actions (Submit, Save) |
| `secondary` | Gray background | Secondary actions (Cancel) |
| `success` | Green background | Confirm actions |
| `danger` | Red gradient | Destructive actions (Delete) |
| `ghost` | Transparent with border | Subtle actions (Edit, View) |

#### Sizes

| Size | Padding | Font Size | Usage |
|------|---------|-----------|-------|
| `sm` | `0.5rem 0.875rem` | 0.875rem | Compact spaces |
| `md` | `0.625rem 1.125rem` | 0.9375rem | Default |
| `lg` | `0.75rem 1.5rem` | 1rem | Prominent actions |

#### Props

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}
```

#### Features

- ✅ Loading state with spinner
- ✅ Disabled state (reduced opacity)
- ✅ Full-width option
- ✅ Icon support (slot-based)
- ✅ Hover/active animations

---

### BaseBadge

Small status indicators and labels.

#### Variants

| Variant | Background | Text Color | Usage |
|---------|-----------|-----------|-------|
| `default` | `#e2e8f0` | `#334155` | General labels |
| `secondary` | `#e2e8f0` | `#1e293b` | Secondary labels |
| `positive` | `#d1fae5` | `#065f46` | Positive feedback |
| `critical` | `#fef3c7` | `#92400e` | Critical feedback |
| `urgent` | `#fee2e2` | `#991b1b` | Urgent issues |
| `question` | `#dbeafe` | `#1e40af` | Questions |
| `partnership` | `#ede9fe` | `#5b21b6` | Partnership |
| `toxic` | `#fecaca` | `#7f1d1d` | Toxic content |
| `spam` | `#e2e8f0` | `#475569` | Spam |
| `success` | `#d1fae5` | `#065f46` | Success states |
| `warning` | `#fef3c7` | `#92400e` | Warnings |
| `error` | `#fee2e2` | `#991b1b` | Errors |
| `info` | `#dbeafe` | `#1e40af` | Information |

#### Sizes

| Size | Padding | Font Size |
|------|---------|-----------|
| `sm` | `0.125rem 0.5rem` | 0.75rem |
| `md` | `0.25rem 0.625rem` | 0.8125rem |
| `lg` | `0.375rem 0.75rem` | 0.875rem |

#### Props

```typescript
interface BadgeProps {
  variant?: 'default' | 'secondary' | 'positive' | 'critical' | 'urgent' |
            'question' | 'partnership' | 'toxic' | 'spam' | 'success' |
            'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  classificationType?: ClassificationType
}
```

---

### BaseCard

Container component for content grouping.

#### Props

```typescript
interface CardProps {
  padding?: 'sm' | 'md' | 'lg'
}
```

#### Features

- ✅ Rounded corners (`--radius-lg`)
- ✅ Shadow elevation (`--shadow-md`)
- ✅ White background
- ✅ Hover effect (optional)
- ✅ Responsive padding

---

### BaseModal

Overlay dialog for focused interactions.

#### Props

```typescript
interface ModalProps {
  modelValue: boolean
  title?: string
  maxWidth?: string
}
```

#### Features

- ✅ Backdrop overlay with blur
- ✅ Centered positioning
- ✅ ESC key to close
- ✅ Click outside to close
- ✅ Smooth fade transitions
- ✅ Teleported to body (z-index management)

---

### BasePagination

Navigation for paginated content.

#### Props

```typescript
interface PaginationProps {
  currentPage: number
  totalPages: number
  maxVisiblePages?: number
}
```

#### Features

- ✅ Previous/Next buttons
- ✅ Page number buttons
- ✅ Disabled states
- ✅ Active page highlighting
- ✅ Responsive (collapses on mobile)

---

### LoadingSpinner

Animated loading indicator.

#### Variants

- Default circular spinner
- Blue accent color
- Customizable size

---

### ConfirmDialog

Global confirmation dialog for critical actions.

#### Props

```typescript
interface ConfirmDialogProps {
  title: string
  message: string
  variant?: 'warning' | 'danger' | 'info'
  confirmText?: string
  cancelText?: string
}
```

#### Features

- ✅ Promise-based API
- ✅ Three variants (warning/danger/info)
- ✅ Custom button text
- ✅ Backdrop click to cancel
- ✅ ESC key support

#### Usage

```typescript
const { confirm } = useConfirm()

const confirmed = await confirm({
  title: 'Delete Comment',
  message: 'Are you sure? This action cannot be undone.',
  variant: 'danger',
  confirmText: 'Delete',
  cancelText: 'Cancel'
})

if (confirmed) {
  // Proceed with deletion
}
```

---

### FullScreenMarkdownEditor

Rich markdown editing experience.

#### Props

```typescript
interface EditorProps {
  modelValue: boolean
  title?: string
  initialContent?: string
  placeholder?: string
  saveButtonText?: string
}
```

#### Features

- ✅ Three view modes (edit/preview/split)
- ✅ Formatting toolbar
  - Bold, Italic, Code
  - Headings (H1, H2, H3)
  - Lists (ordered/unordered)
  - Links
- ✅ Live markdown preview
- ✅ Keyboard shortcuts (Ctrl+B, Ctrl+I, Tab)
- ✅ Unsaved changes warning
- ✅ Character counter
- ✅ ESC to close (with confirmation)
- ✅ Full-screen experience

---

## Layout Components

### AppHeader

Main navigation bar at the top of the application.

#### Features

- ✅ Fixed positioning (sticky header)
- ✅ Logo/branding area
- ✅ Navigation links
- ✅ User actions (logout)
- ✅ Responsive design

---

### Container

Page layout wrapper with max-width constraint.

#### Variants

```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.container-fluid {
  width: 100%;
  padding: 0 var(--spacing-lg);
}
```

---

## Design Patterns

### Interactive States

#### Hover Effects

```css
.interactive-element:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-fast);
}
```

#### Active/Pressed States

```css
.button:active {
  transform: translateY(1px);
  box-shadow: var(--shadow-sm);
}
```

#### Focus States (Accessibility)

```css
.input:focus {
  outline: none;
  border-color: var(--blue-500);
  box-shadow: 0 0 0 3px var(--blue-100);
}
```

### Form Elements

#### Input States

```css
/* Default */
border: 1px solid var(--slate-300);

/* Focus */
border-color: var(--blue-500);
box-shadow: 0 0 0 3px var(--blue-100);

/* Error */
border-color: var(--error);
box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
```

### Card Patterns

#### Default Card

```css
background: white;
border-radius: var(--radius-lg);
box-shadow: var(--shadow-md);
padding: var(--spacing-lg);
```

#### Hover Card

```css
transition: all var(--transition-fast);

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

### List Patterns

#### Striped Lists

```css
.list-item:nth-child(even) {
  background-color: var(--slate-50);
}
```

#### Hover Highlight

```css
.list-item:hover {
  background-color: var(--blue-50);
}
```

---

## Responsive Breakpoints

### Breakpoint Values

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Mobile | < 640px | Phone devices |
| Tablet | 640px - 1024px | Tablets, small laptops |
| Desktop | > 1024px | Desktop screens |

### Media Query Examples

```css
/* Mobile First Approach */
.element {
  /* Mobile styles (default) */
  flex-direction: column;
}

@media (min-width: 640px) {
  /* Tablet styles */
  .element {
    flex-direction: row;
  }
}

@media (min-width: 1024px) {
  /* Desktop styles */
  .element {
    max-width: 1280px;
  }
}
```

---

## Custom Features

### Markdown Support

#### Custom Parser

- **Location:** `/src/composables/useMarkdown.ts`
- **No external dependencies**
- Optimized for performance

#### Supported Syntax

| Syntax | Markdown | Output |
|--------|----------|--------|
| Headings | `# H1`, `## H2`, `### H3` | `<h1>`, `<h2>`, `<h3>` |
| Bold | `**text**` | `<strong>text</strong>` |
| Italic | `*text*` | `<em>text</em>` |
| Code | `` `code` `` | `<code>code</code>` |
| Code Block | ` ```code``` ` | `<pre><code>code</code></pre>` |
| Unordered List | `- item` | `<ul><li>item</li></ul>` |
| Ordered List | `1. item` | `<ol><li>item</li></ol>` |
| Link | `[text](url)` | `<a href="url">text</a>` |
| Image | `![alt](url)` | `<img src="url" alt="alt">` |

#### Spacing Rules

```css
/* Optimized for readability */
.markdown-body p {
  margin-bottom: 1em;
}

.markdown-body ul, ol {
  margin: 0 0 0.75em 0;
  padding-left: 1.5em;
}

.markdown-body li {
  margin: 0;
  line-height: 1.6; /* Compact like normal text */
}

/* No gap between paragraph and list */
.markdown-body p:has(+ ul),
.markdown-body p:has(+ ol) {
  margin-bottom: 0;
}
```

---

### Classification System

#### 7 Classification Types

Each with distinct visual identity:

1. **Positive Feedback** - Green (#10b981)
2. **Critical Feedback** - Orange (#f59e0b)
3. **Urgent Issue** - Red (#ef4444)
4. **Question/Inquiry** - Blue (#3b82f6)
5. **Partnership Proposal** - Purple (#8b5cf6)
6. **Toxic/Abusive** - Dark Red (#dc2626)
7. **Spam/Irrelevant** - Gray (#6b7280)

#### Confidence Indicators

```css
.confidence-bar {
  height: 4px;
  background: linear-gradient(to right, var(--color-start), var(--color-end));
  border-radius: var(--radius-sm);
  width: ${confidence}%;
}
```

---

### Processing Status

#### Status Types

| Status | Badge Color | Label |
|--------|-------------|-------|
| Pending | Yellow | Pending |
| Processing | Blue | Processing |
| Completed | Green | Completed |
| Failed | Red | Failed |
| Retry | Orange | Retry |

---

## Utility Classes

### Text Utilities

```css
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-sm { font-size: 0.875rem; }
.text-xs { font-size: 0.75rem; }
.text-lg { font-size: 1.125rem; }
```

### Font Weight

```css
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
```

### Flexbox

```css
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
```

### Spacing

```css
/* Gaps */
.gap-sm { gap: var(--spacing-sm); }
.gap-md { gap: var(--spacing-md); }
.gap-lg { gap: var(--spacing-lg); }

/* Margins */
.mb-sm { margin-bottom: var(--spacing-sm); }
.mb-md { margin-bottom: var(--spacing-md); }
.mb-lg { margin-bottom: var(--spacing-lg); }
.mt-sm { margin-top: var(--spacing-sm); }
.mt-md { margin-top: var(--spacing-md); }
.mt-lg { margin-top: var(--spacing-lg); }

/* Padding */
.p-sm { padding: var(--spacing-sm); }
.p-md { padding: var(--spacing-md); }
.p-lg { padding: var(--spacing-lg); }
```

---

## Accessibility

### Focus Management

All interactive elements have visible focus states:

```css
.focusable:focus-visible {
  outline: 2px solid var(--blue-500);
  outline-offset: 2px;
}
```

### Keyboard Navigation

- ✅ Tab order follows visual flow
- ✅ ESC closes modals and dialogs
- ✅ Enter/Space activates buttons
- ✅ Arrow keys for navigation (where applicable)

### Color Contrast

All text colors meet WCAG AA standards:
- Body text: 4.5:1 minimum contrast
- Large text: 3:1 minimum contrast

### Screen Reader Support

- Semantic HTML elements
- ARIA labels where needed
- Descriptive alt text for images

---

## File Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── BaseBadge.vue
│   │   ├── BaseButton.vue
│   │   ├── BaseCard.vue
│   │   ├── BaseModal.vue
│   │   ├── BasePagination.vue
│   │   ├── ConfirmDialog.vue
│   │   ├── FullScreenMarkdownEditor.vue
│   │   └── LoadingSpinner.vue
│   ├── layout/                # Layout components
│   │   └── AppHeader.vue
│   ├── comments/              # Feature-specific components
│   │   ├── AnswerCard.vue
│   │   ├── ClassificationForm.vue
│   │   ├── CommentCard.vue
│   │   ├── CommentFilters.vue
│   │   └── CommentsSection.vue
│   └── media/
│       ├── MediaCard.vue
│       └── MediaDetailCard.vue
├── composables/               # Vue composables
│   ├── useAsyncAction.ts
│   ├── useConfirm.ts
│   └── useMarkdown.ts
├── style.css                  # Global styles & design tokens
└── types/
    └── api.ts                 # TypeScript types
```

---

## Best Practices

### Component Development

1. **Use composition API with `<script setup>`**
2. **Define props with TypeScript interfaces**
3. **Emit events with type safety**
4. **Use CSS variables for all colors and spacing**
5. **Keep components small and focused**
6. **Extract reusable logic to composables**

### Styling Guidelines

1. **Mobile-first responsive design**
2. **Use design tokens (CSS variables) exclusively**
3. **Avoid magic numbers - use spacing scale**
4. **Consistent transition timing**
5. **Scoped styles in components**
6. **Semantic class names**

### Performance

1. **Lazy load routes and heavy components**
2. **Use `v-memo` for expensive lists**
3. **Optimize images (blob URLs with auth)**
4. **Debounce user input**
5. **Minimize re-renders with computed properties**

---

## Resources

### Design References

- **Color Palette:** Inspired by Tailwind CSS slate/blue
- **Spacing:** 4px base grid system
- **Typography:** System font stack for performance
- **Shadows:** Material Design elevation

### Tools

- **Design:** Figma, Sketch
- **Development:** VS Code + Volar
- **Build:** Vite
- **Framework:** Vue 3 + TypeScript

---

## Changelog

### Version 1.0.0 (October 2025)

- ✅ Initial UI Kit documentation
- ✅ Complete color palette
- ✅ All base components documented
- ✅ Markdown system with optimized spacing
- ✅ Classification system
- ✅ Responsive breakpoints
- ✅ Accessibility guidelines

---

## Support

For questions or suggestions about the UI Kit:
- Review component source code in `/src/components/ui/`
- Check global styles in `/src/style.css`
- Refer to TypeScript types in `/src/types/api.ts`

---

**Built with ❤️ for Instachatico**
