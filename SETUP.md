# Setup Instructions

This project requires Convex to be initialized before it can build. Follow these steps:

## Step 1: Install Dependencies (Already Done)

```bash
npm install
```

## Step 2: Initialize Convex

Run this command and follow the prompts:

```bash
npx convex dev
```

This will:
1. Ask you to log in (or create an account at convex.dev)
2. Create a new Convex project
3. Generate the `.env.local` file with your deployment URL
4. Generate the `convex/_generated` folder with API types
5. Start watching your Convex functions

**Leave this terminal running!**

## Step 3: Seed Sample Data

In a **new terminal**, run:

```bash
npx convex run seed:seedData
```

This will populate your database with sample activities, tasks, and documents.

## Step 4: Start the Next.js Dev Server

In another **new terminal**, run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your dashboard!

## Quick Start (All-in-One)

If you have three terminals available:

**Terminal 1** (Convex backend):
```bash
npx convex dev
```

**Terminal 2** (Seed data - wait for Terminal 1 to finish):
```bash
npx convex run seed:seedData
```

**Terminal 3** (Next.js dev server):
```bash
npm run dev
```

## Troubleshooting

### "Module not found: Can't resolve '@/convex/_generated/api'"

This means Convex hasn't generated the API files yet. Make sure:
1. You've run `npx convex dev`
2. The `convex/_generated` folder exists
3. You're logged into Convex

### Build fails

The project cannot build until Convex is initialized because it needs the generated API types. Run `npx convex dev` first, then try building again.

### No data showing

Make sure you've run the seed script:
```bash
npx convex run seed:seedData
```

## Next Steps

Once everything is running:
1. Explore the Activity Feed to see sample activities
2. Check the Calendar view for scheduled tasks
3. Try the Search to find activities and documents
4. Review the README.md for customization options
