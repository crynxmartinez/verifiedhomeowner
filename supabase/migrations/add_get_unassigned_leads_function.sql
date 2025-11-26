-- Migration: Add function to get unassigned leads for a user
-- Date: 2025-11-26
-- Purpose: Efficiently retrieve leads that haven't been assigned to a user yet

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
    SELECT l.*
    FROM leads l
    WHERE NOT EXISTS (
      SELECT 1 FROM user_leads ul
      WHERE ul.user_id = p_user_id
        AND ul.lead_id = l.id
    )
  ),
  from_position AS (
    -- Get leads starting from current position
    SELECT * FROM unassigned
    WHERE sequence_number >= p_start_position
    ORDER BY sequence_number ASC
    LIMIT p_limit
  ),
  remaining_needed AS (
    -- Calculate how many more leads we need
    SELECT p_limit - COUNT(*) as needed
    FROM from_position
  ),
  from_beginning AS (
    -- If we need more, wrap around to beginning
    SELECT u.* FROM unassigned u, remaining_needed r
    WHERE u.sequence_number < p_start_position
      AND r.needed > 0
    ORDER BY u.sequence_number ASC
    LIMIT (SELECT needed FROM remaining_needed)
  )
  -- Combine both sets and return in sequence order
  SELECT * FROM from_position
  UNION ALL
  SELECT * FROM from_beginning
  ORDER BY sequence_number ASC;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION get_unassigned_leads IS 'Returns unassigned leads for a user starting from a position, wrapping around if needed';
