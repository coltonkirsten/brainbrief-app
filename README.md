# Brain Brief

AI-powered personalized news briefings. Get smarter about the things you care about — delivered to your inbox.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Database & Auth:** Supabase (Postgres + Supabase Auth)
- **AI:** Google Gemini (with Grounding / Google Search)
- **Email:** Resend
- **Hosting:** Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your keys:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
RESEND_API_KEY=
CRON_SECRET=
```

## Project Structure

```
src/
  app/
    (auth)/         # Auth pages (login, signup)
    (dashboard)/    # Protected dashboard pages
    api/            # API routes (cron, etc.)
    page.tsx        # Landing page
    layout.tsx      # Root layout
  lib/
    supabase/       # Supabase client utilities
  components/       # Shared UI components
```

## Status

In development — MVP phase.
