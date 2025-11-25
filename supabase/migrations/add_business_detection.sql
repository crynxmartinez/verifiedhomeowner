-- Migration: Add business detection field to leads table
-- Date: 2025-11-26

-- Add is_business column to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS is_business BOOLEAN DEFAULT FALSE;

-- Update existing records to detect businesses based on owner_name or full_name
UPDATE leads 
SET is_business = TRUE 
WHERE 
  is_business = FALSE AND (
    -- Check owner_name for business indicators
    (owner_name IS NOT NULL AND (
      owner_name ~* '\b(llc|inc|corp|corporation|ltd|limited|llp|lp|pc|pa|pllc|co|company)\b' OR
      owner_name ~* '\b(enterprises|holdings|group|partners|associates|trust|estate|properties|investments|ventures|solutions|services|consulting|management|realty|construction|development|builders|contractors)\b' OR
      owner_name ~ '&' OR
      owner_name ~* '\band\b'
    )) OR
    -- Check full_name for business indicators
    (full_name IS NOT NULL AND (
      full_name ~* '\b(llc|inc|corp|corporation|ltd|limited|llp|lp|pc|pa|pllc|co|company)\b' OR
      full_name ~* '\b(enterprises|holdings|group|partners|associates|trust|estate|properties|investments|ventures|solutions|services|consulting|management|realty|construction|development|builders|contractors)\b' OR
      full_name ~ '&' OR
      full_name ~* '\band\b'
    ))
  );

-- Add comment
COMMENT ON COLUMN leads.is_business IS 'Indicates if the lead is a business/company rather than an individual person';
