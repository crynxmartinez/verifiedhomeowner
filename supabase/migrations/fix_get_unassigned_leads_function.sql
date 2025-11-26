-- Migration: Fix get_unassigned_leads function
-- Date: 2025-11-26
-- Fix: Remove invalid ORDER BY in UNION subquery

DROP FUNCTION IF EXISTS get_unassigned_leads(UUID, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION get_unassigned_leads(
  p_user_id UUID,
  p_start_position INTEGER,
  p_limit INTEGER
)
RETURNS TABLE (
  id UUID,
  sequence_number INTEGER,
  first_name VARCHAR,
  last_name VARCHAR,
  full_name VARCHAR,
  owner_name VARCHAR,
  phone VARCHAR,
  property_address VARCHAR,
  city VARCHAR,
  state VARCHAR,
  zip_code VARCHAR,
  mailing_address VARCHAR,
  mailing_city VARCHAR,
  mailing_state VARCHAR,
  mailing_zip VARCHAR,
  is_business BOOLEAN,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  WITH unassigned AS (
    -- Get all leads that user doesn't have
    SELECT 
      l.id,
      l.sequence_number,
      l.first_name,
      l.last_name,
      l.full_name,
      l.owner_name,
      l.phone,
      l.property_address,
      l.city,
      l.state,
      l.zip_code,
      l.mailing_address,
      l.mailing_city,
      l.mailing_state,
      l.mailing_zip,
      l.is_business,
      l.created_at
    FROM leads l
    WHERE NOT EXISTS (
      SELECT 1 FROM user_leads ul
      WHERE ul.user_id = p_user_id
        AND ul.lead_id = l.id
    )
  ),
  from_position AS (
    -- Get leads starting from current position
    SELECT 
      u.id,
      u.sequence_number,
      u.first_name,
      u.last_name,
      u.full_name,
      u.owner_name,
      u.phone,
      u.property_address,
      u.city,
      u.state,
      u.zip_code,
      u.mailing_address,
      u.mailing_city,
      u.mailing_state,
      u.mailing_zip,
      u.is_business,
      u.created_at
    FROM unassigned u
    WHERE u.sequence_number >= p_start_position
    ORDER BY u.sequence_number ASC
    LIMIT p_limit
  ),
  remaining_needed AS (
    -- Calculate how many more leads we need
    SELECT p_limit - COUNT(*) as needed
    FROM from_position
  ),
  from_beginning AS (
    -- If we need more, wrap around to beginning
    SELECT 
      u.id,
      u.sequence_number,
      u.first_name,
      u.last_name,
      u.full_name,
      u.owner_name,
      u.phone,
      u.property_address,
      u.city,
      u.state,
      u.zip_code,
      u.mailing_address,
      u.mailing_city,
      u.mailing_state,
      u.mailing_zip,
      u.is_business,
      u.created_at
    FROM unassigned u, remaining_needed r
    WHERE u.sequence_number < p_start_position
      AND r.needed > 0
    ORDER BY u.sequence_number ASC
    LIMIT (SELECT needed FROM remaining_needed)
  )
  -- Combine both sets and return in sequence order
  SELECT 
    c.id,
    c.sequence_number,
    c.first_name,
    c.last_name,
    c.full_name,
    c.owner_name,
    c.phone,
    c.property_address,
    c.city,
    c.state,
    c.zip_code,
    c.mailing_address,
    c.mailing_city,
    c.mailing_state,
    c.mailing_zip,
    c.is_business,
    c.created_at
  FROM (
    SELECT * FROM from_position
    UNION ALL
    SELECT * FROM from_beginning
  ) c
  ORDER BY c.sequence_number ASC;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION get_unassigned_leads IS 'Returns unassigned leads for a user starting from a position, wrapping around if needed';
