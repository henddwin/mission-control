# Mission Control — Premium UI Redesign ✨

**Design Inspiration:** Notion × Perplexity × Claude × Nocta × Nike × Virgil Abloh

## What Was Redesigned

### 🎨 Complete Visual Overhaul

Every component has been redesigned from the ground up with a premium, dark luxury aesthetic.

---

## Files Created/Updated

### Core Design System
- **`app/globals.css`** — Complete CSS overhaul with new color palette, typography, animations, glass morphism utilities, custom scrollbar, and noise texture overlay

### Layout & Navigation
- **`app/layout.tsx`** — Updated with Inter + JetBrains Mono fonts
- **`components/Sidebar.tsx`** — Slim sidebar (64px collapsed, 240px expanded), icon-only by default, Virgil-style vertical text, hover to expand

### Dashboard & Activity
- **`app/page.tsx`** — Home dashboard with stat cards + two-column layout (activity feed + agent status)
- **`components/StatCard.tsx`** — NEW: Premium stat cards with gradient backgrounds and trends
- **`components/ActivityFeed.tsx`** — Redesigned with filter pills and premium styling
- **`components/ActivityCard.tsx`** — Premium cards with left border color coding, glass effects, expandable details

### Agents
- **`app/agents/page.tsx`** — Agent grid with stats bar (active/idle/blocked counts)
- **`components/AgentCard.tsx`** — Premium cards with large emoji, status dots, level badges, hover "VIEW LOGS →" overlay

### Tasks
- **`app/tasks/page.tsx`** — Kanban board with glass column headers and Virgil-quoted labels
- **`components/TaskCard.tsx`** — Minimal cards with priority dots, tags, and assignee avatars
- **`components/TaskDetail.tsx`** — Slide-in panel from right with glass morphism, status controls, comment thread

### Standup
- **`app/standup/page.tsx`** — Daily report with large date display
- **`components/StandupView.tsx`** — Clean sections (COMPLETED, IN PROGRESS, BLOCKED, KEY DECISIONS) with icons and color-coded dots

### New Pages
- **`app/debates/page.tsx`** — NEW: Debate arena with participant cards, confidence bars, expand to see positions
- **`app/logs/page.tsx`** — NEW: Terminal-style log viewer with agent filters, search, auto-scroll, color-coded log types

---

## Design System

### Color Palette
```css
Background: #0A0A0A (deep matte black)
Cards: #111111
Text Primary: #F5F5F3 (warm off-white)
Text Secondary: #8A8A8A
Accent Cream: #E8DCC8 (Nocta gold vibes)
Accent Terracotta: #C4785B (Claude orange)
Success: #4ADE80
Warning: #F59E0B
Error: #EF4444
Borders: rgba(255,255,255,0.06)
Glass: rgba(17,17,17,0.8) + backdrop-blur(20px)
```

### Typography
- **Headlines:** Inter, bold, ALL CAPS with letter-spacing: 0.15em
- **Body:** Inter, regular, 14px
- **Labels:** JetBrains Mono, 11px, uppercase, tracking wide
- **Virgil touch:** Quotation marks around section titles ("AGENTS", "TASK BOARD")

### Micro-Interactions
- **Cards:** hover lift (translateY(-2px))
- **Buttons:** scale down on press (0.97)
- **Status dots:** pulse animation for active
- **Page transitions:** fade-in on mount
- **Skeleton loaders:** shimmer effect for data fetch

---

## Key Features

### Sidebar
- Collapsed by default (64px, icons only)
- Expands to 240px on hover
- "MC" logo in mono font
- Active state: warm cream accent bar on left
- Vertical "MISSION CONTROL" text when expanded (Virgil style)
- User avatar at bottom
- Mobile: transforms to bottom tab bar

### Glass Morphism
- Subtle glass effects throughout (backdrop-filter blur)
- Task column headers
- Slide-in panels
- Stat card gradients

### Virgil Abloh Aesthetic
- Quotation marks around labels: "AGENTS", "TASK BOARD", "LIVE FEED"
- Industrial design codes
- Mono font labels with wide tracking
- Meta-commentary aesthetic

### Nike Energy
- Bold typography
- Athletic spacing
- Confident color blocking
- Premium stat cards

### Nocta Luxury
- Dark matte blacks
- Subtle gold/amber accents (#E8DCC8)
- Sophisticated gradients
- Premium materials feel

---

## Mobile Responsive

- **Sidebar** → Bottom tab bar
- **Cards** → Stack single column
- **Kanban** → Horizontal scroll (maintains desktop layout)
- **Glass effects** → Maintained
- **Typography** → Scales appropriately

---

## Animations

```css
fade-in: 0.3s ease-out
slide-up: 0.4s ease-out
pulse-dot: 2s ease-in-out infinite
slide-in-right: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
glow: 2s ease-in-out infinite
shimmer: 2s infinite linear (skeleton loader)
```

---

## CSS Utilities

### Custom Classes
- `.virgil-label` — Mono font, uppercase, quoted labels
- `.mono-small` — Small mono text for timestamps/metadata
- `.premium-card` — Standard card with hover effects
- `.glass` / `.glass-strong` — Glass morphism effects
- `.status-dot` — Pulsing status indicators
- `.gradient-cream/terracotta/success` — Gradient backgrounds

### Border Utilities
- `.border-accent-left` — Left border in cream
- `.border-terracotta-left` — Left border in terracotta
- `.border-success-left` — Left border in green
- etc.

---

## Next Steps

1. **Connect real data** — Replace mock data in `/debates` and `/logs` with Convex queries
2. **Add transitions** — Page transitions between routes
3. **Implement drag-and-drop** — For Kanban task movement
4. **Add notifications** — Toast notifications for actions
5. **Optimize performance** — Lazy loading, virtualization for long lists

---

## Running the Project

```bash
cd /Users/hendrikdewinne/.openclaw/workspace/mission-control
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

**This is a complete visual overhaul.** Every component has been touched. It now looks like something Nike's design team would build for their internal ops dashboard — premium, confident, and impossibly slick.
