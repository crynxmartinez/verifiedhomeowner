# Prisma Migration Guide

> **Purpose**: Step-by-step guide to migrate from Supabase to Prisma with Prisma Accelerate.

---

## Setup Complete ✅

The following files have been created:

| File | Purpose |
|------|---------|
| `prisma.config.ts` | Prisma configuration for Prisma Accelerate |
| `prisma/schema.prisma` | Complete database schema with all tables |
| `lib/prisma.js` | Prisma client singleton for API routes |
| `.env.example` | Environment variables template |
| `package.json` | Updated with Prisma dependencies |

---

## Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `@prisma/client` - Prisma Client for queries
- `prisma` - Prisma CLI (dev dependency)

---

## Step 2: Set Environment Variable

Add to your `.env` file (and Vercel):

```
DATABASE_URL="postgres://326dff394beead16f5e7e8b55226d48388960c8fcd52230765ffc869cb3ba0b6:sk_-Yk9qxGoJ_2HdmfjnLkJB@db.prisma.io:5432/postgres?sslmode=require"
```

**In Vercel Dashboard:**
1. Go to Settings → Environment Variables
2. Add `DATABASE_URL` with the connection string
3. Remove old Supabase variables: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`

---

## Step 3: Generate Prisma Client

```bash
npx prisma generate
```

---

## Step 4: Push Schema to Database

```bash
npx prisma db push
```

This creates all tables in your new Prisma database.

---

## Step 5: Migrate Data from Supabase

Export data from Supabase SQL Editor:

```sql
-- Run in Supabase SQL Editor, then export results as CSV

-- Users
SELECT id, email, name, role, plan_type, subscription_status, 
       lead_sequence_position, dodo_subscription_id, dodo_customer_id,
       subscription_end_date, created_at, updated_at
FROM users;

-- Leads
SELECT id, first_name, last_name, full_name, is_business, phone,
       property_address, city, state, zip_code,
       mailing_address, mailing_city, mailing_state, mailing_zip,
       sequence_number, created_at
FROM leads;

-- User Leads
SELECT id, user_id, lead_id, status, action, motivation,
       assigned_at, last_called_at, follow_up_date, countdown_days,
       notes, tags, created_at, updated_at
FROM user_leads;

-- Marketplace Leads
SELECT * FROM marketplace_leads;

-- User Marketplace Leads
SELECT * FROM user_marketplace_leads;

-- Support Tickets
SELECT * FROM support_tickets;
```

Then import into Prisma database using Prisma Studio or SQL.

---

## Step 6: Update API Routes

Replace Supabase client with Prisma client in all API files.

### Before (Supabase):
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Query
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();
```

### After (Prisma):
```javascript
import prisma from '../../lib/prisma.js';

// Query
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

---

## API Route Conversion Examples

### SELECT with WHERE
```javascript
// Supabase
const { data } = await supabase.from('users').select('*').eq('email', email).single();

// Prisma
const user = await prisma.user.findUnique({ where: { email } });
```

### SELECT with Multiple Conditions
```javascript
// Supabase
const { data } = await supabase
  .from('user_leads')
  .select('*, lead:leads(*)')
  .eq('user_id', userId)
  .eq('action', 'call_now');

// Prisma
const userLeads = await prisma.userLead.findMany({
  where: { userId, action: 'call_now' },
  include: { lead: true }
});
```

### INSERT
```javascript
// Supabase
const { data } = await supabase.from('users').insert({ email, name }).select().single();

// Prisma
const user = await prisma.user.create({
  data: { email, name }
});
```

### UPDATE
```javascript
// Supabase
const { data } = await supabase.from('users').update({ plan_type: 'elite' }).eq('id', userId);

// Prisma
const user = await prisma.user.update({
  where: { id: userId },
  data: { planType: 'elite' }
});
```

### DELETE
```javascript
// Supabase
await supabase.from('user_leads').delete().eq('id', leadId);

// Prisma
await prisma.userLead.delete({ where: { id: leadId } });
```

### COUNT
```javascript
// Supabase
const { count } = await supabase.from('leads').select('*', { count: 'exact', head: true });

// Prisma
const count = await prisma.lead.count();
```

### ORDER BY + LIMIT
```javascript
// Supabase
const { data } = await supabase
  .from('leads')
  .select('*')
  .order('sequence_number', { ascending: true })
  .limit(10);

