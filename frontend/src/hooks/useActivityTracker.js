import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

export default function useActivityTracker() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const trackEvent = useCallback(async (eventType, eventData = null) => {
    if (!isAuthenticated) return;

    try {
      await api.post('/analytics/track', {
        eventType,
        eventData,
        pagePath: location.pathname,
      });
    } catch (error) {
      // Silently fail - don't interrupt user experience for tracking
      console.debug('Activity tracking failed:', error);
    }
  }, [isAuthenticated, location.pathname]);

  const trackPageView = useCallback((pageName) => {
    trackEvent('page_view', { page: pageName });
  }, [trackEvent]);

  const trackLeadView = useCallback((leadId, state, source) => {
    trackEvent('lead_view', { leadId, state, source });
  }, [trackEvent]);

  const trackLeadAction = useCallback((leadId, action, state) => {
    trackEvent('lead_action', { leadId, action, state });
  }, [trackEvent]);

  const trackMarketplacePurchase = useCallback((leadId, state, price) => {
    trackEvent('marketplace_purchase', { leadId, state, price });
  }, [trackEvent]);

  const trackWishlistVote = useCallback((featureId) => {
    trackEvent('wishlist_vote', { featureId });
  }, [trackEvent]);

  const trackWishlistComment = useCallback((featureId) => {
    trackEvent('wishlist_comment', { featureId });
  }, [trackEvent]);

  const trackWishlistSubmit = useCallback((featureId, title) => {
    trackEvent('wishlist_submit', { featureId, title });
  }, [trackEvent]);

  const trackStatePreferenceUpdate = useCallback((states) => {
    trackEvent('state_preference_update', { states });
  }, [trackEvent]);

  const trackLogin = useCallback(() => {
    trackEvent('login', { timestamp: new Date().toISOString() });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackLeadView,
    trackLeadAction,
    trackMarketplacePurchase,
    trackWishlistVote,
    trackWishlistComment,
    trackWishlistSubmit,
    trackStatePreferenceUpdate,
    trackLogin,
  };
}
