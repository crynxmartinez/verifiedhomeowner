-- Migration: Add created_at column to user_leads if missing
-- Date: 2025-11-30
-- Purpose: Ensure created_at column exists for tracking when leads were assigned

-- Add created_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_leads' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE user_leads ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    -- Backfill existing rows with assigned_at value
    UPDATE user_leads SET created_at = assigned_at WHERE created_at IS NULL;
    RAISE NOTICE '✅ Added created_at column to user_leads';
  ELSE
    RAISE NOTICE 'created_at column already exists in user_leads';
  END IF;
END $$;

-- Verification
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_leads' AND column_name = 'created_at'
  ) THEN
    RAISE NOTICE '✅ user_leads.created_at column verified';
  ELSE
    RAISE EXCEPTION 'FAILED: created_at column not found in user_leads';
  END IF;
END $$;
