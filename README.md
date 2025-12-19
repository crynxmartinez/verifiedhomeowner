# Verified Homeowner CRM

A comprehensive lead management platform for real estate wholesalers with subscription-based lead distribution and a marketplace for purchasing additional leads.

## 🚀 Features

### For Wholesalers
- **Lead Dashboard** - View and manage assigned leads with status tracking
- **Lead Detail Modal** - Comprehensive lead view with tabs (Overview, Activity, Notes, Actions)
- **Marketplace** - Purchase additional hot/warm leads with plan-based pricing
- **Analytics** - Track performance metrics (plan-tier based access)
- **Tags & Filters** - Organize leads with custom tags and advanced filtering
- **CSV Export** - Export leads for external use

### For Admins
- **User Management** - View/edit wholesalers, manage subscriptions
- **Lead Management** - Upload leads via CSV or single entry
- **Marketplace Management** - Add/manage marketplace leads with temperature ratings
- **Email Automation** - Configure automated email sequences
- **Analytics Dashboard** - Platform-wide statistics
- **Support Tickets** - Handle user support requests

### Subscription Plans
| Plan | Price | Daily Leads | States | Marketplace | Analytics |
|------|-------|-------------|--------|-------------|-----------|
| Free | $0 | 1/week | 1 | No access | None |
| Basic | $29/mo | 1/day | 3 | 5/month | 7 days |
| Elite | $99/mo | 5/day | 5 | 15/month | 30 days |
| Pro | $149/mo | 10/day | 7 | Unlimited | 90 days + Export |

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Lucide Icons
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: PostgreSQL via Prisma ORM (Neon/Supabase)
- **Payments**: DodoPayments (subscriptions + one-time purchases)
- **Email**: Resend API
- **Auth**: JWT-based custom authentication

## 📁 Project Structure

```
├── api/                    # Serverless API endpoints
│   ├── admin/              # Admin-only endpoints
│   │   ├── analytics.js    # Platform analytics
│   │   ├── distribute.js   # Manual lead distribution
│   │   ├── leads.js        # Lead CRUD operations
│   │   ├── marketplace.js  # Marketplace lead management
│   │   ├── settings.js     # Admin settings
│   │   ├── users.js        # User management
│   │   └── wholesalers.js  # Wholesaler stats
│   ├── auth/               # Authentication endpoints
│   │   ├── login.js        # User login
│   │   ├── register.js     # User registration
│   │   ├── profile.js      # Get user profile
│   │   ├── verify-email.js # Email verification
│   │   └── reset-password.js
│   ├── cron/               # Scheduled tasks
│   │   ├── distribute.js   # Daily lead distribution
│   │   ├── countdown.js    # Countdown timer updates
│   │   └── process-notifications.js
│   ├── dodo/               # Payment webhooks
│   │   ├── checkout.js     # Create checkout session
│   │   └── webhook.js      # Handle payment events
│   ├── leads/              # Wholesaler lead endpoints
│   │   ├── index.js        # Get user's leads
│   │   ├── update.js       # Update lead status/notes
│   │   ├── export.js       # CSV export
│   │   └── stats.js        # Lead statistics
│   ├── marketplace/        # Marketplace endpoints
│   │   ├── index.js        # Browse marketplace
│   │   └── checkout.js     # Purchase leads
│   └── support/            # Support ticket system
│
├── frontend/               # React application
│   └── src/
│       ├── components/     # Reusable UI components
│       │   ├── Layout.jsx          # Main layout wrapper
│       │   ├── LeadDetailModal.jsx # Lead detail modal
│       │   ├── FilterPanel.jsx     # Lead filtering
│       │   ├── TagInput.jsx        # Tag management
│       │   └── ...
│       ├── pages/
│       │   ├── admin/      # Admin pages
│       │   ├── wholesaler/ # Wholesaler pages
│       │   ├── Home.jsx    # Landing page
│       │   ├── Pricing.jsx # Pricing page
│       │   └── ...
│       ├── lib/
│       │   └── api.js      # API client
│       └── context/        # React contexts
│
├── lib/                    # Shared backend utilities
│   ├── auth-prisma.js      # JWT authentication middleware
│   ├── planConfig.js       # Plan feature configuration
│   ├── distributeLeads-prisma.js  # Lead distribution logic
│   ├── email.js            # Email service (Resend)
│   ├── prisma.js           # Prisma client
│   ├── rateLimit.js        # Rate limiting
│   └── validation.js       # Input validation
│
├── prisma/
│   └── schema.prisma       # Database schema
│
└── vercel.json             # Vercel configuration
```

## 🔧 Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=your-secret-key

# Email (Resend)
RESEND_API_KEY=re_...

# Payments (DodoPayments)
DODO_API_KEY=...
DODO_WEBHOOK_SECRET=...

# Cron Jobs
CRON_SECRET=your-cron-secret

# Frontend
VITE_API_URL=/api
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Database Setup
```bash
npx prisma db push    # Apply schema to database
npx prisma generate   # Generate Prisma client
```

## 📊 Key Workflows

### Lead Distribution (Daily Cron)
1. Cron job runs daily at configured time
2. Gets all active wholesalers
3. For each user, determines lead count based on plan
4. Assigns leads using round-robin sequence
5. Updates user's sequence position

### Marketplace Purchase
1. User browses available leads (filtered by plan access)
2. Selects lead and initiates checkout
3. DodoPayments processes payment
4. Webhook confirms payment
5. Lead assigned to user's account

### Subscription Flow
1. User selects plan on pricing page
2. Redirected to DodoPayments checkout
3. Webhook updates user's plan on success
4. Features unlocked based on plan tier

## 🔐 Authentication

- JWT tokens with 7-day expiration
- Stored in localStorage
- Auto-refresh on API calls
- Rate limiting on login/register

## 📧 Email Templates

- Welcome email on registration
- Email verification
- Password reset
- New lead notification
- Marketplace purchase confirmation

## 🛡 Security Features

- Rate limiting on auth endpoints
- JWT token validation
- Admin role verification
- Input validation with Zod
- SQL injection prevention via Prisma

## 📝 License

Proprietary - All rights reserved

