-- Migration: Add first_name, last_name, and full_name fields to leads table
-- Date: 2025-11-26

-- Add new name columns to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- Migrate existing owner_name data to full_name if full_name is empty
UPDATE leads 
SET full_name = owner_name 
WHERE full_name IS NULL AND owner_name IS NOT NULL;

-- Add comment to owner_name column
COMMENT ON COLUMN leads.owner_name IS 'Deprecated: Use first_name, last_name, and full_name instead';
