-- Migration: Remove 'called' status
-- Date: 2025-11-28
-- Purpose: Remove the 'called' status as it doesn't make sense

-- ============================================================================
-- STEP 1: Update any existing 'called' status to 'new'
-- ============================================================================

UPDATE user_leads SET status = 'new' WHERE status = 'called';
UPDATE user_marketplace_leads SET status = 'new' WHERE status = 'called';

-- ============================================================================
-- STEP 2: Update user_leads status constraint
-- ============================================================================

ALTER TABLE user_leads DROP CONSTRAINT IF EXISTS user_leads_status_check;
ALTER TABLE user_leads 
ADD CONSTRAINT user_leads_status_check 
CHECK (status IN ('new', 'follow_up', 'not_interested', 'pending'));

-- ============================================================================
-- STEP 3: Update user_marketplace_leads status constraint
-- ============================================================================

ALTER TABLE user_marketplace_leads DROP CONSTRAINT IF EXISTS user_marketplace_leads_status_check;
ALTER TABLE user_marketplace_leads 
ADD CONSTRAINT user_marketplace_leads_status_check 
CHECK (status IN ('new', 'follow_up', 'not_interested', 'pending'));

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Removed called status from user_leads and user_marketplace_leads';
END $$;
