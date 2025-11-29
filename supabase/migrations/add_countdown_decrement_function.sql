-- Migration: Add countdown decrement RPC function
-- Date: 2025-11-28
-- Purpose: Create a function to decrement countdown_days since Supabase JS client
--          doesn't support raw SQL expressions in update calls

-- ============================================================================
-- STEP 1: Create function to decrement countdown_days for user_leads
-- ============================================================================

CREATE OR REPLACE FUNCTION decrement_user_leads_countdown()
RETURNS TABLE (
  id UUID,
  countdown_days INTEGER
) AS $$
BEGIN
  RETURN QUERY
  UPDATE user_leads
  SET 
    countdown_days = user_leads.countdown_days - 1,
    updated_at = NOW()
  WHERE user_leads.countdown_days > 0
  RETURNING user_leads.id, user_leads.countdown_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 2: Create function to decrement countdown_days for user_marketplace_leads
-- ============================================================================

CREATE OR REPLACE FUNCTION decrement_marketplace_leads_countdown()
RETURNS TABLE (
  id UUID,
  countdown_days INTEGER
) AS $$
BEGIN
  RETURN QUERY
  UPDATE user_marketplace_leads
  SET 
    countdown_days = user_marketplace_leads.countdown_days - 1,
    updated_at = NOW()
  WHERE user_marketplace_leads.countdown_days > 0
  RETURNING user_marketplace_leads.id, user_marketplace_leads.countdown_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 3: Create function to reset leads with countdown = 0 for user_leads
-- ============================================================================

CREATE OR REPLACE FUNCTION reset_zero_countdown_user_leads()
RETURNS TABLE (
  id UUID,
  user_id UUID
) AS $$
BEGIN
  RETURN QUERY
  UPDATE user_leads
  SET 
    status = 'new',
    action = 'call_now',
    countdown_days = NULL,
    updated_at = NOW()
  WHERE user_leads.countdown_days = 0
  RETURNING user_leads.id, user_leads.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 4: Create function to reset leads with countdown = 0 for marketplace leads
-- ============================================================================

CREATE OR REPLACE FUNCTION reset_zero_countdown_marketplace_leads()
RETURNS TABLE (
  id UUID,
  user_id UUID
) AS $$
BEGIN
  RETURN QUERY
  UPDATE user_marketplace_leads
  SET 
    status = 'new',
    action = 'call_now',
    countdown_days = NULL,
    updated_at = NOW()
  WHERE user_marketplace_leads.countdown_days = 0
  RETURNING user_marketplace_leads.id, user_marketplace_leads.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Countdown decrement functions created successfully!';
  RAISE NOTICE 'Functions available:';
  RAISE NOTICE '  - decrement_user_leads_countdown()';
  RAISE NOTICE '  - decrement_marketplace_leads_countdown()';
  RAISE NOTICE '  - reset_zero_countdown_user_leads()';
  RAISE NOTICE '  - reset_zero_countdown_marketplace_leads()';
END $$;
