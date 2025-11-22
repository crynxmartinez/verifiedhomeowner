# Verified Homeowner CRM

A lead management CRM for wholesalers with sequential lead distribution.

## Features

- **Supabase Authentication** - Built-in auth, no custom password hashing
- **4 Plans**: Free (1/week), Basic (1/day), Elite (5/day), Pro (10/day)
- **Sequential Lead Distribution** - Each wholesaler gets leads in their own sequence
- **Admin Dashboard** - Manage users, upload leads, view analytics
- **Wholesaler Dashboard** - View leads, update status, track progress
- **Full-screen Marketing Pages** - Home, About, How It Works

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Zustand
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth

## Setup Instructions

### 1. Database Setup

Run in Supabase SQL Editor:

```sql
-- First, run cleanup.sql to drop existing tables
-- Then, run schema.sql to create new tables
```

### 2. Create Admin User

In Supabase Dashboard:
1. Go to Authentication → Users
2. Add user: `admin@verifiedhomeowner.com` / `admin123`
3. Profile will be auto-created by trigger

### 3. Environment Variables

Add to Vercel:

```
SUPABASE_URL=https://ardgwqltrryjeoklppyt.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

### 4. Deploy

```bash
git push origin main
```

Vercel will auto-deploy.

## Project Structure

```
/api                    # Serverless API endpoints
  /auth                 # Login, register, profile
  /leads                # Wholesaler lead endpoints
  /admin                # Admin endpoints
/frontend               # React app
  /src
    /pages              # All pages
    /components         # Reusable components
    /lib                # API client, utilities
    /store              # Zustand state management
/lib                    # Shared backend utilities
/supabase               # Database scripts
```

## Lead Distribution Logic

- Each wholesaler has their own `lead_sequence_position`
- Leads are assigned based on this position (wraps around)
- Same lead can be assigned to multiple wholesalers on different days
- Unlimited scalability

## Plans

- **Free**: 1 lead/week (Mondays only)
- **Basic**: 1 lead/day
- **Elite**: 5 leads/day
- **Pro**: 10 leads/day

## Admin Features

- View all wholesalers with stats
- Upload leads (single or CSV)
- Manual distribution (for testing)
- Analytics dashboard

## Wholesaler Features

- Dashboard with lead stats
- Two lead tables: Call Now & Pending
- Update lead status and action
- Add notes and follow-up dates
- Upgrade plan page
