# Verified Homeowner - Complete Documentation

> **Version:** 1.0.0  
> **Last Updated:** December 2025  
> **Website:** https://verifiedhomeowner.com

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Frontend Pages](#frontend-pages)
8. [Subscription Plans](#subscription-plans)
9. [Lead System](#lead-system)
10. [Marketplace](#marketplace)
11. [Email Automation](#email-automation)
12. [Authentication & Security](#authentication--security)
13. [Deployment](#deployment)
14. [Environment Variables](#environment-variables)

---

## Overview

**Verified Homeowner** is a comprehensive lead management platform designed specifically for real estate wholesalers. The platform provides:

- **Daily verified homeowner leads** delivered automatically based on subscription tier
- **Lead marketplace** for purchasing additional hot/warm leads
- **Complete CRM functionality** for tracking, managing, and following up with leads
- **Analytics dashboard** to track performance metrics
- **Email automation** for nurturing and engagement

### The Problem We Solve

Real estate wholesalers waste countless hours:
- Calling disconnected phone numbers
- Chasing leads with wrong contact information
- Skip tracing outdated data
- Managing leads across multiple spreadsheets

### Our Solution

- Every lead is **verified** before delivery
- Phone numbers are **confirmed working**
- Leads are delivered **directly to your dashboard**
- Built-in **CRM tools** for tracking and follow-up

---

## Features

### For Wholesalers

| Feature | Description |
|---------|-------------|
| **Lead Dashboard** | View and manage all assigned leads with status tracking |
| **Lead Detail Modal** | Comprehensive lead view with Overview, Activity, Notes, and Actions tabs |
| **Status Management** | Track leads as New, Follow-up, Not Interested, or Pending |
| **Countdown Timers** | Set follow-up reminders with countdown days |
| **Tags & Filters** | Organize leads with custom tags and advanced filtering |
| **Notes System** | Add detailed notes with quick templates |
| **Marketplace** | Purchase additional hot/warm leads |
| **Analytics** | Track performance metrics (plan-tier based) |
| **CSV Export** | Export leads for external use (Pro plan) |
| **Support Tickets** | Submit and track support requests |

### For Admins

| Feature | Description |
|---------|-------------|
| **User Management** | View, edit, and manage all wholesalers |
| **Lead Management** | Upload leads via CSV or single entry |
| **Lead Distribution** | Manual and automatic lead distribution |
| **Marketplace Management** | Add/manage marketplace leads with temperature ratings |
| **Email Automation** | Configure automated email sequences |
| **Email Templates** | Create and manage email templates |
| **Analytics Dashboard** | Platform-wide statistics and metrics |
| **Support System** | Handle user support tickets |

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Styling |
| **Lucide React** | Icons |
| **React Router DOM** | Client-side routing |
| **Axios** | HTTP client |
| **react-helmet-async** | SEO management |
| **react-hot-toast** | Toast notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| **Vercel Serverless Functions** | API endpoints (Node.js) |
| **Prisma ORM** | Database access |
| **PostgreSQL** | Database (Neon/Supabase) |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Zod** | Input validation |

### External Services
| Service | Purpose |
|---------|---------|
| **DodoPayments** | Subscription & one-time payments |
| **Resend** | Transactional emails |
| **Pexels API** | Stock images for marketing pages |
| **Vercel** | Hosting & deployment |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  React + Vite + Tailwind CSS                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Marketing  │  │  Wholesaler │  │    Admin    │             │
│  │    Pages    │  │   Dashboard │  │  Dashboard  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL SERVERLESS API                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   Auth   │  │  Leads   │  │Marketplace│  │  Admin   │       │
│  │ Endpoints│  │ Endpoints│  │ Endpoints │  │ Endpoints│       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │   Cron   │  │   Dodo   │  │ Support  │                      │
│  │   Jobs   │  │ Webhooks │  │ Tickets  │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ PostgreSQL│  │  Resend  │  │   Dodo   │                      │
│  │ (Prisma) │  │  (Email) │  │(Payments)│                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
verified-homeowner/
├── api/                          # Serverless API endpoints
│   ├── admin/                    # Admin-only endpoints
│   │   ├── analytics.js          # Platform analytics
│   │   ├── distribute.js         # Manual lead distribution
│   │   ├── email-automations.js  # Email automation CRUD
│   │   ├── email-templates.js    # Email template CRUD
│   │   ├── leads.js              # Lead management (CRUD, CSV upload)
│   │   ├── marketplace.js        # Marketplace lead management
│   │   ├── settings.js           # Admin settings
│   │   ├── users.js              # User management
│   │   └── wholesalers.js        # Wholesaler statistics
│   ├── auth/                     # Authentication endpoints
│   │   ├── login.js              # User login
│   │   ├── register.js           # User registration
│   │   ├── profile.js            # Get user profile
│   │   ├── verify-email.js       # Email verification
│   │   ├── forgot-password.js    # Password reset request
│   │   ├── reset-password.js     # Password reset
│   │   └── send-verification.js  # Resend verification email
│   ├── cron/                     # Scheduled tasks
│   │   ├── distribute.js         # Daily lead distribution
│   │   ├── countdown.js          # Countdown timer updates
│   │   └── process-notifications.js # Marketplace notifications
│   ├── dodo/                     # Payment webhooks
│   │   ├── checkout.js           # Create checkout session
│   │   └── webhook.js            # Handle payment events
│   ├── leads/                    # Wholesaler lead endpoints
│   │   ├── index.js              # Get user's leads
│   │   ├── update.js             # Update lead status/notes
│   │   ├── export.js             # CSV export
│   │   └── stats.js              # Lead statistics
│   ├── marketplace/              # Marketplace endpoints
│   │   ├── index.js              # Browse marketplace
│   │   └── checkout.js           # Purchase leads
│   ├── support/                  # Support ticket system
│   │   ├── index.js              # Create/list tickets
│   │   └── update.js             # Update ticket status
│   └── user/                     # User endpoints
│       ├── preferences.js        # User preferences
│       └── subscription.js       # Subscription management
│
├── frontend/                     # React application
│   └── src/
│       ├── components/           # Reusable UI components
│       │   ├── Layout.jsx        # Main layout wrapper
│       │   ├── Navbar.jsx        # Navigation bar
│       │   ├── LeadDetailModal.jsx # Lead detail modal
│       │   ├── FilterPanel.jsx   # Lead filtering
│       │   ├── TagInput.jsx      # Tag management
│       │   ├── Toast.jsx         # Toast notifications
│       │   ├── Skeleton.jsx      # Loading skeletons
│       │   ├── EmptyState.jsx    # Empty state displays
│       │   ├── LoadingButton.jsx # Button with loading state
│       │   ├── SuccessModal.jsx  # Success confirmation modal
│       │   ├── NewLeadsPopup.jsx # New leads notification
│       │   └── TrialOfferModal.jsx # Trial offer modal
│       ├── pages/
│       │   ├── admin/            # Admin pages
│       │   │   ├── Dashboard.jsx # Admin dashboard
│       │   │   ├── Leads.jsx     # Lead management
│       │   │   ├── Wholesalers.jsx # User management
│       │   │   ├── Marketplace.jsx # Marketplace management
│       │   │   ├── Email.jsx     # Email automation
│       │   │   ├── Analytics.jsx # Platform analytics
│       │   │   └── Support.jsx   # Support tickets
│       │   ├── wholesaler/       # Wholesaler pages
│       │   │   ├── Dashboard.jsx # Wholesaler dashboard
│       │   │   ├── Leads.jsx     # Lead management
│       │   │   ├── Marketplace.jsx # Browse marketplace
│       │   │   ├── Profile.jsx   # User profile
│       │   │   ├── Support.jsx   # Submit support tickets
│       │   │   └── UpgradePlan.jsx # Plan upgrade
│       │   ├── Home.jsx          # Landing page
│       │   ├── Pricing.jsx       # Pricing page
│       │   ├── About.jsx         # About page
│       │   ├── HowItWorks.jsx    # How it works page
│       │   ├── Login.jsx         # Login page
│       │   ├── Register.jsx      # Registration page
│       │   ├── ForgotPassword.jsx # Password reset request
│       │   ├── ResetPassword.jsx # Password reset
│       │   ├── VerifyEmail.jsx   # Email verification
│       │   ├── Terms.jsx         # Terms of service
│       │   ├── Privacy.jsx       # Privacy policy
│       │   └── Refund.jsx        # Refund/cancellation policy
│       ├── lib/
│       │   └── api.js            # API client (Axios)
│       └── context/
│           └── ToastContext.jsx  # Toast notification context
│
├── lib/                          # Shared backend utilities
│   ├── auth-prisma.js            # JWT authentication middleware
│   ├── planConfig.js             # Plan feature configuration
│   ├── distributeLeads-prisma.js # Lead distribution logic
│   ├── email.js                  # Email service (Resend)
│   ├── prisma.js                 # Prisma client instance
│   ├── rateLimit.js              # Rate limiting middleware
│   └── validation.js             # Input validation (Zod)
│
├── prisma/
│   └── schema.prisma             # Database schema
│
├── public/                       # Static assets
│   ├── logo.png                  # App logo
│   ├── sitemap.xml               # SEO sitemap
│   └── robots.txt                # SEO robots file
│
└── vercel.json                   # Vercel configuration
```

---

## Database Schema

### Core Models

#### User
```prisma
model User {
  id                    String    @id @default(uuid())
  email                 String    @unique
  password              String
  name                  String
  role                  UserRole  @default(wholesaler)  // admin | wholesaler
  planType              PlanType  @default(free)        // free | basic | elite | pro
  subscriptionStatus    SubscriptionStatus @default(active)
  leadSequencePosition  Int       @default(0)           // For round-robin distribution
  
  // Email Verification
  emailVerified         Boolean   @default(false)
  verificationToken     String?
  verificationExpires   DateTime?
  
  // Password Reset
  resetToken            String?
  resetTokenExpires     DateTime?
  
  // Dodo Payments
  dodoSubscriptionId    String?
  dodoCustomerId        String?
  subscriptionEndDate   DateTime?
  
  // Trial Tracking
  hasUsedTrial          Boolean   @default(false)
  trialUsedAt           DateTime?
  
  // Preferences
  preferredStates       String[]  @default([])
  marketplaceEmails     Boolean   @default(true)
}
```

#### Lead (Master Database)
```prisma
model Lead {
  id              String    @id @default(uuid())
  firstName       String?
  lastName        String?
  fullName        String?
  isBusiness      Boolean   @default(false)
  phone           String?
  propertyAddress String?
  city            String?
  state           String?
  zipCode         String?
  mailingAddress  String?
  mailingCity     String?
  mailingState    String?
  mailingZip      String?
  sequenceNumber  Int       @unique    // For round-robin distribution
}
```

#### UserLead (Assigned Leads)
```prisma
model UserLead {
  id            String      @id @default(uuid())
  userId        String
  leadId        String
  status        LeadStatus  @default(new)      // new | follow_up | not_interested | pending
  action        LeadAction  @default(call_now) // call_now | pending
  motivation    String?
  assignedAt    DateTime    @default(now())
  lastCalledAt  DateTime?
  followUpDate  DateTime?
  countdownDays Int?
  notes         String?
  tags          String[]    @default([])
}
```

#### MarketplaceLead
```prisma
model MarketplaceLead {
  id              String    @id @default(uuid())
  ownerName       String?
  phone           String?
  propertyAddress String?
  city            String?
  state           String?
  zipCode         String?
  mailingAddress  String?
  motivation      String    // High, Medium, Low
  timeline        String    // ASAP, 1-3 months, 3-6 months, etc.
  askingPrice     Decimal?
  temperature     String?   @default("warm")  // hot | warm
  price           Decimal                      // Purchase price
  maxBuyers       Int       @default(0)       // 0 = unlimited
  timesSold       Int       @default(0)
  isHidden        Boolean   @default(false)
}
```

#### SupportTicket
```prisma
model SupportTicket {
  id        String       @id @default(uuid())
  userId    String?
  name      String
  email     String
  category  String       // billing, technical, leads, account, other
  message   String
  status    TicketStatus @default(open)  // open | resolved
}
```

#### EmailTemplate
```prisma
model EmailTemplate {
  id          String   @id @default(uuid())
  name        String   @unique
  displayName String
  subject     String
  htmlContent String
  textContent String
  variables   String[] @default([])
  isActive    Boolean  @default(true)
}
```

#### EmailAutomation
```prisma
model EmailAutomation {
  id                  String    @id @default(uuid())
  name                String
  description         String?
  templateId          String
  trigger             String    // new_user, inactive_user, new_lead, etc.
  delayHours          Int       @default(0)
  repeatIntervalHours Int       @default(0)
  maxSends            Int       @default(1)
  isActive            Boolean   @default(true)
  totalSent           Int       @default(0)
}
```

---

## API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |
| POST | `/api/auth/verify-email` | Verify email with token | No |
| POST | `/api/auth/send-verification` | Resend verification email | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |

### Lead Endpoints (Wholesaler)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/leads` | Get user's leads (paginated) | Yes |
| PATCH | `/api/leads/update` | Update lead status/notes/tags | Yes |
| GET | `/api/leads/stats` | Get lead statistics | Yes |
| GET | `/api/leads/export` | Export leads as CSV | Yes (Pro) |

### Marketplace Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/marketplace` | Browse available leads | Yes |
| POST | `/api/marketplace/checkout` | Purchase a lead | Yes |

### Support Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/support` | List user's tickets | Yes |
| POST | `/api/support` | Create new ticket | Yes |
| PATCH | `/api/support/update` | Update ticket (admin) | Admin |
| DELETE | `/api/support/update` | Delete ticket (admin) | Admin |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users` | List all users | Admin |
| PATCH | `/api/admin/users` | Update user | Admin |
| GET | `/api/admin/leads` | List all leads | Admin |
| POST | `/api/admin/leads` | Create lead | Admin |
| POST | `/api/admin/leads/upload` | Upload CSV | Admin |
| DELETE | `/api/admin/leads` | Delete lead | Admin |
| POST | `/api/admin/distribute` | Manual distribution | Admin |
| GET | `/api/admin/analytics` | Platform analytics | Admin |
| GET | `/api/admin/wholesalers` | Wholesaler stats | Admin |
| GET | `/api/admin/marketplace` | Marketplace leads | Admin |
| POST | `/api/admin/marketplace` | Create marketplace lead | Admin |
| PATCH | `/api/admin/marketplace` | Update marketplace lead | Admin |
| DELETE | `/api/admin/marketplace` | Delete marketplace lead | Admin |
| GET | `/api/admin/email-templates` | List templates | Admin |
| POST | `/api/admin/email-templates` | Create template | Admin |
| PATCH | `/api/admin/email-templates` | Update template | Admin |
| GET | `/api/admin/email-automations` | List automations | Admin |
| POST | `/api/admin/email-automations` | Create automation | Admin |
| PATCH | `/api/admin/email-automations` | Update automation | Admin |

### Payment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/dodo/checkout` | Create subscription checkout | Yes |
| POST | `/api/dodo/webhook` | Handle payment webhooks | No (verified) |

### Cron Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cron/distribute` | Daily lead distribution | Cron Secret |
| GET | `/api/cron/countdown` | Update countdown timers | Cron Secret |
| GET | `/api/cron/process-notifications` | Process marketplace notifications | Cron Secret |

---

## Frontend Pages

### Marketing Pages (Public)

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with features, pricing preview, FAQ |
| Pricing | `/pricing` | Detailed pricing with plan comparison |
| About | `/about` | Company story and mission |
| How It Works | `/how-it-works` | Step-by-step guide |
| Terms | `/terms` | Terms of service |
| Privacy | `/privacy` | Privacy policy |
| Refund | `/refund` | Cancellation/refund policy |

### Auth Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | User login |
| Register | `/register` | User registration |
| Forgot Password | `/forgot-password` | Request password reset |
| Reset Password | `/reset-password` | Reset password with token |
| Verify Email | `/verify-email` | Email verification |

### Wholesaler Pages (Protected)

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Overview, stats, analytics |
| Leads | `/leads` | Lead management with filters |
| Marketplace | `/marketplace` | Browse and purchase leads |
| Profile | `/profile` | User settings, preferences |
| Support | `/support` | Submit support tickets |
| Upgrade | `/upgrade` | Plan upgrade options |

### Admin Pages (Protected)

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/admin` | Platform overview |
| Leads | `/admin/leads` | Lead management, CSV upload |
| Wholesalers | `/admin/wholesalers` | User management |
| Marketplace | `/admin/marketplace` | Marketplace lead management |
| Email | `/admin/email` | Email templates & automations |
| Analytics | `/admin/analytics` | Platform-wide analytics |
| Support | `/admin/support` | Support ticket management |

---

## Subscription Plans

### Plan Comparison

| Feature | Free | Basic ($29/mo) | Elite ($99/mo) | Pro ($149/mo) |
|---------|------|----------------|----------------|---------------|
| **Lead Delivery** | 1/week | 1/day | 5/day | 10/day |
| **States Allowed** | 1 | 3 | 5 | 7 |
| **Marketplace Access** | ❌ | 5/month | 15/month | Unlimited |
| **🔥 Hot Lead Alerts** | ❌ | +4 hours | +30 min | Instant |
| **🌡️ Warm Lead Alerts** | ❌ | +1 hour | +15 min | Instant |
| **Lead Tracking** | ✅ | ✅ | ✅ | ✅ |
| **Analytics** | ❌ | 7 days | 30 days | 90 days + Export |
| **Support** | Email | Priority | Premium | VIP |

### Plan Configuration (planConfig.js)

```javascript
export const PLAN_CONFIG = {
  free: {
    dailyLeads: 0,
    weeklyLeads: 1,
    statesAllowed: 1,
    marketplacePurchasesPerMonth: 0,
    hotLeadDelayMinutes: null,
    warmLeadDelayMinutes: null,
    analyticsEnabled: false,
    analyticsDays: 0,
    analyticsExport: false,
  },
  basic: {
    dailyLeads: 1,
    weeklyLeads: 7,
    statesAllowed: 3,
    marketplacePurchasesPerMonth: 5,
    hotLeadDelayMinutes: 240,  // 4 hours
    warmLeadDelayMinutes: 60,  // 1 hour
    analyticsEnabled: true,
    analyticsDays: 7,
    analyticsExport: false,
  },
  elite: {
    dailyLeads: 5,
    weeklyLeads: 35,
    statesAllowed: 5,
    marketplacePurchasesPerMonth: 15,
    hotLeadDelayMinutes: 30,
    warmLeadDelayMinutes: 15,
    analyticsEnabled: true,
    analyticsDays: 30,
    analyticsExport: false,
  },
  pro: {
    dailyLeads: 10,
    weeklyLeads: 70,
    statesAllowed: 7,
    marketplacePurchasesPerMonth: -1,  // Unlimited
    hotLeadDelayMinutes: 0,  // Instant
    warmLeadDelayMinutes: 0,
    analyticsEnabled: true,
    analyticsDays: 90,
    analyticsExport: true,
  },
};
```

---

## Lead System

### Lead Distribution Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DAILY CRON JOB                            │
│                 (runs at configured time)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              GET ALL ACTIVE WHOLESALERS                      │
│         (subscriptionStatus = 'active')                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              FOR EACH WHOLESALER:                            │
│                                                              │
│  1. Get plan config (dailyLeads / weeklyLeads)              │
│  2. Free plan: Only distribute on Mondays (weekly)          │
│  3. Paid plans: Distribute daily                            │
│  4. Get user's current sequence position                    │
│  5. Fetch next N leads starting from position               │
│  6. Assign leads to user                                    │
│  7. Update user's sequence position                         │
│  8. Send new lead notification email                        │
└─────────────────────────────────────────────────────────────┘
```

### Lead Statuses

| Status | Description | Action |
|--------|-------------|--------|
| `new` | Fresh lead, not yet contacted | Call Now |
| `follow_up` | Needs follow-up call | Call Now |
| `not_interested` | Lead declined | Pending |
| `pending` | Waiting/on hold | Pending |

### Lead Actions

| Action | Description |
|--------|-------------|
| `call_now` | Lead appears in "Call Now" queue |
| `pending` | Lead appears in "Pending" queue |

### Lead Detail Modal Tabs

1. **Overview** - Contact info, property details, mailing address, motivation, timeline
2. **Activity** - Status change history, call attempts, system events
3. **Notes** - Add/edit notes with quick templates
4. **Actions** - Quick actions (call, copy phone, view on Zillow, change status)

---

## Marketplace

### Lead Types

| Type | Price | Max Buyers | Description |
|------|-------|------------|-------------|
| 🔥 Hot | $100 | 3 | High-motivation sellers ready to close quickly |
| 🌡️ Warm | $80 | 5 | Motivated sellers with flexible timelines |

### Notification Delay System

When a new marketplace lead is added, notifications are sent to users based on their plan tier:

| Plan | Hot Lead Delay | Warm Lead Delay |
|------|----------------|-----------------|
| Free | No access | No access |
| Basic | +4 hours | +1 hour |
| Elite | +30 minutes | +15 minutes |
| Pro | Instant | Instant |

### Purchase Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. User browses marketplace (filtered by plan access)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. User selects lead and clicks "Purchase"                  │
│     - System checks plan limits                              │
│     - System checks if lead still available                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Redirect to DodoPayments checkout                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Webhook confirms payment                                 │
│     - Create UserMarketplaceLead record                      │
│     - Increment timesSold on MarketplaceLead                 │
│     - Send confirmation email                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Lead appears in user's dashboard                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Email Automation

### Triggers

| Trigger | Description |
|---------|-------------|
| `new_user` | When a new user registers |
| `inactive_user` | When user hasn't logged in for X days |
| `new_lead` | When new leads are assigned |
| `marketplace_new` | When new marketplace lead is available |
| `subscription_expiring` | Before subscription expires |

### Email Templates

Templates support variables that are replaced at send time:

| Variable | Description |
|----------|-------------|
| `{{name}}` | User's name |
| `{{email}}` | User's email |
| `{{plan}}` | User's plan type |
| `{{leadCount}}` | Number of leads |
| `{{propertyAddress}}` | Lead property address |

### System Emails

| Email | Trigger | Description |
|-------|---------|-------------|
| Welcome | Registration | Welcome message with getting started guide |
| Verification | Registration | Email verification link |
| Password Reset | Forgot password | Password reset link |
| New Leads | Lead distribution | Notification of new leads |
| Purchase Confirmation | Marketplace purchase | Lead purchase receipt |
| Support Notification | New ticket | Admin notification of new ticket |

---

## Authentication & Security

### JWT Authentication

```javascript
// Token structure
{
  userId: "uuid",
  email: "user@example.com",
  role: "wholesaler",
  iat: 1234567890,
  exp: 1235172690  // 7 days
}

// Middleware usage
export default requireAuth(handler);      // Requires valid JWT
export default requireAdmin(handler);     // Requires admin role
```

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 5 attempts | 15 minutes |
| Register | 3 attempts | 1 hour |
| General API | 100 requests | 1 minute |

### Security Features

- **Password Hashing** - bcryptjs with salt rounds
- **JWT Tokens** - 7-day expiration, stored in localStorage
- **Input Validation** - Zod schemas for all inputs
- **SQL Injection Prevention** - Prisma ORM parameterized queries
- **CORS** - Configured for production domain
- **Rate Limiting** - Prevents brute force attacks
- **Email Verification** - Required for account activation
- **Webhook Verification** - DodoPayments signature validation

---

## Deployment

### Vercel Deployment

1. **Connect Repository**
   ```bash
   # Push to GitHub
   git push origin main
   ```

2. **Configure Vercel**
   - Import project from GitHub
   - Set root directory: `/`
   - Set build command: `cd frontend && npm run build`
   - Set output directory: `frontend/dist`

3. **Set Environment Variables**
   - Add all required env vars in Vercel dashboard

4. **Configure Cron Jobs**
   ```json
   // vercel.json
   {
     "crons": [
       {
         "path": "/api/cron/distribute",
         "schedule": "0 8 * * *"  // Daily at 8 AM UTC
       },
       {
         "path": "/api/cron/countdown",
         "schedule": "0 0 * * *"  // Daily at midnight UTC
       }
     ]
   }
   ```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

---

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx

# Payments (DodoPayments)
DODO_API_KEY=your-dodo-api-key
DODO_WEBHOOK_SECRET=your-webhook-secret

# Cron Jobs
CRON_SECRET=your-cron-secret

# Frontend
VITE_API_URL=/api
VITE_PEXELS_API_KEY=your-pexels-api-key
```

### Optional Variables

```env
# App URL (for email links)
APP_URL=https://verifiedhomeowner.com

# Email From Address
EMAIL_FROM=noreply@verifiedhomeowner.com
```

---

## Support

### Contact

- **Email:** support@verifiedhomeowner.com
- **Website:** https://verifiedhomeowner.com

### Ticket Categories

- **Billing** - Payment and subscription issues
- **Technical** - App bugs and errors
- **Leads** - Lead quality or delivery issues
- **Account** - Account access and settings
- **Other** - General inquiries

---

## License

Proprietary - All rights reserved © 2024 Verified Homeowner

---

*This documentation is auto-generated and may be updated as the application evolves.*
