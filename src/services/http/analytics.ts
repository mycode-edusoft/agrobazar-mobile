import { Platform } from 'react-native';
import type { AnalyticsApi } from '../api';
import { request } from './client';

export const httpAnalytics: AnalyticsApi = {
  async sendListingEvents(events, sessionKey) {
    await request('analytics/listings/events/batch/', {
      method: 'POST',
      body: {
        events: events.map((e) => ({
          listing_id: e.listingPk,
          event_type: e.type,
          occurred_at: e.occurredAt,
          session_key: sessionKey,
          meta: { client: 'mobile_app', platform: Platform.OS },
        })),
      },
    });
  },
};
