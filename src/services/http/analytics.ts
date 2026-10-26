import { Platform } from 'react-native';
import type { AnalyticsApi, ListingEvent } from '../api';
import { request } from './client';

const META = { client: 'mobile_app', platform: Platform.OS };

// Web ilə eyni forma: card_impression üçün event_type göndərilmir, yalnız card_context
function toApi(e: ListingEvent, sessionKey: string) {
  return {
    listing_id: e.listingPk,
    ...(e.type === 'card_impression' ? {} : { event_type: e.type }),
    ...(e.card ? { card_context: { device: 'mobile', index: e.card.index, block: e.card.block } } : {}),
    ...(e.source ? { source_page: e.source } : {}),
    occurred_at: e.occurredAt,
    session_key: sessionKey,
    meta: META,
  };
}

export const httpAnalytics: AnalyticsApi = {
  async sendListingEvents(events, sessionKey) {
    await request('analytics/listings/events/batch/', {
      method: 'POST',
      body: { events: events.map((e) => toApi(e, sessionKey)) },
    });
  },
};
