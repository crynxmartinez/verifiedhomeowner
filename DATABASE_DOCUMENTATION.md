# Verified Homeowner - Database Documentation

> **Purpose**: This document describes the complete database schema for the Verified Homeowner CRM platform. Use this as a reference when migrating to Prisma.

---

## Overview

The database uses **PostgreSQL** via **Supabase** with the following core tables:
- `users` - User accounts and subscription info
- `leads` - Master lead database
- `user_leads` - Leads assigned to users (subscription leads)
- `marketplace_leads` - Hot leads available for purchase
- `user_marketplace_leads` - Purchased marketplace leads
- `support_tickets` - Customer support tickets

---

## Tables

### 1. `users`

Stores user profiles linked to Supabase Auth.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, FK → auth.users(id) ON DELETE CASCADE | - | Links to Supabase Auth |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | - | User email |
| `name` | VARCHAR(255) | NOT NULL | - | User's full name |
| `role` | VARCHAR(50) | NOT NULL, CHECK ('admin', 'wholesaler') | 'wholesaler' | User role |
| `plan_type` | VARCHAR(50) | NOT NULL, CHECK ('free', 'basic', 'elite', 'pro') | 'free' | Subscription plan |
| `subscription_status` | VARCHAR(50) | NOT NULL, CHECK ('active', 'inactive', 'cancelled', 'expired', 'on_hold') | 'active' | Subscription state |
| `lead_sequence_position` | INTEGER | - | 0 | Position in lead rotation |
| `stripe_customer_id` | TEXT | - | NULL | **DEPRECATED** - Old Stripe ID |
| `stripe_subscription_id` | TEXT | - | NULL | **DEPRECATED** - Old Stripe subscription |
| `dodo_subscription_id` | TEXT | - | NULL | Dodo Payments subscription ID |
| `dodo_customer_id` | TEXT | - | NULL | Dodo Payments customer ID |
| `subscription_end_date` | TIMESTAMPTZ | - | NULL | When subscription expires |
| `created_at` | TIMESTAMP | - | NOW() | Account creation date |
| `updated_at` | TIMESTAMP | - | NOW() | Last update (auto-updated via trigger) |

**Indexes:**
- `idx_users_email` ON (email)
- `idx_users_role` ON (role)
- `idx_users_plan` ON (plan_type)
- `idx_users_stripe_customer_id` ON (stripe_customer_id) - **DEPRECATED**

---

### 2. `leads`

Master table of all leads in the system.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | uuid_generate_v4() | Unique lead ID |
| `first_name` | VARCHAR(255) | - | NULL | Owner's first name |
| `last_name` | VARCHAR(255) | - | NULL | Owner's last name |
| `full_name` | VARCHAR(255) | - | NULL | Owner's full name |
| `owner_name` | VARCHAR(255) | - | NULL | **DEPRECATED** - Use first/last/full_name |
| `is_business` | BOOLEAN | - | FALSE | True if owner is a business entity |
| `phone` | VARCHAR(50) | - | NULL | Contact phone number |
| `property_address` | VARCHAR(500) | - | NULL | Property street address |
| `city` | VARCHAR(255) | - | NULL | Property city |
| `state` | VARCHAR(100) | - | NULL | Property state |
| `zip_code` | VARCHAR(20) | - | NULL | Property ZIP code |
| `mailing_address` | VARCHAR(500) | - | NULL | Mailing street address |
| `mailing_city` | VARCHAR(255) | - | NULL | Mailing city |
| `mailing_state` | VARCHAR(100) | - | NULL | Mailing state |
| `mailing_zip` | VARCHAR(20) | - | NULL | Mailing ZIP code |
| `sequence_number` | INTEGER | NOT NULL, UNIQUE | - | Order in lead rotation |
| `created_at` | TIMESTAMP | - | NOW() | When lead was added |

**Indexes:**
- `idx_leads_sequence` ON (sequence_number)
- `idx_leads_address` ON (property_address)

**Notes:**
- `is_business` is auto-detected based on keywords like LLC, Inc, Corp, Trust, etc.
- `sequence_number` determines the order leads are distributed to users

---

### 3. `user_leads`

