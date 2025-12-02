-- Add tags column to user_leads table
ALTER TABLE user_leads ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add tags column to user_marketplace_leads table
ALTER TABLE user_marketplace_leads ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create index for tags search performance
CREATE INDEX IF NOT EXISTS idx_user_leads_tags ON user_leads USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_user_marketplace_leads_tags ON user_marketplace_leads USING GIN (tags);