// Prisma
const leads = await prisma.lead.findMany({
  orderBy: { sequenceNumber: 'asc' },
  take: 10
});
```

---

## Files to Update

All API routes that use Supabase need to be converted:

| File | Priority |
|------|----------|
| `api/auth/login.js` | HIGH |
| `api/auth/register.js` | HIGH |
| `api/auth/profile.js` | HIGH |
| `api/leads/index.js` | HIGH |
| `api/leads/update.js` | HIGH |
| `api/leads/stats.js` | MEDIUM |
| `api/user/plan.js` | HIGH |
| `api/dodo/checkout.js` | HIGH |
| `api/dodo/webhook.js` | HIGH |
| `api/marketplace/index.js` | MEDIUM |
| `api/marketplace/purchase.js` | MEDIUM |
| `api/support/index.js` | MEDIUM |
| `api/support/[id].js` | MEDIUM |
| `api/support/update.js` | MEDIUM |
| `api/support/unread-count.js` | LOW |
| `api/admin/users.js` | MEDIUM |
| `api/admin/leads.js` | MEDIUM |
| `api/admin/analytics.js` | LOW |
| `api/admin/distribute.js` | MEDIUM |
| `api/admin/marketplace.js` | MEDIUM |
| `api/cron/countdown.js` | MEDIUM |
| `api/cron/distribute.js` | HIGH |
| `api/user/leads/distribute.js` | HIGH |

---

## Column Name Mapping

Prisma uses camelCase, database uses snake_case. The schema handles this with `@map()`.

| Prisma (code) | Database (actual) |
|---------------|-------------------|
| `planType` | `plan_type` |
| `subscriptionStatus` | `subscription_status` |
| `leadSequencePosition` | `lead_sequence_position` |
| `dodoSubscriptionId` | `dodo_subscription_id` |
| `dodoCustomerId` | `dodo_customer_id` |
| `subscriptionEndDate` | `subscription_end_date` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |
| `firstName` | `first_name` |
| `lastName` | `last_name` |
| `fullName` | `full_name` |
| `isBusiness` | `is_business` |
| `propertyAddress` | `property_address` |
| `zipCode` | `zip_code` |
| `mailingAddress` | `mailing_address` |
| `mailingCity` | `mailing_city` |
| `mailingState` | `mailing_state` |
| `mailingZip` | `mailing_zip` |
| `sequenceNumber` | `sequence_number` |
| `userId` | `user_id` |
| `leadId` | `lead_id` |
| `assignedAt` | `assigned_at` |
| `lastCalledAt` | `last_called_at` |
| `followUpDate` | `follow_up_date` |
| `countdownDays` | `countdown_days` |
| `ownerName` | `owner_name` |
| `maxBuyers` | `max_buyers` |
| `timesSold` | `times_sold` |
| `marketplaceLeadId` | `marketplace_lead_id` |
| `purchasedAt` | `purchased_at` |
| `pricePaid` | `price_paid` |

---

## RPC Functions to Replace

The Supabase RPC functions need to be replaced with Prisma queries:

### `get_unassigned_leads`
```javascript
// Prisma equivalent
const assignedLeadIds = await prisma.userLead.findMany({
  where: { userId },
  select: { leadId: true }
});

const leads = await prisma.lead.findMany({
  where: {
    id: { notIn: assignedLeadIds.map(l => l.leadId) },
    sequenceNumber: { gte: startPosition }
  },
  orderBy: { sequenceNumber: 'asc' },
  take: limit
});
```

### `decrement_user_leads_countdown`
```javascript
await prisma.userLead.updateMany({
  where: { countdownDays: { gt: 0 } },
  data: { countdownDays: { decrement: 1 } }
});
```

### `reset_zero_countdown_user_leads`
```javascript
await prisma.userLead.updateMany({
  where: { countdownDays: 0 },
  data: {
    status: 'new',
    action: 'call_now',
    countdownDays: null
  }
});
```

---

## Vercel Environment Variables

**Remove:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

**Add:**
- `DATABASE_URL` (Prisma connection string)

**Keep:**
- `DODO_PAYMENTS_API_KEY`
- `DODO_PAYMENTS_ENVIRONMENT`
- `DODO_PAYMENTS_WEBHOOK_KEY`
- `DODO_PRODUCT_BASIC`
- `DODO_PRODUCT_ELITE`
- `DODO_PRODUCT_PRO`
- `FRONTEND_URL`
- `JWT_SECRET`

---

## Testing Checklist

After migration, test these flows:

- [ ] User registration
- [ ] User login
- [ ] View leads (Call Now / Pending tabs)
- [ ] Update lead status
- [ ] Add notes to lead
- [ ] Add tags to lead
- [ ] Follow-up countdown
- [ ] Upgrade plan (Dodo checkout)
- [ ] Webhook updates plan
- [ ] Marketplace browse
- [ ] Marketplace purchase
- [ ] Support ticket creation
- [ ] Admin: view users
- [ ] Admin: view analytics
- [ ] Cron: lead distribution
- [ ] Cron: countdown decrement

---

## Rollback Plan

If issues occur, you can temporarily revert by:
1. Restore Supabase env vars in Vercel
2. Revert `lib/prisma.js` imports back to Supabase
3. Redeploy

Keep Supabase active for 1-2 weeks after migration as backup.

---

*Last Updated: December 19, 2024*