Junction table for leads assigned to users via subscription.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | uuid_generate_v4() | Unique assignment ID |
| `user_id` | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE | - | User who owns this lead |
| `lead_id` | UUID | NOT NULL, FK → leads(id) ON DELETE CASCADE | - | Reference to master lead |
| `status` | VARCHAR(50) | NOT NULL, CHECK ('new', 'follow_up', 'not_interested', 'pending') | 'new' | Lead status |
| `action` | VARCHAR(50) | NOT NULL, CHECK ('call_now', 'pending') | 'call_now' | Current action queue |
| `motivation` | VARCHAR(100) | - | NULL | Seller motivation level |
| `assigned_at` | TIMESTAMP | - | NOW() | When lead was assigned |
| `last_called_at` | TIMESTAMP | - | NULL | Last call timestamp |
| `follow_up_date` | DATE | - | NULL | Scheduled follow-up date |
| `countdown_days` | INTEGER | - | NULL | Days until auto-reset to call_now |
| `notes` | TEXT | - | NULL | User notes about the lead |
| `tags` | TEXT[] | - | NULL | Array of custom tags |
| `created_at` | TIMESTAMP | - | NOW() | Record creation date |
| `updated_at` | TIMESTAMP | - | NOW() | Last update (auto-updated) |

**Constraints:**
- UNIQUE(user_id, lead_id) - Each user can only have a lead once

**Indexes:**
- `idx_user_leads_user_id` ON (user_id)
- `idx_user_leads_status` ON (status)
- `idx_user_leads_action` ON (action)
- `idx_user_leads_tags` ON (tags) USING GIN

---

### 4. `marketplace_leads`

Hot leads available for purchase (pay-per-lead).

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | uuid_generate_v4() | Unique marketplace lead ID |
| `owner_name` | VARCHAR(255) | - | NULL | Property owner name |
| `phone` | VARCHAR(50) | - | NULL | Contact phone |
| `property_address` | VARCHAR(500) | - | NULL | Property address |
| `city` | VARCHAR(255) | - | NULL | City |
| `state` | VARCHAR(100) | - | NULL | State |
| `zip_code` | VARCHAR(20) | - | NULL | ZIP code |
| `mailing_address` | VARCHAR(500) | - | NULL | Mailing address |
| `mailing_city` | VARCHAR(255) | - | NULL | Mailing city |
| `mailing_state` | VARCHAR(100) | - | NULL | Mailing state |
| `mailing_zip` | VARCHAR(20) | - | NULL | Mailing ZIP |
| `motivation` | VARCHAR(100) | NOT NULL | - | Seller motivation (e.g., 'High', 'Medium') |
| `timeline` | VARCHAR(100) | NOT NULL | - | Selling timeline (e.g., 'ASAP', '1-3 months') |
| `price` | DECIMAL(10,2) | NOT NULL | - | Purchase price |
| `max_buyers` | INTEGER | - | 0 | Max times can be sold (0 = unlimited) |
| `times_sold` | INTEGER | - | 0 | Times this lead has been sold |
| `created_at` | TIMESTAMP | - | NOW() | When added to marketplace |
| `updated_at` | TIMESTAMP | - | NOW() | Last update |

**Indexes:**
- `idx_marketplace_leads_state` ON (state)
- `idx_marketplace_leads_motivation` ON (motivation)
- `idx_marketplace_leads_timeline` ON (timeline)

---

### 5. `user_marketplace_leads`

Purchased marketplace leads by users.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | uuid_generate_v4() | Unique purchase ID |
| `user_id` | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE | - | Buyer user ID |
| `marketplace_lead_id` | UUID | NOT NULL, FK → marketplace_leads(id) ON DELETE CASCADE | - | Purchased lead |
| `purchased_at` | TIMESTAMP | - | NOW() | Purchase timestamp |
| `price_paid` | DECIMAL(10,2) | NOT NULL | - | Amount paid |
| `status` | VARCHAR(50) | NOT NULL, CHECK ('new', 'follow_up', 'not_interested', 'pending') | 'new' | Lead status |
| `action` | VARCHAR(50) | NOT NULL, CHECK ('call_now', 'pending') | 'call_now' | Action queue |
| `last_called_at` | TIMESTAMP | - | NULL | Last call timestamp |
| `follow_up_date` | DATE | - | NULL | Follow-up date |
| `countdown_days` | INTEGER | - | NULL | Days until auto-reset |
| `notes` | TEXT | - | NULL | User notes |
| `tags` | TEXT[] | - | NULL | Custom tags array |
| `created_at` | TIMESTAMP | - | NOW() | Record creation |
| `updated_at` | TIMESTAMP | - | NOW() | Last update |

**Constraints:**
- UNIQUE(user_id, marketplace_lead_id) - User can only buy a lead once

**Indexes:**
- `idx_user_marketplace_leads_user_id` ON (user_id)
- `idx_user_marketplace_leads_status` ON (status)
- `idx_user_marketplace_leads_tags` ON (tags) USING GIN

---

### 6. `support_tickets`

