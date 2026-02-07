# Mission Control 🚀

A real-time dashboard for monitoring AI assistant activities, scheduled tasks, and searchable content.

## Features

### 📊 Activity Feed
- Chronological view of all AI assistant actions
- Filter by action type (email, search, file operations, cron jobs, messages)
- Expandable details with metadata
- Real-time updates via Convex subscriptions
- Status indicators (success/failed/pending)

### 📅 Calendar View
- Weekly calendar showing scheduled tasks
- Navigate between weeks
- Color-coded by task type (reminder, monitor, check, report)
- Shows task status (active/disabled)
- Time slots and cron schedule display

### 🔍 Global Search
- Fast full-text search across all content
- Searches activities, documents, and tasks
- Results grouped by type with highlights
- Debounced for performance
- Shows snippets and context

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19
- **Database**: Convex (real-time database with subscriptions)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui components
- **Icons**: Lucide React
- **Type Safety**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Convex account (free at [convex.dev](https://convex.dev))

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Convex**:
   ```bash
   npx convex dev
   ```
   
   This will:
   - Create a new Convex project (or link to existing)
   - Generate your Convex URL
   - Start the development backend

3. **Configure environment variables**:
   
   The Convex CLI will automatically create `.env.local` with:
   ```
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   CONVEX_DEPLOYMENT=your-deployment
   ```

4. **Seed the database** (in a new terminal):
   
   Once Convex is running, seed sample data:
   ```bash
   npx convex run seed:seedData
   ```

5. **Start the Next.js dev server**:
   ```bash
   npm run dev
   ```

6. **Open the dashboard**:
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
mission-control/
├── app/
│   ├── layout.tsx              # Root layout with sidebar
│   ├── page.tsx                # Activity feed page
│   ├── calendar/page.tsx       # Calendar view page
│   ├── search/page.tsx         # Search page
│   ├── globals.css             # Global styles
│   └── ConvexClientProvider.tsx
├── components/
│   ├── ActivityFeed.tsx        # Activity list with filters
│   ├── ActivityCard.tsx        # Individual activity card
│   ├── CalendarView.tsx        # Weekly calendar grid
│   ├── CalendarEvent.tsx       # Calendar task card
│   ├── GlobalSearch.tsx        # Search interface
│   ├── SearchResult.tsx        # Search result card
│   ├── Sidebar.tsx             # Navigation sidebar
│   └── ui/                     # shadcn/ui components
├── convex/
│   ├── schema.ts               # Database schema
│   ├── activities.ts           # Activity queries/mutations
│   ├── scheduledTasks.ts       # Task queries/mutations
│   ├── search.ts               # Search functions
│   └── seed.ts                 # Sample data seeding
├── lib/
│   └── utils.ts                # Utility functions
└── package.json
```

## Database Schema

### Activities
```typescript
{
  timestamp: number,        // Unix timestamp in ms
  actionType: string,       // "email_sent", "search", "file_created", etc.
  title: string,
  details?: string,
  status: string,          // "success", "failed", "pending"
  metadata?: any
}
```

### Scheduled Tasks
```typescript
{
  name: string,
  description?: string,
  scheduleType: string,    // "cron", "once", "recurring"
  schedule: string,        // Cron expression or ISO date
  nextRun?: number,       // Unix timestamp in ms
  taskType: string,       // "reminder", "monitor", "check", "report"
  status: string,         // "active", "disabled", "completed"
  metadata?: any
}
```

### Documents
```typescript
{
  title: string,
  content: string,
  source: string,         // "memory", "workspace", "task"
  sourcePath?: string,
  lastUpdated: number     // Unix timestamp in ms
}
```

## Adding Data

### From Code

```typescript
// Add an activity
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const createActivity = useMutation(api.activities.create);

await createActivity({
  timestamp: Date.now(),
  actionType: "email_sent",
  title: "Sent report to team",
  details: "Weekly metrics report sent to 5 recipients",
  status: "success",
  metadata: { recipients: 5 }
});
```

### From Convex Dashboard

Visit your Convex dashboard and use the data browser to manually add records.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import to Vercel
3. Add environment variables from `.env.local`
4. Deploy!

### Deploy Convex

```bash
npx convex deploy
```

Update your `.env.local` with the production Convex URL.

## Development

```bash
# Start Convex backend
npx convex dev

# Start Next.js (in another terminal)
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

## Customization

### Adding Action Types

1. Add icon mapping in `components/ActivityCard.tsx`:
   ```typescript
   const actionIcons = {
     your_action: YourIcon,
     ...
   };
   ```

2. Add color scheme:
   ```typescript
   const actionColors = {
     your_action: "text-color-400 bg-color-950",
     ...
   };
   ```

### Adding Task Types

Update color mapping in `components/CalendarEvent.tsx`:
```typescript
const taskTypeColors = {
  your_type: "bg-color-900 border-color-700 text-color-300",
  ...
};
```

## License

MIT

## Support

For issues and questions, please open an issue on the repository.
