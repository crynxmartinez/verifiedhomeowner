-- Migration: Add countdown_days, motivation, and marketplace tables
-- Date: 2025-11-26
-- Purpose: Add missing columns and tables that were in schema.sql but never migrated

-- ============================================================================
-- STEP 1: Add missing columns to user_leads
-- ============================================================================

-- Add countdown_days column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_leads' AND column_name = 'countdown_days'
  ) THEN
    ALTER TABLE user_leads ADD COLUMN countdown_days INTEGER;
  END IF;
END $$;

-- Add motivation column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_leads' AND column_name = 'motivation'
  ) THEN
    ALTER TABLE user_leads ADD COLUMN motivation VARCHAR(100);
  END IF;
END $$;

-- ============================================================================
-- STEP 2: Update status CHECK constraint to include 'pending'
-- ============================================================================

-- Drop old constraint if exists
ALTER TABLE user_leads DROP CONSTRAINT IF EXISTS user_leads_status_check;

-- Add new constraint with 'pending' status
ALTER TABLE user_leads 
ADD CONSTRAINT user_leads_status_check 
CHECK (status IN ('new', 'called', 'follow_up', 'not_interested', 'pending'));

-- ============================================================================
-- STEP 3: Create marketplace_leads table if it doesn't exist
-- ============================================================================

CREATE TABLE IF NOT EXISTS marketplace_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_name VARCHAR(255),
  phone VARCHAR(50),
  property_address VARCHAR(500),
  city VARCHAR(255),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  mailing_address VARCHAR(500),
  mailing_city VARCHAR(255),
  mailing_state VARCHAR(100),
  mailing_zip VARCHAR(20),
  motivation VARCHAR(100) NOT NULL,
  timeline VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  max_buyers INTEGER DEFAULT 0, -- 0 = unlimited
  times_sold INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: Create user_marketplace_leads table if it doesn't exist
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_marketplace_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  marketplace_lead_id UUID NOT NULL REFERENCES marketplace_leads(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP DEFAULT NOW(),
  price_paid DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'called', 'follow_up', 'not_interested', 'pending')),
  action VARCHAR(50) NOT NULL DEFAULT 'call_now' CHECK (action IN ('call_now', 'pending')),
  last_called_at TIMESTAMP,
  follow_up_date DATE,
  countdown_days INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, marketplace_lead_id)
);

-- ============================================================================
-- STEP 5: Create indexes if they don't exist
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_marketplace_leads_state ON marketplace_leads(state);
CREATE INDEX IF NOT EXISTS idx_marketplace_leads_motivation ON marketplace_leads(motivation);
CREATE INDEX IF NOT EXISTS idx_marketplace_leads_timeline ON marketplace_leads(timeline);
CREATE INDEX IF NOT EXISTS idx_user_marketplace_leads_user_id ON user_marketplace_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_marketplace_leads_status ON user_marketplace_leads(status);

-- ============================================================================
-- STEP 6: Add updated_at trigger for marketplace tables
-- ============================================================================

-- Trigger for marketplace_leads
DROP TRIGGER IF EXISTS update_marketplace_leads_updated_at ON marketplace_leads;
CREATE TRIGGER update_marketplace_leads_updated_at 
BEFORE UPDATE ON marketplace_leads
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_marketplace_leads
DROP TRIGGER IF EXISTS update_user_marketplace_leads_updated_at ON user_marketplace_leads;
CREATE TRIGGER update_user_marketplace_leads_updated_at 
BEFORE UPDATE ON user_marketplace_leads
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify countdown_days column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_leads' AND column_name = 'countdown_days'
  ) THEN
    RAISE NOTICE 'SUCCESS: countdown_days column added to user_leads';
  ELSE
    RAISE EXCEPTION 'FAILED: countdown_days column not found in user_leads';
  END IF;
END $$;

-- Verify motivation column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_leads' AND column_name = 'motivation'
  ) THEN
    RAISE NOTICE 'SUCCESS: motivation column added to user_leads';
  ELSE
    RAISE EXCEPTION 'FAILED: motivation column not found in user_leads';
  END IF;
END $$;

-- Verify marketplace tables exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'marketplace_leads'
  ) THEN
    RAISE NOTICE 'SUCCESS: marketplace_leads table created';
  ELSE
    RAISE EXCEPTION 'FAILED: marketplace_leads table not found';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_marketplace_leads'
  ) THEN
    RAISE NOTICE 'SUCCESS: user_marketplace_leads table created';
  ELSE
    RAISE EXCEPTION 'FAILED: user_marketplace_leads table not found';
  END IF;
END $$;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
END $$;
