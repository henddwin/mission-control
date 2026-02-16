# Mission Control - New Features Documentation

## Overview
Two major features have been added to Mission Control:
1. **Content Pipeline** (`/content`) - AI-powered content creation workflow dashboard
2. **CRM** (`/crm`) - Contact relationship management and sales pipeline

Both features integrate with **Supabase** (not Convex) for data storage.

---

## 🎯 Content Pipeline (`/content`)

### Purpose
Visual dashboard for managing AI-generated content from idea to publication.

### Features

#### 1. Kanban Pipeline View
- **8 status columns**: idea → researching → draft → review → revision → approved → published → promoted
- **Color-coded cards** by content type:
  - Blog Post (blue)
  - LinkedIn Post (purple)
  - Tweet Thread (green)
  - Podcast Summary (orange)
- Each card shows:
  - Title
  - Content type badge
  - Source type
  - Quality score (if available)
  - Word count
  - Time in current status

#### 2. Stats Dashboard
- Total items in pipeline
- Today's published count
- Average quality score
- Items needing review

#### 3. Activity Feed
- Recent pipeline events from AI agents
- Shows agent actions with timestamps
- Format: "🔍 Scout created 'Title' (blog_post)"

#### 4. Filters
- By content type
- By status
- By date range (UI ready, backend needs date filtering)

#### 5. Detail Modal
- Click any card to see full content
- Shows outline and draft text
- Quality metrics and status history

### Technical Details

**Database Tables** (already exist in Supabase):
- `content_pipeline` - Main content items
- `pipeline_events` - Agent activity log
- `quality_scores` - Content quality assessments

**Auto-refresh**: Every 30 seconds

---

## 👥 CRM (`/crm`)

### Purpose
Complete contact relationship management with sales pipeline tracking.

### Features

#### 1. Contact List View (Default)
- Sortable table with all contacts
- Columns: Name, Company, Title, Status, Lead Score, Last Contact, Source
- Quick status change dropdown
- Search by name, company, email
- Click contact to open detail view

#### 2. Pipeline Board View (Toggle)
- **9 status columns**: new → contacted → connected → conversation → qualified → proposal → client → lost → nurture
- Drag-and-drop feel (click to move stages)
- Deal values shown on cards
- Visual lead score indicators

#### 3. Contact Detail Modal
- **Full Profile**:
  - Name, company, title
  - Email, phone, LinkedIn
  - Status badge
  - Lead score (0-100)
  - AI readiness indicator
- **Activity Timeline**:
  - All interactions (calls, emails, LinkedIn DMs, meetings, notes)
  - Inbound/outbound direction
  - Status tracking
- **Associated Deals**:
  - Deal value, stage, probability
  - Expected close date
- **Quick Actions**:
  - Log Call
  - Send Email Draft
  - Add Note
  - Schedule Follow-up
- **Notes & Tags**

#### 4. Stats Bar
- Total contacts
- Pipeline value (sum of active deals)
- Contacts needing follow-up
- New contacts this week

#### 5. Filters & Search
- Full-text search (name, company, email)
- Filter by status
- Filter by source

#### 6. Import Placeholder
- Button ready for future CSV/API import integration

### Technical Details

**Database Tables** (created in Supabase):

```sql
-- crm_contacts: Main contact records
- id, first_name, last_name, email, phone, company, title
- linkedin_url, location, source
- status (9 stages), pipeline_stage, lead_score, ai_readiness
- last_contacted_at, last_response_at, next_followup_at
- notes, tags[]
- created_at, updated_at

-- crm_activities: Interaction log
- id, contact_id, type, direction, subject, content, status
- created_at

-- crm_deals: Sales opportunities
- id, contact_id, title, value, currency, stage, probability
- expected_close_date, notes
- created_at, updated_at
```

**Indexes**: Optimized for status, company, and source lookups

**Auto-refresh**: Every 30 seconds

---

## 🔧 Technical Setup

### Supabase Configuration

**Project ID**: `yheiafezylbdtivpgver`  
**URL**: `https://yheiafezylbdtivpgver.supabase.co`

### Environment Variables (`.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://yheiafezylbdtivpgver.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Files Created/Modified