Customer support ticket system.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | gen_random_uuid() | Ticket ID |
| `user_id` | UUID | FK → users(id) ON DELETE CASCADE | NULL | User who submitted (nullable for guests) |
| `name` | VARCHAR(255) | NOT NULL | - | Submitter name |
| `email` | VARCHAR(255) | NOT NULL | - | Contact email |
| `category` | VARCHAR(100) | NOT NULL | - | Ticket category |
| `message` | TEXT | NOT NULL | - | Ticket message |
| `status` | VARCHAR(20) | CHECK ('open', 'resolved') | 'open' | Ticket status |
| `created_at` | TIMESTAMPTZ | - | NOW() | Submission time |
| `updated_at` | TIMESTAMPTZ | - | NOW() | Last update |

**Indexes:**
- `idx_support_tickets_user_id` ON (user_id)
- `idx_support_tickets_status` ON (status)
- `idx_support_tickets_created_at` ON (created_at DESC)

---

## Database Functions (RPC)

### `get_unassigned_leads(p_user_id UUID, p_start_position INTEGER, p_limit INTEGER)`

Returns leads not yet assigned to a user, starting from a sequence position with wraparound.

**Returns:** Table of lead records

**Usage:** Used by lead distribution system to get next leads for a user.

---

### `decrement_user_leads_countdown()`

Decrements `countdown_days` by 1 for all user_leads where countdown > 0.

**Returns:** Table of (id, countdown_days) for affected rows

**Usage:** Called by daily cron job.

---

### `decrement_marketplace_leads_countdown()`

Same as above but for `user_marketplace_leads` table.

---

### `reset_zero_countdown_user_leads()`

Resets leads with `countdown_days = 0` back to status='new', action='call_now'.

**Returns:** Table of (id, user_id) for reset leads

---

### `reset_zero_countdown_marketplace_leads()`

Same as above but for `user_marketplace_leads` table.

---

### `update_updated_at_column()` (Trigger Function)

Automatically sets `updated_at = NOW()` on any row update.

**Applied to:** users, user_leads, marketplace_leads, user_marketplace_leads

---

### `handle_new_user()` (Trigger Function)

Auto-creates a user profile when a new auth.users record is created.

**Logic:**
- Creates user with email from auth
- Sets name from `raw_user_meta_data->>'name'` or defaults to 'User'
- Admin email `el@admin.com` gets role='admin' and plan='elite'
- All others get role='wholesaler' and plan='free'

---

## Enums / Check Constraints

### User Roles
```
'admin' | 'wholesaler'
```

### Plan Types
```
'free' | 'basic' | 'elite' | 'pro'
```

### Subscription Status
```
'active' | 'inactive' | 'cancelled' | 'expired' | 'on_hold'
```

### Lead Status
```
'new' | 'follow_up' | 'not_interested' | 'pending'
```
> Note: 'called' status was removed in migration

### Lead Action
```
'call_now' | 'pending'
```

### Support Ticket Status
```
'open' | 'resolved'
```

---

## Relationships Diagram

```
auth.users (Supabase Auth)
    │
    └──< users (1:1)
            │
            ├──< user_leads (1:many)
            │       │
            │       └──> leads (many:1)
            │
            ├──< user_marketplace_leads (1:many)
            │       │
            │       └──> marketplace_leads (many:1)
            │
            └──< support_tickets (1:many)
```

---

## Migration Notes for Prisma

### Deprecated Columns to Remove
- `users.stripe_customer_id` - Replaced by dodo_customer_id
- `users.stripe_subscription_id` - Replaced by dodo_subscription_id
- `leads.owner_name` - Replaced by first_name, last_name, full_name

### Special Considerations
1. **UUID Primary Keys**: All tables use UUID, ensure Prisma generates UUIDs
2. **Array Fields**: `tags` columns use PostgreSQL TEXT[] arrays
3. **Triggers**: Prisma doesn't support triggers natively - may need raw SQL migrations
4. **RPC Functions**: Will need to be recreated as raw SQL in Prisma migrations
5. **Auth Integration**: The `handle_new_user` trigger links to Supabase Auth - consider how to handle this with Prisma

### Indexes to Recreate
All indexes listed above should be recreated in Prisma schema for performance.

---

## Plan Limits Reference

| Plan | Leads/Day | Leads/Week |
|------|-----------|------------|
| Free | 0 | 1 (Mondays only) |
| Basic ($29/mo) | 1 | 7 |
| Elite ($99/mo) | 5 | 35 |
| Pro ($149/mo) | 10 | 70 |

---

*Last Updated: December 19, 2024*