**New Files**:
- `lib/supabase.ts` - Supabase client and TypeScript types
- `app/content/page.tsx` - Content Pipeline dashboard
- `app/crm/page.tsx` - CRM interface

**Modified Files**:
- `components/Sidebar.tsx` - Added Content and CRM navigation items
- `.env.local` - Added Supabase credentials
- `package.json` - Added `@supabase/supabase-js` dependency

### Installation

```bash
# Install dependencies
npm install

# Build
npm run build

# Run locally
npm run dev
```

---

## 📱 Responsive Design

Both features are fully responsive and work on mobile devices:
- Mobile bottom navigation includes new tabs
- Tables scroll horizontally on mobile
- Kanban boards scroll horizontally
- Detail modals are mobile-optimized
- Touch-friendly tap targets

---

## 🎨 Design System

Both features follow the existing Mission Control design language:
- Dark theme (`#0A0A0A` background)
- Cream accent (`#E8DCC8`)
- Virgil Abloh-inspired typography
- Premium card styling with hover effects
- Status badges with semantic colors
- Glass morphism for modals
- Noise texture overlay
- Custom scrollbars

---

## 🚀 Deployment

### Vercel
The application is configured for Vercel deployment:
1. Push to GitHub
2. Vercel will auto-deploy
3. **Important**: Add Supabase environment variables in Vercel dashboard

### Convex
Convex backend remains unchanged and continues to handle:
- Agent status
- Activity feed
- Tasks
- Debates
- Logs

---

## 📊 Sample Data

Sample data has been created in Supabase:

**CRM Contacts**: 5 sample contacts
- Jan Peeters (TechCorp Belgium) - Connected
- Sophie Dubois (Innovate Solutions) - Proposal
- Marc Verstappen (StartupIO) - Qualified
- Emma Van den Berg (Berg Consulting) - New
- Thomas Janssens (Enterprise Group) - Conversation

**CRM Deals**: 3 sample deals
- AI Transformation Project - €45K
- Voice Agent Pilot - €12K
- Enterprise AI Suite - €85K

**CRM Activities**: 5 sample interactions

**Content Pipeline**: 13 existing items from your production data

---

## 🔄 Next Steps / Future Enhancements

### Content Pipeline
- [ ] Date range filtering
- [ ] Bulk status changes
- [ ] Export content
- [ ] AI quality suggestions
- [ ] Publishing automation
- [ ] Analytics dashboard

### CRM
- [ ] CSV import
- [ ] Apollo.io integration
- [ ] LinkedIn scraper integration
- [ ] Email template system
- [ ] Automated follow-up reminders
- [ ] Deal probability calculator
- [ ] Revenue forecasting
- [ ] Activity auto-logging from email/calendar

### Both
- [ ] Real-time updates (Supabase Realtime subscriptions)
- [ ] Collaborative features (who's viewing what)
- [ ] Mobile app (React Native)
- [ ] Export to Excel/CSV
- [ ] Advanced analytics
- [ ] Custom field definitions

---

## 🐛 Troubleshooting

### "Missing env.NEXT_PUBLIC_SUPABASE_URL"
Make sure `.env.local` has the Supabase credentials. Restart dev server after adding them.

### "No contacts/content showing"
Check Supabase connection:
```javascript
// In browser console
import { supabase } from './lib/supabase'
const { data, error } = await supabase.from('crm_contacts').select('count')
console.log(data, error)
```

### Build errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

---

## 📝 Code Quality

- **TypeScript**: Fully typed with Supabase schema types
- **Error Handling**: Try-catch blocks on all Supabase queries
- **Loading States**: Skeleton loaders during data fetch
- **Empty States**: Helpful messages when no data exists
- **Accessibility**: Focus states, semantic HTML, ARIA labels
- **Performance**: Auto-refresh throttled to 30s, memoized calculations

---

## 🙏 Credits

Built for **Hendrik De Winne** by OpenClaw AI Agent  
Design inspired by: Notion × Perplexity × Nike × Virgil Abloh  
Stack: Next.js 16 + Supabase + Tailwind CSS + shadcn/ui
